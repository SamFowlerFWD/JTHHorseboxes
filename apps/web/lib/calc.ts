import type { MoneyPence, PricingConfig, Option, Package } from './pricing'

export type SelectedOption = {
  id: string
  quantity?: number
  perFoot?: number
}

export type Input = {
  modelId: string
  chassisCostPence: MoneyPence
  depositPence?: MoneyPence
  selectedOptions: SelectedOption[]
  pioneerEnabled?: boolean
  pioneerChassisFeet?: number
}

export type CalcBreakdown = {
  basePricePence: MoneyPence
  optionsTotalPence: MoneyPence
  buildSubtotalPence: MoneyPence
  totalExVatPence: MoneyPence
  vatPence: MoneyPence
  totalIncVatPence: MoneyPence
  paymentSchedule: {
    depositPence: MoneyPence
    firstPaymentPence: MoneyPence
    secondPaymentPence: MoneyPence
    finalPaymentPence: MoneyPence
  }
}

function toPence(amount: number): number { return Math.round(amount) }

function getOptionUnitPrice(option: Option, quantity?: number, perFoot?: number): number {
  switch (option.type) {
    case 'boolean':
      return option.pricePerUnitPence
    case 'quantity':
      return (option.pricePerUnitPence) * (quantity ?? 0)
    case 'per_foot':
      return (option.pricePerUnitPence) * (perFoot ?? 0)
  }
}

function applyPioneerInclusions(cfg: PricingConfig, modelId: string, pioneer: Package, selections: SelectedOption[]): SelectedOption[] {
  const included = pioneer.includes.map(i => ({ id: i.option, quantity: i.quantity }))
  const merged = new Map<string, SelectedOption>()
  ;[...selections, ...included].forEach(s => {
    const prev = merged.get(s.id)
    if (!prev) { merged.set(s.id, { ...s }); return }
    merged.set(s.id, { id: s.id, quantity: (prev.quantity ?? 0) + (s.quantity ?? 0) })
  })
  // add chassis extension parameter if provided
  const feetParam = pioneer.parameters?.chassis_extension_feet
  if (feetParam) {
    const feet = feetParam.defaultFor?.[modelId]
    if (feet && feetParam.choices.includes(feet)) {
      merged.set('rear-chassis-extension', { id: 'rear-chassis-extension', perFoot: feet })
    }
  }
  return Array.from(merged.values())
}

export function calculate(config: PricingConfig, input: Input): CalcBreakdown {
  const model = config.models.find(m => m.id === input.modelId)
  if (!model || model.basePricePence == null) throw new Error('Model unavailable')
  const deposit = input.depositPence ?? config.depositDefaultPence
  const pioneer = config.packages.find(p => p.id === 'pioneer' && p.appliesTo.includes(input.modelId))

  let selections = input.selectedOptions
  let optionsTotal = 0

  if (input.pioneerEnabled && pioneer) {
    selections = applyPioneerInclusions(config, input.modelId, pioneer, selections)
    optionsTotal += pioneer.pricePence
    if (input.pioneerChassisFeet && pioneer.parameters?.chassis_extension_feet?.choices.includes(input.pioneerChassisFeet)) {
      selections = selections.filter(s => s.id !== 'rear-chassis-extension')
      selections.push({ id: 'rear-chassis-extension', perFoot: input.pioneerChassisFeet })
    }
  }

  for (const sel of selections) {
    const opt = config.options.find(o => o.id === sel.id)
    if (!opt) continue
    // enforce dependency: if fridge selected, ensure leisure battery is counted
    if (opt.id === 'fridge-freezer') {
      const hasBattery = selections.some(s => s.id === 'leisure-battery-electrics')
      if (!hasBattery) {
        selections.push({ id: 'leisure-battery-electrics' })
      }
    }
  }

  // Recompute with dependencies ensured
  for (const sel of selections) {
    const opt = config.options.find(o => o.id === sel.id)
    if (!opt) continue
    optionsTotal += getOptionUnitPrice(opt, sel.quantity, sel.perFoot)
  }

  const base = model.basePricePence
  const buildSubtotal = base + optionsTotal
  const totalExVat = input.chassisCostPence + buildSubtotal
  const vat = Math.round(totalExVat * config.vatRate)
  const totalIncVat = totalExVat + vat

  const chassisWithVat = Math.round(input.chassisCostPence * (1 + config.vatRate))
  const buildWithVat = Math.round(buildSubtotal * (1 + config.vatRate))
  const balance = buildWithVat - deposit
  const perThird = Math.round(balance / 3)

  return {
    basePricePence: base,
    optionsTotalPence: optionsTotal,
    buildSubtotalPence: buildSubtotal,
    totalExVatPence: totalExVat,
    vatPence: vat,
    totalIncVatPence: totalIncVat,
    paymentSchedule: {
      depositPence: deposit,
      firstPaymentPence: perThird + chassisWithVat,
      secondPaymentPence: perThird,
      finalPaymentPence: perThird
    }
  }
}
