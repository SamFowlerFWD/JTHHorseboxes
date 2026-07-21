'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAdmin } from '../admin-context'
import { Plus, Pencil, Trash2, X, Loader2, Star, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { StockListing, CreateStockInput, UpdateStockInput } from '@/lib/stock/types'

type FormData = {
  model: string
  year: string
  mileage: string
  color: string
  price: string
  description: string
  features: string
  status: 'available' | 'reserved' | 'sold'
}

type ImagePreview = {
  url: string
  file?: File
  isExisting: boolean
}

const emptyForm: FormData = {
  model: 'Professional 35',
  year: new Date().getFullYear().toString(),
  mileage: '0',
  color: '',
  price: '',
  description: '',
  features: '',
  status: 'available',
}

function statusBadge(status: string) {
  const base = 'inline-block px-2 py-0.5 text-xs font-semibold uppercase tracking-wide'
  switch (status) {
    case 'available':
      return `${base} bg-green-100 text-green-800`
    case 'reserved':
      return `${base} bg-amber-100 text-amber-800`
    case 'sold':
      return `${base} bg-red-100 text-red-800`
    default:
      return `${base} bg-slate-100 text-slate-800`
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
}

export default function StockAdminPage() {
  const { token, logout } = useAdmin()
  const [listings, setListings] = useState<StockListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [formError, setFormError] = useState('')

  // Image state
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem('admin_token')
    logout()
  }, [logout])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stock?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      if (!res.ok) throw new Error('Failed to load stock listings')
      const data: StockListing[] = await res.json()
      setListings(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [token, handleUnauthorized])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const openAddForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setImagePreviews([])
    setPrimaryIndex(0)
    setShowForm(true)
  }

  const openEditForm = (listing: StockListing) => {
    setEditingId(listing.id)
    setForm({
      model: listing.model,
      year: listing.year.toString(),
      mileage: listing.mileage.toString(),
      color: listing.color,
      price: listing.price.toString(),
      description: listing.description,
      features: listing.features.join('\n'),
      status: listing.status,
    })
    // Load existing images as previews
    const existingPreviews: ImagePreview[] = (listing.images || []).map(url => ({
      url,
      isExisting: true,
    }))
    setImagePreviews(existingPreviews)
    setPrimaryIndex(listing.primaryImage || 0)
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setImagePreviews([])
    setPrimaryIndex(0)
  }

  const validateForm = (): string | null => {
    if (!form.model.trim()) return 'Model is required'
    if (!form.year.trim() || isNaN(Number(form.year))) return 'Valid year is required'
    if (!form.mileage.trim() || isNaN(Number(form.mileage))) return 'Valid mileage is required'
    if (!form.color.trim()) return 'Color is required'
    if (!form.price.trim() || isNaN(Number(form.price))) return 'Valid price is required'
    if (!form.description.trim()) return 'Description is required'
    return null
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPreviews: ImagePreview[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = URL.createObjectURL(file)
      newPreviews.push({ url, file, isExisting: false })
    }
    setImagePreviews(prev => [...prev, ...newPreviews])

    // Reset the input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Adjust primary index
      if (primaryIndex === index) {
        setPrimaryIndex(0)
      } else if (primaryIndex > index) {
        setPrimaryIndex(prev => prev - 1)
      }
      return updated
    })
  }

  const setPrimary = (index: number) => {
    setPrimaryIndex(index)
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError('')

    try {
      // Build the listing payload (without images first)
      const payload: CreateStockInput | UpdateStockInput = {
        model: form.model.trim(),
        year: parseInt(form.year),
        mileage: parseInt(form.mileage),
        color: form.color.trim(),
        price: parseFloat(form.price),
        description: form.description.trim(),
        features: form.features.trim() ? form.features.trim().split('\n').map(f => f.trim()).filter(Boolean) : [],
        images: imagePreviews.filter(p => p.isExisting).map(p => p.url),
        primaryImage: primaryIndex,
        status: form.status,
      }

      // Save/update the listing first to get the ID
      const url = editingId ? `/api/stock/${editingId}` : '/api/stock'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.status === 401) {
        handleUnauthorized()
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as Record<string, string>))
        throw new Error((data as { error?: string }).error || 'Failed to save listing')
      }

      const savedListing: StockListing = await res.json()

      // Upload new images if any
      const newImages = imagePreviews.filter(p => !p.isExisting && p.file)
      if (newImages.length > 0) {
        setUploadingImages(true)

        const existingCount = imagePreviews.filter(p => p.isExisting).length
        const formData = new window.FormData()
        formData.append('listingId', savedListing.id)
        formData.append('startIndex', existingCount.toString())

        for (const img of newImages) {
          if (img.file) {
            formData.append('files', img.file)
          }
        }

        const uploadRes = await fetch('/api/stock/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (uploadRes.status === 401) {
          handleUnauthorized()
          return
        }

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({} as Record<string, string>))
          throw new Error((data as { error?: string }).error || 'Failed to upload images')
        }

        const uploadResult: { imagePaths: string[] } = await uploadRes.json()

        // Update the listing with all image paths
        const allImages = [
          ...imagePreviews.filter(p => p.isExisting).map(p => p.url),
          ...uploadResult.imagePaths,
        ]

        await fetch(`/api/stock/${savedListing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: allImages,
            primaryImage: primaryIndex,
          }),
        })

        setUploadingImages(false)
      }

      closeForm()
      await fetchListings()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
      setUploadingImages(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) {
        handleUnauthorized()
        return
      }

      if (!res.ok) throw new Error('Failed to delete listing')

      setDeleteId(null)
      await fetchListings()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-500">Loading stock listings...</span>
      </div>
    )
  }

  if (error && !showForm) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchListings} className="text-blue-600 underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Stock Management</h2>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </button>
      </div>

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Listing</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Listing' : 'Add New Listing'}
            </h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 mb-4">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model *</label>
              <select
                value={form.model}
                onChange={e => updateField('model', e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Professional 35">Professional 35</option>
                <option value="Principle 35">Principle 35</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
              <input
                type="number"
                value={form.year}
                onChange={e => updateField('year', e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="2000"
                max="2030"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mileage (km) *</label>
              <input
                type="number"
                value={form.mileage}
                onChange={e => updateField('mileage', e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color *</label>
              <input
                type="text"
                value={form.color}
                onChange={e => updateField('color', e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Midnight Blue"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (EUR) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => updateField('price', e.target.value)}
                className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => updateField('status', e.target.value as FormData['status'])}
                className="w-full border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe the horsebox..."
            />
          </div>

          {/* Features */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Features <span className="text-slate-400 font-normal">(one per line)</span>
            </label>
            <textarea
              value={form.features}
              onChange={e => updateField('features', e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder={"Air conditioning\nElectric ramp\nBluetooth audio"}
            />
          </div>

          {/* Images Upload Section */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Images <span className="text-slate-400 font-normal">(click a thumbnail to set as primary)</span>
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={`${preview.url}-${index}`}
                    className={`relative group cursor-pointer border-2 ${
                      index === primaryIndex
                        ? 'border-blue-600 shadow-md'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                    onClick={() => setPrimary(index)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Primary badge */}
                    {index === primaryIndex && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white p-0.5">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Index label */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                      {index === primaryIndex ? 'Primary' : `#${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
              </button>
              {imagePreviews.length > 0 && (
                <span className="text-sm text-slate-500">
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || uploadingImages}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {(saving || uploadingImages) && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadingImages ? 'Uploading Images...' : editingId ? 'Update Listing' : 'Create Listing'}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-2">No stock listings yet.</p>
          <button onClick={openAddForm} className="text-blue-600 text-sm underline">
            Add your first listing
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Image</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Model</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Color</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Year</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Mileage</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative w-16 h-12 overflow-hidden bg-slate-100">
                        <Image
                          src={listing.images[listing.primaryImage || 0] || listing.images[0]}
                          alt={listing.model}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{listing.model}</td>
                  <td className="px-4 py-3 text-slate-600">{listing.color}</td>
                  <td className="px-4 py-3 text-slate-600">{listing.year}</td>
                  <td className="px-4 py-3 text-slate-600">{listing.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{formatPrice(listing.price)}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadge(listing.status)}>{listing.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(listing)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(listing.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
