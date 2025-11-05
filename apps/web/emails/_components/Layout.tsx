import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
  Hr,
} from '@react-email/components'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://jtaylorhorseboxes.com/logo.png"
              alt="JTH Horseboxes"
              width="180"
              height="60"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              <strong>J Taylor Horseboxes</strong>
              <br />
              Unit 5, Industrial Estate
              <br />
              Anytown, UK AT1 2BC
              <br />
              <br />
              Phone: 01234 567890
              <br />
              Email: info@jtaylorhorseboxes.com
              <br />
              Web: www.jtaylorhorseboxes.com
            </Text>
            <Text style={footerSmall}>
              This email was sent to you because you requested information from JTH Horseboxes.
              <br />
              If you did not make this request, please contact us immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#1e3a8a',
}

const content = {
  padding: '0 48px',
}

const footer = {
  padding: '0 48px',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

const footerSmall = {
  color: '#aab7c4',
  fontSize: '10px',
  lineHeight: '14px',
  marginTop: '16px',
}
