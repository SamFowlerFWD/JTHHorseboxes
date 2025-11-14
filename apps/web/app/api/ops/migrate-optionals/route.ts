import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Migration endpoint to update all optional extras to apply to all JTH models
 * Excludes AEOS models from optional extras
 */
export async function POST() {
  try {
    const supabase = await createServiceClient()

    console.log('🚀 Running migration: Update optional extras to all JTH models...')

    // JTH models (excluding AEOS)
    const jthModels = [
      'professional-35',
      'principal-35',
      'progeny-35',
      'professional-45',
      'principal-45',
      'progeny-45',
      'zenos-discovery-72',
      'helios-75',
    ]

    // Update all non-base category options
    const { data, error } = await supabase
      .from('pricing_options')
      .update({ applicable_models: jthModels })
      .neq('category', 'base')
      .select('id, name, category')

    if (error) {
      console.error('Error updating optional extras:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get stats
    const { count: totalOptionalExtras } = await supabase
      .from('pricing_options')
      .select('*', { count: 'exact', head: true })
      .neq('category', 'base')

    console.log(`✅ Updated ${data?.length || 0} optional extras`)
    console.log(`📊 Total optional extras: ${totalOptionalExtras}`)

    return NextResponse.json({
      success: true,
      message: 'Optional extras updated successfully',
      stats: {
        updated: data?.length || 0,
        total_optional_extras: totalOptionalExtras,
        jth_models: jthModels,
      },
    })
  } catch (error: any) {
    console.error('Error in migration:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
