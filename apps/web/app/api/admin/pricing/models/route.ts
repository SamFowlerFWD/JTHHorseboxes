import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { loadPricingConfig, type Model } from '@/lib/pricing'

export const runtime = 'edge'

async function saveCfg(cfg: Awaited<ReturnType<typeof loadPricingConfig>>) {
  const { setPricingInKV } = await import('@/lib/kv')
  await setPricingInKV(cfg)
}

/** PUT — update an existing model by id */
export async function PUT(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: Partial<Model> & { id: string } = await request.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Model id is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    const idx = cfg.models.findIndex(m => m.id === body.id)
    if (idx === -1) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    cfg.models[idx] = { ...cfg.models[idx], ...body }
    await saveCfg(cfg)
    return NextResponse.json({ success: true, model: cfg.models[idx] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to update model' }, { status: 500 })
  }
}

/** POST — add a new model */
export async function POST(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: Model = await request.json()
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'id and name are required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    if (cfg.models.some(m => m.id === body.id)) {
      return NextResponse.json({ error: 'Model with this id already exists' }, { status: 409 })
    }

    const newModel: Model = {
      ...body,
      slug: body.slug || body.id,
      active: body.active ?? true,
      basePricePence: body.basePricePence ?? null,
    }

    cfg.models.push(newModel)
    await saveCfg(cfg)
    return NextResponse.json({ success: true, model: newModel }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to create model' }, { status: 500 })
  }
}

/** DELETE — remove a model by id (query param) */
export async function DELETE(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    const before = cfg.models.length
    cfg.models = cfg.models.filter(m => m.id !== id)
    if (cfg.models.length === before) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    await saveCfg(cfg)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete model' }, { status: 500 })
  }
}
