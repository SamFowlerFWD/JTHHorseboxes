'use client'

import { useState, useEffect } from 'react'
import { useConfiguratorStore } from '@/lib/configurator/store'
import { OPTION_CATEGORIES, PIONEER_PACKAGE } from '@/lib/configurator/types'
import { Package, Plus, Minus, Check, X, Info, ChevronDown, ChevronUp } from 'lucide-react'
import PioneerPackageDialog from './PioneerPackageDialog'

export default function OptionsStep() {
  const {
    selectedModel,
    pioneerPackage,
    setPioneerPackage,
    pioneerHorseArea,
    selectedOptions,
    availableOptions,
    addOption,
    removeOption,
    updateOptionQuantity,
    activeCategory,
    setActiveCategory,
    isLoading,
    optionsTotal
  } = useConfiguratorStore()

  const [showPioneerDialog, setShowPioneerDialog] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['exterior'])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handlePioneerToggle = () => {
    if (!pioneerPackage) {
      // Show dialog for Professional/Principal models
      if (selectedModel?.name === 'Professional 35' || selectedModel?.name === 'Principal 35') {
        setShowPioneerDialog(true)
      } else if (selectedModel?.name === 'Progeny 35') {
        // Auto-select 3ft for Progeny
        setPioneerPackage(true, '3ft')
      }
    } else {
      setPioneerPackage(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const isOptionSelected = (optionId: string) => {
    return selectedOptions.some(opt => opt.id === optionId)
  }

  const getOptionQuantity = (optionId: string) => {
    const option = selectedOptions.find(opt => opt.id === optionId)
    return option?.quantity || 0
  }

  const isQuantityOption = (option: any) => {
    return option.type === 'quantity'
  }
  
  const isPerFootOption = (option: any) => {
    return option.type === 'per_foot'
  }

  const isOptionIncludedInPioneer = (optionName: string) => {
    return PIONEER_PACKAGE.includedOptions.some(included => 
      optionName.toLowerCase().includes(included.toLowerCase())
    )
  }

  const getOptionsByCategory = (categoryId: string) => {
    return availableOptions.filter(opt => 
      opt.category.toLowerCase() === categoryId.toLowerCase()
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Options */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Options & Customization</h2>
        
        <div className="space-y-4">
          {OPTION_CATEGORIES.map((category) => {
            const categoryOptions = getOptionsByCategory(category.id)
            const isExpanded = expandedCategories.includes(category.id)
            
            return (
              <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category.name}</span>
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">
                      {categoryOptions.length} options
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {categoryOptions.map((option) => {
                      const isIncludedInPioneer = pioneerPackage && isOptionIncludedInPioneer(option.name)
                      const isSelected = isOptionSelected(option.id)
                      const quantity = getOptionQuantity(option.id)
                      const hasQuantity = isQuantityOption(option)
                      const isPerFoot = isPerFootOption(option)
                      
                      return (
                        <div
                          key={option.id}
                          className={`p-4 rounded-lg border ${
                            isIncludedInPioneer
                              ? 'bg-blue-50 border-blue-200'
                              : isSelected
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900">{option.name}</h4>
                                {isIncludedInPioneer && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    Included in Pioneer
                                  </span>
                                )}
                              </div>
                              {option.description && (
                                <p className="text-sm text-slate-600 mb-2">{option.description}</p>
                              )}
                              <p className="text-lg font-semibold text-slate-900">
                                {formatPrice(option.price)}
                                {hasQuantity && ' each'}
                                {isPerFoot && ' per foot'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {(hasQuantity || isPerFoot) && (isSelected || isIncludedInPioneer) ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateOptionQuantity(option.id, Math.max(0, quantity - 1))}
                                    disabled={isIncludedInPioneer}
                                    className={`w-8 h-8 rounded flex items-center justify-center ${
                                      isIncludedInPioneer
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-16 text-center font-medium">
                                    {isIncludedInPioneer && option.name.toLowerCase().includes('window') ? 2 : quantity}
                                    {isPerFoot && ' ft'}
                                  </span>
                                  <button
                                    onClick={() => updateOptionQuantity(option.id, quantity + 1)}
                                    disabled={isIncludedInPioneer}
                                    className={`w-8 h-8 rounded flex items-center justify-center ${
                                      isIncludedInPioneer
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    }`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (isSelected) {
                                      removeOption(option.id)
                                    } else {
                                      addOption(option, (hasQuantity || isPerFoot) ? 1 : 1)
                                    }
                                  }}
                                  disabled={isIncludedInPioneer}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    isIncludedInPioneer
                                      ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-red-500 text-white hover:bg-red-600'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isIncludedInPioneer ? 'Included' : isSelected ? 'Remove' : 'Add'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Options Total */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
          <span className="text-lg font-medium text-slate-700">Options Total:</span>
          <span className="text-2xl font-bold text-blue-600">{formatPrice(optionsTotal)}</span>
        </div>
      </div>

      {/* Pioneer Package Dialog */}
      {showPioneerDialog && (
        <PioneerPackageDialog
          onClose={() => setShowPioneerDialog(false)}
          onConfirm={(horseArea) => {
            setPioneerPackage(true, horseArea)
            setShowPioneerDialog(false)
          }}
        />
      )}
    </div>
  )
}