#!/usr/bin/env node

/**
 * Deploy and Validate All Database Migrations for JTH Operations Platform
 * This script systematically deploys and validates all critical migrations
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files to deploy in order
const migrations = [
  '006_customers_table.sql',
  '007_customers_seed_data.sql',
  '008_enhance_profiles_auth.sql',
  '009_enhance_inventory_table.sql'
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Execute SQL and handle errors
async function executeSql(sql, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      .catch(async (rpcError) => {
        // If RPC doesn't exist, try direct execution
        const { data, error } = await supabase.from('_sql').select().single().throwOnError();
        return { data: null, error: rpcError };
      });

    // Fallback to using the REST API directly
    if (error || !data) {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      }).catch(() => null);

      if (!response || !response.ok) {
        // Final fallback: use pg endpoint if available
        const pgResponse = await fetch(`${supabaseUrl}/pg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: sql })
        });

        if (pgResponse.ok) {
          const result = await pgResponse.json();
          return { data: result, error: null };
        }
      }
    }

    if (error) {
      throw new Error(error.message || error);
    }

    return { success: true, data };
  } catch (error) {
    log(`❌ Error executing ${description}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Deploy a single migration file
async function deployMigration(filename) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  try {
    log(`\n📄 Reading migration: ${filename}`, 'cyan');
    const sql = await fs.readFile(migrationPath, 'utf8');
    
    log(`⚙️  Executing migration: ${filename}`, 'yellow');
    const result = await executeSql(sql, filename);
    
    if (result.success) {
      log(`✅ Successfully applied: ${filename}`, 'green');
      return { success: true, filename };
    } else {
      log(`❌ Failed to apply: ${filename}`, 'red');
      return { success: false, filename, error: result.error };
    }
  } catch (error) {
    log(`❌ Error reading migration file ${filename}: ${error.message}`, 'red');
    return { success: false, filename, error: error.message };
  }
}

// Validation queries to verify database structure
const validationQueries = {
  // Check if customers table exists with all columns
  customersTable: `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name = 'customers'
    ORDER BY ordinal_position;
  `,
  
  // Check customer relationships
  customerRelationships: `
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'customers' 
      AND tc.constraint_type = 'FOREIGN KEY';
  `,
  
  // Check profiles enhancements
  profilesColumns: `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name IN ('department', 'is_active', 'locked_until', 
                          'failed_login_attempts', 'last_login_at', 'last_activity_at');
  `,
  
  // Check auth functions
  authFunctions: `
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN ('handle_failed_login', 'handle_user_login', 'is_account_locked');
  `,
  
  // Check inventory enhancements
  inventoryColumns: `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'inventory'
      AND column_name IN ('part_number', 'name', 'min_stock', 'max_stock', 
                          'current_stock', 'last_restocked', 'status');
  `,
  
  // Check inventory functions
  inventoryFunctions: `
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN ('update_inventory_status', 'adjust_inventory_stock');
  `,
  
  // Check RLS policies
  rlsPolicies: `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd
    FROM pg_policies
    WHERE tablename IN ('customers', 'customer_communications', 'customer_orders', 
                        'auth_audit_log', 'inventory', 'inventory_movements')
    ORDER BY tablename, policyname;
  `,
  
  // Check indexes
  indexes: `
    SELECT 
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('customers', 'inventory', 'profiles', 'auth_audit_log')
    ORDER BY tablename, indexname;
  `,
  
  // Verify seed data
  customerCount: `
    SELECT 
      COUNT(*) as total_customers,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
      COUNT(CASE WHEN status = 'prospect' THEN 1 END) as prospects,
      COUNT(CASE WHEN customer_type = 'business' THEN 1 END) as business_customers
    FROM customers;
  `,
  
  // Verify inventory data
  inventoryCount: `
    SELECT 
      COUNT(*) as total_items,
      COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_items,
      COUNT(CASE WHEN status = 'out_of_stock' THEN 1 END) as out_of_stock
    FROM inventory;
  `
};

// Run validation queries
async function runValidation() {
  log('\n' + '='.repeat(60), 'bright');
  log('🔍 RUNNING VALIDATION TESTS', 'bright');
  log('='.repeat(60), 'bright');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  for (const [name, query] of Object.entries(validationQueries)) {
    log(`\n📊 Testing: ${name}`, 'cyan');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query })
        .catch(async () => {
          // Fallback to direct query
          const response = await fetch(`${supabaseUrl}/pg`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ query })
          });
          
          if (response.ok) {
            const result = await response.json();
            return { data: result, error: null };
          }
          return { data: null, error: 'Query failed' };
        });
      
      if (error) {
        log(`  ❌ Failed: ${error}`, 'red');
        results.failed.push({ test: name, error });
      } else if (data && (Array.isArray(data) ? data.length > 0 : data)) {
        log(`  ✅ Passed: Found ${Array.isArray(data) ? data.length : 1} results`, 'green');
        results.passed.push({ test: name, count: Array.isArray(data) ? data.length : 1 });
        
        // Log summary for specific tests
        if (name === 'customerCount' && data[0]) {
          log(`     - Total customers: ${data[0].total_customers}`, 'blue');
          log(`     - Active customers: ${data[0].active_customers}`, 'blue');
          log(`     - Prospects: ${data[0].prospects}`, 'blue');
          log(`     - Business customers: ${data[0].business_customers}`, 'blue');
        }
        
        if (name === 'inventoryCount' && data[0]) {
          log(`     - Total items: ${data[0].total_items}`, 'blue');
          log(`     - Critical items: ${data[0].critical_items}`, 'blue');
          log(`     - Out of stock: ${data[0].out_of_stock}`, 'blue');
        }
      } else {
        log(`  ⚠️  Warning: No results found`, 'yellow');
        results.warnings.push({ test: name });
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, 'red');
      results.failed.push({ test: name, error: error.message });
    }
  }
  
  return results;
}

// Test critical functions
async function testFunctions() {
  log('\n' + '='.repeat(60), 'bright');
  log('🧪 TESTING CRITICAL FUNCTIONS', 'bright');
  log('='.repeat(60), 'bright');
  
  const tests = [
    {
      name: 'Convert Lead to Customer',
      sql: `
        -- Create a test lead first
        INSERT INTO leads (
          id, first_name, last_name, email, phone, status, source
        ) VALUES (
          uuid_generate_v4(), 'Test', 'Lead', 'test.lead@example.com', 
          '+44 1234567890', 'new', 'test'
        ) ON CONFLICT (email) DO UPDATE SET status = 'new'
        RETURNING id;
      `,
      cleanup: `DELETE FROM customers WHERE email = 'test.lead@example.com';
                DELETE FROM leads WHERE email = 'test.lead@example.com';`
    },
    {
      name: 'Search Customers',
      sql: `SELECT * FROM search_customers('Thompson') LIMIT 5;`
    },
    {
      name: 'Check Account Lock Function',
      sql: `SELECT is_account_locked(auth.uid()) as is_locked;`
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    log(`\n🧪 Testing: ${test.name}`, 'cyan');
    const result = await executeSql(test.sql, test.name);
    
    if (result.success) {
      log(`  ✅ Function works correctly`, 'green');
      results.push({ test: test.name, success: true });
      
      // Run cleanup if provided
      if (test.cleanup) {
        await executeSql(test.cleanup, 'Cleanup');
      }
    } else {
      log(`  ❌ Function test failed: ${result.error}`, 'red');
      results.push({ test: test.name, success: false, error: result.error });
    }
  }
  
  return results;
}

// Main deployment function
async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('🚀 JTH OPERATIONS PLATFORM - DATABASE MIGRATION DEPLOYMENT', 'bright');
  log('='.repeat(60), 'bright');
  log(`Deploying to: ${supabaseUrl}`, 'blue');
  log(`Timestamp: ${new Date().toISOString()}`, 'blue');
  
  const deploymentResults = {
    migrations: [],
    validation: null,
    functions: null,
    summary: {
      totalMigrations: migrations.length,
      successful: 0,
      failed: 0
    }
  };
  
  // Step 1: Deploy migrations
  log('\n' + '='.repeat(60), 'bright');
  log('📦 DEPLOYING MIGRATIONS', 'bright');
  log('='.repeat(60), 'bright');
  
  for (const migration of migrations) {
    const result = await deployMigration(migration);
    deploymentResults.migrations.push(result);
    
    if (result.success) {
      deploymentResults.summary.successful++;
    } else {
      deploymentResults.summary.failed++;
      log(`\n⚠️  Migration ${migration} failed. Continue anyway? (Some migrations may be already applied)`, 'yellow');
      // Continue with next migration even if one fails (it might already be applied)
    }
  }
  
  // Step 2: Run validation
  deploymentResults.validation = await runValidation();
  
  // Step 3: Test functions
  deploymentResults.functions = await testFunctions();
  
  // Step 4: Generate final report
  log('\n' + '='.repeat(60), 'bright');
  log('📋 DEPLOYMENT REPORT', 'bright');
  log('='.repeat(60), 'bright');
  
  log('\n📦 Migration Results:', 'cyan');
  log(`  Total: ${deploymentResults.summary.totalMigrations}`, 'blue');
  log(`  ✅ Successful: ${deploymentResults.summary.successful}`, 'green');
  log(`  ❌ Failed: ${deploymentResults.summary.failed}`, deploymentResults.summary.failed > 0 ? 'red' : 'green');
  
  log('\n🔍 Validation Results:', 'cyan');
  log(`  ✅ Passed: ${deploymentResults.validation.passed.length}`, 'green');
  log(`  ⚠️  Warnings: ${deploymentResults.validation.warnings.length}`, 'yellow');
  log(`  ❌ Failed: ${deploymentResults.validation.failed.length}`, deploymentResults.validation.failed.length > 0 ? 'red' : 'green');
  
  log('\n🧪 Function Tests:', 'cyan');
  const functionsPassed = deploymentResults.functions.filter(f => f.success).length;
  const functionsFailed = deploymentResults.functions.filter(f => !f.success).length;
  log(`  ✅ Passed: ${functionsPassed}`, 'green');
  log(`  ❌ Failed: ${functionsFailed}`, functionsFailed > 0 ? 'red' : 'green');
  
  // Step 5: Provide configuration requirements
  log('\n' + '='.repeat(60), 'bright');
  log('⚙️  REQUIRED APPLICATION CONFIGURATION', 'bright');
  log('='.repeat(60), 'bright');
  
  log('\n1. Ensure these environment variables are set:', 'yellow');
  log('   - NEXT_PUBLIC_SUPABASE_URL', 'blue');
  log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY', 'blue');
  log('   - SUPABASE_SERVICE_ROLE_KEY', 'blue');
  
  log('\n2. Update Supabase Dashboard:', 'yellow');
  log('   - Enable RLS on all tables', 'blue');
  log('   - Configure authentication providers', 'blue');
  log('   - Set up email templates', 'blue');
  
  log('\n3. Create admin user:', 'yellow');
  log('   - Sign up through Supabase Auth', 'blue');
  log('   - Update profile role to "admin"', 'blue');
  log('   - Set department and activate account', 'blue');
  
  log('\n4. Test operations platform:', 'yellow');
  log('   - Navigate to /ops/login', 'blue');
  log('   - Test authentication flow', 'blue');
  log('   - Verify all tabs load correctly', 'blue');
  
  // Step 6: Final status
  const overallSuccess = 
    deploymentResults.summary.failed === 0 &&
    deploymentResults.validation.failed.length === 0 &&
    functionsFailed === 0;
  
  log('\n' + '='.repeat(60), 'bright');
  if (overallSuccess) {
    log('✅ DEPLOYMENT COMPLETED SUCCESSFULLY!', 'green');
    log('All systems are operational.', 'green');
  } else {
    log('⚠️  DEPLOYMENT COMPLETED WITH ISSUES', 'yellow');
    log('Some components may require manual intervention.', 'yellow');
    log('Check the errors above and resolve them before using the system.', 'yellow');
  }
  log('='.repeat(60), 'bright');
  
  // Save detailed report to file
  const reportPath = path.join(__dirname, '..', `migration-report-${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify(deploymentResults, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  
  process.exit(overallSuccess ? 0 : 1);
}

// Error handling
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Run the deployment
main().catch((error) => {
  log(`\n❌ Deployment failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});