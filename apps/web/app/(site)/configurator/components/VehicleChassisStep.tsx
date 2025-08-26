'use client'

import { useState } from 'react'
import { useConfiguratorStore } from '@/lib/configurator/store'
import { MODELS, type Model } from '@/lib/configurator/types'
import { Truck, Palette, PoundSterling, Check, Badge, Phone, Mail, Star, Package, Crown } from 'lucide-react'
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

  const [selectedRange, setSelectedRange] = useState<string | null>(selectedModel?.range || null)
  const [selectedTonnage, setSelectedTonnage] = useState<string | null>(selectedModel?.tonnage || null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const ranges = [
    {
      id: 'JTH',
      name: 'JTH Range',
      description: 'Fully configurable horseboxes with complete customization options',
      icon: Star,
      availability: 'configurable',
      badge: 'Fully Configurable',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      id: 'AEOS',
      name: 'AEOS Range',
      description: 'Pre-built packages with limited customization for faster delivery',
      icon: Package,
      availability: 'pre-built',
      badge: 'Pre-Built Package',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'PREMIUM',
      name: 'Premium Range',
      description: 'Zenos & Helios premium models - contact for custom quotes',
      icon: Crown,
      availability: 'contact-only',
      badge: 'Contact for Pricing',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ]

  const getAvailableTonnages = (range: string) => {
    const rangeMap: { [key: string]: string[] } = {
      'JTH': ['3.5T', '4.5T'],
      'AEOS': ['4.5T'],
      'PREMIUM': ['7.2T', '7.5T']
    }
    return rangeMap[range] || []
  }

  const getModelsForSelection = (range: string, tonnage: string) => {
    if (range === 'PREMIUM') {
      // Map premium range to actual model ranges
      const premiumMap: { [key: string]: string } = {
        '7.2T': 'ZENOS',
        '7.5T': 'HELIOS'
      }
      return MODELS.filter(model => model.range === premiumMap[tonnage] && model.tonnage === tonnage)
    }
    return MODELS.filter(model => model.range === range && model.tonnage === tonnage)
  }

  const handleRangeSelect = (range: string) => {
    setSelectedRange(range)
    setSelectedTonnage(null)
    setModel(null as any) // Reset model selection
  }

  const handleTonnageSelect = (tonnage: string) => {
    setSelectedTonnage(tonnage)
    setModel(null as any) // Reset model selection
  }

  const renderModelBadge = (model: Model) => {
    if (model.badge) {
      const badgeColors = {
        'Pre-Built Package': 'bg-blue-100 text-blue-800',
        'Premium Model': 'bg-purple-100 text-purple-800'
      }
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColors[model.badge as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800'}`}>
          <Badge className="w-3 h-3" />
          {model.badge}
        </div>
      )
    }
    return null
  }

  const renderPriceDisplay = (model: Model) => {
    if (model.base_price === null) {
      return (
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700 mb-1">Contact for Pricing</p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4" />
            <span>Custom Quote Required</span>
          </div>
        </div>
      )
    }
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-blue-700">{formatPrice(model.base_price)}</p>
        <p className="text-xs text-slate-500 mt-1">Base Price (ex VAT)</p>
        {model.pioneer_package_eligible && (
          <p className="text-xs text-green-600 mt-1">Pioneer Package Available</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step 1: Range Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Step 1: Choose Your Range</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {ranges.map((range) => {
            const Icon = range.icon
            return (
              <button
                key={range.id}
                onClick={() => handleRangeSelect(range.id)}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedRange === range.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {selectedRange === range.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-8 h-8 text-slate-600" />
                  </div>
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${range.badgeColor}`}>
                    <Badge className="w-3 h-3" />
                    {range.badge}
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2">{range.name}</h3>
                  <p className="text-sm text-slate-600">{range.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Tonnage Selection */}
      {selectedRange && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Step 2: Choose Tonnage</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {getAvailableTonnages(selectedRange).map((tonnage) => (
              <button
                key={tonnage}
                onClick={() => handleTonnageSelect(tonnage)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTonnage === tonnage
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{tonnage}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {tonnage === '3.5T' && 'B License'}
                    {tonnage === '4.5T' && 'C1 License'}
                    {tonnage === '7.2T' && 'C License'}
                    {tonnage === '7.5T' && 'C License'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Model Selection */}
      {selectedRange && selectedTonnage && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Step 3: Select Your Model</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getModelsForSelection(selectedRange, selectedTonnage).map((model) => (
              <button
                key={model.id}
                onClick={() => setModel(model)}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedModel?.id === model.id
                    ? 'border-blue-600 bg-blue-50'
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
                  
                  {renderModelBadge(model)}
                  
                  <h3 className="font-semibold text-slate-900 mb-2 mt-3">{model.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{model.description}</p>
                  
                  {renderPriceDisplay(model)}
                  
                  {/* Features */}
                  {model.features && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="space-y-1 text-xs text-slate-600">
                        {model.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx}>• {feature}</div>
                        ))}
                        {model.features.length > 3 && (
                          <div className="text-slate-500">+ {model.features.length - 3} more features</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Contact Information for Premium Models */}
          {selectedRange === 'PREMIUM' && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Premium Model Information:</h4>
              <div className="text-sm text-amber-700 space-y-2">
                <p>• Premium models require a custom consultation and quote</p>
                <p>• Our team will work with you to create a bespoke specification</p>
                <p>• Contact us to discuss your requirements and receive detailed pricing</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-amber-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Call: +44 1234 567890</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Email: sales@jtaylorhorseboxes.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AEOS Limited Options Info */}
          {selectedRange === 'AEOS' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Pre-Built Package Information:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Pre-configured specification with limited customization options</p>
                <p>• Faster delivery times compared to fully custom builds</p>
                <p>• Contact us for current availability and pricing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chassis Details - Only show for configurable models */}
      {selectedModel && selectedModel.availability === 'configurable' && (
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
                  className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                  required
                  min="0"
                  step="100"
                />
                <PoundSterling className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Enter the cost of your chosen chassis excluding VAT. 
                {selectedModel.tonnage === '3.5T' && ' Typical range: £15,000 - £25,000'}
                {selectedModel.tonnage === '4.5T' && ' Typical range: £20,000 - £35,000'}
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
                  className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
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
      )}

      {/* Pioneer Package Information for 4.5T models */}
      {selectedModel && selectedModel.pioneer_package_eligible && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Pioneer Package Available</h2>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Upgrade to Pioneer Package - £10,800</h4>
            <div className="text-sm text-green-700 space-y-2">
              <p className="font-medium">Complete package includes:</p>
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <div>• L4 Surcharge</div>
                <div>• Tack Locker</div>
                <div>• 4.5T Uprating</div>
                <div>• Cabinets</div>
                <div>• Seating</div>
                <div>• Sink/Hob</div>
                <div>• Water System</div>
                <div>• Fridge</div>
                <div>• Windows (2x)</div>
                <div>• Blinds (2x)</div>
                <div>• Wood Internals</div>
                <div>• Leisure Battery</div>
                <div>• 240v Hookup</div>
              </div>
              <p className="mt-3 font-medium">
                You'll have the option to add the Pioneer Package in the next step, including your choice of horse area extension (1ft or 3ft).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact prompt for non-configurable models */}
      {selectedModel && selectedModel.availability !== 'configurable' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Next Steps</h2>
          <div className={`p-4 rounded-lg border ${
            selectedModel.availability === 'pre-built' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <p className={`text-sm mb-4 ${
              selectedModel.availability === 'pre-built' 
                ? 'text-blue-700' 
                : 'text-purple-700'
            }`}>
              {selectedModel.availability === 'pre-built' 
                ? 'This is a pre-built package model. Our sales team will contact you to discuss availability, pricing, and the limited customization options available.'
                : 'This premium model requires a custom consultation. Our specialists will work with you to create a detailed specification and provide comprehensive pricing.'
              }
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="font-medium">+44 1234 567890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">sales@jtaylorhorseboxes.com</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}