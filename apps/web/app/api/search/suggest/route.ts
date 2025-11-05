import { NextRequest, NextResponse } from 'next/server'
import { getSearchSuggestions } from '@/lib/search/query'
import { SEARCH_INDEXES } from '@/lib/search/config'

export const dynamic = 'force-dynamic'

/**
 * GET /api/search/suggest - Get search suggestions (autocomplete)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('query') || ''
    const index = searchParams.get('index') || 'knowledge_base'
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      })
    }

    // Validate index name
    const validIndexes = Object.values(SEARCH_INDEXES)
    if (!validIndexes.includes(index)) {
      return NextResponse.json(
        { success: false, error: 'Invalid index name' },
        { status: 400 }
      )
    }

    const result = await getSearchSuggestions(query, index, limit)

    return NextResponse.json({
      success: true,
      suggestions: result.suggestions || [],
    })
  } catch (error: any) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}
