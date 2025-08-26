'use client'

import { MODELS, type Model } from '@/lib/configurator/types'
import { formatPrice } from '@/lib/configurator/calculations'
import { Check, Truck, Weight, Users, Gauge, Badge, Phone } from 'lucide-react'
import Image from 'next/image'

interface ModelSelectorProps {
  onSelectModel: (modelId: string) => void
  selectedModelId: string | null
  filterRange?: string
  filterTonnage?: string
}

export default function ModelSelector({ 
  onSelectModel, 
  selectedModelId,
  filterRange,
  filterTonnage
}: ModelSelectorProps) {
  
  // Filter models based on range and tonnage if provided
  const filteredModels = MODELS.filter(model => {
    if (filterRange && filterRange !== 'PREMIUM') {
      return model.range === filterRange && 
             (!filterTonnage || model.tonnage === filterTonnage)
    }
    if (filterRange === 'PREMIUM') {
      return (model.range === 'ZENOS' || model.range === 'HELIOS') &&
             (!filterTonnage || model.tonnage === filterTonnage)
    }
    return !filterTonnage || model.tonnage === filterTonnage
  })

  const renderModelBadge = (model: Model) => {
    if (model.badge) {
      const badgeColors = {
        'Pre-Built Package': 'bg-blue-100 text-blue-800',
        'Premium Model': 'bg-purple-100 text-purple-800'
      }
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${badgeColors[model.badge as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800'}`}>
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
        <div>
          <p className="text-lg font-bold text-slate-700 mb-1">Contact for Pricing</p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone className="w-4 h-4" />
            <span>Custom Quote Required</span>
          </div>
        </div>
      )
    }
    return (
      <div>
        <p className="text-sm text-slate-600 mb-1">Starting from</p>
        <p className="text-2xl font-bold text-slate-900">
          {formatPrice(model.base_price * 100)}
        </p>
        <p className="text-xs text-slate-500 mt-1">+ VAT</p>
        {model.pioneer_package_eligible && (
          <p className="text-xs text-green-600 mt-1">Pioneer Package Available</p>
        )}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredModels.map((model) => {
        const isSelected = selectedModelId === model.id
        
        return (
          <div
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              isSelected ? 'ring-4 ring-blue-700 ring-offset-2' : ''
            }`}
          >
            {/* Selected Badge */}
            {isSelected && (
              <div className="absolute top-4 right-4 z-10 bg-blue-700 text-white rounded-full p-2">
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* Model Image */}
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <Truck className="w-24 h-24 text-slate-400" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {model.weight_class}
                </span>
              </div>
            </div>

            {/* Model Details */}
            <div className="p-6">
              {renderModelBadge(model)}
              
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {model.name}
              </h3>
              <p className="text-slate-600 mb-4">
                {model.description}
              </p>

              {/* Key Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Weight className="w-4 h-4 text-blue-700" />
                  <span>Gross Weight: {model.weight_class}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-blue-700" />
                  <span>
                    {model.weight_class === '3.5t' ? '2 Horses' : 
                     model.weight_class === '4.5t' ? '2-3 Horses' : 
                     model.weight_class === '7.2t' ? '3-4 Horses' :
                     '4+ Horses'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Gauge className="w-4 h-4 text-blue-700" />
                  <span>
                    {model.weight_class === '3.5t' ? 'B Licence Compatible' : 
                     model.weight_class === '4.5t' ? 'C1 Licence Required' : 
                     'C Licence Required'}
                  </span>
                </div>
              </div>

              {/* Features List */}
              {model.features && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-600 space-y-1">
                    {model.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx}>• {feature}</div>
                    ))}
                    {model.features.length > 3 && (
                      <div className="text-slate-500">+ {model.features.length - 3} more features</div>
                    )}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="pt-4 border-t border-slate-200 mb-6">
                {renderPriceDisplay(model)}
              </div>

              {/* Select Button */}
              <button
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected ? 'Selected' : 'Select This Model'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}