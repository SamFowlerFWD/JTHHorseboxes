import pricingData from '@/data/pricing.json'

export type MoneyPence = number

export type Agent = { name: string; email: string }

export type Model = {
  id: string
  slug: string
  name: string
  basePricePence: MoneyPence | null
  active: boolean
  category?: string
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

export type RegionConfig = {
  vatRate: number
  currency: string
  markup: number
  exchangeRate: number
}

export type PricingConfig = {
  regionConfig?: Record<string, RegionConfig>
  vatRate: number
  depositDefaultPence: MoneyPence
  agents: Agent[]
  models: Model[]
  packages: Package[]
  options: Option[]
}

/**
 * Load pricing configuration.
 * At runtime on Cloudflare Workers → reads from KV.
 * At build time / local dev (Node.js) → falls back to static JSON.
 */
export async function loadPricingConfig(): Promise<PricingConfig> {
  try {
    // Dynamic import so Node.js builds don't choke on Workers-only APIs
    const { getPricingFromKV } = await import('./kv')
    const kv = await getPricingFromKV()
    if (kv) return kv
  } catch {
    // Not in a Workers context — fall through to static data
  }

  return pricingData as PricingConfig
}
