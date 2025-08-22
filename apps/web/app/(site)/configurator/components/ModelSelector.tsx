'use client'

import { MODELS } from '@/lib/configurator/types'
import { formatPrice } from '@/lib/configurator/calculations'
import { Check, Truck, Weight, Users, Gauge } from 'lucide-react'
import Image from 'next/image'

interface ModelSelectorProps {
  onSelectModel: (modelId: string) => void
  selectedModelId: string | null
}

export default function ModelSelector({ onSelectModel, selectedModelId }: ModelSelectorProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {MODELS.map((model) => {
        const isSelected = selectedModelId === model.id
        
        return (
          <div
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
              isSelected ? 'ring-4 ring-blue-600 ring-offset-2' : ''
            }`}
          >
            {/* Selected Badge */}
            {isSelected && (
              <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white rounded-full p-2">
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* Model Image */}
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <Truck className="w-24 h-24 text-slate-400" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {model.weight_class}
                </span>
              </div>
            </div>

            {/* Model Details */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {model.name}
              </h3>
              <p className="text-slate-600 mb-4">
                {model.description}
              </p>

              {/* Key Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Weight className="w-4 h-4 text-blue-600" />
                  <span>Gross Weight: {model.weight_class}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    {model.weight_class === '3.5t' ? '2 Horses' : 
                     model.weight_class === '4.5t' ? '2-3 Horses' : 
                     '3-4 Horses'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span>
                    {model.weight_class === '3.5t' ? 'B Licence Compatible' : 
                     model.weight_class === '4.5t' ? 'C1 Licence Required' : 
                     'C Licence Required'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Starting from</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPrice(model.base_price * 100)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  + VAT
                </p>
              </div>

              {/* Select Button */}
              <button
                className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
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