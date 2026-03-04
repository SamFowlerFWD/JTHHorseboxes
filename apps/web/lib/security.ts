/**
 * Security utilities and middleware for production
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limiter pass-through.
 * // TODO: implement distributed rate limiting via KV
 */
export function rateLimit(_identifier: string, _limit = 60): boolean {
  return true
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

/**
 * CORS configuration
 */
export function getCorsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || []
  
  if (process.env.NODE_ENV === 'development') {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  }

  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  }

  return {}
}

/**
 * Validate and sanitize input
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove any script tags and potentially dangerous HTML
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key])
      }
    }
    return sanitized
  }
  
  return input
}

/**
 * Check if request is from a bot
 */
export function isBot(userAgent?: string | null): boolean {
  if (!userAgent) return false
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /facebookexternalhit/i,
    /linkedinbot/i,
    /whatsapp/i,
    /slackbot/i,
  ]
  
  return botPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Generate a secure random token using crypto.getRandomValues(),
 * which is available in both Node.js and Cloudflare Workers.
 */
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length]
  }
  return token
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (UK format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+44|0)[1-9]\d{9,10}$/
  const cleaned = phone.replace(/\s/g, '')
  return phoneRegex.test(cleaned)
}

/**
 * Check for SQL injection patterns
 */
export function hasSqlInjectionPattern(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING)\b)/i,
    /('|(--|\/\*|\*\/|;))/,
    /(xp_|sp_|exec|execute)/i,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * API route wrapper with security checks
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    rateLimit?: number
    requireAuth?: boolean
  }
) {
  return async (req: NextRequest) => {
    // Rate limiting
    const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    if (options?.rateLimit && !rateLimit(identifier, options.rateLimit)) {
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

    // Add security headers
    const response = await handler(req)
    const securityHeaders = getSecurityHeaders()
    const corsHeaders = getCorsHeaders(req.headers.get('origin'))
    
    Object.entries({ ...securityHeaders, ...corsHeaders }).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}