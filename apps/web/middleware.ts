import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, getSecurityHeaders } from '@/lib/security'

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/ops': ['admin', 'staff', 'viewer'],
  '/ops/settings': ['admin'],
  '/ops/pipeline': ['admin', 'staff'],
  '/ops/builds': ['admin', 'staff'],
  '/ops/inventory': ['admin', 'staff'],
  '/ops/customers': ['admin', 'staff'],
  '/ops/quotes': ['admin', 'staff'],
  '/ops/knowledge': ['admin', 'staff', 'viewer'],
  '/ops/reports': ['admin', 'staff', 'viewer'],
  '/api/ops': ['admin', 'staff', 'viewer'], // Protect all /api/ops/* API routes
  '/api/search/admin': ['admin'], // Protect search admin endpoint
  '/admin': ['admin'],
}

// Session timeout in milliseconds (30 minutes default)
const SESSION_TIMEOUT = 30 * 60 * 1000

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Rate limiting for all routes
  const identifier = ip
  const isAuthApiRoute = pathname.startsWith('/api/auth') // Only API auth routes, not login pages
  const isApiRoute = pathname.startsWith('/api')
  const isOpsRoute = pathname.startsWith('/ops')

  // Apply stricter rate limiting for auth API routes (actual login/logout endpoints)
  if (isAuthApiRoute) {
    if (!rateLimit(identifier, 10)) { // 10 attempts per minute for auth API
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            ...getSecurityHeaders()
          }
        }
      )
    }
  } else if (isApiRoute) {
    if (!rateLimit(identifier, 60)) { // 60 requests per minute for API
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            ...getSecurityHeaders()
          }
        }
      )
    }
  } else if (isOpsRoute) {
    if (!rateLimit(identifier, 100)) { // 100 requests per minute for ops pages
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            ...getSecurityHeaders()
          }
        }
      )
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  // Enhanced CSP header for production
  // Note: 'unsafe-inline' is required for Next.js inline scripts
  // Note: upgrade-insecure-requests is removed since VPS doesn't have SSL yet
  if (process.env.NODE_ENV === 'production') {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    supabaseResponse.headers.set('X-Nonce', nonce)
    supabaseResponse.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; ` +
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://vercel.live; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      `img-src 'self' data: https: http: blob:; ` +
      `font-src 'self' data:; ` +
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live http:; ` +
      `frame-src 'self'; ` +
      `frame-ancestors 'none'; ` +
      `base-uri 'self'; ` +
      `form-action 'self';`
    )
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user and session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Check if this is a protected route
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some(route => 
    pathname.startsWith(route)
  )
  
  // Allow access to login page
  if (pathname === '/ops/login') {
    // If already logged in, redirect to ops dashboard
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/ops'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute) {
    if (!user) {
      // Store the original URL to redirect back after login
      const url = request.nextUrl.clone()
      url.pathname = '/ops/login'
      url.searchParams.set('redirect', pathname)
      
      // Log unauthorized access attempt
      console.warn(`Unauthorized access attempt to ${pathname} from ${ip}`)
      
      return NextResponse.redirect(url)
    }

    // Get user profile with role (with caching)
    const PROFILE_CACHE_TIME = 60 * 1000 // 1 minute cache
    const profileCacheKey = `profile_${user.id}`
    const cachedProfileStr = request.cookies.get(profileCacheKey)?.value

    let profile
    if (cachedProfileStr) {
      try {
        const cached = JSON.parse(cachedProfileStr)
        if (Date.now() - cached.cached_at < PROFILE_CACHE_TIME) {
          profile = cached.data
        }
      } catch (e) {
        // Invalid cache, fetch fresh
      }
    }

    // Fetch fresh profile if not cached
    if (!profile) {
      const { data: freshProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active, locked_until, last_login')
        .eq('id', user.id)
        .single()

      if (profileError || !freshProfile) {
        console.error('Failed to fetch user profile:', profileError)
        const url = request.nextUrl.clone()
        url.pathname = '/ops/login'
        return NextResponse.redirect(url)
      }

      profile = freshProfile

      // Cache the profile
      supabaseResponse.cookies.set(profileCacheKey, JSON.stringify({
        data: profile,
        cached_at: Date.now()
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 // 1 minute
      })
    }

    // Check if account is locked
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      const url = request.nextUrl.clone()
      url.pathname = '/ops/locked'
      return NextResponse.redirect(url)
    }

    // Check if account is active
    if (!profile.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = '/ops/inactive'
      return NextResponse.redirect(url)
    }

    // Check session timeout
    if (profile.last_login) {
      const lastLogin = new Date(profile.last_login).getTime()
      const now = Date.now()
      if (now - lastLogin > SESSION_TIMEOUT) {
        // Session expired, force re-authentication
        await supabase.auth.signOut()
        const url = request.nextUrl.clone()
        url.pathname = '/ops/login'
        url.searchParams.set('message', 'Session expired. Please log in again.')
        return NextResponse.redirect(url)
      }
    }

    // Check role-based access
    const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => 
      pathname.startsWith(route)
    )?.[1]

    if (requiredRoles && !requiredRoles.includes(profile.role)) {
      // Log unauthorized access attempt (async - don't block request)
      void supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_event_type: 'data_access',
        p_action: 'Unauthorized access attempt',
        p_resource_type: 'ops',
        p_resource_id: pathname,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}, User role: ${profile.role}`
      }).then(() => {}, (err: Error) => console.error('Audit logging failed:', err))

      const url = request.nextUrl.clone()
      url.pathname = '/ops/unauthorized'
      return NextResponse.redirect(url)
    }

    // Log successful access for audit trail (async - don't block request)
    if (pathname.includes('/customers') || pathname.includes('/quotes')) {
      void supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_event_type: 'data_access',
        p_action: 'Page access',
        p_resource_type: 'ops',
        p_resource_id: pathname,
        p_ip_address: ip,
        p_user_agent: userAgent,
        p_personal_data: pathname.includes('/customers'),
        p_data_categories: pathname.includes('/customers') ? ['customer_data'] : null
      }).then(() => {}, (err: Error) => console.error('Audit logging failed:', err))
    }

    // Update last activity timestamp less frequently (every 5 minutes instead of every request)
    const LAST_LOGIN_UPDATE_INTERVAL = 5 * 60 * 1000 // 5 minutes
    const shouldUpdateLastLogin = !profile.last_login ||
      (Date.now() - new Date(profile.last_login).getTime() > LAST_LOGIN_UPDATE_INTERVAL)

    if (shouldUpdateLastLogin) {
      // Update async, don't block the request
      void supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)
        .then(() => {
          // Invalidate profile cache on successful update
          supabaseResponse.cookies.delete(profileCacheKey)
        }, (err: Error) => console.error('Failed to update last_login:', err))
    }
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}