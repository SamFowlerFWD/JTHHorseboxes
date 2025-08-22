import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const category = searchParams.get('category')

    // Build query
    let query = supabase
      .from('pricing_options')
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true })
      .order('subcategory', { ascending: true })
      .order('name', { ascending: true })

    // Filter by model if provided
    if (model) {
      query = query.eq('model', model)
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pricing options:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pricing options' },
        { status: 500 }
      )
    }

    // Group options by category for easier consumption
    const groupedOptions = data?.reduce((acc: any, option) => {
      const category = option.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(option)
      return acc
    }, {}) || {}

    return NextResponse.json({
      options: data || [],
      grouped: groupedOptions,
      total: data?.length || 0
    })
  } catch (error) {
    console.error('Error in pricing options API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}