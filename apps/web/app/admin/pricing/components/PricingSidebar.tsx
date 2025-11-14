'use client'

import { MODEL_RANGES, OPTION_CATEGORIES } from '@/lib/configurator/types'

interface PricingSidebarProps {
  selectedView: 'all' | string
  onViewChange: (view: string, type: 'model' | 'category' | 'all') => void
  modelCounts: Record<string, number>
  categoryCounts: Record<string, number>
}

export function PricingSidebar({
  selectedView,
  onViewChange,
  modelCounts,
  categoryCounts,
}: PricingSidebarProps) {
  return (
    <div className="w-64 border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Filter by
        </h3>

        {/* All Options */}
        <button
          onClick={() => onViewChange('all', 'all')}
          className={`mb-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            selectedView === 'all'
              ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">All Options</span>
            <span className="text-xs text-slate-500">
              {Object.values(modelCounts).reduce((a, b) => a + b, 0) +
               Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </button>

        {/* Models Section */}
        <div className="mb-6 mt-6">
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            Models
          </h4>
          <div className="space-y-1">
            {MODEL_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => onViewChange(range.id, 'model')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedView === range.id
                    ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{range.name}</span>
                  <span className="text-xs text-slate-500">
                    {modelCounts[range.id] || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Extras Section */}
        <div>
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            Optional Extras
          </h4>
          <div className="space-y-1">
            {OPTION_CATEGORIES.filter(cat => (cat.id as string) !== 'base').map((category) => (
              <button
                key={category.id}
                onClick={() => onViewChange(category.id, 'category')}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedView === category.id
                    ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-xs text-slate-500">
                    {categoryCounts[category.id] || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
