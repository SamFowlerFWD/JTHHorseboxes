#!/usr/bin/env node

/**
 * Alternative migration deployment using Supabase Management API
 * This attempts to use the database connection string approach
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '../../../supabase/migrations');

// Extract project ref from URL
const projectRef = SUPABASE_URL ? SUPABASE_URL.replace('https://', '').split('.')[0] : null;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !projectRef) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

/**
 * Execute SQL via Supabase's database API
 */
async function executeSQLViaAPI(sql) {
  try {
    // Try using the pg REST endpoint
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (response.ok) {
      return { success: true };
    }

    const errorText = await response.text();
    return { success: false, error: errorText };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a database function to execute migrations
 */
async function createMigrationFunction() {
  const functionSQL = `
CREATE OR REPLACE FUNCTION execute_migration(migration_sql TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  BEGIN
    EXECUTE migration_sql;
    RETURN QUERY SELECT true::BOOLEAN, 'Migration executed successfully'::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT false::BOOLEAN, SQLERRM::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION execute_migration TO service_role;
`;

  console.log('📝 Creating migration execution function...');
  const result = await executeSQLViaAPI(functionSQL);
  
  if (result.success) {
    console.log('  ✓ Function created successfully');
    return true;
  } else {
    console.log('  ⚠️  Could not create function via API');
    return false;
  }
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 JTH Database Migration Deployment (API Method)');
  console.log(`📍 Project: ${projectRef}`);
  console.log('');

  // Test API connectivity
  console.log('🔌 Testing API connection...');
  const testResult = await executeSQLViaAPI('SELECT version()');
  
  if (!testResult.success) {
    console.log('  ❌ Cannot execute SQL via REST API');
    console.log('');
    console.log('The Supabase REST API does not support direct SQL execution.');
    console.log('Please use one of these methods:');
    console.log('');
    console.log('Option 1: Supabase Dashboard (Recommended)');
    console.log('  1. Go to: https://supabase.com/dashboard/project/nsbybnsmhvviofzfgphb/sql/new');
    console.log('  2. Copy the contents of the combined migrations file');
    console.log('  3. Paste and execute in SQL Editor');
    console.log('');
    console.log('Option 2: Supabase CLI (Requires login)');
    console.log('  1. Install: npm install -g supabase');
    console.log('  2. Login: supabase login');
    console.log('  3. Link: supabase link --project-ref nsbybnsmhvviofzfgphb');
    console.log('  4. Run: supabase db push');
    console.log('');
    console.log('Option 3: Direct PostgreSQL Connection');
    console.log('  1. Get connection string from Supabase Dashboard > Settings > Database');
    console.log('  2. Use psql or any PostgreSQL client');
    console.log('  3. Execute the migration SQL files');
    
    // Generate a connection helper script
    const helperScript = `#!/bin/bash
# Database connection helper for JTH migrations

# Get these values from Supabase Dashboard > Settings > Database
DB_HOST="db.nsbybnsmhvviofzfgphb.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="[YOUR-DATABASE-PASSWORD]" # Get from Supabase Dashboard

# Connection string
CONNECTION_STRING="postgresql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}"

echo "Connecting to database..."
psql \$CONNECTION_STRING -f combined_migrations_*.sql

# Or use this for interactive mode:
# psql \$CONNECTION_STRING
`;

    const helperPath = path.join(__dirname, 'connect-db.sh');
    await fs.writeFile(helperPath, helperScript);
    console.log('');
    console.log(`📄 Database connection helper saved to: ${helperPath}`);
    console.log('   Update the DB_PASSWORD and run it to apply migrations');
    
    return;
  }

  console.log('  ✓ API connection successful');
  
  // Try to create the migration function
  const functionCreated = await createMigrationFunction();
  
  if (functionCreated) {
    console.log('');
    console.log('✅ Migration function created!');
    console.log('You can now execute migrations through the Supabase client.');
  } else {
    console.log('');
    console.log('⚠️  Could not set up automated migration execution');
    console.log('Please use the manual methods described above.');
  }
}

// Run deployment
deploy().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});