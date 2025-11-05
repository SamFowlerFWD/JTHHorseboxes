import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const pricingOptionSchema = z.object({
  model: z.enum(['3.5t', '4.5t', '7.2t']),
  category: z.string().min(1).max(100),
  subcategory: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0),
  vat_rate: z.number().min(0).max(100).default(20),
  is_default: z.boolean().default(false),
  is_available: z.boolean().default(true),
  dependencies: z.any().optional(),
  incompatible_with: z.any().optional(),
  display_order: z.number().default(0),
  image_url: z.string().url().optional(),
})

// GET /api/pricing - Get pricing options (public for available, admin for all)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = !!user

    const model = searchParams.get('model') || undefined
    const category = searchParams.get('category') || undefined
    const available = searchParams.get('available')
    const availableOnly = !isAdmin || available !== 'false'

    // Use optimized cached pricing query (24 hour TTL)
    const { getPricingOptions } = await import('@/lib/supabase/optimized-queries')
    const options = await getPricingOptions(model, category, availableOnly)

    // Group by model and category for easier consumption
    const grouped = options.reduce((acc, option) => {
      if (!acc[option.model]) {
        acc[option.model] = {}
      }
      if (!acc[option.model][option.category]) {
        acc[option.model][option.category] = []
      }
      acc[option.model][option.category].push(option)
      return acc
    }, {} as Record<string, Record<string, typeof options>>)

    return NextResponse.json({
      options,
      grouped,
      models: ['3.5t', '4.5t', '7.2t'],
      categories: [...new Set(options.map((o: any) => o.category))]
    })
  } catch (error) {
    console.error('Error in GET /api/pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pricing - Create a new pricing option (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = pricingOptionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const optionData = validationResult.data

    // Check if option with same name already exists for this model/category
    const { data: existingOption } = await supabase
      .from('pricing_options')
      .select('id')
      .eq('model', optionData.model)
      .eq('category', optionData.category)
      .eq('name', optionData.name)
      .single()

    if (existingOption) {
      return NextResponse.json(
        { error: 'A pricing option with this name already exists for this model and category' },
        { status: 409 }
      )
    }

    const { data: option, error } = await supabase
      .from('pricing_options')
      .insert([optionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating pricing option:', error)
      return NextResponse.json({ error: 'Failed to create pricing option' }, { status: 500 })
    }

    // Invalidate pricing cache after mutation
    const { invalidatePricingCache } = await import('@/lib/supabase/optimized-queries')
    invalidatePricingCache()

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/pricing/bulk - Bulk update pricing options (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { updates } = await request.json()
    
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Updates must be an array' }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const update of updates) {
      const { id, ...updateData } = update
      
      if (!id) {
        errors.push({ error: 'Missing id', data: update })
        continue
      }

      const { data, error } = await supabase
        .from('pricing_options')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        errors.push({ id, error: error.message })
      } else {
        results.push(data)
      }
    }

    // Invalidate pricing cache after bulk update
    if (results.length > 0) {
      const { invalidatePricingCache } = await import('@/lib/supabase/optimized-queries')
      invalidatePricingCache()
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in PATCH /api/pricing/bulk:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}