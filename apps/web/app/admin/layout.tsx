'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Lock } from 'lucide-react'
import { AdminContext } from './admin-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token')
    if (saved) setToken(saved)
    setChecking(false)
  }, [])

  const handleLogin = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/pricing', {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (res.ok) {
        sessionStorage.setItem('admin_token', password)
        setToken(password)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Failed to connect')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_token')
    setToken(null)
    setPassword('')
  }

  if (checking) return null

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-semibold text-slate-900">JTH Admin</h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin secret"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AdminContext.Provider value={{ token, logout }}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">JTH Pricing Admin</h1>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AdminContext.Provider>
  )
}
