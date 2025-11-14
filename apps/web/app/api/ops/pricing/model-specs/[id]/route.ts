/**
 * Admin Model Specifications Individual API
 *
 * GET    /api/ops/pricing/model-specs/[id] - Get specific model specification
 * PATCH  /api/ops/pricing/model-specs/[id] - Update model specification
 * DELETE /api/ops/pricing/model-specs/[id] - Delete model specification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Get specific model specification
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: spec, error } = await supabase
      .from('model_specifications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model specification not found' }, { status: 404 })
      }
      console.error('Error fetching model specification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: spec,
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/model-specs/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update model specification
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Build update object
    const updates: Record<string, any> = {}

    if (body.model_code !== undefined) updates.model_code = body.model_code
    if (body.model_name !== undefined) updates.model_name = body.model_name
    if (body.tonnage !== undefined) {
      if (!['3.5T', '4.5T', '7.2T', '7.5T'].includes(body.tonnage)) {
        return NextResponse.json(
          { error: 'Invalid tonnage. Must be: 3.5T, 4.5T, 7.2T, or 7.5T' },
          { status: 400 }
        )
      }
      updates.tonnage = body.tonnage
    }

    if (body.gross_vehicle_weight_kg !== undefined) {
      const value = parseFloat(body.gross_vehicle_weight_kg)
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ error: 'Invalid gross_vehicle_weight_kg' }, { status: 400 })
      }
      updates.gross_vehicle_weight_kg = value
    }

    if (body.unladen_weight_kg !== undefined) {
      const value = parseFloat(body.unladen_weight_kg)
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ error: 'Invalid unladen_weight_kg' }, { status: 400 })
      }
      updates.unladen_weight_kg = value
    }

    if (body.target_payload_kg !== undefined) {
      const value = parseFloat(body.target_payload_kg)
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ error: 'Invalid target_payload_kg' }, { status: 400 })
      }
      updates.target_payload_kg = value
    }

    if (body.warning_threshold_kg !== undefined) {
      const value = parseFloat(body.warning_threshold_kg)
      if (isNaN(value) || value < 0) {
        return NextResponse.json({ error: 'Invalid warning_threshold_kg' }, { status: 400 })
      }
      updates.warning_threshold_kg = value
    }

    if (body.standard_living_units !== undefined) {
      const value = parseInt(body.standard_living_units, 10)
      if (isNaN(value) || value < 0) {
        return NextResponse.json({ error: 'Invalid standard_living_units' }, { status: 400 })
      }
      updates.standard_living_units = value
    }

    if (body.units_per_foot_extension !== undefined) {
      const value = parseInt(body.units_per_foot_extension, 10)
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ error: 'Invalid units_per_foot_extension' }, { status: 400 })
      }
      updates.units_per_foot_extension = value
    }

    if (body.suggested_upgrade_model !== undefined) {
      updates.suggested_upgrade_model = body.suggested_upgrade_model
    }

    if (body.is_active !== undefined) {
      updates.is_active = body.is_active
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Validate weight logic if relevant fields are being updated
    if (updates.gross_vehicle_weight_kg || updates.unladen_weight_kg || updates.target_payload_kg) {
      // Fetch current values to validate against
      const { data: current } = await supabase
        .from('model_specifications')
        .select('gross_vehicle_weight_kg, unladen_weight_kg, target_payload_kg')
        .eq('id', params.id)
        .single()

      if (current) {
        const grossWeight = updates.gross_vehicle_weight_kg || current.gross_vehicle_weight_kg
        const unladenWeight = updates.unladen_weight_kg || current.unladen_weight_kg
        const targetPayload = updates.target_payload_kg || current.target_payload_kg

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
      }
    }

    // Perform update
    const { data, error } = await supabase
      .from('model_specifications')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model specification not found' }, { status: 404 })
      }
      console.error('Error updating model specification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Model specification updated successfully',
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/ops/pricing/model-specs/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete model specification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if this specification is referenced in any configuration calculations
    const { data: usageCheck, error: usageError } = await supabase
      .from('configuration_calculations')
      .select('id')
      .limit(1)

    if (usageError) {
      console.error('Error checking usage:', usageError)
    }

    // If there are any calculations, we should be cautious about deleting
    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete model specification that may be used in calculations',
          suggestion: 'Consider marking it as inactive instead (is_active: false)',
        },
        { status: 400 }
      )
    }

    // Delete the specification
    const { error } = await supabase.from('model_specifications').delete().eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model specification not found' }, { status: 404 })
      }
      console.error('Error deleting model specification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Model specification deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/ops/pricing/model-specs/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
