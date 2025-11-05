import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const leadSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  configuration: z.any().optional(),
  quote_amount: z.number().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  consent_marketing: z.boolean().default(false),
})

// GET /api/leads - Get all leads (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('leads')
      .select('*, lead_activities(count)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads - Create a new lead (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = leadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const leadData = validationResult.data
    
    // If consent_marketing is true, add consent_timestamp
    if (leadData.consent_marketing) {
      Object.assign(leadData, { consent_timestamp: new Date().toISOString() })
    }

    // Use service role client for inserting leads
    const supabase = await createServiceClient()
    
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (error) {
      // Check for duplicate email constraint
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A lead with this email was already submitted today' },
          { status: 409 }
        )
      }
      console.error('Error creating lead:', error)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('lead_activities')
      .insert([{
        lead_id: lead.id,
        activity_type: 'lead_created',
        description: `Lead created from ${leadData.source || 'website'}`,
        metadata: { source: leadData.source, utm_source: leadData.utm_source }
      }])

    // Send notification email to admin
    const { sendLeadNotification, sendLeadConfirmation } = await import('@/lib/email')

    const adminEmailResult = await sendLeadNotification({
      leadId: lead.id,
      name: `${leadData.first_name} ${leadData.last_name}`,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      notes: leadData.notes,
    })

    if (adminEmailResult.success) {
      console.log('Admin notification sent for lead:', lead.id)
    } else {
      console.error('Failed to send admin notification:', adminEmailResult.error)
    }

    // Send confirmation email to customer
    const customerEmailResult = await sendLeadConfirmation({
      to: leadData.email,
      name: leadData.first_name,
    })

    if (customerEmailResult.success) {
      console.log('Lead confirmation sent to:', leadData.email)
    } else {
      console.error('Failed to send lead confirmation:', customerEmailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your interest! We will contact you soon.',
      lead_id: lead.id,
      id: lead.id
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}