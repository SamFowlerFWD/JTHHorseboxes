import type { PricingConfig } from './pricing'

async function getEnv(): Promise<CloudflareEnv> {
  // Dynamic import with webpackIgnore so the build doesn't try to bundle
  // the Workers-only package during the Node.js build step.
  const mod = await import(/* webpackIgnore: true */ '@cloudflare/next-on-pages')
  const { env } = (mod.getRequestContext as () => { env: CloudflareEnv })()
  return env
}

// ── Pricing KV ──────────────────────────────────────────────────────

const PRICING_KEY = 'pricing:current'

export async function getPricingFromKV(): Promise<PricingConfig | null> {
  const env = await getEnv()
  const raw = await env.JTH_PRICING.get(PRICING_KEY)
  if (!raw) return null
  return JSON.parse(raw) as PricingConfig
}

export async function setPricingInKV(pricing: PricingConfig): Promise<void> {
  const env = await getEnv()
  await env.JTH_PRICING.put(PRICING_KEY, JSON.stringify(pricing))
}

// ── Saved Configurations KV ─────────────────────────────────────────

const CONFIG_TTL = 90 * 24 * 60 * 60 // 90 days in seconds

export async function getConfigFromKV(id: string): Promise<Record<string, unknown> | null> {
  const env = await getEnv()
  const raw = await env.JTH_CONFIGS.get(`config:${id}`)
  if (!raw) return null
  return JSON.parse(raw)
}

export async function saveConfigToKV(
  id: string,
  config: Record<string, unknown>
): Promise<void> {
  const env = await getEnv()
  await env.JTH_CONFIGS.put(`config:${id}`, JSON.stringify(config), {
    expirationTtl: CONFIG_TTL,
  })
}
