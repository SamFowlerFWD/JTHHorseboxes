#!/usr/bin/env node

// Check ops-specific tables and their data
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkOpsTables() {
  console.log('🔍 Checking Ops Dashboard Tables...\n')
  
  try {
    // Check production_jobs table structure
    console.log('📊 Production Jobs Table:')
    console.log('=' .repeat(50))
    
    const { data: jobs, error: jobsError } = await supabase
      .from('production_jobs')
      .select('*')
      .limit(5)
    
    if (jobsError) {
      console.log('❌ Error fetching production_jobs:', jobsError.message)
    } else {
      console.log(`✅ Found ${jobs.length} production jobs`)
      if (jobs.length > 0) {
        console.log('\nSample job structure:')
        console.log(JSON.stringify(jobs[0], null, 2))
      }
    }
    
    console.log('\n📊 Orders Table:')
    console.log('=' .repeat(50))
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)
    
    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError.message)
    } else {
      console.log(`✅ Found ${orders.length} orders`)
      if (orders.length > 0) {
        console.log('\nSample order structure:')
        console.log(JSON.stringify(orders[0], null, 2))
      }
    }
    
    console.log('\n📊 Leads Table (with ops fields):')
    console.log('=' .repeat(50))
    
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, first_name, last_name, stage, model_interest, assigned_to, lead_score, tags')
      .limit(5)
    
    if (leadsError) {
      console.log('❌ Error fetching leads:', leadsError.message)
    } else {
      console.log(`✅ Found ${leads.length} leads`)
      if (leads.length > 0) {
        console.log('\nSample lead with ops fields:')
        console.log(JSON.stringify(leads[0], null, 2))
      }
    }
    
    // Check if we need to insert sample data
    if (!jobs || jobs.length === 0) {
      console.log('\n⚠️  No production jobs found. Inserting sample data...')
      
      const sampleJob = {
        job_number: 'JOB-2025-0001',
        order_number: 'ORD-2025-0001',
        customer_name: 'Test Customer 1',
        model: 'Professional 4.5t',
        status: 'in_progress',
        current_stage: 'painting',
        priority: 1,
        start_date: '2025-07-01',
        target_date: '2025-08-25',
        stage_progress: {
          chassis_prep: {status: 'completed', completion: 100, hours: 18},
          floor_walls: {status: 'completed', completion: 100, hours: 22},
          electrical: {status: 'completed', completion: 100, hours: 15},
          plumbing: {status: 'completed', completion: 100, hours: 14},
          interior: {status: 'completed', completion: 100, hours: 35},
          painting: {status: 'in_progress', completion: 65, hours: 13},
          testing: {status: 'pending', completion: 0, hours: 0},
          final: {status: 'pending', completion: 0, hours: 0}
        },
        completed_stages: ['chassis_prep', 'floor_walls', 'electrical', 'plumbing', 'interior'],
        assigned_team: ['Steven Warner', 'Workshop Team']
      }
      
      const { data: newJob, error: insertError } = await supabase
        .from('production_jobs')
        .insert(sampleJob)
        .select()
        .single()
      
      if (insertError) {
        console.log('❌ Error inserting sample job:', insertError.message)
      } else {
        console.log('✅ Sample production job created:', newJob.job_number)
      }
    }
    
    console.log('\n✅ Ops tables check complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkOpsTables()