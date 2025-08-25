#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function insertTestData() {
  console.log('📦 Inserting Test Data for JTH Operations Platform')
  console.log('================================================\n')
  
  // 1. Insert test builds
  console.log('Creating test builds...')
  const { data: builds, error: buildsError } = await supabase
    .from('builds')
    .insert([
      {
        build_number: 'JTH-2025-001',
        model: 'Professional 3.5t',
        configuration: {
          base: 'Professional 35',
          options: ['Luxury Living', 'Solar Panel', 'Air Conditioning']
        },
        status: 'in_progress',
        scheduled_start: new Date('2025-08-01'),
        scheduled_end: new Date('2025-09-15')
      },
      {
        build_number: 'JTH-2025-002',
        model: 'Aeos 4.5t',
        configuration: {
          base: 'Aeos 45',
          options: ['Premium Interior', 'Hydraulic Ramp']
        },
        status: 'scheduled',
        scheduled_start: new Date('2025-09-01'),
        scheduled_end: new Date('2025-10-30')
      }
    ])
    .select()
  
  if (buildsError) {
    console.log('⚠️  Builds might already exist:', buildsError.message)
  } else {
    console.log('✅ Created', builds?.length, 'test builds')
  }
  
  // 2. Insert build stages for the first build
  if (builds && builds[0]) {
    console.log('Creating build stages...')
    const { data: stages, error: stagesError } = await supabase
      .from('build_stages')
      .insert([
        {
          build_id: builds[0].id,
          name: 'Chassis Preparation',
          sequence: 1,
          status: 'completed',
          started_at: new Date('2025-08-01'),
          completed_at: new Date('2025-08-05')
        },
        {
          build_id: builds[0].id,
          name: 'Floor and Walls',
          sequence: 2,
          status: 'completed',
          started_at: new Date('2025-08-06'),
          completed_at: new Date('2025-08-12')
        },
        {
          build_id: builds[0].id,
          name: 'Electrical Systems',
          sequence: 3,
          status: 'in_progress',
          started_at: new Date('2025-08-13')
        },
        {
          build_id: builds[0].id,
          name: 'Interior Fit-Out',
          sequence: 4,
          status: 'pending'
        }
      ])
      .select()
    
    if (stagesError) {
      console.log('⚠️  Stages error:', stagesError.message)
    } else {
      console.log('✅ Created', stages?.length, 'build stages')
    }
  }
  
  // 3. Insert test contracts
  console.log('Creating test contracts...')
  const { data: contracts, error: contractsError } = await supabase
    .from('contracts')
    .insert([
      {
        document_url: 'https://example.com/contract-001.pdf',
        signed_at: new Date('2025-07-15'),
        total_contract_value: 45000.00
      }
    ])
    .select()
  
  if (contractsError) {
    console.log('⚠️  Contracts error:', contractsError.message)
  } else {
    console.log('✅ Created', contracts?.length, 'test contracts')
  }
  
  // 4. Insert inventory items
  console.log('Creating inventory items...')
  const { data: inventory, error: inventoryError } = await supabase
    .from('inventory')
    .insert([
      {
        part_code: 'WHEEL-ALLOY-15',
        description: '15" Alloy Wheel',
        quantity_on_hand: 8,
        reorder_point: 4,
        unit_price: 225.00
      },
      {
        part_code: 'DOOR-TACK-LOCKER',
        description: 'Tack Locker Door Unit',
        quantity_on_hand: 3,
        reorder_point: 2,
        unit_price: 450.00
      },
      {
        part_code: 'LIGHT-LED-STRIP',
        description: 'LED Light Strip (per meter)',
        quantity_on_hand: 45,
        reorder_point: 20,
        unit_price: 35.00
      }
    ])
    .select()
  
  if (inventoryError) {
    console.log('⚠️  Inventory might already exist:', inventoryError.message)
  } else {
    console.log('✅ Created', inventory?.length, 'inventory items')
  }
  
  // 5. Update some leads to different stages
  console.log('Moving leads through pipeline stages...')
  
  // Get some existing leads
  const { data: existingLeads } = await supabase
    .from('leads')
    .select('id')
    .limit(6)
  
  if (existingLeads && existingLeads.length >= 6) {
    // Move leads to different stages
    await supabase
      .from('leads')
      .update({ stage: 'specification', deal_value: 45000, probability: 30 })
      .eq('id', existingLeads[0].id)
    
    await supabase
      .from('leads')
      .update({ stage: 'qualification', deal_value: 52000, probability: 50 })
      .eq('id', existingLeads[1].id)
    
    await supabase
      .from('leads')
      .update({ stage: 'quotation', deal_value: 48500, probability: 70 })
      .eq('id', existingLeads[2].id)
    
    await supabase
      .from('leads')
      .update({ stage: 'negotiation', deal_value: 61000, probability: 85 })
      .eq('id', existingLeads[3].id)
    
    console.log('✅ Updated lead stages for pipeline visualization')
  }
  
  console.log('\n🎉 Test data insertion complete!')
  console.log('\n📊 You can now view:')
  console.log('   • Operations Dashboard: http://localhost:3000/ops')
  console.log('   • Sales Pipeline: http://localhost:3000/ops/pipeline')
  console.log('   • Build Tracking: http://localhost:3000/ops/builds')
  console.log('   • Customer Portal: http://localhost:3000/portal/tracker/[buildId]')
}

insertTestData().catch(console.error)