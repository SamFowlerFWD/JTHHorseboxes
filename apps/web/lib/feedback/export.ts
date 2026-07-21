import type { FeedbackNote } from './types'
import { FEEDBACK_CATEGORIES } from './types'

/**
 * Turning a review round into something workable outside the dashboard —
 * a spreadsheet to sort and assign, or a checklist to paste into a ticket.
 */

function categoryLabel(note: FeedbackNote): string {
  return FEEDBACK_CATEGORIES.find((c) => c.value === note.category)?.label ?? note.category
}

function statusLabel(note: FeedbackNote): string {
  return note.status === 'in-progress' ? 'In progress' : note.status === 'done' ? 'Done' : 'Open'
}

/** RFC 4180: wrap in quotes and double any embedded quote. */
function csvCell(value: string): string {
  const needsQuoting = /[",\n\r]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuoting ? `"${escaped}"` : escaped
}

const CSV_COLUMNS = [
  'Page',
  'Status',
  'Type',
  'What they want changed',
  'Element',
  'Left by',
  'Date',
] as const

export function toCSV(notes: FeedbackNote[]): string {
  const rows = notes.map((note) =>
    [
      note.path,
      statusLabel(note),
      categoryLabel(note),
      note.comment,
      note.elementText,
      note.author,
      new Date(note.createdAt).toLocaleString('en-GB'),
    ]
      .map((cell) => csvCell(cell ?? ''))
      .join(',')
  )

  // Excel opens UTF-8 CSV as the local codepage unless it sees a BOM, which
  // mangles the pound signs and curly quotes that show up in this content.
  return '﻿' + [CSV_COLUMNS.join(','), ...rows].join('\r\n')
}

/** Markdown checklist, grouped by page — pastes into Notion, Linear or a PR. */
export function toMarkdownChecklist(notes: FeedbackNote[]): string {
  const byPage = new Map<string, FeedbackNote[]>()
  for (const note of notes) {
    const existing = byPage.get(note.path)
    if (existing) existing.push(note)
    else byPage.set(note.path, [note])
  }

  const lines: string[] = ['# JTH website feedback', '']

  const open = notes.filter((n) => n.status !== 'done').length
  lines.push(`${notes.length} notes, ${open} still to do.`, '')

  for (const [path, pageNotes] of Array.from(byPage.entries()).sort()) {
    lines.push(`## ${path}`, '')
    for (const note of pageNotes) {
      const box = note.status === 'done' ? '[x]' : '[ ]'
      const comment = note.comment.replace(/\s*\n\s*/g, ' ').trim()
      lines.push(`- ${box} **${categoryLabel(note)}** — ${comment}`)
      if (note.elementText) {
        lines.push(`  - Element: “${note.elementText}”`)
      }
      lines.push(`  - ${note.author}, ${new Date(note.createdAt).toLocaleDateString('en-GB')}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
