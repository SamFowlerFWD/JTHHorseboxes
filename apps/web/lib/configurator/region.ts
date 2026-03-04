// Region configuration for GB/IE pricing

export type Region = 'GB' | 'IE'

export interface RegionConfig {
  vatRate: number        // decimal: 0.20 or 0.23
  currency: string       // 'GBP' or 'EUR'
  locale: string         // 'en-GB' or 'en-IE'
  markup: number         // multiplier: 1.0 or 1.15
  exchangeRate: number   // GBP->target: 1.0 or 1.17
  currencySymbol: string // '£' or '€'
}

const REGION_CONFIGS: Record<Region, RegionConfig> = {
  GB: {
    vatRate: 0.20,
    currency: 'GBP',
    locale: 'en-GB',
    markup: 1.0,
    exchangeRate: 1.0,
    currencySymbol: '£',
  },
  IE: {
    vatRate: 0.23,
    currency: 'EUR',
    locale: 'en-IE',
    markup: parseFloat(process.env.NEXT_PUBLIC_IE_MARKUP || '1.15'),
    exchangeRate: parseFloat(process.env.NEXT_PUBLIC_IE_EXCHANGE_RATE || '1.17'),
    currencySymbol: '€',
  },
}

export function getRegionConfig(region: Region): RegionConfig {
  return REGION_CONFIGS[region]
}

/**
 * Read the region cookie. SSR-safe — defaults to 'GB' when document is unavailable.
 */
export function getRegionFromCookie(): Region {
  if (typeof document === 'undefined') return 'GB'

  const match = document.cookie.match(/(?:^|;\s*)region=(GB|IE)/)
  return (match?.[1] as Region) ?? 'GB'
}
