import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { loadPricingConfig, type Agent } from '@/lib/pricing'

export const runtime = 'edge'

async function saveCfg(cfg: Awaited<ReturnType<typeof loadPricingConfig>>) {
  const { setPricingInKV } = await import('@/lib/kv')
  await setPricingInKV(cfg)
}

/** PUT — replace the full agents list */
export async function PUT(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: { agents: Agent[] } = await request.json()
    if (!Array.isArray(body.agents)) {
      return NextResponse.json({ error: 'agents array is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    cfg.agents = body.agents
    await saveCfg(cfg)
    return NextResponse.json({ success: true, agents: cfg.agents })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to update agents' }, { status: 500 })
  }
}

/** POST — add a new agent */
export async function POST(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: Agent = await request.json()
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    if (cfg.agents.some(a => a.email === body.email)) {
      return NextResponse.json({ error: 'Agent with this email already exists' }, { status: 409 })
    }

    cfg.agents.push(body)
    await saveCfg(cfg)
    return NextResponse.json({ success: true, agent: body }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to add agent' }, { status: 500 })
  }
}

/** DELETE — remove an agent by email (query param) */
export async function DELETE(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const email = new URL(request.url).searchParams.get('email')
    if (!email) {
      return NextResponse.json({ error: 'email query param is required' }, { status: 400 })
    }

    const cfg = await loadPricingConfig()
    const before = cfg.agents.length
    cfg.agents = cfg.agents.filter(a => a.email !== email)
    if (cfg.agents.length === before) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    await saveCfg(cfg)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to delete agent' }, { status: 500 })
  }
}
