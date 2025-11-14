/**
 * Admin Pricing Bulk Export API
 *
 * GET /api/ops/pricing/bulk-export - Export all pricing options as CSV
 *
 * Returns CSV with columns:
 * - id, model, category, subcategory, name, description, sku
 * - price, price_per_foot, weight_kg, living_area_units, per_foot_pricing
 * - vat_rate, is_default, is_available, display_order, image_url
 * - created_at, updated_at
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PricingOption } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: PricingOption[]): string {
  if (data.length === 0) {
    return ''
  }

  // Define column order for CSV
  const columns = [
    'id',
    'model',
    'category',
    'subcategory',
    'name',
    'description',
    'sku',
    'price',
    'price_per_foot',
    'weight_kg',
    'living_area_units',
    'per_foot_pricing',
    'vat_rate',
    'is_default',
    'is_available',
    'display_order',
    'image_url',
    'created_at',
    'updated_at',
  ]

  // Create header row
  const header = columns.join(',')

  // Create data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col as keyof PricingOption]

        // Handle null/undefined
        if (value === null || value === undefined) {
          return ''
        }

        // Handle boolean
        if (typeof value === 'boolean') {
          return value.toString()
        }

        // Handle numbers
        if (typeof value === 'number') {
          return value.toString()
        }

        // Handle strings - escape commas and quotes
        const stringValue = value.toString()
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }

        return stringValue
      })
      .join(',')
  })

  return [header, ...rows].join('\n')
}

// GET - Export all pricing options as CSV
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

    // Get optional filters from query params
    const searchParams = request.nextUrl.searchParams
    const model = searchParams.get('model')
    const category = searchParams.get('category')

    // Build query
    let query = supabase.from('pricing_options').select('*').order('display_order', { ascending: true })

    // Apply filters if provided
    if (model) {
      query = query.eq('model', model)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: options, error } = await query

    if (error) {
      console.error('Error fetching pricing options:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!options || options.length === 0) {
      return NextResponse.json({ error: 'No pricing options found' }, { status: 404 })
    }

    // Convert to CSV
    const csv = convertToCSV(options)

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `pricing_options_export_${timestamp}.csv`

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/ops/pricing/bulk-export:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
