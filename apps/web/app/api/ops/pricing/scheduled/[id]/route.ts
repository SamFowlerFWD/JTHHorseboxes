/**
 * Admin Scheduled Pricing Individual API
 *
 * GET    /api/ops/pricing/scheduled/[id] - Get specific scheduled change
 * PATCH  /api/ops/pricing/scheduled/[id] - Update scheduled change
 * DELETE /api/ops/pricing/scheduled/[id] - Cancel scheduled change
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Get specific scheduled price change
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

    const { data: scheduled, error } = await supabase
      .from('scheduled_pricing')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled price change not found' }, { status: 404 })
      }
      console.error('Error fetching scheduled pricing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get associated pricing option details
    const { data: option } = await supabase
      .from('pricing_options')
      .select('id, name, model, category, price, price_per_foot, weight_kg, living_area_units, is_available')
      .eq('id', scheduled.option_id)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        ...scheduled,
        option: option || null,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/scheduled/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update scheduled price change
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

    // Check if scheduled change exists and is still pending
    const { data: existing, error: existingError } = await supabase
      .from('scheduled_pricing')
      .select('*')
      .eq('id', params.id)
      .single()

    if (existingError) {
      if (existingError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled price change not found' }, { status: 404 })
      }
      console.error('Error fetching scheduled pricing:', existingError)
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    // Can only update pending scheduled changes
    if (existing.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot update scheduled change with status: ${existing.status}` },
        { status: 400 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {}

    if (body.effective_date !== undefined) {
      const effectiveDate = new Date(body.effective_date)
      if (isNaN(effectiveDate.getTime())) {
        return NextResponse.json({ error: 'Invalid effective_date format' }, { status: 400 })
      }
      if (effectiveDate <= new Date()) {
        return NextResponse.json({ error: 'effective_date must be in the future' }, { status: 400 })
      }
      updates.effective_date = effectiveDate.toISOString()
    }

    if (body.new_price !== undefined) {
      updates.new_price = body.new_price !== null ? parseFloat(body.new_price) : null
    }

    if (body.new_price_per_foot !== undefined) {
      updates.new_price_per_foot = body.new_price_per_foot !== null ? parseFloat(body.new_price_per_foot) : null
    }

    if (body.new_weight_kg !== undefined) {
      updates.new_weight_kg = body.new_weight_kg !== null ? parseFloat(body.new_weight_kg) : null
    }

    if (body.new_living_area_units !== undefined) {
      updates.new_living_area_units =
        body.new_living_area_units !== null ? parseInt(body.new_living_area_units) : null
    }

    if (body.new_is_available !== undefined) {
      updates.new_is_available = body.new_is_available
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Perform update
    const { data, error } = await supabase
      .from('scheduled_pricing')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scheduled pricing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Scheduled price change updated successfully',
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/ops/pricing/scheduled/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel scheduled price change
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

    // Check if scheduled change exists
    const { data: existing, error: existingError } = await supabase
      .from('scheduled_pricing')
      .select('*')
      .eq('id', params.id)
      .single()

    if (existingError) {
      if (existingError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Scheduled price change not found' }, { status: 404 })
      }
      console.error('Error fetching scheduled pricing:', existingError)
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    // Can only cancel pending scheduled changes
    if (existing.status !== 'pending') {
      return NextResponse.json(
        {
          error: `Cannot cancel scheduled change with status: ${existing.status}`,
          suggestion: 'Only pending scheduled changes can be cancelled',
        },
        { status: 400 }
      )
    }

    // Update status to 'cancelled' instead of deleting
    const { error } = await supabase
      .from('scheduled_pricing')
      .update({ status: 'cancelled' })
      .eq('id', params.id)

    if (error) {
      console.error('Error cancelling scheduled pricing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled price change cancelled successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/ops/pricing/scheduled/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
