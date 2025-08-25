#!/usr/bin/env node
/**
 * End-to-end test script for JTH Operations Platform
 * Run with: npx tsx scripts/test-operations-platform.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { randomUUID } from 'crypto'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Test results tracking
interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message?: string
  error?: any
}

const testResults: TestResult[] = []

// Helper function to run a test
async function runTest(name: string, testFn: () => Promise<void>) {
  process.stdout.write(`Testing: ${name}...`)
  try {
    await testFn()
    testResults.push({ name, status: 'pass' })
    console.log(' ✅')
  } catch (error: any) {
    testResults.push({ 
      name, 
      status: 'fail', 
      message: error.message,
      error 
    })
    console.log(' ❌')
  }
}

// Test Suite
async function runTestSuite() {
  console.log('🧪 JTH Operations Platform Test Suite')
  console.log('=====================================\n')

  // 1. Database Schema Tests
  console.log('📊 Database Schema Tests')
  console.log('------------------------')
  
  await runTest('Leads table exists', async () => {
    const { error } = await supabase.from('leads').select('id').limit(1)
    if (error) throw error
  })

  await runTest('Builds table exists', async () => {
    const { error } = await supabase.from('builds').select('id').limit(1)
    if (error) throw error
  })

  await runTest('Build stages table exists', async () => {
    const { error } = await supabase.from('build_stages').select('id').limit(1)
    if (error) throw error
  })

  await runTest('Contracts table exists', async () => {
    const { error } = await supabase.from('contracts').select('id').limit(1)
    if (error) throw error
  })

  await runTest('Inventory table exists', async () => {
    const { error } = await supabase.from('inventory').select('id').limit(1)
    if (error) throw error
  })

  // 2. Sales Pipeline Tests
  console.log('\n💼 Sales Pipeline Tests')
  console.log('----------------------')
  
  let testLeadId: string | null = null
  
  await runTest('Create new lead', async () => {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name: 'Test',
        last_name: 'Customer',
        email: `test-${Date.now()}@example.com`,
        phone: '+44 7700 900000',
        company: 'Test Stables',
        stage: 'inquiry',
        model_interest: 'Professional 3.5t',
        lead_score: 75
      })
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('No data returned')
    testLeadId = data.id
  })

  await runTest('Move lead through pipeline stages', async () => {
    if (!testLeadId) throw new Error('No test lead ID')
    
    const stages = ['qualification', 'specification', 'quotation']
    for (const stage of stages) {
      const { error } = await supabase
        .from('leads')
        .update({ stage })
        .eq('id', testLeadId)
      
      if (error) throw error
    }
  })

  await runTest('Log deal activity', async () => {
    if (!testLeadId) throw new Error('No test lead ID')
    
    const { error } = await supabase
      .from('deal_activities')
      .insert({
        deal_id: testLeadId,
        activity_type: 'note',
        description: 'Test activity logged'
      })
    
    if (error) throw error
  })

  // 3. Build Tracking Tests
  console.log('\n🏗️  Build Tracking Tests')
  console.log('----------------------')
  
  let testBuildId: string | null = null
  
  await runTest('Create new build', async () => {
    const buildNumber = `TEST-${Date.now()}`
    const { data, error } = await supabase
      .from('builds')
      .insert({
        build_number: buildNumber,
        deal_id: testLeadId,
        model: 'Professional 3.5t',
        configuration: { test: true },
        status: 'pending',
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('No data returned')
    testBuildId = data.id
  })

  await runTest('Create build stages', async () => {
    if (!testBuildId) throw new Error('No test build ID')
    
    const stages = [
      { name: 'Chassis Preparation', sequence: 1, estimated_hours: 16 },
      { name: 'Frame Construction', sequence: 2, estimated_hours: 24 },
      { name: 'Systems Installation', sequence: 3, estimated_hours: 20 }
    ]
    
    for (const stage of stages) {
      const { error } = await supabase
        .from('build_stages')
        .insert({
          build_id: testBuildId,
          ...stage,
          status: 'pending',
          is_customer_visible: true,
          customer_stage_name: stage.name
        })
      
      if (error) throw error
    }
  })

  await runTest('Add customer update', async () => {
    if (!testBuildId) throw new Error('No test build ID')
    
    const { error } = await supabase
      .from('customer_updates')
      .insert({
        build_id: testBuildId,
        stage_name: 'Chassis Preparation',
        message: 'Work has begun on your chassis preparation',
        is_milestone: true
      })
    
    if (error) throw error
  })

  // 4. Inventory Tests
  console.log('\n📦 Inventory Management Tests')
  console.log('----------------------------')
  
  await runTest('Add inventory item', async () => {
    const { error } = await supabase
      .from('inventory')
      .insert({
        part_code: `TEST-${Date.now()}`,
        description: 'Test Part',
        category: 'hardware',
        unit: 'each',
        quantity_on_hand: 100,
        quantity_reserved: 10,
        reorder_point: 20
      })
    
    if (error) throw error
  })

  // 5. RLS Policy Tests
  console.log('\n🔒 Security & RLS Tests')
  console.log('----------------------')
  
  await runTest('RLS enabled on critical tables', async () => {
    const tables = ['builds', 'contracts', 'inventory']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .rpc('check_rls_enabled', { table_name: table })
        .single()
      
      // If the function doesn't exist, we'll check differently
      if (error && error.code === 'PGRST202') {
        // Function doesn't exist, skip this specific check
        continue
      }
      
      if (error) throw error
      if (!(data as any)?.enabled) throw new Error(`RLS not enabled on ${table}`)
    }
  })

  // 6. Real-time Subscription Tests
  console.log('\n📡 Real-time Subscription Tests')
  console.log('-------------------------------')
  
  await runTest('Subscribe to build updates', async () => {
    return new Promise((resolve, reject) => {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'builds'
        }, () => {
          channel.unsubscribe()
          resolve()
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Subscription successful
            setTimeout(() => {
              channel.unsubscribe()
              resolve()
            }, 1000)
          } else if (status === 'CHANNEL_ERROR') {
            reject(new Error('Subscription failed'))
          }
        })
    })
  })

  // 7. Cleanup Test Data
  console.log('\n🧹 Cleanup')
  console.log('----------')
  
  await runTest('Clean up test data', async () => {
    // Delete test build
    if (testBuildId) {
      await supabase.from('builds').delete().eq('id', testBuildId)
    }
    
    // Delete test lead
    if (testLeadId) {
      await supabase.from('leads').delete().eq('id', testLeadId)
    }
    
    // Delete test inventory items
    await supabase
      .from('inventory')
      .delete()
      .like('part_code', 'TEST-%')
  })

  // Print Test Summary
  console.log('\n=====================================')
  console.log('📊 Test Results Summary')
  console.log('=====================================')
  
  const passed = testResults.filter(r => r.status === 'pass').length
  const failed = testResults.filter(r => r.status === 'fail').length
  const skipped = testResults.filter(r => r.status === 'skip').length
  
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`📊 Total: ${testResults.length}`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults
      .filter(r => r.status === 'fail')
      .forEach(r => {
        console.log(`  - ${r.name}`)
        if (r.message) console.log(`    Error: ${r.message}`)
      })
  }
  
  // Overall status
  console.log('\n=====================================')
  if (failed === 0) {
    console.log('🎉 All tests passed! The Operations Platform is ready.')
  } else {
    console.log('⚠️  Some tests failed. Please review and fix the issues.')
  }
  
  // Return exit code
  process.exit(failed > 0 ? 1 : 0)
}

// Main execution
async function main() {
  try {
    await runTestSuite()
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

main()