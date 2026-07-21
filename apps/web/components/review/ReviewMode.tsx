'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { MessageSquarePlus, X, Check, Loader2 } from 'lucide-react'
import { FEEDBACK_CATEGORIES } from '@/lib/feedback/types'
import type { FeedbackCategory, FeedbackNote } from '@/lib/feedback/types'
import { buildSelector, findElement, ownTextOf, describeElement } from './selector'

/**
 * Click-to-comment overlay for the UK preview.
 *
 * Only mounts on the preview host. The Irish site is live to the public, so
 * it is excluded explicitly rather than by omission — see isReviewHost.
 */

function isReviewHost(hostname: string): boolean {
  // The Irish site is public; the tool must never appear there.
  if (hostname.endsWith('.ie')) return false
  return (
    hostname.endsWith('.pages.dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  )
}

interface Draft {
  selector: string
  elementText: string
  label: string
  xPercent: number
  yPercent: number
  /** Viewport coordinates of the click — the composer is fixed, so it cannot
   *  scroll out of reach while someone is part-way through typing. */
  viewTop: number
  viewLeft: number
}

const COMPOSER_WIDTH = 320
const COMPOSER_HEIGHT = 330
const NOTE_WIDTH = 288
const NOTE_HEIGHT = 160
const EDGE_GAP = 12

/** Keep a fixed panel fully on screen regardless of where the click landed. */
function clampToViewport(top: number, left: number, width: number, height: number) {
  const maxLeft = window.innerWidth - width - EDGE_GAP
  const maxTop = window.innerHeight - height - EDGE_GAP
  return {
    top: Math.max(EDGE_GAP, Math.min(top, maxTop)),
    left: Math.max(EDGE_GAP, Math.min(left, maxLeft)),
  }
}

interface PositionedNote extends FeedbackNote {
  docTop: number
  docLeft: number
  orphaned: boolean
}

export default function ReviewMode() {
  const pathname = usePathname()
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const [notes, setNotes] = useState<FeedbackNote[]>([])
  const [positioned, setPositioned] = useState<PositionedNote[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [openNote, setOpenNote] = useState<{ note: FeedbackNote; top: number; left: number } | null>(null)
  const [hoverBox, setHoverBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const [author, setAuthor] = useState('')
  const [comment, setComment] = useState('')
  const [category, setCategory] = useState<FeedbackCategory>('copy')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isReviewHost(window.location.hostname)) setEnabled(true)
    setAuthor(localStorage.getItem('jth_review_author') ?? '')
  }, [])

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/feedback?path=${encodeURIComponent(pathname)}`)
      if (res.ok) setNotes(await res.json())
    } catch {
      // Preview-only tool — a failed load just means no pins this session
    }
  }, [pathname])

  useEffect(() => {
    if (enabled) loadNotes()
  }, [enabled, loadNotes])

  /**
   * Pin positions are stored in document coordinates, so they survive
   * scrolling untouched and only need recomputing when layout changes.
   */
  const reposition = useCallback(() => {
    setPositioned(
      notes.map((note) => {
        const el = findElement(note.selector, note.elementText)
        if (!el) {
          return { ...note, docTop: 0, docLeft: 0, orphaned: true }
        }
        const rect = el.getBoundingClientRect()
        return {
          ...note,
          docTop: rect.top + window.scrollY + (note.yPercent / 100) * rect.height,
          docLeft: rect.left + window.scrollX + (note.xPercent / 100) * rect.width,
          orphaned: false,
        }
      })
    )
  }, [notes])

  useEffect(() => {
    if (!enabled) return
    reposition()
    window.addEventListener('resize', reposition)
    window.addEventListener('load', reposition)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('load', reposition)
    }
  }, [enabled, reposition])

  // The open note is fixed to where its pin was, so dismiss it once the pin
  // has scrolled away rather than letting it float free of its anchor.
  useEffect(() => {
    if (!openNote) return
    const dismiss = () => setOpenNote(null)
    window.addEventListener('scroll', dismiss, { passive: true })
    return () => window.removeEventListener('scroll', dismiss)
  }, [openNote])

  // Element picking
  useEffect(() => {
    if (!active || draft) {
      setHoverBox(null)
      return
    }

    // Coalesce to one update per frame — a raw mousemove handler re-renders
    // the whole overlay dozens of times a second.
    let frame = 0
    const onMove = (e: MouseEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const target = e.target as Element | null
        if (!target || target.closest('[data-review-overlay]')) {
          setHoverBox(null)
          return
        }
        const rect = target.getBoundingClientRect()
        setHoverBox({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        })
      })
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target || target.closest('[data-review-overlay]')) return

      e.preventDefault()
      e.stopPropagation()

      const rect = target.getBoundingClientRect()
      setDraft({
        selector: buildSelector(target),
        elementText: ownTextOf(target),
        label: describeElement(target),
        xPercent: rect.width ? ((e.clientX - rect.left) / rect.width) * 100 : 50,
        yPercent: rect.height ? ((e.clientY - rect.top) / rect.height) * 100 : 50,
        viewTop: e.clientY,
        viewLeft: e.clientX,
      })
      setComment('')
      setError('')
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey)
    document.body.style.cursor = 'crosshair'

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey)
      document.body.style.cursor = ''
    }
  }, [active, draft])

  useEffect(() => {
    if (draft) textareaRef.current?.focus()
  }, [draft])

  const save = async () => {
    if (!draft || !comment.trim()) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          selector: draft.selector,
          elementText: draft.elementText,
          xPercent: draft.xPercent,
          yPercent: draft.yPercent,
          comment,
          category,
          author,
          viewportWidth: window.innerWidth,
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? 'Could not save your note')
      }

      localStorage.setItem('jth_review_author', author)
      setDraft(null)
      setComment('')
      await loadNotes()
    } catch (e: any) {
      setError(e.message ?? 'Could not save your note')
    } finally {
      setSaving(false)
    }
  }

  if (!enabled) return null

  const overlay = (
    <div data-review-overlay>
      {/* Hover highlight */}
      {active && hoverBox && !draft && (
        <div
          className="pointer-events-none absolute z-[9998] rounded-sm ring-2 ring-blue-500/70 bg-blue-500/10 transition-all duration-75"
          style={{
            top: hoverBox.top,
            left: hoverBox.left,
            width: hoverBox.width,
            height: hoverBox.height,
            position: 'absolute',
          }}
        />
      )}

      {/* Existing pins */}
      {positioned
        .filter((n) => !n.orphaned && n.status !== 'done')
        .map((note, i) => (
          <button
            key={note.id}
            onClick={(e) => {
              if (openNote?.note.id === note.id) {
                setOpenNote(null)
                return
              }
              const rect = e.currentTarget.getBoundingClientRect()
              setOpenNote({ note, top: rect.bottom, left: rect.left + rect.width / 2 })
            }}
            style={{ position: 'absolute', top: note.docTop, left: note.docLeft }}
            className="z-[9998] -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110"
            aria-label={`Note ${i + 1}: ${note.comment.slice(0, 40)}`}
          >
            {i + 1}
          </button>
        ))}

      {/* Opened note */}
      {openNote && (
        <div
          style={{
            position: 'fixed',
            ...clampToViewport(openNote.top + 8, openNote.left - NOTE_WIDTH / 2, NOTE_WIDTH, NOTE_HEIGHT),
            width: NOTE_WIDTH,
          }}
          className="z-[9999] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
              {FEEDBACK_CATEGORIES.find((c) => c.value === openNote.note.category)?.label ?? 'Note'}
            </span>
            <button
              onClick={() => setOpenNote(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close note"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{openNote.note.comment}</p>
          <p className="mt-3 text-xs text-slate-400">
            {openNote.note.author} · {new Date(openNote.note.createdAt).toLocaleDateString('en-GB')}
          </p>
        </div>
      )}

      {/* Composer */}
      {draft && (
        <div
          style={{
            position: 'fixed',
            ...clampToViewport(
              draft.viewTop + EDGE_GAP,
              draft.viewLeft - COMPOSER_WIDTH / 2,
              COMPOSER_WIDTH,
              COMPOSER_HEIGHT
            ),
            width: COMPOSER_WIDTH,
          }}
          className="z-[9999] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Suggest a change</p>
              <p className="truncate text-xs text-slate-500" title={draft.label}>
                {draft.label}
              </p>
            </div>
            <button
              onClick={() => setDraft(null)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="review-category">
            What kind of change?
          </label>
          <select
            id="review-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
            className="mb-3 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {FEEDBACK_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What would you like changed here?"
            rows={3}
            maxLength={2000}
            className="mb-3 w-full resize-none rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="mb-3 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDraft(null)}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !comment.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save note
            </button>
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => {
          setActive(!active)
          setDraft(null)
          setOpenNote(null)
        }}
        className={`fixed bottom-5 right-5 z-[9999] inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-xl transition-colors ${
          active
            ? 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {active ? (
          <>
            <X className="h-4 w-4" />
            Done reviewing
          </>
        ) : (
          <>
            <MessageSquarePlus className="h-4 w-4" />
            Suggest an edit
            {positioned.filter((n) => n.status !== 'done' && !n.orphaned).length > 0 && (
              <span className="ml-1 rounded-full bg-white/25 px-1.5 py-0.5 text-xs">
                {positioned.filter((n) => n.status !== 'done' && !n.orphaned).length}
              </span>
            )}
          </>
        )}
      </button>

      {active && !draft && (
        <div className="fixed bottom-20 right-5 z-[9999] max-w-[16rem] rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg">
          Click anything on the page to leave a note. Press Esc to stop.
        </div>
      )}
    </div>
  )

  return typeof document === 'undefined' ? null : createPortal(overlay, document.body)
}
