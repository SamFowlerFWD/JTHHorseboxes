'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdmin } from '../admin-context'
import { FEEDBACK_CATEGORIES } from '@/lib/feedback/types'
import type { FeedbackNote, FeedbackStatus } from '@/lib/feedback/types'
import { toCSV, toMarkdownChecklist } from '@/lib/feedback/export'
import { Loader2, Trash2, ExternalLink, Inbox, Download, ClipboardCheck, Check } from 'lucide-react'

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
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const authHeaders = useMemo(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', { headers: { Authorization: `Bearer ${token}` } })
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

  const visible = useMemo(
    () => (filter === 'all' ? notes : notes.filter((n) => n.status === filter)),
    [notes, filter]
  )

  // Selecting a note then switching tabs would otherwise act on rows the user
  // can no longer see.
  useEffect(() => {
    setSelected((prev) => {
      const stillVisible = new Set(visible.map((n) => n.id))
      const next = new Set(Array.from(prev).filter((id) => stillVisible.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [visible])

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

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)))
      return next
    })

  const allVisibleSelected = visible.length > 0 && visible.every((n) => selected.has(n.id))

  const bulkStatus = async (status: FeedbackStatus) => {
    const ids = Array.from(selected)
    if (!ids.length) return
    setBusy(true)
    setError('')
    // Optimistic — the list re-sorts immediately rather than after a round trip.
    const previous = notes
    setNotes((prev) => prev.map((n) => (selected.has(n.id) ? { ...n, status } : n)))
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ ids, status }),
      })
      if (!res.ok) throw new Error('Could not update the selected notes')
      setSelected(new Set())
    } catch (e: any) {
      setNotes(previous)
      setError(e.message ?? 'Could not update the selected notes')
    } finally {
      setBusy(false)
    }
  }

  const bulkDelete = async () => {
    const ids = Array.from(selected)
    if (!ids.length) return
    if (!confirm(`Delete ${ids.length} note${ids.length === 1 ? '' : 's'}? This cannot be undone.`))
      return
    setBusy(true)
    setError('')
    const previous = notes
    setNotes((prev) => prev.filter((n) => !selected.has(n.id)))
    try {
      const res = await fetch('/api/feedback', {
        method: 'DELETE',
        headers: authHeaders,
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error('Could not delete the selected notes')
      setSelected(new Set())
    } catch (e: any) {
      setNotes(previous)
      setError(e.message ?? 'Could not delete the selected notes')
    } finally {
      setBusy(false)
    }
  }

  /** Export what's on screen, so the status filter doubles as an export filter. */
  const exportRows = visible

  const downloadCSV = () => {
    const blob = new Blob([toCSV(exportRows)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jth-feedback-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyChecklist = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdownChecklist(exportRows))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy to clipboard')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Client feedback</h1>
          <p className="mt-1 text-sm text-slate-500">
            Notes left by JTH on the UK preview site.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyChecklist}
            disabled={!exportRows.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <ClipboardCheck className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy checklist'}
          </button>
          <button
            onClick={downloadCSV}
            disabled={!exportRows.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
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

      {visible.length > 0 && (
        <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={(e) => toggleMany(visible.map((n) => n.id), e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          Select all {visible.length} shown
        </label>
      )}

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
            {filter === 'all'
              ? 'No feedback yet.'
              : `Nothing ${filter === 'in-progress' ? 'in progress' : filter}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-8 pb-24">
          {byPage.map(([path, pageNotes]) => {
            const ids = pageNotes.map((n) => n.id)
            const allSelected = pageNotes.every((n) => selected.has(n.id))
            return (
              <section key={path}>
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleMany(ids, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                    aria-label={`Select all notes on ${path}`}
                  />
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
                      className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                        selected.has(note.id) ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={selected.has(note.id)}
                          onChange={() => toggle(note.id)}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                          aria-label={`Select note: ${note.comment.slice(0, 40)}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[note.status]}`}
                            >
                              {note.status === 'in-progress' ? 'In progress' : note.status}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              {FEEDBACK_CATEGORIES.find((c) => c.value === note.category)?.label ??
                                note.category}
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
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* Bulk action bar — appears once anything is ticked */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
            <span className="text-sm font-medium text-slate-900">
              {selected.size} selected
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-slate-500 underline hover:text-slate-700"
            >
              Clear
            </button>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                onClick={() => bulkStatus('done')}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Mark done
              </button>
              <button
                onClick={() => bulkStatus('in-progress')}
                disabled={busy}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                In progress
              </button>
              <button
                onClick={() => bulkStatus('open')}
                disabled={busy}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Reopen
              </button>
              <button
                onClick={bulkDelete}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
