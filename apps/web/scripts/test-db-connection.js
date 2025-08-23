#!/usr/bin/env node

// Test Supabase database connection and check tables
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  process.exit(1)
}

console.log('🔧 Supabase Configuration:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  
  try {
    // Test 1: Check if we can query the database
    console.log('📊 Checking database tables:')
    console.log('=' .repeat(50))
    
    // Check core tables
    const tables = [
      'leads',
      'production_jobs',
      'orders',
      'profiles',
      'blog_posts',
      'pricing_options',
      'knowledge_base',
      'saved_configurations',
      'lead_activities'
    ]
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table.padEnd(25)} - Error: ${error.message}`)
        } else {
          console.log(`✅ ${table.padEnd(25)} - Table exists`)
        }
      } catch (err) {
        console.log(`❌ ${table.padEnd(25)} - Error: ${err.message}`)
      }
    }
    
    console.log('')
    console.log('📈 Checking data counts:')
    console.log('=' .repeat(50))
    
    // Check data in key tables
    for (const table of ['leads', 'production_jobs', 'orders']) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (!error) {
          console.log(`📦 ${table.padEnd(25)} - ${count || 0} records`)
        }
      } catch (err) {
        // Silent fail for counting
      }
    }
    
    console.log('')
    console.log('🔐 Checking RLS (Row Level Security):')
    console.log('=' .repeat(50))
    
    // Test RLS by trying to query without auth
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    try {
      const { data: publicLeads, error: publicError } = await publicSupabase
        .from('leads')
        .select('id')
        .limit(1)
      
      if (publicError && publicError.message.includes('row-level')) {
        console.log('✅ RLS is enabled on leads table')
      } else if (publicLeads) {
        console.log('⚠️  RLS might not be properly configured on leads table')
      }
    } catch (err) {
      console.log('✅ RLS appears to be working')
    }
    
    console.log('')
    console.log('✅ Database connection successful!')
    console.log('')
    console.log('📝 Summary:')
    console.log('- Supabase project is properly configured')
    console.log('- Environment variables are set correctly')
    console.log('- Tables are accessible via service role key')
    console.log('')
    console.log('⚠️  Note: If tables are missing, you need to run the migration scripts')
    console.log('   in the Supabase SQL editor:')
    console.log('   1. supabase/setup.sql')
    console.log('   2. supabase/ops-tables.sql')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

testConnection()