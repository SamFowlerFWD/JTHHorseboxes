'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdmin } from '../admin-context'
import { FEEDBACK_CATEGORIES } from '@/lib/feedback/types'
import type { FeedbackNote, FeedbackStatus } from '@/lib/feedback/types'
import { Loader2, Trash2, ExternalLink, Inbox } from 'lucide-react'

const STATUS_TABS: { value: FeedbackStatus | 'all'; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
]

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  open: 'bg-amber-100 text-amber-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
}

export default function FeedbackAdminPage() {
  const { token } = useAdmin()
  const [notes, setNotes] = useState<FeedbackNote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('open')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load feedback')
      setNotes(await res.json())
    } catch (e: any) {
      setError(e.message ?? 'Could not load feedback')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id: string, status: FeedbackStatus) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Could not update note')
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status } : n)))
    } catch (e: any) {
      setError(e.message ?? 'Could not update note')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this note? This cannot be undone.')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not delete note')
      setNotes((prev) => prev.filter((n) => n.id !== id))
    } catch (e: any) {
      setError(e.message ?? 'Could not delete note')
    } finally {
      setBusyId(null)
    }
  }

  const visible = useMemo(
    () => (filter === 'all' ? notes : notes.filter((n) => n.status === filter)),
    [notes, filter]
  )

  /** Grouped by page, so a round of edits can be worked through one page at a time. */
  const byPage = useMemo(() => {
    const groups = new Map<string, FeedbackNote[]>()
    for (const note of visible) {
      const existing = groups.get(note.path)
      if (existing) existing.push(note)
      else groups.set(note.path, [note])
    }
    return Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length)
  }, [visible])

  const counts = useMemo(
    () => ({
      open: notes.filter((n) => n.status === 'open').length,
      'in-progress': notes.filter((n) => n.status === 'in-progress').length,
      done: notes.filter((n) => n.status === 'done').length,
      all: notes.length,
    }),
    [notes]
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Client feedback</h1>
        <p className="mt-1 text-sm text-slate-500">
          Notes left by JTH on the UK preview site.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-60">{counts[tab.value]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading feedback…
        </div>
      ) : byPage.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">
            {filter === 'all' ? 'No feedback yet.' : `Nothing ${filter === 'in-progress' ? 'in progress' : filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {byPage.map(([path, pageNotes]) => (
            <section key={path}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-mono text-sm font-medium text-slate-900">{path}</h2>
                <a
                  href={path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-blue-600"
                  aria-label={`Open ${path} in a new tab`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-xs text-slate-400">
                  {pageNotes.length} {pageNotes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>

              <ul className="space-y-3">
                {pageNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[note.status]}`}>
                        {note.status === 'in-progress' ? 'In progress' : note.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {FEEDBACK_CATEGORIES.find((c) => c.value === note.category)?.label ?? note.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {note.author} · {new Date(note.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-sm text-slate-800">{note.comment}</p>

                    {note.elementText && (
                      <p className="mt-2 border-l-2 border-slate-200 pl-3 text-xs italic text-slate-500">
                        “{note.elementText}”
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {(['open', 'in-progress', 'done'] as FeedbackStatus[])
                        .filter((s) => s !== note.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus(note.id, s)}
                            disabled={busyId === note.id}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Mark {s === 'in-progress' ? 'in progress' : s}
                          </button>
                        ))}
                      <button
                        onClick={() => remove(note.id)}
                        disabled={busyId === note.id}
                        className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
