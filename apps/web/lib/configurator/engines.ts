/**
 * Configurator Calculation Engines
 *
 * Three main calculation systems:
 * 1. Weight Calculation Engine - Tracks payload and suggests upgrades
 * 2. Living Area Extension Calculator - Auto-calculates required chassis extension
 * 3. Enhanced Price Calculation - Integrates with existing calc.ts
 */

import type {
  SelectedOption,
  ModelSpecification,
  WeightCalculation,
  LivingAreaCalculation,
  ConfigurationCalculation,
  CalculationWarning,
} from './types'

// =============================================================================
// 1. WEIGHT CALCULATION ENGINE
// =============================================================================

export interface WeightCalculationInput {
  modelSpec: ModelSpecification
  selectedOptions: SelectedOption[]
  pioneerPackageEnabled?: boolean
}

/**
 * Calculate total weight and remaining payload
 * Suggests vehicle upgrade if approaching or exceeding weight threshold
 */
export function calculateWeight(input: WeightCalculationInput): WeightCalculation {
  const { modelSpec, selectedOptions, pioneerPackageEnabled } = input

  // Calculate total weight of selected options
  const optionsTotalWeight = selectedOptions.reduce((total, option) => {
    const optionWeight = option.weight_kg || 0
    const quantity = option.quantity || 1
    const feetSelected = option.feet_selected || 0

    // For per_foot_pricing items, weight might scale with feet
    // (e.g., chassis extension might add weight per foot)
    if (option.per_foot_pricing && feetSelected > 0) {
      return total + (optionWeight * feetSelected)
    }

    return total + (optionWeight * quantity)
  }, 0)

  // Pioneer package adds approximately 200kg of equipment
  const pioneerWeight = pioneerPackageEnabled ? 200 : 0

  const totalWeight = modelSpec.unladen_weight_kg + optionsTotalWeight + pioneerWeight
  const remainingPayload = modelSpec.gross_vehicle_weight_kg - totalWeight
  const payloadPercentageUsed = ((modelSpec.target_payload_kg - remainingPayload) / modelSpec.target_payload_kg) * 100

  // Trigger warning if remaining payload is below warning threshold
  const weightWarningTriggered = remainingPayload < modelSpec.warning_threshold_kg

  // Suggest upgrade if warning triggered and upgrade available
  const suggestedUpgradeModel = weightWarningTriggered ? modelSpec.suggested_upgrade_model : null

  return {
    base_vehicle_weight_kg: modelSpec.unladen_weight_kg,
    options_total_weight_kg: optionsTotalWeight + pioneerWeight,
    total_weight_kg: totalWeight,
    remaining_payload_kg: remainingPayload,
    payload_percentage_used: Math.round(payloadPercentageUsed * 100) / 100,
    weight_warning_triggered: weightWarningTriggered,
    suggested_upgrade_model: suggestedUpgradeModel,
  }
}

/**
 * Generate weight-related warnings and suggestions
 */
export function generateWeightWarnings(
  weightCalc: WeightCalculation,
  modelSpec: ModelSpecification
): CalculationWarning[] {
  const warnings: CalculationWarning[] = []

  if (weightCalc.remaining_payload_kg < 0) {
    warnings.push({
      type: 'weight',
      severity: 'error',
      message: `Configuration exceeds maximum vehicle weight by ${Math.abs(weightCalc.remaining_payload_kg).toFixed(0)}kg`,
      suggested_action: weightCalc.suggested_upgrade_model
        ? `Consider upgrading to ${weightCalc.suggested_upgrade_model} for increased payload capacity`
        : 'Remove some heavy options to reduce weight',
    })
  } else if (weightCalc.weight_warning_triggered) {
    warnings.push({
      type: 'weight',
      severity: 'warning',
      message: `Approaching maximum payload: ${weightCalc.remaining_payload_kg.toFixed(0)}kg remaining (target: ${modelSpec.target_payload_kg}kg)`,
      suggested_action: weightCalc.suggested_upgrade_model
        ? `For more payload capacity, consider upgrading to ${weightCalc.suggested_upgrade_model} (approx ${modelSpec.target_payload_kg + 300}kg payload)`
        : 'Consider removing or replacing heavy options',
    })
  } else if (weightCalc.payload_percentage_used > 50) {
    warnings.push({
      type: 'weight',
      severity: 'info',
      message: `Using ${weightCalc.payload_percentage_used.toFixed(0)}% of target payload (${weightCalc.remaining_payload_kg.toFixed(0)}kg remaining)`,
    })
  }

  return warnings
}

