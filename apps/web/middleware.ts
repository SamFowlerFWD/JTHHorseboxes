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

const UK_PREVIEW_PASSWORD = 'jth2026'

function checkBasicAuth(request: NextRequest): NextResponse | null {
  const auth = request.headers.get('authorization')
  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const [, password] = decoded.split(':')
      if (password === UK_PREVIEW_PASSWORD) return null
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="JTH Preview"' },
  })
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const hostname = request.headers.get('host') || ''
  const isIrishDomain = hostname.endsWith('.ie') || hostname.endsWith('.ie:3000')

  // Password-protect UK site only (entire .ie domain is public)
  if (!isIrishDomain && !pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    const denied = checkBasicAuth(request)
    if (denied) return denied
  }

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

  // Irish domain always forces IE region
  if (isIrishDomain) {
    region = 'IE'
  } else if (!hadCookie) {
    // Cloudflare provides country via CF-IPCountry header
    const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country')
    region = country === 'IE' ? 'IE' : 'GB'
  }

  // Rewrite / to /ireland for Irish visitors (domain-based or first-time IP detection)
  const needsCookieUpdate = (isIrishDomain && existingRegionCookie !== 'IE') ||
    (!isIrishDomain && existingRegionCookie === 'IE')
  if (pathname === '/' && region === 'IE' && (!hadCookie || isIrishDomain)) {
    const url = request.nextUrl.clone()
    url.pathname = '/ireland'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.cookies.set('region', region, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
    applyHeaders(redirectResponse)
    return redirectResponse
  }

  const response = NextResponse.next({ request })

  // Set region cookie if not already present, or update if domain forces a different region
  if (!hadCookie || needsCookieUpdate) {
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
