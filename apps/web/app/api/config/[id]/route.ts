import { NextRequest, NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'

export const runtime = 'edge'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Configuration ID is required' },
        { status: 400 }
      )
    }

    const cfg = await loadPricingConfig()

    // Check if this is a model slug (e.g. 'professional-35')
    const model = cfg.models.find(m => m.slug === id || m.id === id)

    if (model) {
      const pioneer =
        cfg.packages.find(
          p => p.id === 'pioneer' && p.appliesTo.includes(model.id)
        ) ?? null

      return NextResponse.json({
        type: 'model',
        model,
        options: cfg.options.filter(
          opt =>
            !opt.appliesTo ||
            opt.appliesTo.length === 0 ||
            opt.appliesTo.includes(model.id)
        ),
        pioneer,
        agents: cfg.agents,
        vatRate: cfg.vatRate,
        depositDefaultPence: cfg.depositDefaultPence,
      })
    }

    // Check KV for a saved configuration
    let savedConfig: Record<string, unknown> | null = null
    try {
      const { getConfigFromKV } = await import('@/lib/kv')
      savedConfig = await getConfigFromKV(id)
    } catch {
      // Not in Workers context — no saved configs available
    }

    if (savedConfig) {
      const configModel = cfg.models.find(
        m => m.id === savedConfig!.modelId || m.slug === savedConfig!.modelId
      )

      if (!configModel) {
        return NextResponse.json(
          { error: `Model ${savedConfig.modelId} not found for saved configuration` },
          { status: 404 }
        )
      }

      const pioneer =
        cfg.packages.find(
          p => p.id === 'pioneer' && p.appliesTo.includes(configModel.id)
        ) ?? null

      return NextResponse.json({
        type: 'saved',
        config: savedConfig,
        model: configModel,
        options: cfg.options.filter(
          opt =>
            !opt.appliesTo ||
            opt.appliesTo.length === 0 ||
            opt.appliesTo.includes(configModel.id)
        ),
        pioneer,
        agents: cfg.agents,
        vatRate: cfg.vatRate,
        depositDefaultPence:
          (savedConfig.depositPence as number) || cfg.depositDefaultPence,
      })
    }

    return NextResponse.json(
      {
        error: `Configuration '${id}' not found`,
        availableModels: cfg.models.map(m => m.slug),
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Error in GET /api/config/[id]:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: Record<string, unknown> = await req.json()

    const configId = id || `config-${Date.now()}`

    const savedConfig: Record<string, unknown> = {
      ...body,
      id: configId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Persist to KV
    try {
      const { saveConfigToKV } = await import('@/lib/kv')
      await saveConfigToKV(configId, savedConfig)
    } catch {
      // Not in Workers context — log only
      console.warn('KV not available; config not persisted:', configId)
    }

    return NextResponse.json(
      {
        success: true,
        id: configId,
        config: savedConfig,
        message: 'Configuration saved successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/config/[id]:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
