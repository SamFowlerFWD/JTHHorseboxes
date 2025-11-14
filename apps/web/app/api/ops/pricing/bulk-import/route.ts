/**
 * Admin Pricing Bulk Import API
 *
 * POST /api/ops/pricing/bulk-import - Import pricing options from CSV
 *
 * Accepts CSV with columns:
 * - option_id (optional, for updates)
 * - model, category, subcategory (optional)
 * - name, description (optional), sku (optional)
 * - price, price_per_foot (optional), weight_kg (optional)
 * - living_area_units (optional), per_foot_pricing (optional)
 * - vat_rate (optional), is_available (optional)
 * - display_order (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BulkPricingImport, BulkImportResult } from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least header row and one data row')
  }

  // Parse header row
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  // Parse data rows
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })

    rows.push(row)
  }

  return rows
}

/**
 * Validate and transform a CSV row into BulkPricingImport object
 */
function validateRow(row: Record<string, string>, rowNum: number): BulkPricingImport {
  // Required fields
  if (!row.model || !row.category || !row.name || !row.price) {
    throw new Error(
      `Row ${rowNum}: Missing required fields (model, category, name, price). Got: ${JSON.stringify(row)}`
    )
  }

  // Parse and validate
  const price = parseFloat(row.price)
  if (isNaN(price) || price < 0) {
    throw new Error(`Row ${rowNum}: Invalid price value: ${row.price}`)
  }

  const importData: BulkPricingImport = {
    option_id: row.option_id || undefined,
    applicable_models: row.applicable_models || row.model, // Support both new and legacy column names
    category: row.category,
    subcategory: row.subcategory || undefined,
    name: row.name,
    description: row.description || undefined,
    sku: row.sku || undefined,
    price,
    price_per_foot: row.price_per_foot ? parseFloat(row.price_per_foot) : undefined,
    weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : undefined,
    living_area_units: row.living_area_units ? parseInt(row.living_area_units, 10) : undefined,
    per_foot_pricing: row.per_foot_pricing ? row.per_foot_pricing.toLowerCase() === 'true' : undefined,
    vat_rate: row.vat_rate ? parseFloat(row.vat_rate) : undefined,
    is_available: row.is_available !== undefined ? row.is_available.toLowerCase() === 'true' : undefined,
    display_order: row.display_order ? parseInt(row.display_order, 10) : undefined,
  }

  return importData
}

// POST - Bulk import pricing options from CSV
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

    // Get CSV content from request body
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const csvText = await file.text()

    // Parse CSV
    let rows: Record<string, string>[]
    try {
      rows = parseCSV(csvText)
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Failed to parse CSV',
          message: error.message,
        },
        { status: 400 }
      )
    }

    const result: BulkImportResult = {
      success: true,
      total_rows: rows.length,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2 // +2 because: 0-indexed + header row
      try {
        const importData = validateRow(rows[i], rowNum)

        // Check if this is an update or create
        if (importData.option_id) {
          // Update existing option
          const { error: updateError } = await supabase
            .from('pricing_options')
            .update({
              applicable_models: importData.applicable_models.split(',').map(m => m.trim()),
              category: importData.category,
              subcategory: importData.subcategory || null,
              name: importData.name,
              description: importData.description || null,
              sku: importData.sku || null,
              price: importData.price,
              price_per_foot: importData.price_per_foot || 0,
              weight_kg: importData.weight_kg || 0,
              living_area_units: importData.living_area_units || 0,
              per_foot_pricing: importData.per_foot_pricing || false,
              vat_rate: importData.vat_rate !== undefined ? importData.vat_rate : 20.0,
              is_available: importData.is_available !== undefined ? importData.is_available : true,
              display_order: importData.display_order || 0,
            })
            .eq('id', importData.option_id)

          if (updateError) {
            throw new Error(`Database update failed: ${updateError.message}`)
          }

          result.updated++
        } else {
          // Create new option
          const { error: insertError } = await supabase.from('pricing_options').insert({
            applicable_models: importData.applicable_models.split(',').map(m => m.trim()),
            category: importData.category,
            subcategory: importData.subcategory || null,
            name: importData.name,
            description: importData.description || null,
            sku: importData.sku || null,
            price: importData.price,
            price_per_foot: importData.price_per_foot || 0,
            weight_kg: importData.weight_kg || 0,
            living_area_units: importData.living_area_units || 0,
            per_foot_pricing: importData.per_foot_pricing || false,
            vat_rate: importData.vat_rate !== undefined ? importData.vat_rate : 20.0,
            is_default: importData.is_default || false,
            is_available: importData.is_available !== undefined ? importData.is_available : true,
            display_order: importData.display_order || 0,
          })

          if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`)
          }

          result.created++
        }
      } catch (error: any) {
        console.error(`Error processing row ${rowNum}:`, error)
        result.failed++
        result.errors.push({
          row: rowNum,
          error: error.message,
          data: rows[i] as any,
        })
      }
    }

    // Determine overall success
    result.success = result.failed === 0

    return NextResponse.json(result, {
      status: result.success ? 200 : 207, // 207 Multi-Status for partial success
    })
  } catch (error: any) {
    console.error('Error in POST /api/ops/pricing/bulk-import:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
