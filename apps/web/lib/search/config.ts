import { MeiliSearch } from 'meilisearch'

// Meilisearch configuration
export const MEILISEARCH_CONFIG = {
  host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY || '',
}

// Initialize Meilisearch client (server-side only)
let meilisearchClient: MeiliSearch | null = null

export function getMeilisearchClient(): MeiliSearch {
  if (!meilisearchClient) {
    meilisearchClient = new MeiliSearch({
      host: MEILISEARCH_CONFIG.host,
      apiKey: MEILISEARCH_CONFIG.apiKey,
    })
  }
  return meilisearchClient
}

// Index names
export const SEARCH_INDEXES = {
  knowledgeBase: 'knowledge_base',
  leads: 'leads',
  customers: 'customers',
  products: 'products',
}

// Searchable attributes configuration
export const KNOWLEDGE_BASE_SETTINGS = {
  searchableAttributes: ['title', 'content', 'excerpt', 'tags', 'category'],
  filterableAttributes: ['category', 'tags', 'author', 'published', 'created_at'],
  sortableAttributes: ['created_at', 'updated_at', 'views'],
  displayedAttributes: ['id', 'title', 'excerpt', 'category', 'tags', 'slug', 'created_at'],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
  ],
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
  },
  pagination: {
    maxTotalHits: 1000,
  },
}

export const LEADS_SETTINGS = {
  searchableAttributes: ['first_name', 'last_name', 'email', 'company', 'phone', 'notes'],
  filterableAttributes: ['status', 'stage', 'source', 'assigned_to', 'lead_score', 'created_at'],
  sortableAttributes: ['created_at', 'updated_at', 'lead_score', 'quote_amount'],
  displayedAttributes: [
    'id',
    'first_name',
    'last_name',
    'email',
    'company',
    'phone',
    'stage',
    'lead_score',
    'quote_amount',
  ],
}

export const CUSTOMERS_SETTINGS = {
  searchableAttributes: ['name', 'email', 'phone', 'company', 'address', 'notes'],
  filterableAttributes: ['status', 'created_at', 'total_spent'],
  sortableAttributes: ['created_at', 'updated_at', 'total_spent'],
  displayedAttributes: ['id', 'name', 'email', 'phone', 'company', 'status'],
}
