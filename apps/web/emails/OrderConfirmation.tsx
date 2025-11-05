import {
  Heading,
  Text,
  Button,
  Section,
  Row,
  Column,
} from '@react-email/components'
import { EmailLayout } from './_components/Layout'

interface OrderConfirmationEmailProps {
  orderId: string
  customerName: string
  modelName: string
  totalPrice: string
  depositPaid: string
}

export function OrderConfirmationEmail({
  orderId,
  customerName,
  modelName,
  totalPrice,
  depositPaid,
}: OrderConfirmationEmailProps) {
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/tracker/${orderId}`

  return (
    <EmailLayout preview={`Order Confirmation ${orderId}`}>
      <Heading style={h1}>🎉 Your Order is Confirmed!</Heading>

      <Text style={text}>Dear {customerName},</Text>

      <Text style={text}>
        Congratulations! We're delighted to confirm your order for a beautiful JTH horsebox.
        Your journey to owning the perfect horsebox begins here!
      </Text>

      <Section style={orderBox}>
        <Row>
          <Column>
            <Text style={orderLabel}>Order Reference</Text>
            <Text style={orderValue}>{orderId}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={orderLabel}>Model</Text>
            <Text style={orderValue}>{modelName}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={orderLabel}>Total Price</Text>
            <Text style={orderValue}>{totalPrice}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={orderLabel}>Deposit Paid</Text>
            <Text style={orderValue}>{depositPaid}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={button} href={portalUrl}>
          Track Your Build Progress
        </Button>
      </Section>

      <Text style={text}>
        <strong>What happens next?</strong>
      </Text>

      <Text style={text}>
        📋 <strong>Build Planning (Week 1-2)</strong>
        <br />
        Our team will finalize your specification and schedule production
        <br />
        <br />
        🔨 <strong>Manufacturing (Weeks 3-12)</strong>
        <br />
        Your horsebox will be expertly crafted by our skilled team
        <br />
        <br />
        📸 <strong>Progress Updates</strong>
        <br />
        We'll share photos and updates as your build progresses
        <br />
        <br />
        ✅ <strong>Quality Inspection</strong>
        <br />
        Final checks and adjustments before delivery
        <br />
        <br />
        🚚 <strong>Delivery</strong>
        <br />
        Your horsebox will be delivered to your door
      </Text>

      <Section style={infoBox}>
        <Text style={infoHeading}>📱 Stay Connected</Text>
        <Text style={infoText}>
          Use your customer portal to track progress, view photos, and communicate with our team
          throughout the build process.
        </Text>
      </Section>

      <Text style={text}>
        If you have any questions about your order, please don't hesitate to contact us:
      </Text>

      <Text style={contactInfo}>
        📧 Email: <a href="mailto:info@jtaylorhorseboxes.com" style={link}>info@jtaylorhorseboxes.com</a>
        <br />
        📞 Phone: <a href="tel:01234567890" style={link}>01234 567890</a>
      </Text>

      <Text style={text}>
        Thank you for choosing JTH Horseboxes. We can't wait to see you enjoying your new horsebox!
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

const orderBox = {
  backgroundColor: '#eff6ff',
  border: '2px solid #3b82f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
}

const orderLabel = {
  color: '#1e40af',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '8px 0 4px',
}

const orderValue = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const infoBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const infoHeading = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '22px',
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

export default OrderConfirmationEmail
