'use client'

import { useState } from 'react'
import type { Model } from '@/lib/pricing'
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

type Props = { models: Model[]; token: string; onRefresh: () => void }

export default function ModelsTab({ models, token, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (model: Model) => {
    setEditingId(model.id)
    setEditPrice(model.basePricePence !== null ? (model.basePricePence / 100).toString() : '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditPrice('')
  }

  const savePrice = async (model: Model) => {
    setSaving(true)
    try {
      const pence = editPrice ? Math.round(parseFloat(editPrice) * 100) : null
      await fetch('/api/admin/pricing/models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: model.id, basePricePence: pence }),
      })
      setEditingId(null)
      onRefresh()
    } catch (err) {
      console.error('Failed to save model price:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (model: Model) => {
    await fetch('/api/admin/pricing/models', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: model.id, active: !model.active }),
    })
    onRefresh()
  }

  const formatGBP = (pence: number | null) => {
    if (pence === null) return 'Contact'
    return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{model.category || '—'}</Badge>
              </TableCell>
              <TableCell>
                {editingId === model.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">£</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-32 h-8"
                      placeholder="e.g. 22000"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePrice(model)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => savePrice(model)}
                      disabled={saving}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <span>{formatGBP(model.basePricePence)}</span>
                )}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => toggleActive(model)}
                  className="cursor-pointer"
                >
                  <Badge variant={model.active ? 'default' : 'secondary'}>
                    {model.active ? 'Active' : 'Inactive'}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-sm text-slate-500">{model.notes || '—'}</TableCell>
              <TableCell>
                {editingId !== model.id && (
                  <Button size="sm" variant="ghost" onClick={() => startEdit(model)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
