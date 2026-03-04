'use client'

import { useState } from 'react'
import type { Agent } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

type Props = { agents: Agent[]; token: string; onRefresh: () => void }

export default function AgentsTab({ agents, token, onRefresh }: Props) {
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const addAgent = async () => {
    if (!newName.trim() || !newEmail.trim()) return
    setSaving(true)
    try {
      await fetch('/api/admin/pricing/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
      })
      setNewName('')
      setNewEmail('')
      onRefresh()
    } catch (err) {
      console.error('Failed to add agent:', err)
    } finally {
      setSaving(false)
    }
  }

  const removeAgent = async (email: string) => {
    if (!confirm('Remove this agent?')) return
    try {
      await fetch(`/api/admin/pricing/agents?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      onRefresh()
    } catch (err) {
      console.error('Failed to remove agent:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add agent form */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-700 mb-4">Add Agent</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Agent name"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="agent-email">Email</Label>
            <Input
              id="agent-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="agent@example.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') addAgent()
              }}
            />
          </div>
          <Button onClick={addAgent} disabled={saving || !newName || !newEmail}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Agents table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.email}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell className="text-slate-600">{agent.email}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAgent(agent.email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  No agents configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
