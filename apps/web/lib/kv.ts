import type { PricingConfig } from './pricing'

/**
 * In-memory stubs for KV operations.
 * TODO: Re-enable Cloudflare KV once next-on-pages esbuild
 * resolution issue is resolved.
 */

const memoryPricing: { data: PricingConfig | null } = { data: null }
const memoryConfigs = new Map<string, Record<string, unknown>>()

export async function getPricingFromKV(): Promise<PricingConfig | null> {
  return memoryPricing.data
}

export async function setPricingInKV(pricing: PricingConfig): Promise<void> {
  memoryPricing.data = pricing
}

export async function getConfigFromKV(id: string): Promise<Record<string, unknown> | null> {
  return memoryConfigs.get(id) ?? null
}

export async function saveConfigToKV(
  id: string,
  config: Record<string, unknown>
): Promise<void> {
  memoryConfigs.set(id, config)
}
