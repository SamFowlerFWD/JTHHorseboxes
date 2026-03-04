import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, getSecurityHeaders } from '@/lib/security'

const CSP_HEADER =
  `default-src 'self'; ` +
  `script-src 'self' 'unsafe-inline'; ` +
  `style-src 'self' 'unsafe-inline'; ` +
  `img-src 'self' data: https: http: blob:; ` +
  `font-src 'self' data:; ` +
  `connect-src 'self' https://*.sanity.io; ` +
  `frame-src 'self'; ` +
  `frame-ancestors 'none'; ` +
  `base-uri 'self'; ` +
  `form-action 'self';`

function applyHeaders(response: NextResponse) {
  const headers = getSecurityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', CSP_HEADER)
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    if (!rateLimit(ip, 60)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            ...getSecurityHeaders(),
          },
        }
      )
    }
  }

  // Region detection and cookie persistence
  const existingRegionCookie = request.cookies.get('region')?.value
  const hadCookie = !!existingRegionCookie
  let region = existingRegionCookie || 'GB'

  if (!hadCookie) {
    // Cloudflare provides country via CF-IPCountry header
    const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country')
    region = country === 'IE' ? 'IE' : 'GB'
  }

  // Rewrite / to /ireland for first-time Irish IP visitors (no cookie yet)
  // Exclude /admin paths from region redirect
  if (pathname === '/' && region === 'IE' && !hadCookie && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/ireland'
    const rewriteResponse = NextResponse.rewrite(url, { request })
    rewriteResponse.cookies.set('region', region, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
    applyHeaders(rewriteResponse)
    return rewriteResponse
  }

  const response = NextResponse.next({ request })

  // Set region cookie if not already present
  if (!hadCookie) {
    response.cookies.set('region', region, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  applyHeaders(response)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
