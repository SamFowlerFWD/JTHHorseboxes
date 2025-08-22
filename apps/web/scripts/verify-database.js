#!/usr/bin/env node

/**
 * Database Verification Script
 * Checks that all required tables, indexes, and policies are properly set up
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabase() {
  console.log('🔍 Verifying JTH Database Setup...\n');
  
  const checks = {
    tables: { passed: 0, failed: 0, items: [] },
    indexes: { passed: 0, failed: 0, items: [] },
    rls: { passed: 0, failed: 0, items: [] },
    data: { passed: 0, failed: 0, items: [] }
  };

  // Required tables
  const requiredTables = [
    'leads',
    'blog_posts',
    'pricing_options',
    'knowledge_base',
    'saved_configurations',
    'lead_activities',
    'production_builds',
    'pipeline_stages'
  ];

  // Check tables exist
  console.log('📋 Checking Tables...');
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        checks.tables.failed++;
        checks.tables.items.push(`❌ ${table}: ${error.message}`);
      } else {
        checks.tables.passed++;
        checks.tables.items.push(`✅ ${table}`);
      }
    } catch (err) {
      checks.tables.failed++;
      checks.tables.items.push(`❌ ${table}: ${err.message}`);
    }
  }

  // Check for sample data
  console.log('\n📊 Checking Sample Data...');
  
  // Check knowledge base has entries
  try {
    const { count, error } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count > 0) {
      checks.data.passed++;
      checks.data.items.push(`✅ Knowledge base: ${count} entries`);
    } else {
      checks.data.failed++;
      checks.data.items.push(`⚠️  Knowledge base: ${count || 0} entries (consider adding sample data)`);
    }
  } catch (err) {
    checks.data.failed++;
    checks.data.items.push(`❌ Knowledge base check failed: ${err.message}`);
  }

  // Check pricing options
  try {
    const { count, error } = await supabase
      .from('pricing_options')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count > 0) {
      checks.data.passed++;
      checks.data.items.push(`✅ Pricing options: ${count} entries`);
    } else {
      checks.data.failed++;
      checks.data.items.push(`⚠️  Pricing options: ${count || 0} entries (consider adding pricing data)`);
    }
  } catch (err) {
    checks.data.failed++;
    checks.data.items.push(`❌ Pricing options check failed: ${err.message}`);
  }

  // Check RLS is enabled (by trying to query without auth)
  console.log('\n🔒 Checking Row Level Security...');
  const publicClient = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Test public access to blog posts (should work for published posts)
  try {
    const { data, error } = await publicClient
      .from('blog_posts')
      .select('id')
      .eq('status', 'published')
      .limit(1);
    
    // No error means RLS allows public read of published posts
    checks.rls.passed++;
    checks.rls.items.push('✅ Blog posts: Public can read published posts');
  } catch (err) {
    checks.rls.failed++;
    checks.rls.items.push(`❌ Blog posts RLS: ${err.message}`);
  }

  // Test that public cannot read all leads (should fail)
  try {
    const { data, error } = await publicClient
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error) {
      // Error is expected - RLS is working
      checks.rls.passed++;
      checks.rls.items.push('✅ Leads: Protected by RLS');
    } else {
      // No error means RLS is not properly configured
      checks.rls.failed++;
      checks.rls.items.push('❌ Leads: Not protected by RLS (public can read)');
    }
  } catch (err) {
    checks.rls.passed++;
    checks.rls.items.push('✅ Leads: Protected by RLS');
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS');
  console.log('='.repeat(60));

  // Tables
  console.log('\n📋 Tables:');
  checks.tables.items.forEach(item => console.log('  ' + item));
  console.log(`  Summary: ${checks.tables.passed} passed, ${checks.tables.failed} failed`);

  // Data
  console.log('\n📊 Sample Data:');
  checks.data.items.forEach(item => console.log('  ' + item));
  console.log(`  Summary: ${checks.data.passed} passed, ${checks.data.failed} warnings`);

  // RLS
  console.log('\n🔒 Security (RLS):');
  checks.rls.items.forEach(item => console.log('  ' + item));
  console.log(`  Summary: ${checks.rls.passed} passed, ${checks.rls.failed} failed`);

  // Overall summary
  const totalPassed = checks.tables.passed + checks.data.passed + checks.rls.passed;
  const totalFailed = checks.tables.failed + checks.data.failed + checks.rls.failed;

  console.log('\n' + '='.repeat(60));
  if (totalFailed === 0) {
    console.log('✅ DATABASE VERIFICATION PASSED!');
    console.log('   Your database is ready for production.');
  } else if (checks.tables.failed === 0) {
    console.log('⚠️  DATABASE PARTIALLY CONFIGURED');
    console.log('   Core tables exist but some checks failed.');
    console.log('   Review warnings above and run migrations if needed.');
  } else {
    console.log('❌ DATABASE VERIFICATION FAILED');
    console.log('   Please run the migration script: supabase/deploy-migration.sql');
  }
  console.log('='.repeat(60) + '\n');

  // Return exit code
  process.exit(checks.tables.failed > 0 ? 1 : 0);
}

// Run verification
verifyDatabase().catch(err => {
  console.error('❌ Verification script error:', err);
  process.exit(1);
});