'use client'

import { useConfiguratorStore } from '@/lib/configurator/store'
import { PoundSterling, Info, Calculator } from 'lucide-react'

const PRESET_DEPOSITS = [2500, 5000, 7500, 10000]

export default function DepositStep() {
  const {
    deposit,
    setDeposit,
    basePrice,
    selectedModel
  } = useConfiguratorStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const calculatePercentage = () => {
    if (!selectedModel || basePrice === 0) return 0
    return ((deposit / basePrice) * 100).toFixed(1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Set Your Deposit</h2>
        
        {/* Current Deposit Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Current Deposit Amount</p>
              <p className="text-3xl font-bold text-blue-700">{formatPrice(deposit)}</p>
              {selectedModel && (
                <p className="text-sm text-slate-500 mt-1">
                  {calculatePercentage()}% of base price
                </p>
              )}
            </div>
            <Calculator className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        {/* Preset Amounts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Quick Select Amount
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_DEPOSITS.map((amount) => (
              <button
                key={amount}
                onClick={() => setDeposit(amount)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  deposit === amount
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label htmlFor="custom-deposit" className="block text-sm font-medium text-slate-700 mb-2">
            Or Enter Custom Amount
          </label>
          <div className="relative">
            <input
              type="number"
              id="custom-deposit"
              value={deposit || ''}
              onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
              placeholder="Enter deposit amount"
              className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              min="1000"
              step="500"
            />
            <PoundSterling className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Minimum deposit: £1,000 | Recommended: £5,000
          </p>
        </div>

        {/* Payment Schedule Preview */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">How Your Deposit Works:</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Your deposit secures your build slot and is deducted from the total</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>The remaining balance is split into three equal payments</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>First payment includes the chassis cost (paid on order)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Second payment due at build commencement</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Final payment due on completion</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Deposit Protection</p>
            <p>
              Your deposit is fully refundable if we cannot accommodate your build requirements. 
              All deposits are held in a client account and protected under UK consumer law.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}