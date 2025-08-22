import { NextRequest, NextResponse } from 'next/server'

// Sample knowledge base articles for development
const KNOWLEDGE_BASE = [
  {
    id: '1',
    title: 'How to Choose the Right Horsebox Size',
    content: 'Choosing the right horsebox size depends on several factors including the number of horses, journey length, and your driving license category. For single horse transport, a 3.5t model is often sufficient.',
    category: 'Buying Guide',
    tags: ['size', 'buying', '3.5t', '7.2t'],
    relevance_score: 0.95
  },
  {
    id: '2',
    title: 'Horsebox Maintenance Schedule',
    content: 'Regular maintenance is essential for safety and longevity. Check tyres monthly, service every 6 months, and perform daily checks before journeys. Keep detailed maintenance records.',
    category: 'Maintenance',
    tags: ['maintenance', 'safety', 'servicing'],
    relevance_score: 0.88
  },
  {
    id: '3',
    title: 'Understanding Horsebox Weight Limits',
    content: 'Weight limits are crucial for legal compliance and safety. A 3.5t horsebox can be driven on a standard car license, while 7.2t requires a C1 license. Always account for payload including horses, equipment, and water.',
    category: 'Legal',
    tags: ['weight', 'license', 'legal', 'payload'],
    relevance_score: 0.92
  },
  {
    id: '4',
    title: 'Essential Horsebox Features',
    content: 'Key features to consider include: ventilation systems, non-slip flooring, partition options, tack storage, water tanks, and emergency exits. Safety features should be your top priority.',
    category: 'Features',
    tags: ['features', 'safety', 'equipment'],
    relevance_score: 0.85
  },
  {
    id: '5',
    title: 'Horsebox Insurance Guide',
    content: 'Comprehensive horsebox insurance should cover vehicle damage, theft, liability, and breakdown. Consider additional coverage for horses in transit and equipment. Compare quotes from specialist insurers.',
    category: 'Insurance',
    tags: ['insurance', 'coverage', 'legal'],
    relevance_score: 0.79
  }
]

// Simple text search function
function searchKnowledgeBase(query: string, limit: number = 5): any[] {
  if (!query || query.trim() === '') {
    return []
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  
  // Score each article based on matches
  const scoredArticles = KNOWLEDGE_BASE.map(article => {
    let score = 0
    const titleLower = article.title.toLowerCase()
    const contentLower = article.content.toLowerCase()
    
    searchTerms.forEach(term => {
      // Title matches are worth more
      if (titleLower.includes(term)) score += 3
      if (contentLower.includes(term)) score += 1
      // Tag matches
      if (article.tags.some(tag => tag.includes(term))) score += 2
      // Category matches
      if (article.category.toLowerCase().includes(term)) score += 2
    })
    
    return { ...article, searchScore: score }
  })
  
  // Filter and sort by score
  return scoredArticles
    .filter(article => article.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit)
    .map(({ searchScore, ...article }) => article)
}

// GET /api/knowledge-base/search - Search knowledge base with query parameters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '5')
    const category = searchParams.get('category')
    
    if (!query) {
      return NextResponse.json(
        { 
          error: 'Query parameter is required. Use ?q=your+search+query or ?query=your+search+query',
          example: '/api/knowledge-base/search?q=horsebox+size'
        },
        { status: 400 }
      )
    }

    let results = searchKnowledgeBase(query, limit)
    
    // Filter by category if specified
    if (category) {
      results = results.filter(
        article => article.category.toLowerCase() === category.toLowerCase()
      )
    }

    return NextResponse.json({
      results,
      query,
      count: results.length,
      totalAvailable: KNOWLEDGE_BASE.length
    })
  } catch (error) {
    console.error('Error in GET /api/knowledge-base/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/knowledge-base/search - Search knowledge base with body parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, q, limit = 5, category } = body

    const searchQuery = query || q
    
    if (!searchQuery) {
      return NextResponse.json(
        { 
          error: 'Query is required in request body',
          example: { query: 'horsebox maintenance', limit: 5 }
        },
        { status: 400 }
      )
    }

    let results = searchKnowledgeBase(searchQuery, limit)
    
    // Filter by category if specified
    if (category) {
      results = results.filter(
        article => article.category.toLowerCase() === category.toLowerCase()
      )
    }

    return NextResponse.json({
      results,
      query: searchQuery,
      count: results.length,
      totalAvailable: KNOWLEDGE_BASE.length
    })
  } catch (error) {
    console.error('Error in POST /api/knowledge-base/search:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}