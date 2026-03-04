'use client'

import { useState } from 'react'
import type { PricingConfig } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

type Props = { config: PricingConfig; token: string; onRefresh: () => void }

export default function RegionTab({ config, token, onRefresh }: Props) {
  const ieConfig = config.regionConfig?.IE
  const [vatRate, setVatRate] = useState((config.vatRate * 100).toString())
  const [depositPounds, setDepositPounds] = useState((config.depositDefaultPence / 100).toString())
  const [ieMarkup, setIeMarkup] = useState(ieConfig?.markup?.toString() ?? '1.15')
  const [ieExchange, setIeExchange] = useState(ieConfig?.exchangeRate?.toString() ?? '1.17')
  const [ieVat, setIeVat] = useState(ieConfig?.vatRate ? (ieConfig.vatRate * 100).toString() : '23')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/admin/pricing/region', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vatRate: parseFloat(vatRate) / 100,
          depositDefaultPence: Math.round(parseFloat(depositPounds) * 100),
          regionConfig: {
            IE: {
              vatRate: parseFloat(ieVat) / 100,
              currency: 'EUR',
              markup: parseFloat(ieMarkup),
              exchangeRate: parseFloat(ieExchange),
            },
          },
        }),
      })
      setSaved(true)
      onRefresh()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save region config:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-lg space-y-8">
      {/* GB Defaults */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-900">UK Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vat">VAT Rate (%)</Label>
            <Input
              id="vat"
              type="number"
              step="0.1"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deposit">Default Deposit (£)</Label>
            <Input
              id="deposit"
              type="number"
              step="1"
              value={depositPounds}
              onChange={(e) => setDepositPounds(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ireland */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-900">Ireland (IE)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ie-markup">Markup</Label>
            <Input
              id="ie-markup"
              type="number"
              step="0.01"
              value={ieMarkup}
              onChange={(e) => setIeMarkup(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ie-exchange">GBP → EUR Rate</Label>
            <Input
              id="ie-exchange"
              type="number"
              step="0.01"
              value={ieExchange}
              onChange={(e) => setIeExchange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ie-vat">IE VAT (%)</Label>
            <Input
              id="ie-vat"
              type="number"
              step="0.1"
              value={ieVat}
              onChange={(e) => setIeVat(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Region Settings'}
      </Button>
    </div>
  )
}
