/**
 * Admin Pricing Management API - Individual Option
 *
 * GET    /api/ops/pricing/[id] - Get specific pricing option
 * PATCH  /api/ops/pricing/[id] - Update pricing option
 * DELETE /api/ops/pricing/[id] - Delete pricing option
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { PricingOptionUpdate } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// GET - Get specific pricing option
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServiceClient()

    // Check admin authentication (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { data: option, error } = await supabase
      .from('pricing_options')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pricing option not found' }, { status: 404 })
      }
      console.error('Error fetching pricing option:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: option,
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update pricing option
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServiceClient()

    // Check admin authentication (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()

    // Build update object with only provided fields
    const updates: Partial<PricingOptionUpdate> = {}

    if (body.applicable_models !== undefined) {
      // Validate applicable_models is an array if provided
      if (!Array.isArray(body.applicable_models) || body.applicable_models.length === 0) {
        return NextResponse.json(
          { error: 'applicable_models must be a non-empty array of model codes' },
          { status: 400 }
        )
      }
      updates.applicable_models = body.applicable_models
    }
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.sku !== undefined) updates.sku = body.sku
    if (body.price !== undefined) updates.price = parseFloat(body.price)
    if (body.price_per_foot !== undefined) updates.price_per_foot = parseFloat(body.price_per_foot)
    if (body.weight_kg !== undefined) updates.weight_kg = parseFloat(body.weight_kg)
    if (body.living_area_units !== undefined) updates.living_area_units = parseInt(body.living_area_units)
    if (body.per_foot_pricing !== undefined) updates.per_foot_pricing = body.per_foot_pricing
    if (body.vat_rate !== undefined) updates.vat_rate = parseFloat(body.vat_rate)
    if (body.is_default !== undefined) updates.is_default = body.is_default
    if (body.is_available !== undefined) updates.is_available = body.is_available
    if (body.dependencies !== undefined) updates.dependencies = body.dependencies
    if (body.incompatible_with !== undefined) updates.incompatible_with = body.incompatible_with
    if (body.display_order !== undefined) updates.display_order = parseInt(body.display_order)
    if (body.image_url !== undefined) updates.image_url = body.image_url

    // Perform update (this will trigger the pricing_history trigger automatically)
    const { data, error } = await supabase
      .from('pricing_options')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pricing option not found' }, { status: 404 })
      }
      console.error('Error updating pricing option:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Pricing option updated successfully',
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/ops/pricing/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete pricing option
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServiceClient()

    // Check admin authentication (skip in development)
    if (process.env.NODE_ENV !== 'development') {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Check if option is used in any saved configurations
    const { data: usageCheck, error: usageError } = await supabase
      .from('saved_configurations')
      .select('id')
      .contains('configuration', { selected_options: [{ id: params.id }] })
      .limit(1)

    if (usageError) {
      console.error('Error checking usage:', usageError)
    }

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete pricing option that is used in saved configurations',
          suggestion: 'Consider marking it as unavailable instead',
        },
        { status: 400 }
      )
    }

    // Delete the option (cascade delete will handle pricing_history)
    const { error } = await supabase.from('pricing_options').delete().eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pricing option not found' }, { status: 404 })
      }
      console.error('Error deleting pricing option:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing option deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/ops/pricing/[id]:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
