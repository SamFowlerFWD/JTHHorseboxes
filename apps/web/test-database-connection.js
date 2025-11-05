#!/usr/bin/env node

/**
 * Simple database connection test
 * Tests if the newly created tables are accessible
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

async function testTables() {
  console.log('\n🧪 Testing Database Tables\n');
  console.log('═'.repeat(50));

  const tables = [
    'customers',
    'customer_communications',
    'customer_orders',
    'auth_audit_log'
  ];

  let allSuccess = true;

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(30)} ERROR: ${error.message}`);
        allSuccess = false;
      } else {
        console.log(`✅ ${table.padEnd(30)} EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(30)} FAILED: ${err.message}`);
      allSuccess = false;
    }
  }

  console.log('═'.repeat(50));

  if (allSuccess) {
    console.log('\n✅ All tables are accessible!\n');
    console.log('Next steps:');
    console.log('  1. Visit: http://localhost:3000/ops');
    console.log('  2. The app should now use real database');
    console.log('  3. Create admin user in Supabase Auth\n');
  } else {
    console.log('\n⚠️  Some tables had errors\n');
  }

  return allSuccess;
}

testTables()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
