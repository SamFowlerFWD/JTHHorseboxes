'use client'

import { useConfiguratorStore } from '@/lib/configurator/store'
import { 
  formatPrice, 
  calculateMonthlyPayment, 
  calculateDeposit,
  groupOptionsByCategory 
} from '@/lib/configurator/calculations'
import { 
  Calculator, Download, Share2, Save, 
  ChevronDown, ChevronUp, CreditCard,
  Truck, Check, X
} from 'lucide-react'
import { useState } from 'react'

interface PriceSummaryProps {
  showActions?: boolean
  detailed?: boolean
}

export default function PriceSummary({ showActions = true, detailed = false }: PriceSummaryProps) {
  const {
    selectedModel,
    selectedOptions,
    basePrice,
    totalExVat,
    vatAmount,
    totalIncVat,
    removeOption
  } = useConfiguratorStore()

  const [showFinance, setShowFinance] = useState(false)
  const [depositPercent, setDepositPercent] = useState(10)
  const [termMonths, setTermMonths] = useState(60)

  if (!selectedModel) {
    return null
  }

  const monthlyPayment = calculateMonthlyPayment(totalIncVat, depositPercent, termMonths)
  const depositAmount = calculateDeposit(totalIncVat, depositPercent)
  const groupedOptions = groupOptionsByCategory(selectedOptions)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Your Configuration</h3>
          <Truck className="w-6 h-6 opacity-80" />
        </div>
        <p className="text-blue-100">{selectedModel.name}</p>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-4">
        {/* Base Price */}
        <div className="flex justify-between items-center">
          <span className="text-slate-600">Base Price</span>
          <span className="font-medium text-slate-900">{formatPrice(basePrice)}</span>
        </div>

        {/* Selected Options */}
        {detailed && selectedOptions.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-900 mb-3">Selected Options</h4>
            <div className="space-y-3">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category}>
                  <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">
                    {category}
                  </p>
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">{option.name}</span>
                        {showActions && (
                          <button
                            onClick={() => removeOption(option.id)}
                            className="p-0.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {option.price === 0 ? 'Included' : `+${formatPrice(option.price)}`}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {!detailed && selectedOptions.length > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">
              Options ({selectedOptions.length} selected)
            </span>
            <span className="font-medium text-slate-900">
              +{formatPrice(selectedOptions.reduce((sum, opt) => sum + opt.price, 0))}
            </span>
          </div>
        )}

        {/* Subtotal */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium text-slate-900">{formatPrice(totalExVat)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-600">VAT (20%)</span>
            <span className="font-medium text-slate-900">{formatPrice(vatAmount)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-900">Total Price</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(totalIncVat)}</span>
          </div>
        </div>

        {/* Finance Calculator */}
        <div className="border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowFinance(!showFinance)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <span className="font-medium text-slate-700">Finance Calculator</span>
            </div>
            {showFinance ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showFinance && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deposit ({depositPercent}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-slate-600 mt-1">
                  {formatPrice(depositAmount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Term ({termMonths} months)
                </label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                  <option value="72">72 months</option>
                  <option value="84">84 months</option>
                </select>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Estimated Monthly Payment</p>
                <p className="text-2xl font-bold text-slate-900">{formatPrice(monthlyPayment)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Based on 7.9% APR (representative)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Save className="w-5 h-5" />
              Save Configuration
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Estimate */}
      {detailed && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-600" />
            <span>Estimated delivery: 10-12 weeks from order</span>
          </div>
        </div>
      )}
    </div>
  )
}