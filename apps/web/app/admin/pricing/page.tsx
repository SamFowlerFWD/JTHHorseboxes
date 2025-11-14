'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { ToastProvider, useToast } from '@/components/admin/Toast'
import { PricingOption } from '@/lib/configurator/types'
import { OPTION_CATEGORIES } from '@/lib/configurator/types'
import {
  Plus,
  Download,
  Upload,
  History,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PricingModal } from './components/PricingModal'
import { BulkImportDialog } from './components/BulkImportDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { GroupedPricingView } from './components/GroupedPricingView'

interface Filters {
  availability: string
  search: string
}

function PricingPageContent() {
  const { showToast } = useToast()
  const [options, setOptions] = useState<PricingOption[]>([])
  const [filteredOptions, setFilteredOptions] = useState<PricingOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<PricingOption | null>(null)
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null)

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    availability: 'all',
    search: '',
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [options, filters])

  const fetchOptions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ops/pricing')
      const data = await response.json()

      if (data.success) {
        setOptions(data.data || [])
      } else {
        showToast('error', 'Failed to fetch pricing options')
      }
    } catch (error) {
      console.error('Error fetching options:', error)
      showToast('error', 'Failed to fetch pricing options')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...options]

    // Availability filter
    if (filters.availability !== 'all') {
      const isAvailable = filters.availability === 'available'
      filtered = filtered.filter((opt) => opt.is_available === isAvailable)
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (opt) =>
          opt.name.toLowerCase().includes(searchLower) ||
          opt.description?.toLowerCase().includes(searchLower) ||
          opt.sku?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredOptions(filtered)
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleCreate = () => {
    setEditingOption(null)
    setIsModalOpen(true)
  }

  const handleEdit = (option: PricingOption) => {
    setEditingOption(option)
    setIsModalOpen(true)
  }

  const handleDuplicate = async (option: PricingOption) => {
    try {
      const duplicateData = {
        ...option,
        name: `${option.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      }

      const response = await fetch('/api/ops/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Option duplicated successfully')
        fetchOptions()
      } else {
        showToast('error', data.error || 'Failed to duplicate option')
      }
    } catch (error) {
      console.error('Error duplicating option:', error)
      showToast('error', 'Failed to duplicate option')
    }
  }

  const handleToggleAvailability = async (option: PricingOption) => {
    try {
      const response = await fetch(`/api/ops/pricing/${option.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !option.is_available }),
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', `Option ${!option.is_available ? 'enabled' : 'disabled'}`)
        fetchOptions()
      } else {
        showToast('error', data.error || 'Failed to update availability')
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
      showToast('error', 'Failed to update availability')
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeletingOptionId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingOptionId) return

    try {
      const response = await fetch(`/api/ops/pricing/${deletingOptionId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Option deleted successfully')
        fetchOptions()
      } else {
        showToast('error', data.error || 'Failed to delete option')
      }
    } catch (error) {
      console.error('Error deleting option:', error)
      showToast('error', 'Failed to delete option')
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingOptionId(null)
    }
  }

  const handleModalSave = () => {
    setIsModalOpen(false)
    setEditingOption(null)
    fetchOptions()
  }

  const handleExportCSV = () => {
    const csvHeaders = [
      'ID',
      'Applicable Models',
      'Category',
      'Subcategory',
      'Name',
      'Description',
      'SKU',
      'Price',
      'Price Per Foot',
      'Weight (kg)',
      'Living Area Units',
      'Per Foot Pricing',
      'VAT Rate',
      'Is Default',
      'Is Available',
      'Display Order',
    ]

    const csvRows = options.map((opt) => [
      opt.id,
      opt.applicable_models?.join(';') || '',
      opt.category,
      opt.subcategory || '',
      opt.name,
      opt.description || '',
      opt.sku || '',
      opt.price,
      opt.price_per_foot,
      opt.weight_kg,
      opt.living_area_units,
      opt.per_foot_pricing,
      opt.vat_rate,
      opt.is_default,
      opt.is_available,
      opt.display_order || 0,
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pricing-options-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    showToast('success', 'CSV exported successfully')
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Pricing Management
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Manage all configurator pricing options across models and categories
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
                <Button size="sm" onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Option
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search options..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={filters.availability}
                onValueChange={(value) => handleFilterChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      availability: 'all',
                      search: '',
                    })
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Options
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {options.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Available
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {options.filter((o) => o.is_available).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Unavailable
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-400">
                  {options.filter((o) => !o.is_available).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Filtered Results
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {filteredOptions.length}
                </p>
              </div>
            </div>

        {/* Grouped Pricing View */}
        <GroupedPricingView
          options={filteredOptions}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteClick}
          onToggleAvailability={handleToggleAvailability}
        />
      </div>

      {/* Modals */}
      <PricingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingOption(null)
        }}
        option={editingOption}
        onSave={handleModalSave}
      />

      <BulkImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportComplete={() => {
          setIsImportDialogOpen(false)
          fetchOptions()
        }}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDeletingOptionId(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
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
