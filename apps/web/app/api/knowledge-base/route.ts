import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const knowledgeBaseSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.enum(['manual', 'faq', 'documentation', 'product']).default('manual'),
  source_url: z.string().url().optional(),
  is_published: z.boolean().default(true),
  search_keywords: z.string().optional(),
  relevance_score: z.number().min(0).max(1).default(1),
})

// Generate embedding for text
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

// GET /api/knowledge-base - Get knowledge base entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const published = searchParams.get('published')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }

    if (source) {
      query = query.eq('source', source)
    }

    if (published !== null) {
      query = query.eq('is_published', published === 'true')
    }

    const { data: entries, error, count } = await query

    if (error) {
      console.error('Error fetching knowledge base:', error)
      return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 })
    }

    // Remove embeddings from response (they're large)
    const entriesWithoutEmbeddings = entries.map(({ embedding, ...rest }) => rest)

    return NextResponse.json({
      entries: entriesWithoutEmbeddings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/knowledge-base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/knowledge-base - Create a new knowledge base entry (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = knowledgeBaseSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const entryData = validationResult.data

    // Generate embedding for the content
    const textForEmbedding = `${entryData.title}\n\n${entryData.content}\n\n${entryData.search_keywords || ''}`
    const embedding = await generateEmbedding(textForEmbedding)

    const { data: entry, error } = await supabase
      .from('knowledge_base')
      .insert([{
        ...entryData,
        embedding,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating knowledge base entry:', error)
      return NextResponse.json({ error: 'Failed to create knowledge base entry' }, { status: 500 })
    }

    // Remove embedding from response
    const { embedding: _, ...entryWithoutEmbedding } = entry

    return NextResponse.json(entryWithoutEmbedding, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/knowledge-base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}