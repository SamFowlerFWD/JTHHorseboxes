import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { loadPricingConfig, type PricingConfig } from '@/lib/pricing'

export const runtime = 'edge'

/** GET — return full pricing config */
export async function GET(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  const cfg = await loadPricingConfig()
  return NextResponse.json(cfg)
}

/** PUT — replace the entire pricing config */
export async function PUT(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: PricingConfig = await request.json()
    const { setPricingInKV } = await import('@/lib/kv')
    await setPricingInKV(body)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating pricing:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to update pricing' },
      { status: 500 }
    )
  }
}

/** PATCH — merge top-level fields into the existing config */
export async function PATCH(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const patch: Partial<PricingConfig> = await request.json()
    const cfg = await loadPricingConfig()
    const updated = { ...cfg, ...patch }
    const { setPricingInKV } = await import('@/lib/kv')
    await setPricingInKV(updated)
    return NextResponse.json({ success: true, config: updated })
  } catch (error: any) {
    console.error('Error patching pricing:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to patch pricing' },
      { status: 500 }
    )
  }
}
