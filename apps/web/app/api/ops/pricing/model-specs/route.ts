/**
 * Admin Model Specifications API
 *
 * GET  /api/ops/pricing/model-specs - List all model specifications
 * POST /api/ops/pricing/model-specs - Create new model specification
 *
 * Query params (GET):
 * - model_code: Filter by specific model
 * - tonnage: Filter by tonnage (3.5T, 4.5T, 7.2T, 7.5T)
 * - is_active: Filter by active status (true/false)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ModelSpecification } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// GET - List model specifications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const modelCode = searchParams.get('model_code')
    const tonnage = searchParams.get('tonnage')
    const isActive = searchParams.get('is_active')

    // Build query
    let query = supabase.from('model_specifications').select('*').order('tonnage', { ascending: true })

    // Apply filters
    if (modelCode) {
      query = query.eq('model_code', modelCode)
    }

    if (tonnage) {
      if (!['3.5T', '4.5T', '7.2T', '7.5T'].includes(tonnage)) {
        return NextResponse.json(
          { error: 'Invalid tonnage. Must be: 3.5T, 4.5T, 7.2T, or 7.5T' },
          { status: 400 }
        )
      }
      query = query.eq('tonnage', tonnage)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: specs, error } = await query

    if (error) {
      console.error('Error fetching model specifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: specs || [],
      count: specs?.length || 0,
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/model-specs:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new model specification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check admin authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'model_code',
      'model_name',
      'tonnage',
      'gross_vehicle_weight_kg',
      'unladen_weight_kg',
      'target_payload_kg',
      'warning_threshold_kg',
      'standard_living_units',
      'units_per_foot_extension',
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate tonnage value
    if (!['3.5T', '4.5T', '7.2T', '7.5T'].includes(body.tonnage)) {
      return NextResponse.json(
        { error: 'Invalid tonnage. Must be: 3.5T, 4.5T, 7.2T, or 7.5T' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const grossWeight = parseFloat(body.gross_vehicle_weight_kg)
    const unladenWeight = parseFloat(body.unladen_weight_kg)
    const targetPayload = parseFloat(body.target_payload_kg)
    const warningThreshold = parseFloat(body.warning_threshold_kg)
    const standardLivingUnits = parseInt(body.standard_living_units, 10)
    const unitsPerFoot = parseInt(body.units_per_foot_extension, 10)

    if (
      isNaN(grossWeight) ||
      isNaN(unladenWeight) ||
      isNaN(targetPayload) ||
      isNaN(warningThreshold) ||
      isNaN(standardLivingUnits) ||
      isNaN(unitsPerFoot)
    ) {
      return NextResponse.json({ error: 'Invalid numeric values in specification' }, { status: 400 })
    }

    // Validate weight logic
    if (unladenWeight >= grossWeight) {
      return NextResponse.json(
        { error: 'unladen_weight_kg must be less than gross_vehicle_weight_kg' },
        { status: 400 }
      )
    }

    if (targetPayload > grossWeight - unladenWeight) {
      return NextResponse.json(
        { error: 'target_payload_kg cannot exceed available payload (gross - unladen)' },
        { status: 400 }
      )
    }

    // Check if model_code already exists
    const { data: existing } = await supabase
      .from('model_specifications')
      .select('id, model_code')
      .eq('model_code', body.model_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Model specification with code "${body.model_code}" already exists` },
        { status: 409 }
      )
    }

    // Create new specification
    const newSpec = {
      model_code: body.model_code,
      model_name: body.model_name,
      tonnage: body.tonnage,
      gross_vehicle_weight_kg: grossWeight,
      unladen_weight_kg: unladenWeight,
      target_payload_kg: targetPayload,
      warning_threshold_kg: warningThreshold,
      standard_living_units: standardLivingUnits,
      units_per_foot_extension: unitsPerFoot,
      suggested_upgrade_model: body.suggested_upgrade_model || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
    }

    const { data, error } = await supabase
      .from('model_specifications')
      .insert(newSpec)
      .select()
      .single()

    if (error) {
      console.error('Error creating model specification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Model specification created: ${body.model_name} (${body.model_code})`,
    })
  } catch (error: any) {
    console.error('Error in POST /api/ops/pricing/model-specs:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
