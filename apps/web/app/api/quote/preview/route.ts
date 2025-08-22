import { NextRequest, NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'
import { calculate, type Input } from '@/lib/calc'

export const dynamic = 'force-dynamic'

// GET handler for retrieving quote preview data
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const modelId = searchParams.get('modelId')
    const chassisCost = searchParams.get('chassisCost')
    
    if (!modelId) {
      return NextResponse.json(
        { ok: false, error: 'modelId is required' },
        { status: 400 }
      )
    }

    const cfg = await loadPricingConfig()
    const model = cfg.models.find(m => m.id === modelId)
    
    if (!model) {
      return NextResponse.json(
        { ok: false, error: `Model ${modelId} not found` },
        { status: 404 }
      )
    }

    // Return preview data with model info and default values
    const previewData = {
      model,
      options: cfg.options,
      vatRate: cfg.vatRate,
      depositDefaultPence: cfg.depositDefaultPence,
      chassisCostPence: chassisCost ? parseInt(chassisCost) : model.basePricePence,
      pioneer: cfg.packages.find(p => p.id === 'pioneer' && p.appliesTo.includes(modelId)) ?? null
    }

    return NextResponse.json({ ok: true, data: previewData })
  } catch (err: any) {
    console.error('Error in GET /api/quote/preview:', err)
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Failed to generate preview' },
      { status: 500 }
    )
  }
}

// POST handler for calculating quote
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Input
    
    // Validate required fields
    if (!body.modelId) {
      return NextResponse.json(
        { ok: false, error: 'modelId is required' },
        { status: 400 }
      )
    }
    
    if (typeof body.chassisCostPence !== 'number' || body.chassisCostPence < 0) {
      return NextResponse.json(
        { ok: false, error: 'chassisCostPence must be a positive number' },
        { status: 400 }
      )
    }

    const cfg = await loadPricingConfig()
    
    // Validate model exists
    const model = cfg.models.find(m => m.id === body.modelId)
    if (!model) {
      return NextResponse.json(
        { ok: false, error: `Model ${body.modelId} not found` },
        { status: 404 }
      )
    }

    const result = calculate(cfg, body)
    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    console.error('Error in POST /api/quote/preview:', err)
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Failed to calculate quote' },
      { status: 500 }
    )
  }
}
