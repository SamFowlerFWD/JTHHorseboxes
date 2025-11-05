import { NextRequest, NextResponse } from 'next/server'
import {
  searchKnowledgeBase,
  searchLeads,
  searchCustomers,
  multiIndexSearch,
  getSearchSuggestions,
  getFacets,
} from '@/lib/search/query'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const searchSchema = z.object({
  query: z.string().min(1).max(200),
  index: z.enum(['knowledge_base', 'leads', 'customers', 'all']).optional().default('knowledge_base'),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  filter: z.string().or(z.array(z.string())).optional(),
  sort: z.array(z.string()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * GET /api/search - Search endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    // Parse query parameters
    const rawParams = {
      query: searchParams.get('q') || searchParams.get('query') || '',
      index: searchParams.get('index') || 'knowledge_base',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      filter: searchParams.get('filter'),
      sort: searchParams.get('sort')?.split(','),
      category: searchParams.get('category'),
      tags: searchParams.get('tags')?.split(','),
    }

    // Validate
    const validation = searchSchema.safeParse(rawParams)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid search parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const params = validation.data

    // Build filters
    const filters: string[] = []
    if (params.category) {
      filters.push(`category = "${params.category}"`)
    }
    if (params.tags && params.tags.length > 0) {
      const tagFilters = params.tags.map(tag => `tags = "${tag}"`).join(' OR ')
      filters.push(`(${tagFilters})`)
    }
    if (params.filter) {
      const filterValue = Array.isArray(params.filter) ? params.filter[0] : params.filter
      filters.push(filterValue)
    }

    const searchOptions = {
      query: params.query,
      limit: params.limit,
      offset: params.offset,
      filter: filters.length > 0 ? filters : undefined,
      sort: params.sort,
    }

    // Execute search based on index with deduplication
    const { deduplicate } = await import('@/lib/utils/request-deduplication')
    const { monitorQuery } = await import('@/lib/utils/query-monitor')

    // Create unique key for this search request
    const searchKey = `search:${params.index}:${params.query}:${JSON.stringify(filters)}`

    let result = await deduplicate(
      searchKey,
      async () => {
        return await monitorQuery(
          `search_${params.index}`,
          async () => {
            if (params.index === 'all') {
              return await multiIndexSearch(params.query)
            } else if (params.index === 'knowledge_base') {
              return await searchKnowledgeBase(searchOptions)
            } else if (params.index === 'leads') {
              return await searchLeads(searchOptions)
            } else if (params.index === 'customers') {
              return await searchCustomers(searchOptions)
            }
          },
          { endpoint: '/api/search' }
        )
      },
      3000 // 3 second deduplication window
    )

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.error || 'Search failed' },
        { status: 500 }
      )
    }

    // Handle different response structures
    if ('data' in result) {
      return NextResponse.json({
        success: true,
        ...result.data,
      })
    } else if ('results' in result) {
      return NextResponse.json({
        success: true,
        results: result.results,
      })
    }

    // For other result types, omit success from spread
    const { success: _, ...rest } = result as any
    return NextResponse.json({
      success: true,
      ...rest,
    })
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/search - Advanced search with filters
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = searchSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid search parameters', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const params = validation.data

    // Build filters
    const filters: string[] = []
    if (params.category) {
      filters.push(`category = "${params.category}"`)
    }
    if (params.tags && params.tags.length > 0) {
      const tagFilters = params.tags.map(tag => `tags = "${tag}"`).join(' OR ')
      filters.push(`(${tagFilters})`)
    }
    if (params.filter) {
      const filterValue = Array.isArray(params.filter) ? params.filter[0] : params.filter
      filters.push(filterValue)
    }

    const searchOptions = {
      query: params.query,
      limit: params.limit,
      offset: params.offset,
      filter: filters.length > 0 ? filters : undefined,
      sort: params.sort,
    }

    // Execute search
    let result
    if (params.index === 'all') {
      result = await multiIndexSearch(params.query)
    } else if (params.index === 'knowledge_base') {
      result = await searchKnowledgeBase(searchOptions)
    } else if (params.index === 'leads') {
      result = await searchLeads(searchOptions)
    } else if (params.index === 'customers') {
      result = await searchCustomers(searchOptions)
    }

    if (!result || !result.success) {
      return NextResponse.json(
        { success: false, error: result?.error || 'Search failed' },
        { status: 500 }
      )
    }

    // Handle different response structures
    if ('data' in result) {
      return NextResponse.json({
        success: true,
        ...result.data,
      })
    } else if ('results' in result) {
      return NextResponse.json({
        success: true,
        results: result.results,
      })
    }

    // For other result types, omit success from spread
    const { success: _, ...rest } = result as any
    return NextResponse.json({
      success: true,
      ...rest,
    })
  } catch (error: any) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
