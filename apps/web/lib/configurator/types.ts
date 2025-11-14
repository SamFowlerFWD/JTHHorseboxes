// Configurator Types

export interface PricingOption {
  id: string
  created_at: string
  updated_at: string
  applicable_models: string[] // Array of model codes this option applies to (e.g., ['3.5t', '4.5t'])
  category: string
  subcategory: string | null
  name: string
  description: string | null
  sku: string | null
  price: number
  vat_rate: number
  is_default: boolean
  is_available: boolean
  dependencies: any | null
  incompatible_with: any | null
  display_order: number | null
  image_url: string | null
  // NEW: Weight and Living Area tracking
  weight_kg: number
  living_area_units: number
  per_foot_pricing: boolean
  price_per_foot: number
}

export interface SelectedOption {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  subcategory: string | null
  sku: string | null
  vat_rate: number
  // NEW: Weight and Living Area tracking
  weight_kg: number
  living_area_units: number
  per_foot_pricing: boolean
  price_per_foot: number
  feet_selected?: number // For per_foot_pricing options
}

export interface ConfigurationData {
  // Customer Info
  customerName: string
  customerEmail: string
  customerPhone: string
  agentName?: string
  
  // Vehicle
  model: string
  model_name: string
  base_price: number
  chassisCost: number
  deposit: number
  color: string
  
  // Options
  pioneerPackage: boolean
  pioneerHorseArea?: '1ft' | '3ft'
  selected_options: SelectedOption[]
  
  // Pricing
  options_total: number
  build_subtotal: number
  total_ex_vat: number
  vat_amount: number
  total_inc_vat: number
  
  // Payment Schedule
  payment_schedule: PaymentSchedule
  
  created_at?: string
  updated_at?: string
}

export interface PaymentSchedule {
  deposit: number
  firstPayment: number
  secondPayment: number
  finalPayment: number
  chassisWithVat: number
  buildWithVat: number
  buildBalanceMinusDeposit: number
}

export interface LeadFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  company?: string
  message?: string
  consent_marketing: boolean
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export interface Model {
  id: string
  slug: string
  name: string
  description: string
  base_price: number | null // null for contact-for-pricing models
  vat_rate: number
  weight_class: string
  range: 'JTH' | 'AEOS' | 'ZENOS' | 'HELIOS'
  range_display: string
  tonnage: '3.5T' | '4.5T' | '7.2T' | '7.5T'
  availability: 'configurable' | 'pre-built' | 'contact-only'
  pioneer_package_eligible: boolean
  features?: string[]
  badge?: string
}

export const MODELS: Model[] = [
  // JTH Range - Fully Configurable
  {
    id: 'professional-35',
    slug: 'professional-35',
    name: 'Professional 35',
    description: '3.5 Tonne Premium Model with full customization options',
    base_price: 22000,
    vat_rate: 20,
    weight_class: '3.5t',
    range: 'JTH',
    range_display: 'JTH Range',
    tonnage: '3.5T',
    availability: 'configurable',
    pioneer_package_eligible: false,
    features: ['Premium build quality', 'Full luxury interior', 'Advanced features']
  },
  {
    id: 'principle-35',
    slug: 'principle-35',
    name: 'Principle 35',
    description: '3.5 Tonne Essential Model with quality construction',
    base_price: 18500,
    vat_rate: 20,
    weight_class: '3.5t',
    range: 'JTH',
    range_display: 'JTH Range',
    tonnage: '3.5T',
    availability: 'configurable',
    pioneer_package_eligible: false,
    features: ['Excellent value', 'Essential features', 'Quality construction']
  },
  {
    id: 'progeny-35',
    slug: 'progeny-35',
    name: 'Progeny 35',
    description: '3.5 Tonne Top-of-the-line Model with maximum space',
    base_price: 25500,
    vat_rate: 20,
    weight_class: '3.5t',
    range: 'JTH',
    range_display: 'JTH Range',
    tonnage: '3.5T',
    availability: 'configurable',
    pioneer_package_eligible: false,
    features: ['Top-of-the-line', 'Maximum space', 'All premium features included']
  },
  {
    id: 'professional-45',
    slug: 'professional-45',
    name: 'Professional 45',
    description: '4.5 Tonne Professional Model with Pioneer Package option',
    base_price: 28000,
    vat_rate: 20,
    weight_class: '4.5t',
    range: 'JTH',
    range_display: 'JTH Range',
    tonnage: '4.5T',
    availability: 'configurable',
    pioneer_package_eligible: true,
    features: [
      'Large horse area', 
      'Full tack locker', 
      'Premium interior', 
      'Optional Pioneer Package upgrade',
      'Cabinets & seating options',
      'Kitchen facilities available'
    ]
  },
  
  // AEOS Range - Pre-Built with Limited Options
  {
    id: 'aeos-45',
    slug: 'aeos-45',
    name: 'AEOS 45',
    description: '4.5 Tonne Pre-Built Package with limited customization',
    base_price: null, // Contact for pricing
    vat_rate: 20,
    weight_class: '4.5t',
    range: 'AEOS',
    range_display: 'AEOS Range',
    tonnage: '4.5T',
    availability: 'pre-built',
    pioneer_package_eligible: false,
    badge: 'Pre-Built Package',
    features: [
      'Pre-configured build',
      'Limited customization options',
      'Faster delivery times',
      'Fixed specification package'
    ]
  },
  
  // Premium Range - Contact for Pricing
  {
    id: 'zenos-72',
    slug: 'zenos-72',
    name: 'Zenos 7.2T',
    description: '7.2 Tonne Premium Model - Contact for custom quote',
    base_price: null, // Contact for pricing
    vat_rate: 20,
    weight_class: '7.2t',
    range: 'ZENOS',
    range_display: 'Zenos Range',
    tonnage: '7.2T',
    availability: 'contact-only',
    pioneer_package_eligible: false,
    badge: 'Premium Model',
    features: [
      'Heavy duty construction',
      '3-4 horse capacity',
      'Professional specification',
      'Custom configuration available',
      'Contact for detailed pricing'
    ]
  },
  {
    id: 'helios-75',
    slug: 'helios-75',
    name: 'Helios 7.5T',
    description: '7.5 Tonne Premium Model - Contact for custom quote',
    base_price: null, // Contact for pricing
    vat_rate: 20,
    weight_class: '7.5t',
    range: 'HELIOS',
    range_display: 'Helios Range',
    tonnage: '7.5T',
    availability: 'contact-only',
    pioneer_package_eligible: false,
    badge: 'Premium Model',
    features: [
      'Maximum capacity',
      '4+ horse capacity',
      'Ultimate specification',
      'Fully bespoke builds',
      'Contact for detailed consultation'
    ]
  }
]

