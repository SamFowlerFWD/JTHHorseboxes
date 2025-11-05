import { NextRequest, NextResponse } from 'next/server'
import { generateQuotePDF, getQuotePDFFilename } from '@/lib/pdf/generate'
import { loadPricingConfig } from '@/lib/pricing'
import { calculate } from '@/lib/calc'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schema
const pdfRequestSchema = z.object({
  quoteId: z.string().min(1),
  modelId: z.string().min(1),
  chassisCostPence: z.number().int().min(0),
  depositPence: z.number().int().min(0).optional(),
  selectedOptions: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().min(0).optional(),
    perFoot: z.number().min(0).optional()
  })).default([]),
  pioneerEnabled: z.boolean().optional(),
  pioneerChassisFeet: z.number().min(0).optional(),
  customerInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  createdAt: z.string().optional(),
})

/**
 * POST /api/quote/pdf - Generate a PDF for a quote
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json()
    const validation = pdfRequestSchema.safeParse(rawBody)

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

    // Validate model
    const model = cfg.models.find(m => m.id === body.modelId)
    if (!model) {
      return NextResponse.json(
        {
          ok: false,
          error: `Model '${body.modelId}' not found`
        },
        { status: 404 }
      )
    }

    // Calculate the quote
    const calculation = calculate(cfg, {
      modelId: body.modelId,
      chassisCostPence: body.chassisCostPence,
      depositPence: body.depositPence,
      selectedOptions: body.selectedOptions,
      pioneerEnabled: body.pioneerEnabled,
      pioneerChassisFeet: body.pioneerChassisFeet,
    })

    // Generate PDF
    const quoteData = {
      quoteId: body.quoteId,
      customerInfo: body.customerInfo,
      modelName: model.name,
      calculation,
      selectedOptions: body.selectedOptions,
      pricingConfig: cfg,
      createdAt: body.createdAt || new Date().toISOString(),
    }

    const pdfBuffer = await generateQuotePDF(quoteData)
    const filename = getQuotePDFFilename(body.quoteId)

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (err: any) {
    console.error('Error generating PDF:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err.message || 'Failed to generate PDF'
      },
      { status: 500 }
    )
  }
}
