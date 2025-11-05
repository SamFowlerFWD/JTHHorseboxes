#!/usr/bin/env node

/**
 * Quick Database Check Script
 * 
 * Minimal script to quickly verify database connectivity and table existence
 * Run with: node scripts/quick-db-check.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Quick check without detailed validation
async function quickCheck() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.log('❌ Supabase not configured')
    return false
  }
  
  console.log('\n🔍 Quick Database Check\n')
  console.log(`URL: ${url}`)
  console.log('-'.repeat(40))
  
  const supabase = createClient(url, key)
  
  const tables = {
    customers: false,
    inventory: false,
    profiles: false
  }
  
  // Check each table
  for (const table of Object.keys(tables)) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      tables[table] = !error || !error.message.includes('does not exist')
      console.log(`${tables[table] ? '✅' : '❌'} ${table}`)
    } catch {
      console.log(`❌ ${table}`)
    }
  }
  
  console.log('-'.repeat(40))
  
  const allPresent = Object.values(tables).every(v => v)
  if (allPresent) {
    console.log('✅ All critical tables present!')
    console.log('\nRun "npm run validate:db" for detailed validation')
  } else {
    console.log('⚠️  Some tables missing')
    console.log('\nTo fix:')
    console.log('1. Run migration: apps/web/APPLY_NOW_COMPLETE_MIGRATION.sql')
    console.log('2. Then verify: npm run validate:db')
  }
  
  return allPresent
}

quickCheck()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })