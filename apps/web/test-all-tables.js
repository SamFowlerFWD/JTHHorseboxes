#!/usr/bin/env node

/**
 * Comprehensive database test - all 11 tables
 */

require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAllTables() {
  console.log('\n🎯 COMPLETE DATABASE VERIFICATION\n');
  console.log('═'.repeat(60));

  const tables = [
    // Original tables
    { name: 'customers', category: 'Core' },
    { name: 'customer_communications', category: 'Core' },
    { name: 'customer_orders', category: 'Core' },
    { name: 'auth_audit_log', category: 'Core' },

    // New tables
    { name: 'profiles', category: 'Auth' },
    { name: 'leads', category: 'CRM' },
    { name: 'lead_activities', category: 'CRM' },
    { name: 'quotes', category: 'Sales' },
    { name: 'quote_items', category: 'Sales' },
    { name: 'inventory', category: 'Stock' },
    { name: 'inventory_movements', category: 'Stock' }
  ];

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({
          ...table,
          status: '❌',
          message: error.message,
          success: false
        });
        failCount++;
      } else {
        results.push({
          ...table,
          status: '✅',
          message: `${count || 0} rows`,
          success: true
        });
        successCount++;
      }
    } catch (err) {
      results.push({
        ...table,
        status: '❌',
        message: err.message,
        success: false
      });
      failCount++;
    }
  }

  // Group by category
  const categories = [...new Set(results.map(r => r.category))];

  categories.forEach(category => {
    console.log(`\n📁 ${category} Tables`);
    console.log('─'.repeat(60));

    results
      .filter(r => r.category === category)
      .forEach(r => {
        console.log(`${r.status} ${r.name.padEnd(30)} ${r.message}`);
      });
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 SUMMARY: ${successCount}/${tables.length} tables accessible`);

  if (failCount === 0) {
    console.log('\n🎉 SUCCESS! All tables are working!\n');
    console.log('Your complete operations platform database:');
    console.log('  ✅ Customer Management');
    console.log('  ✅ Lead Tracking & CRM');
    console.log('  ✅ Quote Generation');
    console.log('  ✅ Inventory Management');
    console.log('  ✅ Order Processing');
    console.log('  ✅ Security & Audit Logging\n');
    console.log('Next steps:');
    console.log('  1. Create admin user: Visit Supabase Auth');
    console.log('  2. Add sample data (optional)');
    console.log('  3. Test operations platform: http://localhost:3000/ops\n');
  } else {
    console.log(`\n⚠️  ${failCount} table(s) had errors - see above for details\n`);
  }

  return failCount === 0;
}

testAllTables()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
