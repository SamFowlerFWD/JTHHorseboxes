import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(30),
  model: z.string().optional(),
  message: z.string().min(1, 'Message is required').max(5000),
  marketingConsent: z.boolean().optional(),
  // Configurator submission fields
  source: z.string().optional(),
  configuration: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    const resend = new Resend(process.env.RESEND_API_KEY)

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const isConfiguratorSubmission = data.source === 'configurator' && data.configuration

    // Build email body
    const configDetails = isConfiguratorSubmission
      ? `\n\n--- CONFIGURATOR DETAILS ---\n${JSON.stringify(data.configuration, null, 2)}`
      : ''

    const modelLine = data.model ? `Model of Interest: ${data.model}\n` : ''

    // Send notification to JTH sales team
    await resend.emails.send({
      from: 'JTH Website <noreply@jthltd.co.uk>',
      to: 'sales@jthltd.co.uk',
      subject: isConfiguratorSubmission
        ? `New Configurator Submission from ${data.name}`
        : `New Enquiry from ${data.name}`,
      text: [
        `New ${isConfiguratorSubmission ? 'configurator submission' : 'website enquiry'}`,
        '',
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        modelLine,
        `Message: ${data.message}`,
        '',
        `Marketing Consent: ${data.marketingConsent ? 'Yes' : 'No'}`,
        configDetails,
      ].join('\n'),
    })

    // Send confirmation to customer
    await resend.emails.send({
      from: 'J Taylor Horseboxes <noreply@jthltd.co.uk>',
      to: data.email,
      subject: 'Thank you for contacting J Taylor Horseboxes',
      text: [
        `Dear ${data.name},`,
        '',
        'Thank you for your enquiry. We have received your message and our team will be in touch within 24 hours.',
        '',
        'If you need immediate assistance, please call us on 01603 552109.',
        '',
        'Kind regards,',
        'The JTH Team',
        'J Taylor Horseboxes',
        'www.jthltd.co.uk',
      ].join('\n'),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
