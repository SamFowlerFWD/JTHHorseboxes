// Configurator Types

export interface PricingOption {
  id: string
  created_at: string
  updated_at: string
  model: string
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