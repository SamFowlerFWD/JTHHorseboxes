import { getMeilisearchClient, SEARCH_INDEXES } from './config'
import type { SearchParams } from 'meilisearch'

export interface SearchOptions {
  query: string
  limit?: number
  offset?: number
  filter?: string | string[]
  sort?: string[]
  attributesToHighlight?: string[]
  attributesToCrop?: string[]
  cropLength?: number
}

export interface SearchResult<T> {
  hits: T[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
}

/**
 * Search knowledge base articles
 */
export async function searchKnowledgeBase(options: SearchOptions) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.knowledgeBase)

  const searchParams: SearchParams = {
    q: options.query,
    limit: options.limit || 20,
    offset: options.offset || 0,
    filter: options.filter,
    sort: options.sort,
    attributesToHighlight: options.attributesToHighlight || ['title', 'content'],
    attributesToCrop: options.attributesToCrop || ['content'],
    cropLength: options.cropLength || 200,
    showMatchesPosition: true,
  }

  try {
    const results = await index.search(options.query, searchParams)
    return {
      success: true,
      data: {
        hits: results.hits,
        query: results.query,
        processingTimeMs: results.processingTimeMs,
        limit: results.limit,
        offset: results.offset,
        estimatedTotalHits: results.estimatedTotalHits,
      },
    }
  } catch (error: any) {
    console.error('Knowledge base search failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Search leads
 */
export async function searchLeads(options: SearchOptions) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.leads)

  const searchParams: SearchParams = {
    q: options.query,
    limit: options.limit || 20,
    offset: options.offset || 0,
    filter: options.filter,
    sort: options.sort,
    attributesToHighlight: options.attributesToHighlight || ['first_name', 'last_name', 'email', 'company'],
  }

  try {
    const results = await index.search(options.query, searchParams)
    return {
      success: true,
      data: {
        hits: results.hits,
        query: results.query,
        processingTimeMs: results.processingTimeMs,
        limit: results.limit,
        offset: results.offset,
        estimatedTotalHits: results.estimatedTotalHits,
      },
    }
  } catch (error: any) {
    console.error('Leads search failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Search customers
 */
export async function searchCustomers(options: SearchOptions) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.customers)

  const searchParams: SearchParams = {
    q: options.query,
    limit: options.limit || 20,
    offset: options.offset || 0,
    filter: options.filter,
    sort: options.sort,
    attributesToHighlight: options.attributesToHighlight || ['name', 'email', 'company'],
  }

  try {
    const results = await index.search(options.query, searchParams)
    return {
      success: true,
      data: {
        hits: results.hits,
        query: results.query,
        processingTimeMs: results.processingTimeMs,
        limit: results.limit,
        offset: results.offset,
        estimatedTotalHits: results.estimatedTotalHits,
      },
    }
  } catch (error: any) {
    console.error('Customers search failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query: string, indexName: string, limit = 5) {
  const client = getMeilisearchClient()
  const index = client.index(indexName)

  try {
    const results = await index.search(query, {
      limit,
      attributesToRetrieve: ['id', 'title', 'name'],
    })

    return {
      success: true,
      suggestions: results.hits.map((hit: any) => ({
        id: hit.id,
        label: hit.title || hit.name,
      })),
    }
  } catch (error: any) {
    console.error('Failed to get search suggestions:', error)
    return { success: false, error: error.message, suggestions: [] }
  }
}

/**
 * Multi-index search (search across multiple indexes)
 */
export async function multiIndexSearch(query: string, indexes: string[] = []) {
  const client = getMeilisearchClient()

  const indexesToSearch = indexes.length > 0
    ? indexes
    : [SEARCH_INDEXES.knowledgeBase, SEARCH_INDEXES.leads, SEARCH_INDEXES.customers]

  try {
    const results = await client.multiSearch({
      queries: indexesToSearch.map(indexName => ({
        indexUid: indexName,
        q: query,
        limit: 5,
      })),
    })

    return {
      success: true,
      results: results.results.map((result, index) => ({
        index: indexesToSearch[index],
        hits: result.hits,
        estimatedTotalHits: result.estimatedTotalHits,
      })),
    }
  } catch (error: any) {
    console.error('Multi-index search failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get facet distribution for filtering
 */
export async function getFacets(indexName: string, facets: string[]) {
  const client = getMeilisearchClient()
  const index = client.index(indexName)

  try {
    const results = await index.search('', {
      facets,
      limit: 0, // We only need facet distribution
    })

    return {
      success: true,
      facetDistribution: results.facetDistribution,
    }
  } catch (error: any) {
    console.error('Failed to get facets:', error)
    return { success: false, error: error.message }
  }
}
