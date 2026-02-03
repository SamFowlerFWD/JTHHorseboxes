import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'J Taylor Horseboxes <noreply@jthltd.co.uk>'
const ADMIN_EMAIL = process.env.EMAIL_ADMIN || 'sales@jthltd.co.uk'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

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
      text: options.text || '',
      ...(options.html && { html: options.html }),
      ...(options.replyTo && { replyTo: options.replyTo }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error: any) {
    console.error('Exception sending email:', error)
    return { success: false, error: error.message }
  }
}

export { resend, FROM_EMAIL, ADMIN_EMAIL }
