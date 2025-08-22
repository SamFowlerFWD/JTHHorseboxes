#!/usr/bin/env node

/**
 * Database Migration Check Script
 * Verifies that all required migrations have been applied to the production database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health and migrations...\n');

  const checks = {
    tables: false,
    knowledge_base: false,
    admin_users: false,
    functions: false,
    sample_data: false
  };

  try {
    // 1. Check if core tables exist
    console.log('1. Checking core tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (!tablesError) {
      checks.tables = true;
      console.log('✅ Core tables exist');
    } else {
      console.log('❌ Core tables missing:', tablesError.message);
    }

    // 2. Check knowledge base
    console.log('\n2. Checking knowledge base...');
    const { count: kbCount, error: kbError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (!kbError && kbCount > 0) {
      checks.knowledge_base = true;
      console.log(`✅ Knowledge base populated (${kbCount} articles)`);
    } else if (!kbError) {
      console.log('⚠️  Knowledge base exists but is empty');
    } else {
      console.log('❌ Knowledge base table missing:', kbError.message);
    }

    // 3. Check admin users
    console.log('\n3. Checking admin users...');
    const { count: adminCount, error: adminError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (!adminError && adminCount > 0) {
      checks.admin_users = true;
      console.log(`✅ Admin users exist (${adminCount} users)`);
    } else if (!adminError) {
      console.log('⚠️  Admin users table exists but is empty');
      console.log('   Run: node scripts/create-admin.js to create an admin user');
    } else {
      console.log('❌ Admin users table missing:', adminError.message);
    }

    // 4. Check if search function exists
    console.log('\n4. Checking database functions...');
    const { data: searchTest, error: searchError } = await supabase
      .rpc('search_knowledge_base', { query_text: 'test' });

    if (!searchError) {
      checks.functions = true;
      console.log('✅ Database functions installed');
    } else {
      console.log('❌ Database functions missing:', searchError.message);
    }

    // 5. Check for JTH model data
    console.log('\n5. Checking sample data...');
    const { count: modelCount, error: modelError } = await supabase
      .from('jth_models')
      .select('*', { count: 'exact', head: true });

    if (!modelError && modelCount > 0) {
      checks.sample_data = true;
      console.log(`✅ JTH models data loaded (${modelCount} models)`);
    } else if (!modelError) {
      console.log('⚠️  JTH models table exists but is empty');
    } else {
      console.log('❌ JTH models table missing:', modelError.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('DATABASE STATUS SUMMARY');
    console.log('='.repeat(50));
    
    const allChecks = Object.values(checks);
    const passedChecks = allChecks.filter(Boolean).length;
    const totalChecks = allChecks.length;

    if (passedChecks === totalChecks) {
      console.log(`✅ All checks passed (${passedChecks}/${totalChecks})`);
      console.log('Database is ready for production!');
      process.exit(0);
    } else if (passedChecks > 0) {
      console.log(`⚠️  Partial setup (${passedChecks}/${totalChecks} checks passed)`);
      console.log('\nTo complete setup:');
      if (!checks.tables) console.log('  - Run migrations to create tables');
      if (!checks.knowledge_base) console.log('  - Import knowledge base content');
      if (!checks.admin_users) console.log('  - Create admin users');
      if (!checks.functions) console.log('  - Install database functions');
      if (!checks.sample_data) console.log('  - Load sample data');
      process.exit(1);
    } else {
      console.log('❌ Database not configured');
      console.log('Run the migration scripts first');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

// Run the check
checkDatabaseHealth();