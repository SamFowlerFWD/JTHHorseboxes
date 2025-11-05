import {
  Heading,
  Text,
  Button,
  Section,
} from '@react-email/components'
import { EmailLayout } from './_components/Layout'

interface LeadConfirmationEmailProps {
  name: string
}

export function LeadConfirmationEmail({ name }: LeadConfirmationEmailProps) {
  const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jtaylorhorseboxes.com'

  return (
    <EmailLayout preview="Thank you for your interest in JTH Horseboxes">
      <Heading style={h1}>Thank You for Your Enquiry</Heading>

      <Text style={text}>Dear {name},</Text>

      <Text style={text}>
        Thank you for getting in touch with J Taylor Horseboxes. We're thrilled that you're
        interested in our premium horsebox solutions.
      </Text>

      <Section style={infoBox}>
        <Text style={infoHeading}>✅ We've received your enquiry</Text>
        <Text style={infoText}>
          One of our horsebox specialists will be in touch with you within 24 hours to discuss
          your requirements.
        </Text>
      </Section>

      <Text style={text}>
        <strong>What to expect next:</strong>
      </Text>

      <Text style={text}>
        📞 <strong>Personal Consultation</strong>
        <br />
        We'll call you to understand your specific needs and preferences
        <br />
        <br />
        🎨 <strong>Custom Configuration</strong>
        <br />
        We'll help design a horsebox perfectly tailored to your requirements
        <br />
        <br />
        🏭 <strong>Workshop Visit</strong>
        <br />
        You're welcome to visit our workshop to see our craftsmanship firsthand
        <br />
        <br />
        💷 <strong>Detailed Quote</strong>
        <br />
        We'll provide a comprehensive quote with no hidden costs
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={button} href={`${websiteUrl}/models`}>
          Explore Our Models
        </Button>
      </Section>

      <Text style={text}>
        In the meantime, feel free to browse our range of horseboxes or contact us directly:
      </Text>

      <Text style={contactInfo}>
        📧 Email: <a href="mailto:info@jtaylorhorseboxes.com" style={link}>info@jtaylorhorseboxes.com</a>
        <br />
        📞 Phone: <a href="tel:01234567890" style={link}>01234 567890</a>
      </Text>

      <Text style={text}>
        We look forward to helping you find your perfect horsebox!
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

const infoBox = {
  backgroundColor: '#ecfdf5',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const infoHeading = {
  color: '#065f46',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const infoText = {
  color: '#047857',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const contactInfo = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '6px',
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

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 16px',
}

export default LeadConfirmationEmail
