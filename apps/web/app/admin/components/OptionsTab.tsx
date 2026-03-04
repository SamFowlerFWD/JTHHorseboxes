'use client'

import { useState, useMemo } from 'react'
import type { Option } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X, Pencil } from 'lucide-react'

type Props = { options: Option[]; token: string; onRefresh: () => void }

export default function OptionsTab({ options, token, onRefresh }: Props) {
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set(options.map(o => o.category || 'uncategorized'))
    return ['all', ...Array.from(cats).sort()]
  }, [options])

  const filtered = filter === 'all' ? options : options.filter(o => (o.category || 'uncategorized') === filter)

  const startEdit = (opt: Option) => {
    setEditingId(opt.id)
    setEditPrice((opt.pricePerUnitPence / 100).toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
  }

  const savePrice = async (opt: Option) => {
    setSaving(true)
    try {
      const pence = Math.round(parseFloat(editPrice) * 100)
      await fetch('/api/admin/pricing/options', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: opt.id, pricePerUnitPence: pence }),
      })
      setEditingId(null)
      onRefresh()
    } catch (err) {
      console.error('Failed to save option price:', err)
    } finally {
      setSaving(false)
    }
  }

  const formatGBP = (pence: number) =>
    `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat.replace(/-/g, ' ')}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Option</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((opt) => (
              <TableRow key={opt.id}>
                <TableCell className="font-medium">{opt.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{opt.type}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {opt.category || '—'}
                </TableCell>
                <TableCell>
                  {editingId === opt.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-28 h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePrice(opt)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => savePrice(opt)}
                        disabled={saving}
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <span>
                      {formatGBP(opt.pricePerUnitPence)}
                      {opt.unit ? ` / ${opt.unit}` : ''}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId !== opt.id && (
                    <Button size="sm" variant="ghost" onClick={() => startEdit(opt)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