// =============================================================================
// 2. LIVING AREA EXTENSION CALCULATOR
// =============================================================================

export interface LivingAreaCalculationInput {
  modelSpec: ModelSpecification
  selectedOptions: SelectedOption[]
  chassisExtensionPricePerFoot: number // Price per foot of extension
}

/**
 * Living Area Unit Rules:
 * - Standard: 6 units available (3ft living area)
 * - Each ft of extension adds 2 units
 * - External large tack locker: 4 units (2ft width)
 * - Full length bed: 6 units (6ft long)
 * - Slide-out bed: 2 units on each side it extends to (single bed spans both sides = 4 units total)
 *
 * Maximum extension: 6ft (provides 12 additional units, total 18 units)
 */
export function calculateLivingAreaExtension(input: LivingAreaCalculationInput): LivingAreaCalculation {
  const { modelSpec, selectedOptions, chassisExtensionPricePerFoot } = input

  // Calculate total living area units needed
  const livingAreaUnitsUsed = selectedOptions.reduce((total, option) => {
    const units = option.living_area_units || 0
    const quantity = option.quantity || 1
    return total + (units * quantity)
  }, 0)

  const standardUnitsAvailable = modelSpec.standard_living_units
  const unitsPerFootExtension = modelSpec.units_per_foot_extension

  // Calculate how many feet of extension are required
  let extensionFeetRequired = 0
  if (livingAreaUnitsUsed > standardUnitsAvailable) {
    const additionalUnitsNeeded = livingAreaUnitsUsed - standardUnitsAvailable
    extensionFeetRequired = Math.ceil(additionalUnitsNeeded / unitsPerFootExtension)
  }

  // Cap extension at 6ft maximum
  extensionFeetRequired = Math.min(extensionFeetRequired, 6)

  const extensionUnitsProvided = extensionFeetRequired * unitsPerFootExtension
  const totalUnitsAvailable = standardUnitsAvailable + extensionUnitsProvided
  const unitsRemaining = totalUnitsAvailable - livingAreaUnitsUsed

  // Calculate auto-added extension cost
  const autoAddedExtensionCost = extensionFeetRequired * chassisExtensionPricePerFoot

  return {
    living_area_units_used: livingAreaUnitsUsed,
    standard_units_available: standardUnitsAvailable,
    extension_feet_required: extensionFeetRequired,
    extension_units_provided: extensionUnitsProvided,
    total_units_available: totalUnitsAvailable,
    units_remaining: unitsRemaining,
    auto_added_extension_cost: autoAddedExtensionCost,
  }
}

/**
 * Generate living area warnings
 */
export function generateLivingAreaWarnings(
  livingAreaCalc: LivingAreaCalculation
): CalculationWarning[] {
  const warnings: CalculationWarning[] = []

  if (livingAreaCalc.units_remaining < 0) {
    warnings.push({
      type: 'living_area',
      severity: 'error',
      message: `Living area configuration exceeds maximum capacity by ${Math.abs(livingAreaCalc.units_remaining)} units`,
      suggested_action: 'Remove some living area features or consider a different layout',
    })
  } else if (livingAreaCalc.extension_feet_required >= 6) {
    warnings.push({
      type: 'living_area',
      severity: 'warning',
      message: `Maximum chassis extension (6ft) required for this configuration`,
      suggested_action: 'This is the maximum extension available. Consider optimizing your layout.',
    })
  } else if (livingAreaCalc.extension_feet_required > 0) {
    warnings.push({
      type: 'living_area',
      severity: 'info',
      message: `${livingAreaCalc.extension_feet_required}ft chassis extension automatically added (£${(livingAreaCalc.auto_added_extension_cost / 100).toFixed(2)} + VAT)`,
      suggested_action: `Extension provides ${livingAreaCalc.extension_units_provided} additional units`,
    })
  }

  return warnings
}

// =============================================================================
// 3. COMPREHENSIVE CONFIGURATION CALCULATION
// =============================================================================

export interface ComprehensiveCalculationInput {
  modelSpec: ModelSpecification
  selectedOptions: SelectedOption[]
  pioneerPackageEnabled?: boolean
  pioneerPackageCost?: number
  chassisExtensionPricePerFoot: number
  depositAmount?: number
  vatRate?: number
}

