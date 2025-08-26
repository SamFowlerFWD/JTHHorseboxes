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
    // Only allow Pioneer Package for eligible models (4.5T models)
    if (!selectedModel?.pioneer_package_eligible) {
      return
    }
    
    if (!pioneerPackage) {
      // Show dialog for all Pioneer-eligible models to choose horse area
      setShowPioneerDialog(true)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Non-configurable Model Warning */}
      {selectedModel && selectedModel.availability !== 'configurable' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Customization Information</h2>
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
                ? 'This is a pre-built package model with limited customization options. Our sales team will discuss available modifications with you.'
                : 'This premium model is fully bespoke. All specifications and options will be customized during your consultation with our specialists.'
              }
            </p>
            <p className={`text-sm font-medium ${
              selectedModel.availability === 'pre-built' 
                ? 'text-blue-800' 
                : 'text-purple-800'
            }`}>
              The options configurator is not available for this model. Please contact us to discuss your requirements.
            </p>
          </div>
        </div>
      )}

      {/* Pioneer Package - Only for eligible models */}
      {selectedModel && selectedModel.pioneer_package_eligible && selectedModel.availability === 'configurable' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Pioneer Package Upgrade</h2>
              <p className="text-slate-600 mb-4">
                Complete upgrade package for {selectedModel.name} - transforms your horsebox with professional features
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700 mb-4">
                <div>
                  <div className="font-medium text-slate-900 mb-1">Included Features:</div>
                  <div>• L4 Surcharge & 4.5T Uprating</div>
                  <div>• Tack Locker & Cabinets</div>
                  <div>• Seating & Kitchen (Sink/Hob)</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">Utilities & Comfort:</div>
                  <div>• Water System & Fridge</div>
                  <div>• Windows (2x) & Blinds (2x)</div>
                  <div>• Leisure Battery & 240v Hookup</div>
                </div>
                <div>
                  <div className="font-medium text-slate-900 mb-1">Finishing:</div>
                  <div>• Premium Wood Internals</div>
                  <div>• Choice of Horse Area Extension</div>
                  <div>• Professional Installation</div>
                </div>
              </div>

              {pioneerPackage && pioneerHorseArea && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
                  <strong>Selected:</strong> Pioneer Package with {pioneerHorseArea} horse area extension
                </div>
              )}
            </div>
            
            <div className="ml-6 text-right">
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {formatPrice(PIONEER_PACKAGE.price)}
              </div>
              <div className="text-sm text-slate-500 mb-4">Total Package Price</div>
              
              <button
                onClick={handlePioneerToggle}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  pioneerPackage
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {pioneerPackage ? 'Remove Package' : 'Add Package'}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options - Only for configurable models */}
      {selectedModel && selectedModel.availability === 'configurable' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {selectedModel.pioneer_package_eligible ? 'Additional Options & Customization' : 'Options & Customization'}
          </h2>
          
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
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900">{option.name}</h4>
                                {isIncludedInPioneer && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
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
                                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-red-500 text-white hover:bg-red-600'
                                      : 'bg-blue-700 text-white hover:bg-blue-800'
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
            <span className="text-lg font-medium text-slate-700">
              {selectedModel?.pioneer_package_eligible && pioneerPackage 
                ? 'Additional Options Total:' 
                : 'Options Total:'
              }
            </span>
            <span className="text-2xl font-bold text-blue-700">{formatPrice(optionsTotal)}</span>
          </div>
        </div>
      )}

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