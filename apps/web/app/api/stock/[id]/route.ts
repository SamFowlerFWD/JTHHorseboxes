import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { getStockById, updateStock, deleteStockById } from '@/lib/stock/kv'
import type { UpdateStockInput } from '@/lib/stock/types'

export const runtime = 'edge'

/** GET — get a single stock listing by ID (public) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const listing = await getStockById(id)

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  return NextResponse.json(listing)
}

/** PUT — update a stock listing (admin only) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: UpdateStockInput = await request.json()
    const updated = await updateStock(id, body)

    if (!updated) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating stock listing:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to update stock listing' },
      { status: 500 }
    )
  }
}

/** DELETE — delete a stock listing (admin only) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const denied = validateAdmin(request)
  if (denied) return denied

  const deleted = await deleteStockById(id)

  if (!deleted) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
