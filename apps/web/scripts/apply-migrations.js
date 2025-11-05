#!/usr/bin/env node

/**
 * Apply Migrations Script
 * This script guides through the migration process and validates results
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testDatabaseStatus() {
  console.log('\n📊 Current Database Status:\n');
  
  const tables = [
    { name: 'customers', critical: true },
    { name: 'inventory', critical: true },
    { name: 'profiles', critical: true },
    { name: 'auth_audit_log', critical: false }
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table.name}: Not found`);
        results[table.name] = false;
      } else {
        console.log(`✅ ${table.name}: Exists`);
        results[table.name] = true;
      }
    } catch (err) {
      console.log(`❌ ${table.name}: Error checking`);
      results[table.name] = false;
    }
  }
  
  return results;
}

async function generateMigrationReport() {
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    supabaseUrl,
    status: 'MIGRATION_REQUIRED',
    tables: {},
    instructions: []
  };
  
  // Test current status
  const status = await testDatabaseStatus();
  report.tables = status;
  
  // Check if all critical tables exist
  const criticalTablesExist = status.customers && status.inventory && status.profiles;
  
  if (!criticalTablesExist) {
    console.log('\n⚠️  MIGRATION REQUIRED\n');
    console.log('Please follow these steps to apply migrations:\n');
    
    report.instructions = [
      '1. Open Supabase SQL Editor',
      '2. Copy the migration SQL from one of these files:',
      '   - apps/web/supabase/quick-setup.sql (Quick setup)',
      '   - apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql (Full migration)',
      '3. Paste and execute in SQL Editor',
      '4. Run this script again to verify'
    ];
    
    console.log('1. Open the Supabase SQL Editor:');
    console.log(`   ${supabaseUrl}/project/nsbybnsmhvviofzfgphb/sql/new\n`);
    
    console.log('2. Choose one of these migration approaches:\n');
    console.log('   OPTION A - Quick Setup (Recommended for testing):');
    console.log('   Copy contents from: apps/web/supabase/quick-setup.sql\n');
    
    console.log('   OPTION B - Full Migration:');
    console.log('   Copy contents from: apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql\n');
    
    console.log('3. Paste the SQL into the editor and click "Run"\n');
    
    console.log('4. After execution, run this script again to verify:\n');
    console.log('   node scripts/apply-migrations.js\n');
    
    // Save report
    const reportPath = path.join(__dirname, '..', `migration-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
  } else {
    console.log('\n✅ All critical tables exist!');
    report.status = 'MIGRATION_COMPLETE';
    
    // Test data access
    console.log('\n🔍 Testing data access:\n');
    
    // Test customers
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*')
      .limit(3);
    
    if (!custError && customers) {
      console.log(`✅ Customers table: ${customers.length} records accessible`);
      report.customerCount = customers.length;
    }
    
    // Test inventory
    const { data: inventory, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .limit(3);
    
    if (!invError && inventory) {
      console.log(`✅ Inventory table: ${inventory.length} records accessible`);
      report.inventoryCount = inventory.length;
    }
    
    // Test profiles
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(3);
    
    if (!profError && profiles) {
      console.log(`✅ Profiles table: ${profiles.length} records accessible`);
      report.profileCount = profiles.length;
    }
    
    console.log('\n🎉 Database is ready for use!');
    
    // Save success report
    const reportPath = path.join(__dirname, '..', `migration-success-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Success report saved to: ${reportPath}`);
  }
  
  return report;
}

async function main() {
  console.log('=' .repeat(60));
  console.log('   J TAYLOR HORSEBOXES - DATABASE MIGRATION ASSISTANT');
  console.log('=' .repeat(60));
  
  await generateMigrationReport();
}

main().catch(console.error);