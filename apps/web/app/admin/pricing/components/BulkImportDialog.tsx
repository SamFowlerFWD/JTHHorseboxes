'use client'

import { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react'

interface BulkImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  success: boolean
  total_rows: number
  created: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    error: string
  }>
}

export function BulkImportDialog({ isOpen, onClose, onImportComplete }: BulkImportDialogProps) {
  const { showToast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        showToast('error', 'Please select a CSV file')
        return
      }
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select a file to import')
      return
    }

    setIsProcessing(true)
    setImportResult(null)

    try {
      // Read CSV file
      const text = await selectedFile.text()
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        showToast('error', 'CSV file must contain headers and at least one data row')
        setIsProcessing(false)
        return
      }

      // Parse CSV
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      // Process each row
      let created = 0
      let updated = 0
      let failed = 0
      const errors: Array<{ row: number; error: string }> = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNumber = i + 2 // +2 because of header and 0-based index

        try {
          const payload = {
            model: row.Model,
            category: row.Category,
            subcategory: row.Subcategory || null,
            name: row.Name,
            description: row.Description || null,
            sku: row.SKU || null,
            price: parseFloat(row.Price) || 0,
            price_per_foot: parseFloat(row['Price Per Foot']) || 0,
            weight_kg: parseFloat(row['Weight (kg)']) || 0,
            living_area_units: parseInt(row['Living Area Units']) || 0,
            per_foot_pricing: row['Per Foot Pricing'] === 'true' || row['Per Foot Pricing'] === 'TRUE',
            vat_rate: parseFloat(row['VAT Rate']) || 20,
            is_default: row['Is Default'] === 'true' || row['Is Default'] === 'TRUE',
            is_available: row['Is Available'] === 'true' || row['Is Available'] === 'TRUE',
          }

          // Validate required fields
          if (!payload.name || !payload.model || !payload.category) {
            throw new Error('Missing required fields: Name, Model, or Category')
          }

          // Check if updating existing (has ID) or creating new
          const optionId = row.ID
          let response

          if (optionId) {
            // Update existing
            response = await fetch(`/api/ops/pricing/${optionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (response.ok) {
              updated++
            } else {
              const data = await response.json()
              throw new Error(data.error || 'Failed to update')
            }
          } else {
            // Create new
            response = await fetch('/api/ops/pricing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (response.ok) {
              created++
            } else {
              const data = await response.json()
              throw new Error(data.error || 'Failed to create')
            }
          }
        } catch (error: any) {
          failed++
          errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error',
          })
        }
      }

      const result: ImportResult = {
        success: failed === 0,
        total_rows: rows.length,
        created,
        updated,
        failed,
        errors,
      }

      setImportResult(result)

      if (failed === 0) {
        showToast('success', `Successfully imported ${created + updated} options`)
        setTimeout(() => {
          onImportComplete()
        }, 2000)
      } else {
        showToast('warning', `Import completed with ${failed} error(s)`)
      }
    } catch (error: any) {
      console.error('Import error:', error)
      showToast('error', `Import failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = [
      'ID,Model,Category,Subcategory,Name,Description,SKU,Price,Price Per Foot,Weight (kg),Living Area Units,Per Foot Pricing,VAT Rate,Is Default,Is Available',
      ',3.5t,exterior,,Sample Tack Locker,External storage locker,TL-001,750,0,50,4,false,20,false,true',
      ',4.5t,chassis,,Rear Extension,Chassis extension,RE-001,0,1000,0,0,true,20,false,true',
      ',3.5t,interior,,Full Length Bed,Complete sleeping area,BED-FL,1200,0,80,6,false,20,false,true',
    ].join('\n')

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pricing-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)

    showToast('success', 'Template downloaded successfully')
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImportResult(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Pricing Options</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create or update multiple pricing options at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">Download the CSV template to get started</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="ml-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="space-y-2">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">CSV files only</p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </label>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-900 dark:text-slate-100">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null)
                      setImportResult(null)
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Total Rows</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {importResult.total_rows}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">Created</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {importResult.created}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Updated</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {importResult.updated}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {importResult.failed}
                  </p>
                </div>
              </div>

              {importResult.success ? (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900 dark:text-green-100">
                    Import completed successfully! All rows processed without errors.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900 dark:text-amber-100">
                    Import completed with {importResult.failed} error(s). Review the errors below.
                  </AlertDescription>
                </Alert>
              )}

              {importResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Errors:
                  </p>
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Row {error.row}: {error.error}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <Alert>
            <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">
              <strong>CSV Format Guidelines:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Leave ID column empty for new options, include ID to update existing</li>
                <li>Model values: 3.5t, 4.5t, 7.2t</li>
                <li>Category values: exterior, storage, interior, chassis, horse-area, grooms-area, electrical</li>
                <li>Boolean values: true or false (lowercase)</li>
                <li>Per foot pricing: Set "Per Foot Pricing" to true and use "Price Per Foot" column</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={!selectedFile || isProcessing}>
              {isProcessing ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
