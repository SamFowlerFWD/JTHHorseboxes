import pricingData from '@/data/pricing.json'

export type MoneyPence = number

export type Agent = { name: string; email: string }

export type Model = {
  id: string
  slug: string
  name: string
  basePricePence: MoneyPence | null
  active: boolean
  notes?: string
}

export type PackageInclude = { option: string; quantity?: number }

export type Package = {
  id: string
  slug: string
  name: string
  pricePence: MoneyPence
  appliesTo: string[]
  includes: PackageInclude[]
  parameters?: {
    chassis_extension_feet?: {
      choices: number[]
      pricePerFootPence: MoneyPence
      defaultFor?: Record<string, number>
    }
  }
}

export type OptionType = 'boolean' | 'quantity' | 'per_foot'

export type Option = {
  id: string
  slug: string
  name: string
  type: OptionType
  pricePerUnitPence: MoneyPence
  unit?: string
  maxQty?: number
  category?: string
  modelScope?: string[]
  appliesTo?: string[]
  dependencies?: string[]
  includedByDefault?: boolean
}

export type PricingConfig = {
  vatRate: number
  depositDefaultPence: MoneyPence
  agents: Agent[]
  models: Model[]
  packages: Package[]
  options: Option[]
}

export async function loadPricingConfig(): Promise<PricingConfig> {
  return pricingData as PricingConfig
}
