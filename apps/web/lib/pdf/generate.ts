import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePDF } from './QuotePDF'
import type { CalcBreakdown, SelectedOption } from '@/lib/calc'
import type { PricingConfig } from '@/lib/pricing'

interface QuoteData {
  quoteId: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  modelName: string
  calculation: CalcBreakdown
  selectedOptions: SelectedOption[]
  pricingConfig: PricingConfig
  createdAt: string
}

/**
 * Generate a PDF buffer for a quote
 */
export async function generateQuotePDF(quoteData: QuoteData): Promise<Buffer> {
  const {
    quoteId,
    customerInfo,
    modelName,
    calculation,
    selectedOptions,
    pricingConfig,
    createdAt,
  } = quoteData

  // Format date
  const quoteDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Convert prices from pence to pounds
  const modelBasePrice = calculation.basePricePence / 100
  const subtotal = calculation.buildSubtotalPence / 100
  const vat = calculation.vatPence / 100
  const total = calculation.totalIncVatPence / 100
  const deposit = calculation.paymentSchedule.depositPence / 100
  const buildWithVat = Math.round(calculation.buildSubtotalPence * (1 + pricingConfig.vatRate)) / 100
  const balanceRemaining = buildWithVat - deposit

  // Format options with names from config
  const options = selectedOptions.map((selectedOption) => {
    const optionConfig = pricingConfig.options.find(o => o.id === selectedOption.id)
    const optionName = optionConfig?.name || selectedOption.id

    // Calculate option price
    let optionPrice = 0
    if (optionConfig) {
      if (optionConfig.type === 'boolean') {
        optionPrice = optionConfig.pricePerUnitPence
      } else if (optionConfig.type === 'quantity' && selectedOption.quantity) {
        optionPrice = optionConfig.pricePerUnitPence * selectedOption.quantity
      } else if (optionConfig.type === 'per_foot' && selectedOption.perFoot) {
        optionPrice = optionConfig.pricePerUnitPence * selectedOption.perFoot
      }
    }

    return {
      name: optionName,
      price: optionPrice / 100,
      quantity: selectedOption.quantity || 1,
    }
  })

  // Build payment schedule from CalcBreakdown
  const paymentSchedule = []

  if (deposit > 0) {
    paymentSchedule.push({
      description: 'Deposit',
      amount: deposit,
      dueDate: 'On Order Confirmation',
    })
  }

  const firstPayment = calculation.paymentSchedule.firstPaymentPence / 100
  const secondPayment = calculation.paymentSchedule.secondPaymentPence / 100
  const finalPayment = calculation.paymentSchedule.finalPaymentPence / 100

  if (firstPayment > 0) {
    paymentSchedule.push({
      description: '1st Installment',
      amount: firstPayment,
      dueDate: 'Month 4',
    })
  }

  if (secondPayment > 0) {
    paymentSchedule.push({
      description: '2nd Installment',
      amount: secondPayment,
      dueDate: 'Month 8',
    })
  }

  if (finalPayment > 0) {
    paymentSchedule.push({
      description: 'Final Payment',
      amount: finalPayment,
      dueDate: 'On Completion',
    })
  }

  // Create PDF document
  const pdfDocument = QuotePDF({
    quoteId,
    quoteDate,
    customerName: customerInfo?.name || 'Valued Customer',
    customerEmail: customerInfo?.email || '',
    customerPhone: customerInfo?.phone,
    modelName,
    modelBasePrice,
    options,
    subtotal,
    vat,
    total,
    deposit,
    balanceRemaining,
    paymentSchedule,
    notes: 'This quote has been automatically generated based on your configuration. Final specifications and pricing will be confirmed before production begins.',
  })

  // Render to buffer
  const buffer = await renderToBuffer(pdfDocument)
  return buffer
}

/**
 * Generate filename for quote PDF
 */
export function getQuotePDFFilename(quoteId: string): string {
  return `JTH-Quote-${quoteId}.pdf`
}
