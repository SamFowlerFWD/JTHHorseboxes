import { NextRequest, NextResponse } from 'next/server'
import { identifyCaller } from '@/lib/feedback/auth'
import {
  getAllFeedback,
  createFeedback,
  updateManyFeedback,
  deleteManyFeedback,
} from '@/lib/feedback/kv'
import type { CreateFeedbackInput, FeedbackStatus } from '@/lib/feedback/types'

export const runtime = 'edge'

const MAX_COMMENT_LENGTH = 2000
/** Guards against a malformed client sending an unbounded id list. */
const MAX_BULK_IDS = 500
const VALID_STATUSES: FeedbackStatus[] = ['open', 'in-progress', 'done']

/** GET — list notes. `?path=` scopes to one page, for rendering pins. */
export async function GET(request: NextRequest) {
  const caller = identifyCaller(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path') ?? undefined
  const notes = await getAllFeedback(path)
  return NextResponse.json(notes)
}

/** POST — leave a note. Open to reviewers as well as admins. */
export async function POST(request: NextRequest) {
  const caller = identifyCaller(request)
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as CreateFeedbackInput

    if (!body.comment?.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }
    if (body.comment.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be under ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      )
    }
    if (!body.path?.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const note = await createFeedback({
      path: body.path,
      selector: body.selector ?? '',
      elementText: (body.elementText ?? '').slice(0, 200),
      xPercent: Number(body.xPercent) || 0,
      yPercent: Number(body.yPercent) || 0,
      comment: body.comment.trim(),
      category: body.category ?? 'other',
      author: (body.author ?? '').slice(0, 60) || 'Anonymous',
      viewportWidth: Number(body.viewportWidth) || 0,
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error: any) {
    console.error('Error creating feedback note:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to save note' },
      { status: 500 }
    )
  }
}

/** Read and validate an id list from a bulk request body. */
function parseIds(value: unknown): string[] | NextResponse {
  if (!Array.isArray(value) || value.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
  }
  if (value.length > MAX_BULK_IDS) {
    return NextResponse.json(
      { error: `Cannot process more than ${MAX_BULK_IDS} notes at once` },
      { status: 400 }
    )
  }
  return value.filter((id): id is string => typeof id === 'string')
}

/** PATCH — change the status of many notes at once. Admin only. */
export async function PATCH(request: NextRequest) {
  if (identifyCaller(request) !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { ids?: unknown; status?: FeedbackStatus }

    const ids = parseIds(body.ids)
    if (ids instanceof NextResponse) return ids

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await updateManyFeedback(ids, { status: body.status })
    return NextResponse.json({ updated, count: updated.length })
  } catch (error: any) {
    console.error('Error bulk-updating feedback:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to update notes' },
      { status: 500 }
    )
  }
}

/** DELETE — remove many notes at once. Admin only. */
export async function DELETE(request: NextRequest) {
  if (identifyCaller(request) !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { ids?: unknown }

    const ids = parseIds(body.ids)
    if (ids instanceof NextResponse) return ids

    const deleted = await deleteManyFeedback(ids)
    return NextResponse.json({ deleted, count: deleted.length })
  } catch (error: any) {
    console.error('Error bulk-deleting feedback:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to delete notes' },
      { status: 500 }
    )
  }
}
