'use client'

import { useConfiguratorStore } from '@/lib/configurator/store'
import { Check, Calendar, CreditCard, Package, Truck, User, Mail, Phone } from 'lucide-react'

interface ReviewStepProps {
  onSubmit: () => void
  isSubmitting: boolean
}

export default function ReviewStep({ onSubmit, isSubmitting }: ReviewStepProps) {
  const {
    customerName,
    customerEmail,
    customerPhone,
    agentName,
    selectedModel,
    basePrice,
    chassisCost,
    deposit,
    color,
    pioneerPackage,
    pioneerHorseArea,
    selectedOptions,
    optionsTotal,
    buildSubtotal,
    totalExVat,
    vatAmount,
    totalIncVat,
    paymentSchedule
  } = useConfiguratorStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Customer Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-slate-600" />
          Customer Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Name:</span>
            <p className="font-medium text-slate-900">{customerName}</p>
          </div>
          <div>
            <span className="text-slate-600">Email:</span>
            <p className="font-medium text-slate-900">{customerEmail}</p>
          </div>
          <div>
            <span className="text-slate-600">Phone:</span>
            <p className="font-medium text-slate-900">{customerPhone}</p>
          </div>
          {agentName && (
            <div>
              <span className="text-slate-600">Sales Agent:</span>
              <p className="font-medium text-slate-900">{agentName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-600" />
          Vehicle Configuration
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600">Model:</span>
            <span className="font-medium text-slate-900">{selectedModel?.name}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600">Base Price:</span>
            <span className="font-medium text-slate-900">{formatPrice(basePrice)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-slate-600">Chassis Cost:</span>
            <span className="font-medium text-slate-900">{formatPrice(chassisCost)}</span>
          </div>
          {color && (
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-600">Color:</span>
              <span className="font-medium text-slate-900">{color}</span>
            </div>
          )}
        </div>
      </div>

      {/* Options Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-600" />
          Selected Options
        </h2>
        <div className="space-y-2">
          {pioneerPackage && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-blue-950">Pioneer Package</span>
                  {pioneerHorseArea && (
                    <span className="ml-2 text-sm text-blue-800">
                      ({pioneerHorseArea === '3ft' ? '3ft Full Extension' : '1ft Half Wall'})
                    </span>
                  )}
                </div>
                <span className="font-medium text-blue-950">{formatPrice(10800)}</span>
              </div>
            </div>
          )}
          
          {selectedOptions.map((option) => (
            <div key={option.id} className="flex justify-between items-center py-2">
              <div>
                <span className="text-slate-700">{option.name}</span>
                {option.quantity > 1 && (
                  <span className="ml-2 text-sm text-slate-500">x{option.quantity}</span>
                )}
              </div>
              <span className="text-slate-900">
                {formatPrice(option.price * option.quantity)}
              </span>
            </div>
          ))}
          
          {!pioneerPackage && selectedOptions.length === 0 && (
            <p className="text-slate-500 italic">No additional options selected</p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">Options Total:</span>
            <span className="font-semibold text-slate-900">{formatPrice(optionsTotal)}</span>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-600" />
          Pricing Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Build Subtotal:</span>
            <span className="text-slate-900">{formatPrice(buildSubtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Chassis Cost:</span>
            <span className="text-slate-900">{formatPrice(chassisCost)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-slate-600">Total (ex VAT):</span>
            <span className="font-medium text-slate-900">{formatPrice(totalExVat)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">VAT (20%):</span>
            <span className="text-slate-900">{formatPrice(vatAmount)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-lg font-semibold text-slate-900">Total (inc VAT):</span>
            <span className="text-2xl font-bold text-blue-700">{formatPrice(totalIncVat)}</span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-700" />
          Payment Schedule
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Deposit</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(paymentSchedule.deposit)}</p>
            <p className="text-xs text-slate-500 mt-1">Due on order</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">1st Payment</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(paymentSchedule.firstPayment)}</p>
            <p className="text-xs text-slate-500 mt-1">Includes chassis</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">2nd Payment</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(paymentSchedule.secondPayment)}</p>
            <p className="text-xs text-slate-500 mt-1">Build start</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Final Payment</p>
            <p className="text-xl font-bold text-slate-900">{formatPrice(paymentSchedule.finalPayment)}</p>
            <p className="text-xs text-slate-500 mt-1">On completion</p>
          </div>
        </div>
        
        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Payment Breakdown:</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Chassis with VAT: {formatPrice(paymentSchedule.chassisWithVat)}</li>
            <li>• Build with VAT: {formatPrice(paymentSchedule.buildWithVat)}</li>
            <li>• Balance after deposit: {formatPrice(paymentSchedule.buildBalanceMinusDeposit)}</li>
            <li>• Balance split into 3 equal payments</li>
          </ul>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Check className="w-6 h-6 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-950 mb-2">Ready to Submit</h3>
            <p className="text-sm text-blue-900 mb-4">
              Please review all details above. Once submitted, you will receive a formal quote 
              via email within 24 hours. Our team will contact you to discuss your requirements 
              and answer any questions.
            </p>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium transition-all ${
                isSubmitting
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}