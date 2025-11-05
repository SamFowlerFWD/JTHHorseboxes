import {
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
} from '@react-email/components'
import { EmailLayout } from './_components/Layout'

interface QuoteConfirmationEmailProps {
  quoteId: string
  customerName: string
  modelName: string
  totalPrice: string
  quoteUrl?: string
}

export function QuoteConfirmationEmail({
  quoteId,
  customerName,
  modelName,
  totalPrice,
  quoteUrl,
}: QuoteConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Your JTH Horsebox Quote ${quoteId}`}>
      <Heading style={h1}>Your Quote is Ready!</Heading>

      <Text style={text}>Dear {customerName},</Text>

      <Text style={text}>
        Thank you for your interest in JTH Horseboxes. We're delighted to provide you with a
        personalized quote for your dream horsebox.
      </Text>

      <Section style={quoteBox}>
        <Row>
          <Column>
            <Text style={quoteLabel}>Quote Reference</Text>
            <Text style={quoteValue}>{quoteId}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={quoteLabel}>Model</Text>
            <Text style={quoteValue}>{modelName}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={quoteLabel}>Total Price</Text>
            <Text style={quotePrice}>{totalPrice}</Text>
          </Column>
        </Row>
      </Section>

      {quoteUrl && (
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button style={button} href={quoteUrl}>
            View Full Quote Details
          </Button>
        </Section>
      )}

      <Text style={text}>
        <strong>What happens next?</strong>
      </Text>

      <Text style={text}>
        1. One of our horsebox specialists will contact you within 24 hours
        <br />
        2. We'll discuss your specific requirements and answer any questions
        <br />
        3. We can arrange a visit to our workshop to view our horseboxes
        <br />
        4. If you're happy to proceed, we'll finalize the specification and order
      </Text>

      <Text style={text}>
        If you have any immediate questions, please don't hesitate to contact us on{' '}
        <strong>01234 567890</strong> or reply to this email.
      </Text>

      <Text style={text}>
        We look forward to building your perfect horsebox!
      </Text>

      <Text style={signature}>
        Best regards,
        <br />
        <strong>The JTH Team</strong>
        <br />
        J Taylor Horseboxes
      </Text>
    </EmailLayout>
  )
}

// Styles
const h1 = {
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  lineHeight: '1.3',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const quoteBox = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const quoteLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '8px 0 4px',
}

const quoteValue = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const quotePrice = {
  color: '#1e3a8a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
}

const button = {
  backgroundColor: '#1e3a8a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 16px',
}

export default QuoteConfirmationEmail
