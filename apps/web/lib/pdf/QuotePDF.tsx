import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (optional - using built-in fonts for now)
// Font.register({ family: 'Inter', src: '/fonts/Inter.ttf' })

interface QuotePDFProps {
  quoteId: string
  quoteDate: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  modelName: string
  modelBasePrice: number
  options: Array<{
    name: string
    price: number
    quantity?: number
  }>
  subtotal: number
  vat: number
  total: number
  deposit?: number
  balanceRemaining?: number
  paymentSchedule?: Array<{
    description: string
    amount: number
    dueDate?: string
  }>
  notes?: string
}

export function QuotePDF({
  quoteId,
  quoteDate,
  customerName,
  customerEmail,
  customerPhone,
  modelName,
  modelBasePrice,
  options,
  subtotal,
  vat,
  total,
  deposit,
  balanceRemaining,
  paymentSchedule,
  notes,
}: QuotePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>J Taylor Horseboxes</Text>
            <Text style={styles.companyTagline}>Premium Horsebox Manufacturing</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteTitle}>QUOTATION</Text>
            <Text style={styles.quoteId}>#{quoteId}</Text>
            <Text style={styles.quoteDate}>{quoteDate}</Text>
          </View>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>From:</Text>
          <Text style={styles.text}>J Taylor Horseboxes</Text>
          <Text style={styles.text}>Unit 5, Industrial Estate</Text>
          <Text style={styles.text}>Anytown, UK AT1 2BC</Text>
          <Text style={styles.text}>Phone: 01234 567890</Text>
          <Text style={styles.text}>Email: info@jtaylorhorseboxes.com</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>To:</Text>
          <Text style={styles.text}>{customerName}</Text>
          <Text style={styles.text}>{customerEmail}</Text>
          {customerPhone && <Text style={styles.text}>{customerPhone}</Text>}
        </View>

        {/* Quote Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quotation Details</Text>

          {/* Table Header */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 3 }]}>Description</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Price</Text>
            </View>

            {/* Model */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{modelName}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>1</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                £{modelBasePrice.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Options */}
            {options.map((option, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3, paddingLeft: 20 }]}>+ {option.name}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
                  {option.quantity || 1}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                  £{option.price.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}

            {/* Subtotal */}
            <View style={[styles.tableRow, styles.tableTotalRow]}>
              <Text style={[styles.tableCell, { flex: 4 }]}>Subtotal</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                £{subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* VAT */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 4 }]}>VAT (20%)</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                £{vat.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Total */}
            <View style={[styles.tableRow, styles.tableTotalRow, styles.grandTotal]}>
              <Text style={[styles.tableCell, styles.tableTotalText, { flex: 4 }]}>Total</Text>
              <Text style={[styles.tableCell, styles.tableTotalText, { flex: 1, textAlign: 'right' }]}>
                £{total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Schedule */}
        {paymentSchedule && paymentSchedule.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Schedule</Text>
            {paymentSchedule.map((payment, index) => (
              <View key={index} style={styles.paymentItem}>
                <Text style={styles.text}>{payment.description}</Text>
                <Text style={styles.text}>
                  £{payment.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  {payment.dueDate && ` - Due: ${payment.dueDate}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{notes}</Text>
          </View>
        )}

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.smallText}>
            • This quotation is valid for 30 days from the date of issue.
          </Text>
          <Text style={styles.smallText}>
            • A deposit of 20% is required to confirm your order.
          </Text>
          <Text style={styles.smallText}>
            • Build time is approximately 12-16 weeks from order confirmation.
          </Text>
          <Text style={styles.smallText}>
            • Final specifications may be adjusted during the build process with customer approval.
          </Text>
          <Text style={styles.smallText}>
            • All prices include VAT at the current rate.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for considering JTH Horseboxes. We look forward to building your dream horsebox!
          </Text>
          <Text style={styles.footerText}>
            For any questions, please contact us at info@jtaylorhorseboxes.com or call 01234 567890
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #1e3a8a',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  companyTagline: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  quoteId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  quoteDate: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  smallText: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.4,
    color: '#64748b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottom: '1 solid #cbd5e1',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableTotalRow: {
    backgroundColor: '#f8fafc',
    borderTop: '1 solid #cbd5e1',
  },
  grandTotal: {
    backgroundColor: '#eff6ff',
    borderTop: '2 solid #1e3a8a',
  },
  tableCell: {
    fontSize: 10,
  },
  tableTotalText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '1 solid #e2e8f0',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #e2e8f0',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
})

export default QuotePDF
