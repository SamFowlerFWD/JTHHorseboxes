import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { loadPricingConfig, type Option } from '@/lib/pricing'

export const runtime = 'edge'

async function saveCfg(cfg: Awaited<ReturnType<typeof loadPricingConfig>>) {
  const { setPricingInKV } = await import('@/lib/kv')
  await setPricingInKV(cfg)
}

/** PUT — update an existing option by id */
export async function PUT(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: Partial<Option> & { id: string } = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Option id is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    const idx = cfg.options.findIndex(o => o.id === body.id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    cfg.options[idx] = { ...cfg.options[idx], ...body }
    await saveCfg(cfg)
    return NextResponse.json({ success: true, option: cfg.options[idx] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to update option' }, { status: 500 })
  }
}

/** POST — add a new option */
export async function POST(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: Option = await request.json()
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'id and name are required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    if (cfg.options.some(o => o.id === body.id)) {
      return NextResponse.json({ error: 'Option with this id already exists' }, { status: 409 })
    }

    const newOption: Option = {
      ...body,
      slug: body.slug || body.id,
      type: body.type || 'boolean',
      pricePerUnitPence: body.pricePerUnitPence ?? 0,
    }

    cfg.options.push(newOption)
    await saveCfg(cfg)
    return NextResponse.json({ success: true, option: newOption }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to create option' }, { status: 500 })
  }
}

/** DELETE — remove an option by id (query param) */
export async function DELETE(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    const before = cfg.options.length
    cfg.options = cfg.options.filter(o => o.id !== id)
    if (cfg.options.length === before) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 })
    }

    await saveCfg(cfg)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete option' }, { status: 500 })
  }
}
