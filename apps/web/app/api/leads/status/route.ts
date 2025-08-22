import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Sample lead data for development
const SAMPLE_LEADS: Record<string, any> = {
  'LEAD-2024-001': {
    id: 'LEAD-2024-001',
    status: 'contacted',
    createdAt: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-01-16T14:30:00Z'
  },
  'LEAD-2024-002': {
    id: 'LEAD-2024-002',
    status: 'quote_sent',
    createdAt: '2024-01-20T09:00:00Z',
    lastUpdated: '2024-01-22T11:15:00Z'
  },
  'LEAD-2024-003': {
    id: 'LEAD-2024-003',
    status: 'converted',
    createdAt: '2024-01-25T13:00:00Z',
    lastUpdated: '2024-02-01T10:00:00Z'
  }
}

const leadStatusSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  email: z.string().email('Valid email is required').optional()
})

// GET /api/leads/status - Check lead status (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('leadId') || searchParams.get('id')
    const email = searchParams.get('email')
    
    if (!leadId) {
      return NextResponse.json(
        {
          error: 'Lead ID is required',
          message: 'Please provide a lead ID using ?leadId=YOUR_LEAD_ID',
          example: '/api/leads/status?leadId=LEAD-2024-001'
        },
        { status: 400 }
      )
    }

    // In production, this would query the database
    // For now, check our sample data
    const lead = SAMPLE_LEADS[leadId]
    
    if (!lead) {
      // Return generic message for security (don't reveal if ID exists)
      return NextResponse.json(
        {
          error: 'Unable to retrieve lead status',
          message: 'Please check your lead ID and try again. If you need assistance, contact support.',
          leadId
        },
        { status: 404 }
      )
    }

    // If email is provided, validate it matches (in production)
    // For now, we'll skip this validation
    
    // Return sanitized lead information (public-safe data only)
    const publicLeadInfo = {
      leadId: lead.id,
      status: lead.status,
      statusMessage: getStatusMessage(lead.status),
      lastUpdated: lead.lastUpdated,
      nextSteps: getNextSteps(lead.status)
    }

    return NextResponse.json({
      success: true,
      data: publicLeadInfo
    })
  } catch (error: any) {
    console.error('Error in GET /api/leads/status:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve lead status',
        message: 'An error occurred while checking lead status. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// POST /api/leads/status - Check lead status with email verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = leadStatusSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      )
    }

    const { leadId, email } = validation.data
    
    // In production, this would query the database
    const lead = SAMPLE_LEADS[leadId]
    
    if (!lead) {
      return NextResponse.json(
        {
          error: 'Unable to retrieve lead status',
          message: 'Please check your lead ID and try again.',
          leadId
        },
        { status: 404 }
      )
    }

    // In production, verify email matches the lead
    // For development, we'll accept any valid email
    if (email) {
      console.log(`Email verification for lead ${leadId}: ${email}`)
    }

    // Return sanitized lead information
    const publicLeadInfo = {
      leadId: lead.id,
      status: lead.status,
      statusMessage: getStatusMessage(lead.status),
      lastUpdated: lead.lastUpdated,
      nextSteps: getNextSteps(lead.status),
      // Include additional info if email is verified
      ...(email && {
        estimatedTimeline: getEstimatedTimeline(lead.status),
        contactSupport: 'support@jtaylorhorseboxes.com'
      })
    }

    return NextResponse.json({
      success: true,
      data: publicLeadInfo
    })
  } catch (error: any) {
    console.error('Error in POST /api/leads/status:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve lead status',
        message: 'An error occurred while checking lead status. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Helper functions for status messages
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    new: 'Your inquiry has been received and will be reviewed shortly.',
    contacted: 'We have reached out to you. Please check your email for our response.',
    quote_sent: 'Your quote has been sent. Please review it and let us know if you have questions.',
    negotiating: 'We are currently discussing your requirements.',
    converted: 'Thank you for your business! Your order is being processed.',
    lost: 'This inquiry has been closed. Feel free to contact us if you would like to reopen it.'
  }
  return messages[status] || 'Your inquiry is being processed.'
}

function getNextSteps(status: string): string[] {
  const steps: Record<string, string[]> = {
    new: [
      'You will receive an email confirmation shortly',
      'A sales representative will contact you within 24 hours'
    ],
    contacted: [
      'Check your email for our initial response',
      'Reply with any additional requirements or questions'
    ],
    quote_sent: [
      'Review the quote we sent to your email',
      'Contact us to discuss customization options',
      'Schedule a viewing if desired'
    ],
    negotiating: [
      'Finalize your configuration choices',
      'Discuss payment and delivery options'
    ],
    converted: [
      'Complete payment arrangements',
      'Schedule delivery or collection',
      'Prepare for pre-delivery inspection'
    ],
    lost: [
      'Contact us if you would like to reopen your inquiry',
      'Browse our latest models and offers'
    ]
  }
  return steps[status] || ['Please contact support for assistance']
}

function getEstimatedTimeline(status: string): string {
  const timelines: Record<string, string> = {
    new: '24-48 hours for initial response',
    contacted: '2-3 days for quote preparation',
    quote_sent: 'Quote valid for 30 days',
    negotiating: '1-2 weeks to finalize details',
    converted: '8-12 weeks for build and delivery',
    lost: 'Contact us anytime to restart'
  }
  return timelines[status] || 'Timeline varies based on requirements'
}