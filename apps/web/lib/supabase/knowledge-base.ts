import { createClient } from '@supabase/supabase-js'
import { Database, KnowledgeBase, KnowledgeBaseInsert } from './database.types'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// Create Supabase client for server-side operations
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate embedding for text content using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  })
  
  return response.data[0].embedding
}

/**
 * Add or update knowledge base entry with embedding
 */
export async function upsertKnowledgeEntry(
  entry: Omit<KnowledgeBaseInsert, 'embedding'>
): Promise<KnowledgeBase | null> {
  try {
    // Generate embedding from title and content
    const textForEmbedding = `${entry.title}\n\n${entry.content}`
    const embedding = await generateEmbedding(textForEmbedding)
    
    // Insert or update the knowledge base entry
    const { data, error } = await supabase
      .from('knowledge_base')
      .upsert({
        ...entry,
        embedding,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error upserting knowledge entry:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in upsertKnowledgeEntry:', error)
    return null
  }
}

/**
 * Search knowledge base using semantic search
 */
export async function searchKnowledge(
  query: string,
  options: {
    matchThreshold?: number
    matchCount?: number
    category?: string
  } = {}
): Promise<Array<KnowledgeBase & { similarity: number }>> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)
    
    // Use the search_knowledge function
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: options.matchThreshold || 0.7,
      match_count: options.matchCount || 10,
    })
    
    if (error) {
      console.error('Error searching knowledge:', error)
      return []
    }
    
    // Filter by category if specified
    let results = data || []
    if (options.category) {
      results = results.filter((item: any) => item.category === options.category)
    }
    
    return results
  } catch (error) {
    console.error('Error in searchKnowledge:', error)
    return []
  }
}

/**
 * Hybrid search combining semantic and keyword search
 */
export async function hybridSearchKnowledge(
  query: string,
  options: {
    matchThreshold?: number
    matchCount?: number
    category?: string
  } = {}
): Promise<Array<KnowledgeBase & { similarity: number; relevance: number }>> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)
    
    // Use the hybrid_search_knowledge function
    const { data, error } = await supabase.rpc('hybrid_search_knowledge', {
      query_embedding: queryEmbedding,
      search_query: query,
      match_threshold: options.matchThreshold || 0.7,
      match_count: options.matchCount || 10,
    })
    
    if (error) {
      console.error('Error in hybrid search:', error)
      return []
    }
    
    // Filter by category if specified
    let results = data || []
    if (options.category) {
      results = results.filter((item: any) => item.category === options.category)
    }
    
    return results
  } catch (error) {
    console.error('Error in hybridSearchKnowledge:', error)
    return []
  }
}

/**
 * Get relevant context for RAG agent
 */
export async function getRAGContext(
  query: string,
  maxTokens: number = 3000
): Promise<string> {
  try {
    // Perform hybrid search
    const results = await hybridSearchKnowledge(query, {
      matchCount: 5,
      matchThreshold: 0.6,
    })
    
    if (results.length === 0) {
      return ''
    }
    
    // Build context from results
    let context = ''
    let currentTokens = 0
    
    for (const result of results) {
      const entry = `## ${result.title}\n${result.content}\n\n`
      const entryTokens = Math.ceil(entry.length / 4) // Rough token estimation
      
      if (currentTokens + entryTokens > maxTokens) {
        break
      }
      
      context += entry
      currentTokens += entryTokens
    }
    
    return context.trim()
  } catch (error) {
    console.error('Error getting RAG context:', error)
    return ''
  }
}

/**
 * Batch import knowledge base entries
 */
export async function batchImportKnowledge(
  entries: Array<Omit<KnowledgeBaseInsert, 'embedding'>>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  
  // Process in batches to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    
    const promises = batch.map(entry => upsertKnowledgeEntry(entry))
    const results = await Promise.allSettled(promises)
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        success++
      } else {
        failed++
      }
    })
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < entries.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return { success, failed }
}

/**
 * Update embeddings for existing entries without embeddings
 */
export async function updateMissingEmbeddings(): Promise<number> {
  try {
    // Get entries without embeddings
    const { data: entries, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content')
      .is('embedding', null)
    
    if (error || !entries) {
      console.error('Error fetching entries without embeddings:', error)
      return 0
    }
    
    let updated = 0
    
    for (const entry of entries) {
      const textForEmbedding = `${entry.title}\n\n${entry.content}`
      const embedding = await generateEmbedding(textForEmbedding)
      
      const { error: updateError } = await supabase
        .from('knowledge_base')
        .update({ embedding })
        .eq('id', entry.id)
      
      if (!updateError) {
        updated++
      }
      
      // Rate limit: wait between updates
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    return updated
  } catch (error) {
    console.error('Error updating missing embeddings:', error)
    return 0
  }
}

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeStats() {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('category, source', { count: 'exact' })
    
    if (error) {
      console.error('Error getting knowledge stats:', error)
      return null
    }
    
    // Group by category and source
    const stats = {
      total: data?.length || 0,
      byCategory: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
    }
    
    data?.forEach(item => {
      if (item.category) {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1
      }
      if (item.source) {
        stats.bySource[item.source] = (stats.bySource[item.source] || 0) + 1
      }
    })
    
    return stats
  } catch (error) {
    console.error('Error in getKnowledgeStats:', error)
    return null
  }
}