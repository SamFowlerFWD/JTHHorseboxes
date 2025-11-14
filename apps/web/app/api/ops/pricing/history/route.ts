/**
 * Admin Pricing History API
 *
 * GET /api/ops/pricing/history - Get pricing change history
 *
 * Query params:
 * - option_id: Filter by specific pricing option
 * - from_date: Filter changes after this date (ISO 8601)
 * - to_date: Filter changes before this date (ISO 8601)
 * - changed_by: Filter by user ID
 * - limit: Number of records to return (default 100, max 1000)
 * - offset: Pagination offset (default 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PricingHistory } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// GET - Get pricing history with filters
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
    const optionId = searchParams.get('option_id')
    const fromDate = searchParams.get('from_date')
    const toDate = searchParams.get('to_date')
    const changedBy = searchParams.get('changed_by')
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')

    // Parse limit and offset
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 1000) : 100
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid limit or offset parameters' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('pricing_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
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
        query = query.gte('created_at', date.toISOString())
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
        query = query.lte('created_at', date.toISOString())
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid to_date format. Use ISO 8601 format.' },
          { status: 400 }
        )
      }
    }

    if (changedBy) {
      query = query.eq('changed_by', changedBy)
    }

    const { data: history, error, count } = await query

    if (error) {
      console.error('Error fetching pricing history:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get pricing option names for context
    if (history && history.length > 0) {
      const optionIds = [...new Set(history.map((h) => h.option_id))]
      const { data: options } = await supabase
        .from('pricing_options')
        .select('id, name, model, category')
        .in('id', optionIds)

      // Create a map for quick lookup
      const optionMap = new Map(options?.map((o) => [o.id, o]) || [])

      // Enrich history records with option context
      const enrichedHistory = history.map((h) => ({
        ...h,
        option: optionMap.get(h.option_id) || null,
      }))

      return NextResponse.json({
        success: true,
        data: enrichedHistory,
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
      data: history || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        has_more: false,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/history:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
