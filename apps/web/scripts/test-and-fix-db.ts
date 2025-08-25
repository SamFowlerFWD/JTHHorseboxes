#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testDatabase() {
  console.log('🔍 Testing JTH Database State...\n')
  
  const tests = [
    {
      name: 'Leads table',
      test: async () => {
        const { data, error } = await supabase.from('leads').select('*').limit(1)
        return { success: !error, error: error?.message, count: data?.length }
      }
    },
    {
      name: 'Leads table - pipeline fields',
      test: async () => {
        const { data, error } = await supabase
          .from('leads')
          .select('stage, deal_value, configurator_snapshot')
          .limit(1)
        return { success: !error, error: error?.message }
      }
    },
    {
      name: 'Contracts table',
      test: async () => {
        const { data, error } = await supabase.from('contracts').select('*').limit(1)
        return { success: !error, error: error?.message }
      }
    },
    {
      name: 'Builds table',
      test: async () => {
        const { data, error } = await supabase.from('builds').select('*').limit(1)
        return { success: !error, error: error?.message }
      }
    },
    {
      name: 'Build stages table',
      test: async () => {
        const { data, error } = await supabase.from('build_stages').select('*').limit(1)
        return { success: !error, error: error?.message }
      }
    },
    {
      name: 'Inventory table',
      test: async () => {
        const { data, error } = await supabase.from('inventory').select('*').limit(1)
        return { success: !error, error: error?.message }
      }
    },
    {
      name: 'Production jobs (legacy)',
      test: async () => {
        const { data, error } = await supabase.from('production_jobs').select('*').limit(1)
        return { success: !error, error: error?.message, count: data?.length }
      }
    }
  ]
  
  console.log('Running tests...\n')
  const results = []
  
  for (const test of tests) {
    const result = await test.test()
    results.push({ name: test.name, ...result })
    
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${test.name}`)
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
    if ('count' in result && result.count !== undefined) {
      console.log(`   Rows: ${result.count}`)
    }
  }
  
  // Provide fix recommendations
  console.log('\n📋 MIGRATION STATUS:')
  console.log('====================')
  
  const missingTables = results.filter(r => !r.success && r.error?.includes('does not exist'))
  const missingColumns = results.filter(r => !r.success && r.error?.includes('column'))
  
  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables:')
    missingTables.forEach(t => console.log(`  - ${t.name}`))
    console.log('\n➡️  Action: Run the full migration')
  }
  
  if (missingColumns.length > 0) {
    console.log('\n⚠️  Missing columns:')
    missingColumns.forEach(t => console.log(`  - ${t.name}`))
    console.log('\n➡️  Action: Run the column additions migration')
  }
  
  if (missingTables.length === 0 && missingColumns.length === 0) {
    console.log('\n✅ Database is fully migrated!')
  }
  
  // Generate a quick fix SQL based on what's missing
  if (missingColumns.length > 0 || missingTables.length > 0) {
    console.log('\n🔧 QUICK FIX SQL:')
    console.log('================')
    console.log('Copy and run this in Supabase SQL Editor:\n')
    
    let quickFix = '-- Quick fix for missing columns and tables\n\n'
    
    // Add missing columns to leads if needed
    if (results.find(r => r.name.includes('pipeline fields') && !r.success)) {
      quickFix += `-- Add pipeline fields to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50) DEFAULT 'inquiry',
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS configurator_snapshot JSONB,
ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS contract_id UUID,
ADD COLUMN IF NOT EXISTS build_id UUID;\n\n`
    }
    
    // Add contracts table if missing
    if (results.find(r => r.name === 'Contracts table' && !r.success)) {
      quickFix += `-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES leads(id),
  document_url TEXT,
  signed_at TIMESTAMPTZ,
  total_contract_value DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);\n\n`
    }
    
    // Add builds table if missing
    if (results.find(r => r.name === 'Builds table' && !r.success)) {
      quickFix += `-- Create builds table
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_number VARCHAR(50) UNIQUE NOT NULL,
  deal_id UUID REFERENCES leads(id),
  model VARCHAR(100),
  configuration JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_start DATE,
  scheduled_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);\n\n`
    }
    
    // Add build_stages if missing
    if (results.find(r => r.name === 'Build stages table' && !r.success)) {
      quickFix += `-- Create build_stages table
CREATE TABLE IF NOT EXISTS build_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sequence INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);\n\n`
    }
    
    // Add inventory if missing
    if (results.find(r => r.name === 'Inventory table' && !r.success)) {
      quickFix += `-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);\n\n`
    }
    
    console.log(quickFix)
    
    // Save quick fix
    const fs = await import('fs')
    const quickFixPath = path.join(__dirname, '../supabase/migrations/QUICK_FIX.sql')
    fs.writeFileSync(quickFixPath, quickFix)
    console.log(`\n💾 Quick fix saved to: ${quickFixPath}`)
  }
  
  console.log('\n🌐 Supabase SQL Editor:')
  console.log('   https://app.supabase.com/project/nsbybnsmhvviofzfgphb/sql')
}

testDatabase().catch(console.error)