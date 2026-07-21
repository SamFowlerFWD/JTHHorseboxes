import { NextRequest, NextResponse } from 'next/server'
import { identifyCaller } from '@/lib/feedback/auth'
import { updateFeedback, deleteFeedbackById } from '@/lib/feedback/kv'
import type { UpdateFeedbackInput } from '@/lib/feedback/types'

export const runtime = 'edge'

/** PATCH — change a note's status. Admin only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (identifyCaller(request) !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as UpdateFeedbackInput
    const updated = await updateFeedback(params.id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating feedback note:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to update note' },
      { status: 500 }
    )
  }
}

/** DELETE — remove a note. Admin only. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (identifyCaller(request) !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deleted = await deleteFeedbackById(params.id)
  if (!deleted) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
