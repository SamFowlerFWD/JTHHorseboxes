/**
 * Configurator Calculation API
 *
 * POST /api/configurator/calculate - Calculate comprehensive configuration
 *
 * Request body:
 * {
 *   model_code: string,
 *   selected_options: SelectedOption[],
 *   pioneer_package_enabled?: boolean,
 *   pioneer_package_cost?: number,
 *   save_calculation?: boolean,
 *   configuration_id?: string,
 *   lead_id?: string
 * }
 *
 * Returns:
 * - Weight calculation (total weight, remaining payload, warnings)
 * - Living area calculation (units used, extension required, cost)
 * - Pricing breakdown (options total, VAT, final price)
 * - Warnings and suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateConfiguration,
  getChassisExtensionPricePerFoot,
  hasConfigurationErrors,
  getConfigurationSummary,
} from '@/lib/configurator/engines'
import type {
  ComprehensiveCalculationResult,
} from '@/lib/configurator/engines'
import type {
  SelectedOption,
  ModelSpecification,
  ConfigurationCalculation,
} from '@/lib/configurator/types'

export const dynamic = 'force-dynamic'

// POST - Calculate configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authentication is optional for this endpoint (public configurator)
    // But we'll track if a user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()

    // Validate required fields
    if (!body.model_code || !body.selected_options || !Array.isArray(body.selected_options)) {
      return NextResponse.json(
        {
          error: 'Missing required fields: model_code, selected_options (array)',
        },
        { status: 400 }
      )
    }

    // Fetch model specification
    const { data: modelSpec, error: modelError } = await supabase
      .from('model_specifications')
      .select('*')
      .eq('model_code', body.model_code)
      .eq('is_active', true)
      .single()

    if (modelError || !modelSpec) {
      return NextResponse.json(
        {
          error: `Model specification not found for: ${body.model_code}`,
          suggestion: 'Check that the model_code is correct and active',
        },
        { status: 404 }
      )
    }

    const selectedOptions: SelectedOption[] = body.selected_options
    const pioneerPackageEnabled = body.pioneer_package_enabled || false
    const pioneerPackageCost = body.pioneer_package_cost || 10800 // Default from types.ts
    const vatRate = body.vat_rate || 0.2

    // Get chassis extension price per foot
    // Fetch all pricing options to find chassis extension
    const { data: pricingOptions } = await supabase
      .from('pricing_options')
      .select('name, price_per_foot, per_foot_pricing')
      .eq('is_available', true)

    const chassisExtensionPricePerFoot = getChassisExtensionPricePerFoot(pricingOptions || [])

    // Perform comprehensive calculation
    const calculationResult: ComprehensiveCalculationResult = calculateConfiguration({
      modelSpec: modelSpec as ModelSpecification,
      selectedOptions,
      pioneerPackageEnabled,
      pioneerPackageCost,
      chassisExtensionPricePerFoot,
      vatRate,
    })

    // Check for errors
    const hasErrors = hasConfigurationErrors(calculationResult.warnings)
    const summary = getConfigurationSummary(calculationResult)

    // Optionally save calculation to database
    let savedCalculationId: string | null = null
    if (body.save_calculation && user) {
      const calculationData: Partial<ConfigurationCalculation> = {
        configuration_id: body.configuration_id || null,
        lead_id: body.lead_id || null,
        weight: calculationResult.weight,
        living_area: calculationResult.living_area,
        chassis_extension_cost: calculationResult.pricing.chassis_extension_cost,
        options_total: calculationResult.pricing.options_total,
        total_ex_vat: calculationResult.pricing.total_ex_vat,
        vat_amount: calculationResult.pricing.vat_amount,
        total_inc_vat: calculationResult.pricing.total_inc_vat,
        calculation_version: '1.0.0',
        calculation_warnings: calculationResult.warnings,
        calculation_notes: body.calculation_notes || null,
      }

      const { data: savedCalc, error: saveError } = await supabase
        .from('configuration_calculations')
        .insert(calculationData)
        .select('id')
        .single()

      if (saveError) {
        console.error('Error saving calculation:', saveError)
        // Don't fail the request, just log the error
      } else {
        savedCalculationId = savedCalc?.id || null
      }
    }

    // Return comprehensive result
    return NextResponse.json({
      success: !hasErrors,
      data: {
        model_code: body.model_code,
        model_name: modelSpec.model_name,
        tonnage: modelSpec.tonnage,
        weight: calculationResult.weight,
        living_area: calculationResult.living_area,
        pricing: calculationResult.pricing,
        warnings: calculationResult.warnings,
        summary,
        has_errors: hasErrors,
        calculation_id: savedCalculationId,
      },
      message: hasErrors
        ? 'Configuration has errors that must be resolved'
        : 'Configuration calculated successfully',
    })
  } catch (error: any) {
    console.error('Error in POST /api/configurator/calculate:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
