// Price Calculation Utilities for Configurator

import type { SelectedOption, ConfigurationData } from './types'

/**
 * Format a price in pounds with proper formatting
 */
export function formatPrice(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(pounds)
}

/**
 * Format a price without currency symbol
 */
export function formatPriceNumber(pence: number): string {
  const pounds = pence / 100
  return pounds.toLocaleString('en-GB')
}

/**
 * Calculate VAT amount from a base price
 */
export function calculateVAT(pricePence: number, vatRate: number = 20): number {
  return Math.round(pricePence * (vatRate / 100))
}

/**
 * Calculate total with VAT
 */
export function calculateTotalWithVAT(pricePence: number, vatRate: number = 20): number {
  const vat = calculateVAT(pricePence, vatRate)
  return pricePence + vat
}

/**
 * Calculate monthly finance payment
 */
export function calculateMonthlyPayment(
  totalPence: number,
  depositPercent: number = 10,
  termMonths: number = 60,
  apr: number = 7.9
): number {
  const principal = totalPence * (1 - depositPercent / 100)
  const monthlyRate = apr / 100 / 12
  
  if (monthlyRate === 0) {
    return principal / termMonths
  }
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  
  return Math.round(payment)
}

/**
 * Calculate deposit amount
 */
export function calculateDeposit(totalPence: number, depositPercent: number = 10): number {
  return Math.round(totalPence * (depositPercent / 100))
}

/**
 * Calculate total options price
 */
export function calculateOptionsTotal(options: SelectedOption[]): number {
  return options.reduce((total, option) => total + option.price, 0)
}

/**
 * Calculate configuration totals
 */
export function calculateConfigurationTotals(
  basePricePence: number,
  options: SelectedOption[],
  vatRate: number = 20
): {
  subtotal: number
  optionsTotal: number
  vatAmount: number
  total: number
} {
  const optionsTotal = calculateOptionsTotal(options)
  const subtotal = basePricePence + optionsTotal
  const vatAmount = calculateVAT(subtotal, vatRate)
  const total = subtotal + vatAmount
  
  return {
    subtotal,
    optionsTotal,
    vatAmount,
    total
  }
}

/**
 * Group options by category
 */
export function groupOptionsByCategory(options: SelectedOption[]): Record<string, SelectedOption[]> {
  return options.reduce((groups, option) => {
    const category = option.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(option)
    return groups
  }, {} as Record<string, SelectedOption[]>)
}

/**
 * Generate a quote reference number
 */
export function generateQuoteReference(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `JTH-${year}${month}${day}-${random}`
}

/**
 * Calculate delivery date estimate (weeks from now)
 */
export function calculateDeliveryDate(weeksFromNow: number = 10): string {
  const date = new Date()
  date.setDate(date.getDate() + weeksFromNow * 7)
  
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Validate configuration completeness
 */
export function validateConfiguration(config: ConfigurationData | null): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!config) {
    errors.push('No configuration data')
    return { isValid: false, errors }
  }
  
  if (!config.model) {
    errors.push('No model selected')
  }
  
  if (config.base_price <= 0) {
    errors.push('Invalid base price')
  }
  
  if (config.total_inc_vat <= 0) {
    errors.push('Invalid total price')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format configuration for display
 */
export function formatConfigurationSummary(config: ConfigurationData): string {
  const lines: string[] = []
  
  lines.push(`Model: ${config.model_name}`)
  lines.push(`Base Price: ${formatPrice(config.base_price)}`)
  
  if (config.selected_options.length > 0) {
    lines.push('')
    lines.push('Selected Options:')
    
    const grouped = groupOptionsByCategory(config.selected_options)
    
    Object.entries(grouped).forEach(([category, options]) => {
      lines.push(`  ${category}:`)
      options.forEach(option => {
        lines.push(`    - ${option.name}: ${formatPrice(option.price)}`)
      })
    })
  }
  
  lines.push('')
  lines.push(`Subtotal: ${formatPrice(config.total_ex_vat)}`)
  lines.push(`VAT (20%): ${formatPrice(config.vat_amount)}`)
  lines.push(`Total: ${formatPrice(config.total_inc_vat)}`)
  
  return lines.join('\n')
}

/**
 * Calculate savings for bulk options or packages
 */
export function calculatePackageSavings(
  individualPrices: number[],
  packagePrice: number
): {
  savings: number
  savingsPercent: number
} {
  const individualTotal = individualPrices.reduce((sum, price) => sum + price, 0)
  const savings = individualTotal - packagePrice
  const savingsPercent = (savings / individualTotal) * 100
  
  return {
    savings: Math.max(0, savings),
    savingsPercent: Math.max(0, savingsPercent)
  }
}