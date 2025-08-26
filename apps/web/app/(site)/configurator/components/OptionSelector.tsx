'use client'

import { useState, useEffect } from 'react'
import { useConfiguratorStore } from '@/lib/configurator/store'
import { OPTION_CATEGORIES } from '@/lib/configurator/types'
import { formatPrice } from '@/lib/configurator/calculations'
import { 
  Palette, Home, Shield, Cpu, Wind, 
  Check, Plus, Minus, Info, Search,
  ChevronDown, ChevronUp
} from 'lucide-react'

const categoryIcons: Record<string, any> = {
  exterior: Palette,
  interior: Home,
  safety: Shield,
  technology: Cpu,
  comfort: Wind,
  horse_area: Shield
}

export default function OptionSelector() {
  const {
    availableOptions,
    selectedOptions,
    addOption,
    removeOption,
    activeCategory,
    setActiveCategory,
    isLoading
  } = useConfiguratorStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())

  // Group options by category and subcategory
  const groupedOptions = availableOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = {}
    }
    const subcategory = option.subcategory || 'General'
    if (!acc[option.category][subcategory]) {
      acc[option.category][subcategory] = []
    }
    acc[option.category][subcategory].push(option)
    return acc
  }, {} as Record<string, Record<string, typeof availableOptions>>)

  // Filter options based on search
  const filteredOptions = searchTerm
    ? availableOptions.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null

  const toggleSubcategory = (subcategory: string) => {
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(subcategory)) {
      newExpanded.delete(subcategory)
    } else {
      newExpanded.add(subcategory)
    }
    setExpandedSubcategories(newExpanded)
  }

  const isOptionSelected = (optionId: string) => {
    return selectedOptions.some(o => o.id === optionId)
  }

  const toggleOption = (option: any) => {
    if (isOptionSelected(option.id)) {
      removeOption(option.id)
    } else {
      addOption(option)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!searchTerm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
          <div className="flex flex-wrap gap-2">
            {OPTION_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category.id]
              const isActive = activeCategory === category.id
              const categoryOptions = groupedOptions[category.id] || {}
              const optionCount = Object.values(categoryOptions).flat().length

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  disabled={optionCount === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : optionCount === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  {optionCount > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-blue-800' : 'bg-slate-200'
                    }`}>
                      {optionCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-4">
        {searchTerm ? (
          // Show filtered results
          filteredOptions && filteredOptions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">
                  Search Results ({filteredOptions.length})
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {filteredOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={isOptionSelected(option.id)}
                    onToggle={() => toggleOption(option)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
              <p className="text-slate-600">No options found matching "{searchTerm}"</p>
            </div>
          )
        ) : (
          // Show categorized options
          Object.entries(groupedOptions[activeCategory] || {}).map(([subcategory, options]) => {
            const isExpanded = expandedSubcategories.has(subcategory) || subcategory === 'General'
            
            return (
              <div key={subcategory} className="bg-white rounded-lg shadow-sm border border-slate-200">
                <button
                  onClick={() => toggleSubcategory(subcategory)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{subcategory}</h3>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                      {options.length} options
                    </span>
                  </div>
                  {subcategory !== 'General' && (
                    isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    {options.map((option) => (
                      <OptionCard
                        key={option.id}
                        option={option}
                        isSelected={isOptionSelected(option.id)}
                        onToggle={() => toggleOption(option)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Individual Option Card Component
function OptionCard({ option, isSelected, onToggle }: any) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected 
        ? 'border-blue-700 bg-blue-50' 
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <button
              onClick={onToggle}
              className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-blue-700 border-blue-700'
                  : 'bg-white border-slate-300 hover:border-slate-400'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </button>
            
            <div className="flex-1">
              <h4 className="font-medium text-slate-900">{option.name}</h4>
              {option.sku && (
                <p className="text-xs text-slate-500 mt-0.5">SKU: {option.sku}</p>
              )}
              {option.description && (
                <p className="text-sm text-slate-600 mt-1">{option.description}</p>
              )}
              {option.is_default && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Included as standard
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <p className="font-semibold text-slate-900">
              {option.price === 0 ? 'Included' : formatPrice(option.price)}
            </p>
            {option.price > 0 && (
              <p className="text-xs text-slate-500">+ VAT</p>
            )}
          </div>
          
          {option.description && option.description.length > 100 && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <Info className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>
      
      {showInfo && option.description && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-sm text-slate-600">{option.description}</p>
        </div>
      )}
    </div>
  )
}