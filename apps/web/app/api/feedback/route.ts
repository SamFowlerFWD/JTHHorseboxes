import { NextRequest, NextResponse } from 'next/server'
import { identifyCaller } from '@/lib/feedback/auth'
import { getAllFeedback, createFeedback } from '@/lib/feedback/kv'
import type { CreateFeedbackInput } from '@/lib/feedback/types'

export const runtime = 'edge'

const MAX_COMMENT_LENGTH = 2000

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
