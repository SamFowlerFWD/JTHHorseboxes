'use client'

import { useState } from 'react'
import { PricingOption, MODEL_RANGES } from '@/lib/configurator/types'
import { OPTION_CATEGORIES } from '@/lib/configurator/types'
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Weight as WeightIcon,
  Ruler,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GroupedPricingViewProps {
  options: PricingOption[]
  onEdit: (option: PricingOption) => void
  onDuplicate: (option: PricingOption) => void
  onDelete: (optionId: string) => void
  onToggleAvailability: (option: PricingOption) => void
}

export function GroupedPricingView({
  options,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
}: GroupedPricingViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['models', 'optional-extras'])
  )
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set(['jth-35']))
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['exterior', 'chassis'])
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleModel = (modelId: string) => {
    const newExpanded = new Set(expandedModels)
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId)
    } else {
      newExpanded.add(modelId)
    }
    setExpandedModels(newExpanded)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exterior: 'bg-blue-100 text-blue-800 border-blue-200',
      storage: 'bg-purple-100 text-purple-800 border-purple-200',
      interior: 'bg-pink-100 text-pink-800 border-pink-200',
      chassis: 'bg-slate-100 text-slate-800 border-slate-200',
      'horse-area': 'bg-amber-100 text-amber-800 border-amber-200',
      'grooms-area': 'bg-green-100 text-green-800 border-green-200',
      electrical: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cab: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      pioneer: 'bg-violet-100 text-violet-800 border-violet-200',
      horse_area: 'bg-amber-100 text-amber-800 border-amber-200',
      grooms_area: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  const getWeightBadgeColor = (weight: number) => {
    if (weight === 0) return 'text-slate-500'
    if (weight < 25) return 'text-green-600'
    if (weight < 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const formatPrice = (option: PricingOption) => {
    if (option.per_foot_pricing) {
      return `£${option.price_per_foot.toFixed(2)}/ft`
    }
    return `£${option.price.toFixed(2)}`
  }

  const formatLivingUnits = (units: number) => {
    const feet = units / 2
    return units === 0 ? '-' : `${units}u (${feet}ft)`
  }

  const OptionRow = ({ option }: { option: PricingOption }) => (
    <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {option.name}
          </span>
          {option.per_foot_pricing && (
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
              Per Foot
            </Badge>
          )}
          {!option.is_available && (
            <Badge variant="outline" className="border-slate-300 text-slate-500">
              Unavailable
            </Badge>
          )}
          {option.applicable_models && option.applicable_models.length > 1 && (
            <Badge
              variant="outline"
              className="border-purple-200 bg-purple-50 text-purple-700"
              title={`Applies to: ${option.applicable_models.join(', ')}`}
            >
              Multi-Model ({option.applicable_models.length})
            </Badge>
          )}
        </div>
        {option.description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {option.description}
          </p>
        )}
        {option.sku && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            SKU: {option.sku}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {formatPrice(option)}
          </div>
          <div className="text-xs text-slate-500">+{option.vat_rate}% VAT</div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <WeightIcon className="h-4 w-4 text-slate-400" />
          <span className={getWeightBadgeColor(option.weight_kg)}>
            {option.weight_kg === 0 ? '-' : `${option.weight_kg}kg`}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <Ruler className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">
            {formatLivingUnits(option.living_area_units)}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="sr-only">Actions</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(option)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(option)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleAvailability(option)}>
              {option.is_available ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Mark Unavailable
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Mark Available
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(option.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  // Get base models for each range
  const getBaseModelsForRange = (range: typeof MODEL_RANGES[number]) => {
    return options.filter(opt =>
      opt.category === 'base' &&
      opt.applicable_models?.some(m => range.models.includes(m))
    )
  }

  // Get optional extras by category (excluding AEOS if needed)
  const getOptionalExtrasByCategory = () => {
    const categorizedExtras: Record<string, PricingOption[]> = {}

    OPTION_CATEGORIES.filter(cat => cat.id !== 'base').forEach(category => {
      categorizedExtras[category.id] = options.filter(opt => opt.category === category.id)
    })

    return categorizedExtras
  }

  const optionalExtrasByCategory = getOptionalExtrasByCategory()

  return (
    <div className="space-y-4">
      {/* Models Section */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={() => toggleSection('models')}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('models') ? (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-500" />
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Models</h3>
          </div>
        </button>

        {expandedSections.has('models') && (
          <div className="border-t border-slate-200 dark:border-slate-700">
            {MODEL_RANGES.map(range => {
              const baseModels = getBaseModelsForRange(range)
              if (baseModels.length === 0) return null

              return (
                <div key={range.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                  <button
                    onClick={() => toggleModel(range.id)}
                    className="flex w-full items-center justify-between p-3 pl-12 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      {expandedModels.has(range.id) ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {range.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {baseModels.length} model{baseModels.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>

                  {expandedModels.has(range.id) && (
                    <div className="bg-slate-50 dark:bg-slate-800/50">
                      {baseModels.map(option => (
                        <div key={option.id} className="pl-16">
                          <OptionRow option={option} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Optional Extras Section */}
      <div className="rounded-lg border border-red-200 bg-white dark:border-red-700 dark:bg-slate-900">
        <button
          onClick={() => toggleSection('optional-extras')}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('optional-extras') ? (
              <ChevronDown className="h-5 w-5 text-red-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-red-600" />
            )}
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Optional Extras</h3>
            <span className="text-sm text-slate-500">Available across all JTH models (not AEOS)</span>
          </div>
        </button>

        {expandedSections.has('optional-extras') && (
          <div className="border-t border-red-200 dark:border-red-700">
            {Object.entries(optionalExtrasByCategory).map(([categoryId, categoryOptions]) => {
              if (categoryOptions.length === 0) return null

              const categoryName =
                OPTION_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId

              return (
                <div key={categoryId} className="border-b border-red-100 last:border-b-0 dark:border-red-800/50">
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="flex w-full items-center justify-between p-3 pl-12 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <div className="flex items-center gap-3">
                      {expandedCategories.has(categoryId) ? (
                        <ChevronDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant="outline" className={`border ${getCategoryColor(categoryId)}`}>
                        {categoryName}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {categoryOptions.length} option{categoryOptions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>

                  {expandedCategories.has(categoryId) && (
                    <div className="bg-slate-50 dark:bg-slate-800/50">
                      {categoryOptions.map(option => (
                        <div key={option.id} className="pl-16">
                          <OptionRow option={option} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {options.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">
            No pricing options found. Try adjusting your filters or add a new option.
          </p>
        </div>
      )}
    </div>
  )
}
