import { NextRequest } from 'next/server'

/**
 * The review tool has two callers with different rights:
 *
 *  - the reviewer (JTH), who reaches the preview through the site-wide HTTP
 *    basic auth wall in middleware.ts. Browsers re-send those credentials on
 *    same-origin fetches, so the overlay authenticates for free.
 *  - the admin (us), whose dashboard sends an explicit Bearer token. An
 *    explicit Authorization header replaces the automatic basic one, so the
 *    two never collide.
 *
 * Reviewers may read and add notes. Only admins may change status or delete.
 */

export type Caller = 'admin' | 'reviewer' | null

/** Kept in step with UK_PREVIEW_PASSWORD in middleware.ts */
const REVIEW_PASSWORD = process.env.UK_PREVIEW_PASSWORD ?? 'jth2026'

export function identifyCaller(request: NextRequest): Caller {
  // Local dev bypasses the basic-auth wall (see middleware.ts), so there are
  // no credentials to inspect and the caller is trusted by definition.
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return 'admin'

  const auth = request.headers.get('authorization')
  if (!auth) return null

  const [scheme, encoded] = auth.split(' ')
  if (!encoded) return null

  if (scheme === 'Bearer') {
    const secret = process.env.ADMIN_SECRET
    return secret && encoded === secret ? 'admin' : null
  }

  if (scheme === 'Basic') {
    try {
      const [, password] = atob(encoded).split(':')
      return password === REVIEW_PASSWORD ? 'reviewer' : null
    } catch {
      return null
    }
  }

  return null
}
