// Export all search utilities
export * from './config'
export * from './index-manager'
export * from './query'

// Re-export commonly used functions
export {
  getMeilisearchClient,
  SEARCH_INDEXES,
  MEILISEARCH_CONFIG,
} from './config'

export {
  initializeSearchIndexes,
  indexKnowledgeBaseArticles,
  indexKnowledgeBaseArticle,
  deleteKnowledgeBaseArticle,
  indexLeads,
  indexCustomers,
  clearIndex,
  getIndexStats,
  checkSearchHealth,
} from './index-manager'

export {
  searchKnowledgeBase,
  searchLeads,
  searchCustomers,
  multiIndexSearch,
  getSearchSuggestions,
  getFacets,
} from './query'

export type { SearchOptions, SearchResult } from './query'
