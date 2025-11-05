import { NextRequest, NextResponse } from 'next/server'
import {
  initializeSearchIndexes,
  indexKnowledgeBaseArticles,
  indexLeads,
  indexCustomers,
  clearIndex,
  getIndexStats,
  checkSearchHealth,
} from '@/lib/search/index-manager'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/search/admin - Get search system status
 *
 * Authentication: Admin-only (enforced by middleware)
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication is handled by middleware - only admins can access this route

    const health = await checkSearchHealth()

    if (!health.success) {
      return NextResponse.json(
        { success: false, error: 'Meilisearch is not available', details: health.error },
        { status: 503 }
      )
    }

    // Get stats for all indexes
    const kbStats = await getIndexStats('knowledge_base')
    const leadsStats = await getIndexStats('leads')
    const customersStats = await getIndexStats('customers')

    return NextResponse.json({
      success: true,
      health: health.status,
      indexes: {
        knowledge_base: kbStats.success ? kbStats.stats : null,
        leads: leadsStats.success ? leadsStats.stats : null,
        customers: customersStats.success ? customersStats.stats : null,
      },
    })
  } catch (error: any) {
    console.error('Search admin API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get search status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/search/admin - Admin actions (initialize, reindex, clear)
 *
 * Authentication: Admin-only (enforced by middleware)
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication is handled by middleware - only admins can access this route
    const body = await req.json()
    const { action, index } = body

    switch (action) {
      case 'initialize': {
        const result = await initializeSearchIndexes()
        return NextResponse.json(result)
      }

      case 'reindex': {
        if (!index) {
          return NextResponse.json(
            { success: false, error: 'Index name is required' },
            { status: 400 }
          )
        }

        // Fetch data from Supabase and reindex
        const supabase = await createServiceClient()

        if (index === 'knowledge_base') {
          // Fetch all knowledge base articles
          const { data: articles, error } = await supabase
            .from('knowledge_base')
            .select('*')
            .eq('published', true)

          if (error) throw error

          const result = await indexKnowledgeBaseArticles(articles || [])
          return NextResponse.json(result)
        } else if (index === 'leads') {
          // Fetch all leads
          const { data: leads, error } = await supabase
            .from('leads')
            .select('*')

          if (error) throw error

          const result = await indexLeads(leads || [])
          return NextResponse.json(result)
        } else if (index === 'customers') {
          // Fetch all customers
          const { data: customers, error } = await supabase
            .from('customers')
            .select('*')

          if (error) throw error

          const result = await indexCustomers(customers || [])
          return NextResponse.json(result)
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid index name' },
            { status: 400 }
          )
        }
      }

      case 'clear': {
        if (!index) {
          return NextResponse.json(
            { success: false, error: 'Index name is required' },
            { status: 400 }
          )
        }

        const result = await clearIndex(index)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Search admin API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to perform admin action' },
      { status: 500 }
    )
  }
}
