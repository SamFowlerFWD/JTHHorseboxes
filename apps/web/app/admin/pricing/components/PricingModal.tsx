'use client'

import { useState, useEffect } from 'react'
import { PricingOption, OPTION_CATEGORIES, MODEL_CODES, MODEL_RANGES } from '@/lib/configurator/types'
import { useToast } from '@/components/admin/Toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  option: PricingOption | null
  onSave: () => void
}

interface FormData {
  applicable_models: string[]
  category: string
  subcategory: string
  name: string
  description: string
  sku: string
  price: string
  price_per_foot: string
  weight_kg: string
  living_area_units: string
  per_foot_pricing: boolean
  vat_rate: string
  is_default: boolean
  is_available: boolean
}

export function PricingModal({ isOpen, onClose, option, onSave }: PricingModalProps) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    applicable_models: MODEL_CODES.map(m => m.code), // Default to all models
    category: 'exterior',
    subcategory: '',
    name: '',
    description: '',
    sku: '',
    price: '0',
    price_per_foot: '0',
    weight_kg: '0',
    living_area_units: '0',
    per_foot_pricing: false,
    vat_rate: '20',
    is_default: false,
    is_available: true,
  })

  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  useEffect(() => {
    if (option) {
      // Editing existing option
      setFormData({
        applicable_models: option.applicable_models || ['3.5t'],
        category: option.category,
        subcategory: option.subcategory || '',
        name: option.name,
        description: option.description || '',
        sku: option.sku || '',
        price: option.price.toString(),
        price_per_foot: option.price_per_foot.toString(),
        weight_kg: option.weight_kg.toString(),
        living_area_units: option.living_area_units.toString(),
        per_foot_pricing: option.per_foot_pricing,
        vat_rate: option.vat_rate.toString(),
        is_default: option.is_default,
        is_available: option.is_available,
      })
    } else {
      // Creating new option - reset form (default to all models)
      setFormData({
        applicable_models: MODEL_CODES.map(m => m.code), // All models by default
        category: 'exterior',
        subcategory: '',
        name: '',
        description: '',
        sku: '',
        price: '0',
        price_per_foot: '0',
        weight_kg: '0',
        living_area_units: '0',
        per_foot_pricing: false,
        vat_rate: '20',
        is_default: false,
        is_available: true,
      })
    }
    setErrors({})
  }, [option, isOpen])

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleModelToggle = (modelCode: string) => {
    setFormData((prev) => {
      const currentModels = prev.applicable_models
      const isSelected = currentModels.includes(modelCode)

      const newModels = isSelected
        ? currentModels.filter((m) => m !== modelCode)
        : [...currentModels, modelCode]

      return { ...prev, applicable_models: newModels }
    })
    // Clear error for applicable_models
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.applicable_models
      return newErrors
    })
  }

  const handleRangeToggle = (rangeModels: readonly string[]) => {
    setFormData((prev) => {
      const currentModels = prev.applicable_models
      const allSelected = rangeModels.every((m) => currentModels.includes(m))

      let newModels: string[]
      if (allSelected) {
        // Deselect all models in this range
        newModels = currentModels.filter((m) => !rangeModels.includes(m))
      } else {
        // Select all models in this range
        const modelsToAdd = rangeModels.filter((m) => !currentModels.includes(m))
        newModels = [...currentModels, ...modelsToAdd]
      }

      return { ...prev, applicable_models: newModels }
    })
    // Clear error
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.applicable_models
      return newErrors
    })
  }

  const isRangeFullySelected = (rangeModels: readonly string[]) => {
    return rangeModels.every((m) => formData.applicable_models.includes(m))
  }

  const isRangePartiallySelected = (rangeModels: readonly string[]) => {
    const selectedCount = rangeModels.filter((m) => formData.applicable_models.includes(m)).length
    return selectedCount > 0 && selectedCount < rangeModels.length
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.applicable_models || formData.applicable_models.length === 0) {
      newErrors.applicable_models = 'At least one model must be selected'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    // Price validation
    if (formData.per_foot_pricing) {
      const pricePerFoot = parseFloat(formData.price_per_foot)
      if (isNaN(pricePerFoot) || pricePerFoot < 0) {
        newErrors.price_per_foot = 'Valid price per foot is required'
      }
    } else {
      const price = parseFloat(formData.price)
      if (isNaN(price) || price < 0) {
        newErrors.price = 'Valid price is required'
      }
    }

    // Weight validation
    const weight = parseFloat(formData.weight_kg)
    if (isNaN(weight) || weight < 0) {
      newErrors.weight_kg = 'Weight must be 0 or greater'
    }

    // Living area validation
    const livingUnits = parseInt(formData.living_area_units)
    if (isNaN(livingUnits) || livingUnits < 0) {
      newErrors.living_area_units = 'Living area units must be 0 or greater'
    }

    // VAT rate validation
    const vatRate = parseFloat(formData.vat_rate)
    if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
      newErrors.vat_rate = 'VAT rate must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('error', 'Please fix the validation errors')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        applicable_models: formData.applicable_models,
        category: formData.category,
        subcategory: formData.subcategory || null,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        sku: formData.sku.trim() || null,
        price: parseFloat(formData.price),
        price_per_foot: parseFloat(formData.price_per_foot),
        weight_kg: parseFloat(formData.weight_kg),
        living_area_units: parseInt(formData.living_area_units),
        per_foot_pricing: formData.per_foot_pricing,
        vat_rate: parseFloat(formData.vat_rate),
        is_default: formData.is_default,
        is_available: formData.is_available,
      }

      const url = option ? `/api/ops/pricing/${option.id}` : '/api/ops/pricing'
      const method = option ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', option ? 'Option updated successfully' : 'Option created successfully')
        onSave()
        onClose()
      } else {
        showToast('error', data.error || 'Failed to save option')
      }
    } catch (error) {
      console.error('Error saving option:', error)
      showToast('error', 'Failed to save option')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{option ? 'Edit Pricing Option' : 'Create New Pricing Option'}</DialogTitle>
          <DialogDescription>
            {option
              ? 'Update the details of this pricing option'
              : 'Add a new option to the configurator'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>
                  Applicable Models <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which models this option applies to. Use "Select All" for each range to quickly select all models in that range.
                </p>

                {/* Model Ranges */}
                <div className="space-y-4 pt-2">
                  {MODEL_RANGES.map((range) => {
                    const rangeModels = MODEL_CODES.filter((m) => range.models.includes(m.code))
                    const isFullySelected = isRangeFullySelected(range.models)
                    const isPartiallySelected = isRangePartiallySelected(range.models)

                    return (
                      <div key={range.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                        {/* Range Header with Select All */}
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {range.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRangeToggle(range.models)}
                            className="h-7 text-xs"
                          >
                            {isFullySelected ? 'Deselect All' : 'Select All'}
                            {isPartiallySelected && !isFullySelected && ' (partial)'}
                          </Button>
                        </div>

                        {/* Individual Models in Range */}
                        <div className="space-y-2">
                          {rangeModels.map((model) => (
                            <div key={model.code} className="flex items-start space-x-2">
                              <Checkbox
                                id={`model-${model.code}`}
                                checked={formData.applicable_models.includes(model.code)}
                                onCheckedChange={() => handleModelToggle(model.code)}
                              />
                              <div className="grid gap-0.5 leading-none">
                                <label
                                  htmlFor={`model-${model.code}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {model.label}
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {model.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {errors.applicable_models && (
                  <p className="text-xs text-red-500">{errors.applicable_models}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Large External Tack Locker"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the option..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="e.g., TL-LRG-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleChange('subcategory', e.target.value)}
                  placeholder="Optional subcategory"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pricing</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="per_foot_pricing"
                checked={formData.per_foot_pricing}
                onCheckedChange={(checked) => handleChange('per_foot_pricing', checked as boolean)}
              />
              <Label htmlFor="per_foot_pricing" className="cursor-pointer">
                Per-foot pricing (e.g., chassis extension)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.per_foot_pricing ? (
                <div className="space-y-2">
                  <Label htmlFor="price_per_foot">
                    Price Per Foot (£) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price_per_foot"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_foot}
                    onChange={(e) => handleChange('price_per_foot', e.target.value)}
                    placeholder="1000"
                  />
                  {errors.price_per_foot && (
                    <p className="text-xs text-red-500">{errors.price_per_foot}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (£) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="750"
                  />
                  {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                <Input
                  id="vat_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.vat_rate}
                  onChange={(e) => handleChange('vat_rate', e.target.value)}
                  placeholder="20"
                />
                {errors.vat_rate && <p className="text-xs text-red-500">{errors.vat_rate}</p>}
              </div>
            </div>
          </div>

          {/* Weight & Living Area */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Weight & Living Area
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight_kg}
                  onChange={(e) => handleChange('weight_kg', e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-slate-500">e.g., Fridge: 30kg, Bed: 80kg</p>
                {errors.weight_kg && <p className="text-xs text-red-500">{errors.weight_kg}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="living_area_units">Living Area Units</Label>
                <Input
                  id="living_area_units"
                  type="number"
                  min="0"
                  value={formData.living_area_units}
                  onChange={(e) => handleChange('living_area_units', e.target.value)}
                  placeholder="6"
                />
                <p className="text-xs text-slate-500">1 unit = 6 inches. Full bed = 6 units</p>
                {errors.living_area_units && (
                  <p className="text-xs text-red-500">{errors.living_area_units}</p>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Options</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={formData.is_default}
                  onCheckedChange={(checked) => handleChange('is_default', checked as boolean)}
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default option for this category
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleChange('is_available', checked as boolean)}
                />
                <Label htmlFor="is_available" className="cursor-pointer">
                  Option is available for selection
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {option ? 'Update Option' : 'Create Option'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