export const OPTION_CATEGORIES = [
  { id: 'exterior', name: 'Exterior', icon: 'palette' },
  { id: 'storage', name: 'Storage', icon: 'box' },
  { id: 'interior', name: 'Interior', icon: 'sofa' },
  { id: 'chassis', name: 'Chassis', icon: 'truck' },
  { id: 'horse-area', name: 'Horse Area', icon: 'horse' },
  { id: 'grooms-area', name: 'Grooms Area', icon: 'home' },
  { id: 'electrical', name: 'Electrical', icon: 'zap' }
] as const

// Available model codes for pricing options - organized by range
export const MODEL_CODES = [
  // JTH 3.5T Range
  { code: 'professional-35', label: 'JTH Professional 3.5T', range: 'JTH 3.5T', description: 'Premium 3.5T model' },
  { code: 'principal-35', label: 'JTH Principal 3.5T', range: 'JTH 3.5T', description: 'Essential 3.5T model' },
  { code: 'progeny-35', label: 'JTH Progeny 3.5T', range: 'JTH 3.5T', description: 'Top-spec 3.5T model' },

  // JTH 4.5T Range
  { code: 'professional-45', label: 'JTH Professional 4.5T', range: 'JTH 4.5T', description: 'Premium 4.5T model' },
  { code: 'principal-45', label: 'JTH Principal 4.5T', range: 'JTH 4.5T', description: 'Essential 4.5T model' },
  { code: 'progeny-45', label: 'JTH Progeny 4.5T', range: 'JTH 4.5T', description: 'Top-spec 4.5T model' },

  // AEOS 4.5T Range
  { code: 'aeos-edge-45', label: 'AEOS Edge 4.5T', range: 'AEOS 4.5T', description: 'AEOS Edge model' },
  { code: 'aeos-freedom-45', label: 'AEOS Freedom 4.5T', range: 'AEOS 4.5T', description: 'AEOS Freedom model' },
  { code: 'aeos-discovery-45', label: 'AEOS Discovery 4.5T', range: 'AEOS 4.5T', description: 'AEOS Discovery model' },

  // Zenos 7.2T Range
  { code: 'zenos-discovery-72', label: 'Zenos Discovery 7.2T', range: 'Zenos 7.2T', description: 'Premium 7.2T model' },

  // Helios 7.5T Range
  { code: 'helios-75', label: 'Helios 7.5T', range: 'Helios 7.5T', description: 'Ultimate 7.5T model' }
] as const

// Model ranges for grouping
export const MODEL_RANGES = [
  { id: 'jth-35', name: 'JTH 3.5T', models: ['professional-35', 'principal-35', 'progeny-35'] },
  { id: 'jth-45', name: 'JTH 4.5T', models: ['professional-45', 'principal-45', 'progeny-45'] },
  { id: 'aeos-45', name: 'AEOS 4.5T', models: ['aeos-edge-45', 'aeos-freedom-45', 'aeos-discovery-45'] },
  { id: 'zenos-72', name: 'Zenos 7.2T', models: ['zenos-discovery-72'] },
  { id: 'helios-75', name: 'Helios 7.5T', models: ['helios-75'] }
] as const

