import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { loadPricingConfig, type RegionConfig } from '@/lib/pricing'

export const runtime = 'edge'

type RegionPatch = {
  vatRate?: number
  depositDefaultPence?: number
  regionConfig?: Record<string, RegionConfig>
}

/** PATCH — update region config, VAT rate, or deposit */
export async function PATCH(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: RegionPatch = await request.json()
    const cfg = await loadPricingConfig()

    // Allow patching top-level fields
    if (body.vatRate !== undefined) cfg.vatRate = body.vatRate
    if (body.depositDefaultPence !== undefined) cfg.depositDefaultPence = body.depositDefaultPence

    // Allow patching regionConfig (IE markup, exchange rate, VAT)
    if (body.regionConfig) {
      cfg.regionConfig = { ...cfg.regionConfig, ...body.regionConfig }
    }

    const { setPricingInKV } = await import('@/lib/kv')
    await setPricingInKV(cfg)

    return NextResponse.json({
      success: true,
      vatRate: cfg.vatRate,
      depositDefaultPence: cfg.depositDefaultPence,
      regionConfig: cfg.regionConfig,
    })
  } catch (error: any) {
    console.error('Error patching region config:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to update region config' },
      { status: 500 }
    )
  }
}
