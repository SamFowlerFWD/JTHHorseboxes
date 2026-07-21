import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/admin-auth'
import { getAllStock, createStock } from '@/lib/stock/kv'
import type { CreateStockInput } from '@/lib/stock/types'

export const runtime = 'edge'

/** GET — list stock listings (public: available only, ?status=all for admin) */
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') ?? 'available'
  const listings = await getAllStock(status)
  return NextResponse.json(listings)
}

/** POST — create a new stock listing (admin only) */
export async function POST(request: NextRequest) {
  const denied = validateAdmin(request)
  if (denied) return denied

  try {
    const body: CreateStockInput = await request.json()
    const listing = await createStock(body)
    return NextResponse.json(listing, { status: 201 })
  } catch (error: any) {
    console.error('Error creating stock listing:', error)
    return NextResponse.json(
      { error: error.message ?? 'Failed to create stock listing' },
      { status: 500 }
    )
  }
}
