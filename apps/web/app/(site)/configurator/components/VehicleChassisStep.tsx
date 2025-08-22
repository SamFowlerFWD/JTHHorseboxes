'use client'

import { useConfiguratorStore } from '@/lib/configurator/store'
import { MODELS } from '@/lib/configurator/types'
import { Truck, Palette, PoundSterling, Check } from 'lucide-react'
import Image from 'next/image'

export default function VehicleChassisStep() {
  const {
    selectedModel,
    setModel,
    chassisCost,
    setChassisCost,
    color,
    setColor
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
    <div className="max-w-4xl mx-auto">
      {/* Model Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Select Your Model</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setModel(model)}
              className={`relative p-6 rounded-lg border-2 transition-all ${
                selectedModel?.id === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              {selectedModel?.id === model.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-8 h-8 text-slate-600" />
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-1">{model.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{model.description}</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(model.base_price)}</p>
                <p className="text-xs text-slate-500 mt-1">Base Price (ex VAT)</p>
              </div>
            </button>
          ))}
        </div>

        {/* Model Comparison */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Model Comparison:</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="font-medium">Professional 35:</span>
              <span>Premium build quality, full luxury interior, advanced features</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">Principle 35:</span>
              <span>Excellent value, essential features, quality construction</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">Progeny 35:</span>
              <span>Top-of-the-line, maximum space, all premium features included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chassis Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Chassis Details</h2>
        
        <div className="space-y-6">
          {/* Chassis Cost */}
          <div>
            <label htmlFor="chassis-cost" className="block text-sm font-medium text-slate-700 mb-2">
              Chassis Cost (ex VAT) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="chassis-cost"
                value={chassisCost || ''}
                onChange={(e) => setChassisCost(parseFloat(e.target.value) || 0)}
                placeholder="Enter chassis cost"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                min="0"
                step="100"
              />
              <PoundSterling className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Enter the cost of your chosen chassis excluding VAT. Typical range: £15,000 - £35,000
            </p>
          </div>

          {/* Color Specification */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-2">
              Color Specification
            </label>
            <div className="relative">
              <input
                type="text"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Midnight Blue, Silver Metallic"
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Palette className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Specify your preferred color or leave blank for standard options
            </p>
          </div>
        </div>

        {/* Chassis Info */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Information:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• The chassis cost is separate from the horsebox build cost</li>
            <li>• We can source chassis for you or work with your supplied chassis</li>
            <li>• VAT will be calculated automatically at 20%</li>
            <li>• Chassis payment is due with the first build payment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}