export interface ComprehensiveCalculationResult {
  weight: WeightCalculation
  living_area: LivingAreaCalculation
  pricing: {
    base_price: number
    pioneer_package_cost: number
    chassis_extension_cost: number
    options_total: number
    build_subtotal: number
    total_ex_vat: number
    vat_amount: number
    total_inc_vat: number
  }
  warnings: CalculationWarning[]
}

/**
 * Perform comprehensive configuration calculation
 * Combines weight, living area, and pricing calculations
 */
export function calculateConfiguration(
  input: ComprehensiveCalculationInput
): ComprehensiveCalculationResult {
  const {
    modelSpec,
    selectedOptions,
    pioneerPackageEnabled = false,
    pioneerPackageCost = 0,
    chassisExtensionPricePerFoot,
    vatRate = 0.20,
  } = input

  // 1. Calculate weight
  const weightCalc = calculateWeight({
    modelSpec,
    selectedOptions,
    pioneerPackageEnabled,
  })

  // 2. Calculate living area extension
  const livingAreaCalc = calculateLivingAreaExtension({
    modelSpec,
    selectedOptions,
    chassisExtensionPricePerFoot,
  })

  // 3. Calculate pricing
  // Note: Assumes selectedOptions already have price calculated (price * quantity or price_per_foot * feet_selected)
  const optionsTotal = selectedOptions.reduce((total, option) => {
    if (option.per_foot_pricing && option.feet_selected) {
      return total + (option.price_per_foot * option.feet_selected)
    }
    return total + (option.price * (option.quantity || 1))
  }, 0)

  const pioneerCost = pioneerPackageEnabled ? pioneerPackageCost : 0
  const chassisExtensionCost = livingAreaCalc.auto_added_extension_cost

  // Build subtotal = options + pioneer + auto-extension
  const buildSubtotal = optionsTotal + pioneerCost + chassisExtensionCost

  const totalExVat = buildSubtotal
  const vatAmount = totalExVat * vatRate
  const totalIncVat = totalExVat + vatAmount

  // 4. Generate all warnings
  const warnings: CalculationWarning[] = [
    ...generateWeightWarnings(weightCalc, modelSpec),
    ...generateLivingAreaWarnings(livingAreaCalc),
  ]

  return {
    weight: weightCalc,
    living_area: livingAreaCalc,
    pricing: {
      base_price: 0, // Base price is separate from options
      pioneer_package_cost: pioneerCost,
      chassis_extension_cost: chassisExtensionCost,
      options_total: optionsTotal,
      build_subtotal: buildSubtotal,
      total_ex_vat: totalExVat,
      vat_amount: vatAmount,
      total_inc_vat: totalIncVat,
    },
    warnings,
  }
}

// =============================================================================
// 4. HELPER FUNCTIONS
// =============================================================================

/**
 * Get the chassis extension price per foot option from pricing options
 */
export function getChassisExtensionPricePerFoot(
  pricingOptions: { name: string; price_per_foot: number; per_foot_pricing: boolean }[]
): number {
  const extensionOption = pricingOptions.find(
    (opt) => opt.name.toLowerCase().includes('chassis extension') && opt.per_foot_pricing
  )
  return extensionOption?.price_per_foot || 1000 // Default £1000 per foot if not found
}

/**
 * Format weight for display
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(0)}kg`
}

/**
 * Format living area units for display
 */
export function formatLivingAreaUnits(units: number): string {
  const feet = units / 2 // 2 units per foot
  return `${units} units (${feet}ft)`
}

/**
 * Check if configuration has critical errors
 */
export function hasConfigurationErrors(warnings: CalculationWarning[]): boolean {
  return warnings.some((w) => w.severity === 'error')
}

/**
 * Get summary of configuration status
 */
export function getConfigurationSummary(result: ComprehensiveCalculationResult): string {
  const { weight, living_area } = result
  const errors = result.warnings.filter((w) => w.severity === 'error')
  const warnings = result.warnings.filter((w) => w.severity === 'warning')

  if (errors.length > 0) {
    return `Configuration has ${errors.length} error(s) that must be resolved`
  }

  if (warnings.length > 0) {
    return `Configuration has ${warnings.length} warning(s) to review`
  }

  return `Configuration looks good: ${formatWeight(weight.remaining_payload_kg)} payload remaining, ${living_area.units_remaining} living area units available`
}
