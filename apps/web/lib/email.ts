import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email
const FROM_EMAIL = process.env.EMAIL_FROM || 'JTH Horseboxes <quotes@jtaylorhorseboxes.com>'
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || 'info@jtaylorhorseboxes.com'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent:', options.subject)
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      react: options.react,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error: any) {
    console.error('Exception sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send quote confirmation email to customer
 */
export async function sendQuoteConfirmation({
  to,
  quoteId,
  customerName,
  modelName,
  totalPrice,
  quoteUrl,
  pdfBuffer,
}: {
  to: string
  quoteId: string
  customerName: string
  modelName: string
  totalPrice: string
  quoteUrl?: string
  pdfBuffer?: Buffer
}) {
  // Import email template dynamically
  const { QuoteConfirmationEmail } = await import('@/emails/QuoteConfirmation')

  const attachments = pdfBuffer
    ? [
        {
          filename: `JTH-Quote-${quoteId}.pdf`,
          content: pdfBuffer,
        },
      ]
    : undefined

  return sendEmail({
    to,
    subject: `Your JTH Horsebox Quote ${quoteId}`,
    react: QuoteConfirmationEmail({
      quoteId,
      customerName,
      modelName,
      totalPrice,
      quoteUrl,
    }),
    replyTo: ADMIN_EMAIL,
    attachments,
  })
}

/**
 * Send lead notification email to admin
 */
export async function sendLeadNotification({
  leadId,
  name,
  email,
  phone,
  source,
  notes,
}: {
  leadId: string
  name: string
  email: string
  phone?: string
  source?: string
  notes?: string
}) {
  const { LeadNotificationEmail } = await import('@/emails/LeadNotification')

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Lead: ${name}`,
    react: LeadNotificationEmail({
      leadId,
      name,
      email,
      phone,
      source,
      notes,
    }),
  })
}

/**
 * Send lead confirmation email to customer
 */
export async function sendLeadConfirmation({
  to,
  name,
}: {
  to: string
  name: string
}) {
  const { LeadConfirmationEmail } = await import('@/emails/LeadConfirmation')

  return sendEmail({
    to,
    subject: 'Thank you for your interest in JTH Horseboxes',
    react: LeadConfirmationEmail({ name }),
    replyTo: ADMIN_EMAIL,
  })
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation({
  to,
  orderId,
  customerName,
  modelName,
  totalPrice,
  depositPaid,
}: {
  to: string
  orderId: string
  customerName: string
  modelName: string
  totalPrice: string
  depositPaid: string
}) {
  const { OrderConfirmationEmail } = await import('@/emails/OrderConfirmation')

  return sendEmail({
    to,
    subject: `Order Confirmation ${orderId} - JTH Horseboxes`,
    react: OrderConfirmationEmail({
      orderId,
      customerName,
      modelName,
      totalPrice,
      depositPaid,
    }),
    replyTo: ADMIN_EMAIL,
  })
}

export { resend, FROM_EMAIL, ADMIN_EMAIL }
