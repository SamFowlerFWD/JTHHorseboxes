import {
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
} from '@react-email/components'
import { EmailLayout } from './_components/Layout'

interface LeadNotificationEmailProps {
  leadId: string
  name: string
  email: string
  phone?: string
  source?: string
  notes?: string
}

export function LeadNotificationEmail({
  leadId,
  name,
  email,
  phone,
  source,
  notes,
}: LeadNotificationEmailProps) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/ops/pipeline`

  return (
    <EmailLayout preview={`New Lead: ${name}`}>
      <Heading style={h1}>🎉 New Lead Received!</Heading>

      <Text style={text}>
        A new customer has submitted an enquiry through the website.
      </Text>

      <Section style={leadBox}>
        <Row>
          <Column>
            <Text style={leadLabel}>Lead ID</Text>
            <Text style={leadValue}>{leadId}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={leadLabel}>Name</Text>
            <Text style={leadValue}>{name}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={leadLabel}>Email</Text>
            <Text style={leadValue}>
              <a href={`mailto:${email}`} style={link}>{email}</a>
            </Text>
          </Column>
        </Row>
        {phone && (
          <Row>
            <Column>
              <Text style={leadLabel}>Phone</Text>
              <Text style={leadValue}>
                <a href={`tel:${phone}`} style={link}>{phone}</a>
              </Text>
            </Column>
          </Row>
        )}
        {source && (
          <Row>
            <Column>
              <Text style={leadLabel}>Source</Text>
              <Text style={leadValue}>{source}</Text>
            </Column>
          </Row>
        )}
        {notes && (
          <Row>
            <Column>
              <Text style={leadLabel}>Notes</Text>
              <Text style={leadValue}>{notes}</Text>
            </Column>
          </Row>
        )}
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={button} href={dashboardUrl}>
          View in Dashboard
        </Button>
      </Section>

      <Text style={text}>
        <strong>⚡ Action Required:</strong>
        <br />
        Please contact this lead within 24 hours for the best conversion rate.
      </Text>

      <Text style={smallText}>
        This notification was sent automatically by the JTH Operations Platform.
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

const smallText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0 16px',
  fontStyle: 'italic' as const,
}

const leadBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const leadLabel = {
  color: '#92400e',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '8px 0 4px',
}

const leadValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px',
}

const link = {
  color: '#1e3a8a',
  textDecoration: 'underline',
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

export default LeadNotificationEmail
