#!/bin/bash

# JTH Database Migration Deployment Script
# =========================================

echo "🚀 JTH Database Migration Deployment"
echo "===================================="
echo "Target: https://nsbybnsmhvviofzfgphb.supabase.co"
echo "Time: $(date)"
echo ""

# Database connection string
DATABASE_URL="postgresql://postgres.nsbybnsmhvviofzfgphb:GT9eUV6AvvsC0r3OIGHgQgP8I-QILvm2z-nuMizfKB0@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    echo "📝 Executing: $description"
    echo "   File: $file"
    
    if [ -f "$file" ]; then
        # Use psql to execute the file
        psql "$DATABASE_URL" -f "$file" 2>&1 | tail -20
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Success"
        else
            echo "   ❌ Failed with errors"
        fi
    else
        echo "   ⚠️  File not found: $file"
    fi
    echo ""
}

echo "🔄 Starting migration deployment..."
echo ""

# Execute migrations in order
execute_sql_file "apps/web/supabase/deploy-migration.sql" "Main deployment migration"
execute_sql_file "supabase/migrations/001_initial_schema.sql" "Initial comprehensive schema"
execute_sql_file "supabase/migrations/002_monday_data_import.sql" "Monday.com data import"
execute_sql_file "supabase/migrations/003_vector_search_and_functions.sql" "Vector search and functions"
execute_sql_file "supabase/migrations/004_jth_model_data.sql" "JTH model specifications"

echo "===================================="
echo "📊 Migration deployment complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Check the Supabase dashboard for table creation"
echo "2. Verify RLS policies are active"
echo "3. Test the API endpoints"
echo ""