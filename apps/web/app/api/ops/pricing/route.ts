/**
 * Admin Pricing Management API
 *
 * GET    /api/ops/pricing - List all pricing options with filters
 * POST   /api/ops/pricing - Create new pricing option
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { PricingOption, BulkPricingImport } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// GET - List pricing options with optional filters
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model')
    const category = searchParams.get('category')
    const isAvailable = searchParams.get('is_available')
    const search = searchParams.get('search')

    // Build query
    let query = supabase.from('pricing_options').select('*').order('display_order', { ascending: true })

    // Apply filters
    if (model) {
      // Filter by applicable_models array containing the specified model
      query = query.contains('applicable_models', [model])
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (isAvailable !== null) {
      query = query.eq('is_available', isAvailable === 'true')
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data: options, error } = await query

    if (error) {
      console.error('Error fetching pricing options:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: options,
      count: options?.length || 0,
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new pricing option
export async function POST(request: NextRequest) {
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

    // Validate required fields
    const requiredFields = ['applicable_models', 'category', 'name', 'price']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate applicable_models is an array
    if (!Array.isArray(body.applicable_models) || body.applicable_models.length === 0) {
      return NextResponse.json(
        { error: 'applicable_models must be a non-empty array of model codes' },
        { status: 400 }
      )
    }

    // Create new pricing option
    const newOption = {
      applicable_models: body.applicable_models,
      category: body.category,
      subcategory: body.subcategory || null,
      name: body.name,
      description: body.description || null,
      sku: body.sku || null,
      price: parseFloat(body.price),
      price_per_foot: parseFloat(body.price_per_foot || 0),
      weight_kg: parseFloat(body.weight_kg || 0),
      living_area_units: parseInt(body.living_area_units || 0),
      per_foot_pricing: body.per_foot_pricing || false,
      vat_rate: parseFloat(body.vat_rate || 20.0),
      is_default: body.is_default || false,
      is_available: body.is_available !== undefined ? body.is_available : true,
      dependencies: body.dependencies || null,
      incompatible_with: body.incompatible_with || null,
      display_order: parseInt(body.display_order || 0),
      image_url: body.image_url || null,
    }

    const { data, error } = await supabase.from('pricing_options').insert(newOption).select().single()

    if (error) {
      console.error('Error creating pricing option:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Pricing option created successfully',
    })
  } catch (error: any) {
    console.error('Error in POST /api/ops/pricing:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
