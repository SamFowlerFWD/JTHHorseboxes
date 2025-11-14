/**
 * Migration 016: Update model codes to specific variants
 * POST /api/ops/migrate - Run migration 016
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Use service role client for admin operations
    const supabase = await createServiceClient()

    console.log('🚀 Running migration 016: Update to specific model codes...')

    const results = []

    // Get all options first
    const { data: allOptionsData, error: fetchError } = await supabase
      .from('pricing_options')
      .select('id, name, applicable_models')

    if (fetchError) throw fetchError

    console.log(`Found ${allOptionsData?.length || 0} total options`)

    // Step 1: Update 3.5t to JTH 3.5T models
    console.log('Step 1: Updating 3.5t options...')
    const options35t = allOptionsData?.filter(opt => opt.applicable_models && opt.applicable_models.includes('3.5t')) || []
    console.log(`Found ${options35t.length} options with 3.5t`)

    let step1Count = 0
    for (const opt of options35t) {
      console.log(`Updating ${opt.name} (${opt.id})...`)
      const { data: updated, error } = await supabase
        .from('pricing_options')
        .update({ applicable_models: ['professional-35', 'principal-35', 'progeny-35'] })
        .eq('id', opt.id)
        .select()

      if (error) {
        console.error(`Error updating ${opt.name}:`, error)
        throw error
      }
      console.log(`Updated:`, updated)
      step1Count++
    }
    results.push({ step: 1, description: 'Updated 3.5t to JTH 3.5T models', count: step1Count })
    console.log(`✅ Updated ${step1Count} options`)

    // Step 2: Update 4.5t to JTH 4.5T models (excluding AEOS)
    console.log('Step 2: Updating 4.5t options...')
    const options45t = allOptionsData?.filter(opt => opt.applicable_models.includes('4.5t')) || []
    let step2Count = 0
    for (const opt of options45t) {
      const { error } = await supabase
        .from('pricing_options')
        .update({ applicable_models: ['professional-45', 'principal-45', 'progeny-45'] })
        .eq('id', opt.id)
      if (error) throw error
      step2Count++
    }
    results.push({ step: 2, description: 'Updated 4.5t to JTH 4.5T models', count: step2Count })
    console.log(`✅ Updated ${step2Count} options`)

    // Step 3: Update 7.2t to Zenos Discovery
    console.log('Step 3: Updating 7.2t options...')
    const options72t = allOptionsData?.filter(opt => opt.applicable_models.includes('7.2t')) || []
    let step3Count = 0
    for (const opt of options72t) {
      const { error } = await supabase
        .from('pricing_options')
        .update({ applicable_models: ['zenos-discovery-72'] })
        .eq('id', opt.id)
      if (error) throw error
      step3Count++
    }
    results.push({ step: 3, description: 'Updated 7.2t to Zenos Discovery', count: step3Count })
    console.log(`✅ Updated ${step3Count} options`)

    // Step 4: Update 7.5t to Helios 7.5T
    console.log('Step 4: Updating 7.5t options...')
    const options75t = allOptionsData?.filter(opt => opt.applicable_models.includes('7.5t')) || []
    let step4Count = 0
    for (const opt of options75t) {
      const { error } = await supabase
        .from('pricing_options')
        .update({ applicable_models: ['helios-75'] })
        .eq('id', opt.id)
      if (error) throw error
      step4Count++
    }
    results.push({ step: 4, description: 'Updated 7.5t to Helios 7.5T', count: step4Count })
    console.log(`✅ Updated ${step4Count} options`)

    // Step 5: Get final statistics
    console.log('Getting final statistics...')
    const { data: allOptions, error: statsError } = await supabase
      .from('pricing_options')
      .select('id, name, applicable_models')

    if (statsError) throw statsError

    const stats = {
      total_options: allOptions?.length || 0,
      multi_model_options: allOptions?.filter(o => o.applicable_models.length > 1).length || 0,
      jth_35_options: allOptions?.filter(o =>
        o.applicable_models.some((m: string) => ['professional-35', 'principal-35', 'progeny-35'].includes(m))
      ).length || 0,
      jth_45_options: allOptions?.filter(o =>
        o.applicable_models.some((m: string) => ['professional-45', 'principal-45', 'progeny-45'].includes(m))
      ).length || 0,
      zenos_options: allOptions?.filter(o => o.applicable_models.includes('zenos-discovery-72')).length || 0,
      helios_options: allOptions?.filter(o => o.applicable_models.includes('helios-75')).length || 0,
      old_codes_remaining: allOptions?.filter(o =>
        o.applicable_models.some((m: string) => ['3.5t', '4.5t', '7.2t', '7.5t'].includes(m))
      ).length || 0,
    }

    console.log('📊 Final Statistics:', stats)
    console.log('✅ Migration 016 completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Migration 016 completed successfully',
      results,
      stats
    })

  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    )
  }
}
