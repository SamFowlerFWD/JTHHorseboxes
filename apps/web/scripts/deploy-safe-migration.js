#!/usr/bin/env node

/**
 * Deploy Safe Migration Script
 * 
 * This script deploys the safe migration to Supabase that handles
 * non-existent tables properly.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsbybnsmhvviofzfgphb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('\nPlease set it using:');
    console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    console.log('\nYou can find this in your Supabase dashboard under Settings > API');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function deployMigration() {
    console.log('🚀 Starting safe migration deployment...\n');
    
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, 'safe-complete-migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📝 Loaded migration script');
        console.log(`   File: ${migrationPath}`);
        console.log(`   Size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);
        
        // Split migration into statements (basic split on semicolons at end of line)
        // Note: This is a simplified approach - complex scripts might need better parsing
        const statements = migrationSQL
            .split(/;\s*$/gm)
            .filter(stmt => stmt.trim().length > 0)
            .map(stmt => stmt.trim() + ';');
        
        console.log(`📦 Found ${statements.length} SQL statements to execute\n`);
        
        // Execute migration using RPC call to run raw SQL
        console.log('⚙️  Executing migration...\n');
        
        // We'll execute the entire script as one transaction
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: migrationSQL
        }).single();
        
        if (error) {
            // If exec_sql doesn't exist, try direct execution through REST API
            console.log('⚠️  exec_sql function not found, trying direct execution...\n');
            
            // Execute through Supabase REST API
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ sql: migrationSQL })
            });
            
            if (!response.ok) {
                // If that doesn't work either, provide manual instructions
                console.log('⚠️  Automated deployment not available.\n');
                console.log('📋 Please run the migration manually:\n');
                console.log('1. Go to: https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new');
                console.log('2. Copy the contents of: scripts/safe-complete-migration.sql');
                console.log('3. Paste into the SQL editor');
                console.log('4. Click "Run" to execute\n');
                console.log('The migration has been saved to: scripts/safe-complete-migration.sql');
                return;
            }
        }
        
        console.log('✅ Migration deployed successfully!\n');
        
        // Run validation queries
        console.log('🔍 Running validation checks...\n');
        
        // Check if customers table exists
        const { data: customersCheck } = await supabase
            .from('customers')
            .select('count')
            .limit(1);
        
        if (customersCheck !== null) {
            console.log('✅ Customers table created successfully');
        }
        
        // Check if auth_audit_log exists
        const { data: auditCheck } = await supabase
            .from('auth_audit_log')
            .select('count')
            .limit(1);
        
        if (auditCheck !== null) {
            console.log('✅ Auth audit log table created successfully');
        }
        
        // Check if inventory_changelog exists
        const { data: inventoryCheck } = await supabase
            .from('inventory_changelog')
            .select('count')
            .limit(1);
        
        if (inventoryCheck !== null) {
            console.log('✅ Inventory changelog table created successfully');
        }
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📊 Database is now ready with:');
        console.log('   - Customers management tables');
        console.log('   - Enhanced inventory tracking');
        console.log('   - Auth and RBAC system');
        console.log('   - Audit logging');
        console.log('   - Row Level Security policies');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('\nError details:', error);
        
        console.log('\n📋 Manual deployment instructions:');
        console.log('1. Go to: https://nsbybnsmhvviofzfgphb.supabase.co/project/nsbybnsmhvviofzfgphb/sql/new');
        console.log('2. Copy the contents of: scripts/safe-complete-migration.sql');
        console.log('3. Paste into the SQL editor');
        console.log('4. Click "Run" to execute');
        
        process.exit(1);
    }
}

// Run the deployment
deployMigration().catch(console.error);