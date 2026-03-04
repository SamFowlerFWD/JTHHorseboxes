import { NextRequest, NextResponse } from 'next/server'

/**
 * Validate admin Bearer token against ADMIN_SECRET env var.
 * Returns null on success, or a 401 NextResponse on failure.
 */
export function validateAdmin(request: NextRequest): NextResponse | null {
  const auth = request.headers.get('authorization')
  const secret = process.env.ADMIN_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'Admin authentication not configured' },
      { status: 500 }
    )
  }

  if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== secret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return null // Authenticated
}
