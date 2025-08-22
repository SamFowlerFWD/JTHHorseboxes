import { NextRequest, NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'
import { calculate, type Input } from '@/lib/calc'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema for quote creation
const quoteCreateSchema = z.object({
  modelId: z.string().min(1, 'Model ID is required'),
  chassisCostPence: z.number().int().min(0, 'Chassis cost must be a positive number'),
  depositPence: z.number().int().min(0).optional(),
  selectedOptions: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().min(0).optional(),
    perFoot: z.number().min(0).optional()
  })).default([]),
  pioneerEnabled: z.boolean().optional(),
  pioneerChassisFeet: z.number().min(0).optional(),
  // Additional customer info for quote generation
  customerInfo: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().max(1000).optional()
  }).optional()
})

export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const rawBody = await req.json()
    const validation = quoteCreateSchema.safeParse(rawBody)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    const body = validation.data
    const cfg = await loadPricingConfig()
    
    // Validate model exists
    const model = cfg.models.find(m => m.id === body.modelId)
    if (!model) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Model '${body.modelId}' not found. Available models: ${cfg.models.map(m => m.id).join(', ')}`
        },
        { status: 404 }
      )
    }

    // Validate selected options exist
    const invalidOptions = body.selectedOptions.filter(
      selected => !cfg.options.some(opt => opt.id === selected.id)
    )
    
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: `Invalid options: ${invalidOptions.map(o => o.id).join(', ')}`
        },
        { status: 400 }
      )
    }

    // Calculate the quote
    const calculationInput: Input = {
      modelId: body.modelId,
      chassisCostPence: body.chassisCostPence,
      depositPence: body.depositPence,
      selectedOptions: body.selectedOptions,
      pioneerEnabled: body.pioneerEnabled,
      pioneerChassisFeet: body.pioneerChassisFeet
    }
    
    const result = calculate(cfg, calculationInput)
    
    // Generate unique quote ID
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 5).toUpperCase()
    const quoteId = `JTH-${timestamp}-${random}`

    // TODO: In production, save to database
    // For now, log the quote details
    const quoteData = {
      id: quoteId,
      modelId: body.modelId,
      model: model.name,
      customerInfo: body.customerInfo,
      configuration: calculationInput,
      calculation: result,
      createdAt: new Date().toISOString()
    }
    
    console.log('QUOTE_CREATED:', quoteData)

    // TODO: Send confirmation email if customer email provided
    if (body.customerInfo?.email) {
      console.log(`Would send quote ${quoteId} to ${body.customerInfo.email}`)
    }

    return NextResponse.json({ 
      ok: true, 
      quoteId,
      result,
      message: 'Quote created successfully'
    }, { status: 201 })
    
  } catch (err: any) {
    console.error('Error in POST /api/quote/create:', err)
    
    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        ok: false, 
        error: err.message ?? 'Failed to create quote'
      },
      { status: 500 }
    )
  }
}
