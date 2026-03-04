import type { PricingConfig } from './pricing'

function getEnv(): CloudflareEnv {
  // @cloudflare/next-on-pages exposes getRequestContext but we avoid
  // a hard dependency so the app still builds under Node / next dev.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getRequestContext } = require('@cloudflare/next-on-pages') as {
    getRequestContext: () => { env: CloudflareEnv }
  }
  return getRequestContext().env
}

// ── Pricing KV ──────────────────────────────────────────────────────

const PRICING_KEY = 'pricing:current'

export async function getPricingFromKV(): Promise<PricingConfig | null> {
  const env = getEnv()
  const raw = await env.JTH_PRICING.get(PRICING_KEY)
  if (!raw) return null
  return JSON.parse(raw) as PricingConfig
}

export async function setPricingInKV(pricing: PricingConfig): Promise<void> {
  const env = getEnv()
  await env.JTH_PRICING.put(PRICING_KEY, JSON.stringify(pricing))
}

// ── Saved Configurations KV ─────────────────────────────────────────

const CONFIG_TTL = 90 * 24 * 60 * 60 // 90 days in seconds

export async function getConfigFromKV(id: string): Promise<Record<string, unknown> | null> {
  const env = getEnv()
  const raw = await env.JTH_CONFIGS.get(`config:${id}`)
  if (!raw) return null
  return JSON.parse(raw)
}

export async function saveConfigToKV(
  id: string,
  config: Record<string, unknown>
): Promise<void> {
  const env = getEnv()
  await env.JTH_CONFIGS.put(`config:${id}`, JSON.stringify(config), {
    expirationTtl: CONFIG_TTL,
  })
}
