'use client'

import { X, ArrowUp, Maximize2 } from 'lucide-react'

interface PioneerPackageDialogProps {
  onClose: () => void
  onConfirm: (horseArea: '1ft' | '3ft') => void
}

export default function PioneerPackageDialog({ onClose, onConfirm }: PioneerPackageDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Select Horse Area Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-6">
            The Pioneer Package includes a horse area extension. Please select your preferred configuration:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* 1ft Half Wall Option */}
            <button
              onClick={() => onConfirm('1ft')}
              className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ArrowUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">1ft Half Wall Extension</h3>
              <p className="text-sm text-slate-600 mb-4">
                Adds 1 foot to the horse area with a half-height wall, providing extra space while maintaining visibility.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Better ventilation</li>
                <li>• Easy monitoring</li>
                <li>• Suitable for most horses</li>
              </ul>
            </button>
            
            {/* 3ft Full Extension Option */}
            <button
              onClick={() => onConfirm('3ft')}
              className="p-6 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Maximize2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">3ft Full Extension</h3>
              <p className="text-sm text-slate-600 mb-4">
                Extends the horse area by 3 feet with full-height walls, maximizing space and privacy.
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Maximum space</li>
                <li>• Full privacy</li>
                <li>• Ideal for larger horses</li>
              </ul>
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This selection affects the horse area configuration only. 
              All other Pioneer Package features remain the same regardless of your choice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}