// Pioneer Package configuration
export const PIONEER_PACKAGE = {
  id: 'pioneer-package',
  name: 'Pioneer Package',
  price: 10800,
  description: 'Complete package including L4 surcharge, 4.5T uprating, tack locker, cabinets, seating, sink/hob, water, fridge, windows (2x), blinds (2x), wood internals, leisure battery, 240v hookup',
  includedOptions: [
    'L4 Surcharge',
    '4.5T Uprating',
    'Tack Locker',
    'Cabinets',
    'Seating',
    'Sink/Hob',
    'Water',
    'Fridge',
    'Windows',
    'Blinds',
    'Wood Internals',
    'Leisure Battery',
    '240v Hookup'
  ]
}

export type OptionCategory = typeof OPTION_CATEGORIES[number]['id']

// =============================================================================
// NEW: Weight, Living Area, and Admin Management Types
// =============================================================================

export interface ModelSpecification {
  id: string
  created_at: string
  updated_at: string
  model_code: string
  model_name: string
  tonnage: '3.5T' | '4.5T' | '7.2T' | '7.5T'
  gross_vehicle_weight_kg: number
  unladen_weight_kg: number
  target_payload_kg: number
  warning_threshold_kg: number
  standard_living_units: number
  units_per_foot_extension: number
  suggested_upgrade_model: string | null
  is_active: boolean
}

export interface WeightCalculation {
  base_vehicle_weight_kg: number
  options_total_weight_kg: number
  total_weight_kg: number
  remaining_payload_kg: number
  payload_percentage_used: number
  weight_warning_triggered: boolean
  suggested_upgrade_model: string | null
}

export interface LivingAreaCalculation {
  living_area_units_used: number
  standard_units_available: number
  extension_feet_required: number
  extension_units_provided: number
  total_units_available: number
  units_remaining: number
  auto_added_extension_cost: number
}

export interface ConfigurationCalculation {
  id: string
  created_at: string
  configuration_id: string | null
  lead_id: string | null

  // Weight calculations
  weight: WeightCalculation

  // Living area calculations
  living_area: LivingAreaCalculation

  // Pricing breakdown
  chassis_extension_cost: number
  options_total: number
  total_ex_vat: number
  vat_amount: number
  total_inc_vat: number

  // Metadata
  calculation_version: string
  calculation_warnings: CalculationWarning[]
  calculation_notes: string | null
}

export interface CalculationWarning {
  type: 'weight' | 'living_area' | 'price' | 'compatibility'
  severity: 'info' | 'warning' | 'error'
  message: string
  suggested_action?: string
}

export interface PricingHistory {
  id: string
  created_at: string
  option_id: string
  old_price: number | null
  new_price: number | null
  old_price_per_foot: number | null
  new_price_per_foot: number | null
  old_weight_kg: number | null
  new_weight_kg: number | null
  old_living_area_units: number | null
  new_living_area_units: number | null
  old_is_available: boolean | null
  new_is_available: boolean | null
  changed_by: string | null
  change_reason: string | null
  change_metadata: any | null
}

export interface ScheduledPricing {
  id: string
  created_at: string
  updated_at: string
  option_id: string
  effective_date: string
  new_price: number | null
  new_price_per_foot: number | null
  new_weight_kg: number | null
  new_living_area_units: number | null
  new_is_available: boolean | null
  status: 'pending' | 'applied' | 'cancelled'
  applied_at: string | null
  scheduled_by: string | null
  notes: string | null
}

// Admin management types
export interface PricingOptionUpdate {
  applicable_models?: string[]
  name?: string
  description?: string
  sku?: string
  price?: number
  price_per_foot?: number
  weight_kg?: number
  living_area_units?: number
  per_foot_pricing?: boolean
  vat_rate?: number
  is_default?: boolean
  is_available?: boolean
  dependencies?: any
  incompatible_with?: any
  display_order?: number
  image_url?: string
}

export interface BulkPricingImport {
  option_id?: string // If provided, updates existing; otherwise creates new
  applicable_models: string // Comma-separated model codes (e.g., "3.5t,4.5t,7.2t")
  category: string
  subcategory?: string
  name: string
  description?: string
  sku?: string
  price: number
  price_per_foot?: number
  weight_kg?: number
  living_area_units?: number
  per_foot_pricing?: boolean
  vat_rate?: number
  is_default?: boolean
  is_available?: boolean
  display_order?: number
}

export interface BulkImportResult {
  success: boolean
  total_rows: number
  created: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data?: BulkPricingImport
  }>
}