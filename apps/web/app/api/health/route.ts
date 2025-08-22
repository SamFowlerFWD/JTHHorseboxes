import { NextRequest, NextResponse } from 'next/server'
import { loadPricingConfig } from '@/lib/pricing'
import { createClient } from '@/lib/supabase/server'

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const checks: Record<string, any> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Check if pricing config can be loaded
    try {
      const cfg = await loadPricingConfig()
      checks.pricing = {
        status: 'ok',
        models: cfg.models.length,
        options: cfg.options.length
      }
    } catch (error) {
      checks.pricing = {
        status: 'error',
        error: 'Failed to load pricing config'
      }
    }

    // Check database connectivity
    try {
      const supabase = await createClient()
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      
      checks.database = {
        status: 'ok',
        connected: true,
        leads_table: 'accessible'
      }
    } catch (error: any) {
      checks.database = {
        status: 'error',
        connected: false,
        error: error.message || 'Database connection failed'
      }
    }

    // Check external services (when implemented)
    checks.services = {
      email: { status: 'pending', provider: 'not configured' },
      storage: { status: 'pending', provider: 'not configured' },
      ai: { status: 'pending', provider: 'not configured' }
    }

    // Overall health status
    const hasErrors = Object.values(checks).some(
      check => typeof check === 'object' && check.status === 'error'
    )

    const statusCode = hasErrors ? 503 : 200
    
    return NextResponse.json(checks, { status: statusCode })
  } catch (error: any) {
    console.error('Error in health check:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

// HEAD request for simple health check
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
}