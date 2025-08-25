#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

async function main() {
  console.log('🚀 JTH Operations Platform - Database Migration')
  console.log('================================================\n')
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations')
  
  // Migration files in order
  const migrations = [
    '005a_fix_leads_and_contracts.sql',
    '005b_builds_and_stages.sql', 
    '005c_inventory_and_materials.sql',
    '005d_rls_policies.sql',
    '005e_triggers_and_data.sql'
  ]
  
  // Combine all migrations into one
  let combinedSql = '-- COMBINED JTH OPERATIONS MIGRATION\n\n'
  
  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration)
    if (fs.existsSync(filePath)) {
      console.log(`📄 Reading ${migration}...`)
      const content = fs.readFileSync(filePath, 'utf8')
      combinedSql += `\n-- ================== ${migration} ==================\n`
      combinedSql += content
      combinedSql += '\n\n'
    } else {
      console.error(`❌ Missing: ${migration}`)
      process.exit(1)
    }
  }
  
  // Save combined migration
  const outputPath = path.join(migrationsDir, 'COMBINED_OPERATIONS_MIGRATION.sql')
  fs.writeFileSync(outputPath, combinedSql)
  
  console.log(`\n✅ Combined migration saved to: ${outputPath}`)
  console.log('\n📋 NEXT STEPS:')
  console.log('================================================')
  console.log('1. Open Supabase Dashboard:')
  console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com/project/').replace('https://', 'https://app.')}/sql`)
  console.log('\n2. Copy the contents of:')
  console.log(`   ${outputPath}`)
  console.log('\n3. Paste and run in SQL Editor')
  console.log('\n4. The migration will:')
  console.log('   - Extend leads table with pipeline fields')
  console.log('   - Create contracts and deal tracking')
  console.log('   - Add comprehensive build tracking')
  console.log('   - Implement inventory management')
  console.log('   - Set up RLS policies for all roles')
  console.log('   - Add triggers and sample data')
  console.log('\n✨ After running, test at: http://localhost:3000/ops')
  
  // Also create a verification script
  const verificationSql = `
-- VERIFY JTH OPERATIONS MIGRATION
-- Run this after applying the migration to verify success

-- Check tables exist
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'leads', 'contracts', 'deal_activities', 'pipeline_automations',
    'builds', 'build_stages', 'build_tasks', 'build_media',
    'inventory', 'suppliers', 'purchase_orders',
    'customer_updates', 'quality_checks'
  )
ORDER BY table_name;

-- Check critical columns on leads table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name IN ('stage', 'deal_value', 'configurator_snapshot', 'user_id')
ORDER BY column_name;

-- Count rows in key tables
SELECT 'leads' as table_name, COUNT(*) as row_count FROM leads
UNION ALL
SELECT 'builds', COUNT(*) FROM builds
UNION ALL  
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'stage_templates', COUNT(*) FROM stage_templates;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('leads', 'builds', 'contracts', 'inventory')
ORDER BY tablename;
`
  
  const verifyPath = path.join(migrationsDir, 'VERIFY_MIGRATION.sql')
  fs.writeFileSync(verifyPath, verificationSql)
  console.log(`\n📝 Verification script saved to: ${verifyPath}`)
}

main().catch(console.error)