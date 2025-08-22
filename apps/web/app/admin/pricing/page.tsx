'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/admin/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/Toast'
import { PricingOption } from '@/lib/supabase/database.types'
import { Save, Edit2, DollarSign, Package, Grip } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GroupedPricing {
  '3.5t': PricingOption[]
  '4.5t': PricingOption[]
  '7.2t': PricingOption[]
}

function PricingPageContent() {
  const { showToast } = useToast()
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([])
  const [groupedPricing, setGroupedPricing] = useState<GroupedPricing>({
    '3.5t': [],
    '4.5t': [],
    '7.2t': [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<PricingOption>>({})
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPricingOptions()
  }, [])

  useEffect(() => {
    groupPricingByModel()
  }, [pricingOptions])

  const fetchPricingOptions = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('pricing_options')
        .select('*')
        .order('model')
        .order('category')
        .order('display_order')

      if (error) throw error
      setPricingOptions(data || [])
    } catch (error) {
      console.error('Error fetching pricing options:', error)
      showToast('error', 'Failed to fetch pricing options')
    } finally {
      setIsLoading(false)
    }
  }

  const groupPricingByModel = () => {
    const grouped: GroupedPricing = {
      '3.5t': [],
      '4.5t': [],
      '7.2t': [],
    }

    pricingOptions.forEach((option) => {
      if (option.model in grouped) {
        grouped[option.model as keyof GroupedPricing].push(option)
      }
    })

    setGroupedPricing(grouped)
  }

  const handleInlineEdit = (option: PricingOption) => {
    setEditingId(option.id)
    setEditForm(option)
  }

  const handleSaveInlineEdit = async () => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('pricing_options')
        .update({
          name: editForm.name,
          price: editForm.price,
          vat_rate: editForm.vat_rate,
          description: editForm.description,
        })
        .eq('id', editForm.id)

      if (error) throw error

      setPricingOptions((prev) =>
        prev.map((option) =>
          option.id === editForm.id ? { ...option, ...editForm } as PricingOption : option
        )
      )
      
      setEditingId(null)
      showToast('success', 'Price updated successfully')
    } catch (error) {
      console.error('Error updating price:', error)
      showToast('error', 'Failed to update price')
    }
  }

  const handleToggleAvailability = async (optionId: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('pricing_options')
        .update({ is_available: !currentStatus })
        .eq('id', optionId)

      if (error) throw error

      setPricingOptions((prev) =>
        prev.map((option) =>
          option.id === optionId ? { ...option, is_available: !currentStatus } : option
        )
      )
      
      showToast('success', `Option ${!currentStatus ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling availability:', error)
      showToast('error', 'Failed to update availability')
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0) {
      showToast('warning', 'No items selected')
      return
    }

    const newPrice = prompt('Enter new price for selected items:')
    if (!newPrice || isNaN(Number(newPrice))) return

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('pricing_options')
        .update({ price: Number(newPrice) })
        .in('id', Array.from(selectedItems))

      if (error) throw error

      setPricingOptions((prev) =>
        prev.map((option) =>
          selectedItems.has(option.id) ? { ...option, price: Number(newPrice) } : option
        )
      )
      
      setSelectedItems(new Set())
      setBulkEditMode(false)
      showToast('success', `Updated ${selectedItems.size} items`)
    } catch (error) {
      console.error('Error bulk updating:', error)
      showToast('error', 'Failed to bulk update prices')
    }
  }

  const handleReorder = async (optionId: string, direction: 'up' | 'down', model: keyof GroupedPricing) => {
    const modelOptions = groupedPricing[model]
    const currentIndex = modelOptions.findIndex(opt => opt.id === optionId)
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === modelOptions.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapOption = modelOptions[newIndex]

    const supabase = createClient()
    
    try {
      // Swap display_order values
      await supabase
        .from('pricing_options')
        .update({ display_order: modelOptions[currentIndex].display_order })
        .eq('id', swapOption.id)

      await supabase
        .from('pricing_options')
        .update({ display_order: swapOption.display_order })
        .eq('id', optionId)

      // Refresh data
      fetchPricingOptions()
      showToast('success', 'Order updated')
    } catch (error) {
      console.error('Error reordering:', error)
      showToast('error', 'Failed to reorder items')
    }
  }

  const renderPricingTable = (model: keyof GroupedPricing, options: PricingOption[]) => {
    const categories = [...new Set(options.map(opt => opt.category))]

    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          {model} Model
        </h2>
        
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              {category}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    {bulkEditMode && (
                      <th className="px-2 py-2">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const categoryOptions = options.filter(opt => opt.category === category)
                            if (e.target.checked) {
                              categoryOptions.forEach(opt => selectedItems.add(opt.id))
                            } else {
                              categoryOptions.forEach(opt => selectedItems.delete(opt.id))
                            }
                            setSelectedItems(new Set(selectedItems))
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                    )}
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">VAT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {options
                    .filter(opt => opt.category === category)
                    .map((option, index) => (
                      <tr key={option.id} className={option.is_default ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                        {bulkEditMode && (
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(option.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectedItems.add(option.id)
                                } else {
                                  selectedItems.delete(option.id)
                                }
                                setSelectedItems(new Set(selectedItems))
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                          {editingId === option.id ? (
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          ) : (
                            <>
                              {option.name}
                              {option.is_default && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Default
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {editingId === option.id ? (
                            <input
                              type="text"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                          ) : (
                            option.description || '-'
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {editingId === option.id ? (
                            <div className="flex items-center">
                              <span className="mr-1">£</span>
                              <input
                                type="number"
                                value={editForm.price || 0}
                                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          ) : (
                            `£${option.price.toLocaleString()}`
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {editingId === option.id ? (
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={editForm.vat_rate || 0}
                                onChange={(e) => setEditForm({ ...editForm, vat_rate: Number(e.target.value) })}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                              />
                              <span className="ml-1">%</span>
                            </div>
                          ) : (
                            `${option.vat_rate}%`
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleToggleAvailability(option.id, option.is_available)}
                            className={`inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium ${
                              option.is_available
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {option.is_available ? 'Available' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            {editingId === option.id ? (
                              <>
                                <button
                                  onClick={handleSaveInlineEdit}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleInlineEdit(option)}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReorder(option.id, 'up', model)}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-gray-500 disabled:opacity-30"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => handleReorder(option.id, 'down', model)}
                                  disabled={index === options.filter(opt => opt.category === category).length - 1}
                                  className="text-gray-400 hover:text-gray-500 disabled:opacity-30"
                                >
                                  ↓
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pricing Editor</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage pricing for all horsebox models and options
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              onClick={() => {
                setBulkEditMode(!bulkEditMode)
                setSelectedItems(new Set())
              }}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                bulkEditMode
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
            </Button>
            {bulkEditMode && (
              <Button
                onClick={handleBulkUpdate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Selected ({selectedItems.size})
              </Button>
            )}
          </div>
        </div>

        {/* Pricing Tables by Model */}
        <div className="space-y-6">
          {Object.entries(groupedPricing).map(([model, options]) => (
            <div key={model}>
              {options.length > 0 && renderPricingTable(model as keyof GroupedPricing, options)}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function PricingPage() {
  return (
    <ToastProvider>
      <PricingPageContent />
    </ToastProvider>
  )
}