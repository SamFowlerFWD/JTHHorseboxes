/**
 * Admin Scheduled Pricing API
 *
 * GET  /api/ops/pricing/scheduled - List scheduled price changes
 * POST /api/ops/pricing/scheduled - Create new scheduled price change
 *
 * Query params (GET):
 * - status: Filter by status (pending, applied, cancelled)
 * - option_id: Filter by specific pricing option
 * - from_date: Filter effective_date >= this date
 * - to_date: Filter effective_date <= this date
 * - limit: Number of records (default 100, max 500)
 * - offset: Pagination offset (default 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ScheduledPricing } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// GET - List scheduled price changes
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
    const status = searchParams.get('status')
    const optionId = searchParams.get('option_id')
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Parse limit and offset
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 500) : 100
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ error: 'Invalid limit or offset parameters' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('scheduled_pricing')
      .select('*', { count: 'exact' })
      .order('effective_date', { ascending: true })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      if (!['pending', 'applied', 'cancelled'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: pending, applied, or cancelled' },
          { status: 400 }
        )
      }
      query = query.eq('status', status)
    }

    if (optionId) {
      query = query.eq('option_id', optionId)
    }

    if (fromDate) {
      try {
        const date = new Date(fromDate)
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'Invalid from_date format. Use ISO 8601 format.' },
            { status: 400 }
          )
        }
        query = query.gte('effective_date', date.toISOString())
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid from_date format. Use ISO 8601 format.' },
          { status: 400 }
        )
      }
    }

    if (toDate) {
      try {
        const date = new Date(toDate)
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'Invalid to_date format. Use ISO 8601 format.' },
            { status: 400 }
          )
        }
        query = query.lte('effective_date', date.toISOString())
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid to_date format. Use ISO 8601 format.' },
          { status: 400 }
        )
      }
    }

    const { data: scheduled, error, count } = await query

    if (error) {
      console.error('Error fetching scheduled pricing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with pricing option details
    if (scheduled && scheduled.length > 0) {
      const optionIds = [...new Set(scheduled.map((s) => s.option_id))]
      const { data: options } = await supabase
        .from('pricing_options')
        .select('id, name, model, category, price, price_per_foot, weight_kg, living_area_units')
        .in('id', optionIds)

      const optionMap = new Map(options?.map((o) => [o.id, o]) || [])

      const enrichedScheduled = scheduled.map((s) => ({
        ...s,
        option: optionMap.get(s.option_id) || null,
      }))

      return NextResponse.json({
        success: true,
        data: enrichedScheduled,
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: count ? offset + limit < count : false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: scheduled || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: false,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/scheduled:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new scheduled price change
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
    if (!body.option_id || !body.effective_date) {
      return NextResponse.json(
        { error: 'Missing required fields: option_id, effective_date' },
        { status: 400 }
      )
    }

    // Validate that at least one field to update is provided
    if (
      body.new_price === undefined &&
      body.new_price_per_foot === undefined &&
      body.new_weight_kg === undefined &&
      body.new_living_area_units === undefined &&
      body.new_is_available === undefined
    ) {
      return NextResponse.json(
        { error: 'Must provide at least one field to update' },
        { status: 400 }
      )
    }

    // Validate effective_date is in the future
    const effectiveDate = new Date(body.effective_date)
    if (isNaN(effectiveDate.getTime())) {
      return NextResponse.json({ error: 'Invalid effective_date format' }, { status: 400 })
    }

    if (effectiveDate <= new Date()) {
      return NextResponse.json(
        { error: 'effective_date must be in the future' },
        { status: 400 }
      )
    }

    // Verify option exists
    const { data: option, error: optionError } = await supabase
      .from('pricing_options')
      .select('id, name')
      .eq('id', body.option_id)
      .single()

    if (optionError || !option) {
      return NextResponse.json({ error: 'Pricing option not found' }, { status: 404 })
    }

    // Create scheduled change
    const newScheduled = {
      option_id: body.option_id,
      effective_date: effectiveDate.toISOString(),
      new_price: body.new_price !== undefined ? parseFloat(body.new_price) : null,
      new_price_per_foot:
        body.new_price_per_foot !== undefined ? parseFloat(body.new_price_per_foot) : null,
      new_weight_kg: body.new_weight_kg !== undefined ? parseFloat(body.new_weight_kg) : null,
      new_living_area_units:
        body.new_living_area_units !== undefined ? parseInt(body.new_living_area_units) : null,
      new_is_available: body.new_is_available !== undefined ? body.new_is_available : null,
      status: 'pending',
      scheduled_by: user.id,
      notes: body.notes || null,
    }

    const { data, error } = await supabase
      .from('scheduled_pricing')
      .insert(newScheduled)
      .select()
      .single()

    if (error) {
      console.error('Error creating scheduled pricing:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Scheduled price change created for "${option.name}" effective ${effectiveDate.toLocaleDateString()}`,
    })
  } catch (error: any) {
    console.error('Error in POST /api/ops/pricing/scheduled:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
