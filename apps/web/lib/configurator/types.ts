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
  base_price: number
  vat_rate: number
  weight_class: string
}

export const MODELS: Model[] = [
  {
    id: 'professional-35',
    slug: 'professional-35',
    name: 'Professional 35',
    description: '3.5 Tonne Professional Model',
    base_price: 22000,
    vat_rate: 20,
    weight_class: '3.5t'
  },
  {
    id: 'principle-35',
    slug: 'principle-35',
    name: 'Principle 35',
    description: '3.5 Tonne Principle Model',
    base_price: 18500,
    vat_rate: 20,
    weight_class: '3.5t'
  },
  {
    id: 'progeny-35',
    slug: 'progeny-35',
    name: 'Progeny 35',
    description: '3.5 Tonne Progeny Model',
    base_price: 25500,
    vat_rate: 20,
    weight_class: '3.5t'
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