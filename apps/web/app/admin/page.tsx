'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdmin } from './admin-context'
import type { PricingConfig } from '@/lib/pricing'
import ModelsTab from './components/ModelsTab'
import OptionsTab from './components/OptionsTab'
import AgentsTab from './components/AgentsTab'
import RegionTab from './components/RegionTab'

export default function AdminPage() {
  const { token } = useAdmin()
  const [config, setConfig] = useState<PricingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchConfig = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/pricing', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load pricing')
      const data: PricingConfig = await res.json()
      setConfig(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [token])

  if (loading) {
    return <p className="text-slate-500 text-center py-20">Loading pricing data...</p>
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchConfig} className="text-blue-600 underline">
          Retry
        </button>
      </div>
    )
  }

  if (!config) return null

  return (
    <Tabs defaultValue="models" className="space-y-6">
      <TabsList>
        <TabsTrigger value="models">Models</TabsTrigger>
        <TabsTrigger value="options">Options</TabsTrigger>
        <TabsTrigger value="agents">Agents</TabsTrigger>
        <TabsTrigger value="region">Region</TabsTrigger>
      </TabsList>

      <TabsContent value="models">
        <ModelsTab models={config.models} token={token} onRefresh={fetchConfig} />
      </TabsContent>

      <TabsContent value="options">
        <OptionsTab options={config.options} token={token} onRefresh={fetchConfig} />
      </TabsContent>

      <TabsContent value="agents">
        <AgentsTab agents={config.agents} token={token} onRefresh={fetchConfig} />
      </TabsContent>

      <TabsContent value="region">
        <RegionTab config={config} token={token} onRefresh={fetchConfig} />
      </TabsContent>
    </Tabs>
  )
}
