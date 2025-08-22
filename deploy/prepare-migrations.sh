#!/bin/bash

#################################################
# Database Migration Preparation Script
# Combines all migrations into a single SQL file
# for manual deployment to Supabase
#################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"
OUTPUT_FILE="$SCRIPT_DIR/combined-migrations.sql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$SCRIPT_DIR/combined-migrations_$TIMESTAMP.sql"

echo "🚀 JTH Database Migration Preparation"
echo "====================================="
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$SCRIPT_DIR"

# Start the combined SQL file
cat > "$OUTPUT_FILE" << 'EOF'
-- ============================================
-- JTH Operations Platform - Complete Database Setup
-- Generated: $(date)
-- ============================================
-- 
-- This file contains all migrations for the JTH platform.
-- Run this in the Supabase SQL editor to set up the database.
--
-- IMPORTANT: Review each section before running in production!
-- ============================================

BEGIN;

-- Create a migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

EOF

# Add each migration file
echo "📦 Combining migration files..."

for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "  - Adding: $filename"
        
        cat >> "$OUTPUT_FILE" << EOF

-- ============================================
-- Migration: $filename
-- ============================================

EOF
        cat "$migration" >> "$OUTPUT_FILE"
        
        # Add migration tracking
        cat >> "$OUTPUT_FILE" << EOF

-- Record migration
INSERT INTO schema_migrations (version) 
VALUES ('$filename') 
ON CONFLICT (version) DO NOTHING;

EOF
    fi
done

# Add verification queries at the end
cat >> "$OUTPUT_FILE" << 'EOF'

-- ============================================
-- Verification Queries
-- ============================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check migrations applied
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Count records in key tables
SELECT 
    'leads' as table_name, COUNT(*) as count FROM leads
UNION ALL
SELECT 
    'knowledge_base' as table_name, COUNT(*) as count FROM knowledge_base
UNION ALL
SELECT 
    'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL
SELECT 
    'jth_models' as table_name, COUNT(*) as count FROM jth_models;

COMMIT;

-- ============================================
-- Post-Migration Steps:
-- 1. Create an admin user: node scripts/create-admin.js
-- 2. Verify database: node deploy/check-database.js
-- 3. Test the application endpoints
-- ============================================
EOF

# Create a backup
cp "$OUTPUT_FILE" "$BACKUP_FILE"

echo ""
echo "✅ Migration file created successfully!"
echo ""
echo "📄 Output files:"
echo "  - Main: $OUTPUT_FILE"
echo "  - Backup: $BACKUP_FILE"
echo ""
echo "📋 Next steps:"
echo "  1. Review the generated SQL file"
echo "  2. Open Supabase Dashboard > SQL Editor"
echo "  3. Copy and paste the contents of combined-migrations.sql"
echo "  4. Run the migration"
echo "  5. Verify with: node deploy/check-database.js"
echo ""
echo "⚠️  IMPORTANT: Always backup your database before running migrations!"

# Make the script executable
chmod +x "$SCRIPT_DIR/check-database.js" 2>/dev/null || true