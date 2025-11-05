import {
  getMeilisearchClient,
  SEARCH_INDEXES,
  KNOWLEDGE_BASE_SETTINGS,
  LEADS_SETTINGS,
  CUSTOMERS_SETTINGS,
} from './config'
import type { Index } from 'meilisearch'

/**
 * Initialize all search indexes with proper settings
 */
export async function initializeSearchIndexes() {
  const client = getMeilisearchClient()

  try {
    // Create or update knowledge base index
    const kbIndex = client.index(SEARCH_INDEXES.knowledgeBase)
    await kbIndex.updateSettings(KNOWLEDGE_BASE_SETTINGS)
    console.log('✓ Knowledge base index configured')

    // Create or update leads index
    const leadsIndex = client.index(SEARCH_INDEXES.leads)
    await leadsIndex.updateSettings(LEADS_SETTINGS)
    console.log('✓ Leads index configured')

    // Create or update customers index
    const customersIndex = client.index(SEARCH_INDEXES.customers)
    await customersIndex.updateSettings(CUSTOMERS_SETTINGS)
    console.log('✓ Customers index configured')

    return { success: true }
  } catch (error: any) {
    console.error('Failed to initialize search indexes:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Index knowledge base articles
 */
export async function indexKnowledgeBaseArticles(articles: any[]) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.knowledgeBase)

  const documents = articles.map((article) => ({
    id: article.id,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || article.content?.substring(0, 200),
    category: article.category,
    tags: article.tags || [],
    author: article.author,
    slug: article.slug,
    published: article.published ?? true,
    created_at: new Date(article.created_at).getTime(),
    updated_at: new Date(article.updated_at || article.created_at).getTime(),
    views: article.views || 0,
  }))

  try {
    const task = await index.addDocuments(documents, { primaryKey: 'id' })
    return { success: true, taskUid: task.taskUid }
  } catch (error: any) {
    console.error('Failed to index knowledge base articles:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Index a single knowledge base article
 */
export async function indexKnowledgeBaseArticle(article: any) {
  return indexKnowledgeBaseArticles([article])
}

/**
 * Delete knowledge base article from index
 */
export async function deleteKnowledgeBaseArticle(articleId: string) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.knowledgeBase)

  try {
    const task = await index.deleteDocument(articleId)
    return { success: true, taskUid: task.taskUid }
  } catch (error: any) {
    console.error('Failed to delete knowledge base article:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Index leads
 */
export async function indexLeads(leads: any[]) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.leads)

  const documents = leads.map((lead) => ({
    id: lead.id,
    first_name: lead.first_name,
    last_name: lead.last_name,
    email: lead.email,
    phone: lead.phone || '',
    company: lead.company || '',
    notes: lead.notes || '',
    status: lead.status,
    stage: lead.stage,
    source: lead.source || '',
    assigned_to: lead.assigned_to || '',
    lead_score: lead.lead_score || 0,
    quote_amount: lead.quote_amount || 0,
    created_at: new Date(lead.created_at).getTime(),
    updated_at: new Date(lead.updated_at || lead.created_at).getTime(),
  }))

  try {
    const task = await index.addDocuments(documents, { primaryKey: 'id' })
    return { success: true, taskUid: task.taskUid }
  } catch (error: any) {
    console.error('Failed to index leads:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Index customers
 */
export async function indexCustomers(customers: any[]) {
  const client = getMeilisearchClient()
  const index = client.index(SEARCH_INDEXES.customers)

  const documents = customers.map((customer) => ({
    id: customer.id,
    name: `${customer.first_name} ${customer.last_name}`,
    email: customer.email,
    phone: customer.phone || '',
    company: customer.company || '',
    address: customer.address || '',
    notes: customer.notes || '',
    status: customer.status || 'active',
    total_spent: customer.total_spent || 0,
    created_at: new Date(customer.created_at).getTime(),
    updated_at: new Date(customer.updated_at || customer.created_at).getTime(),
  }))

  try {
    const task = await index.addDocuments(documents, { primaryKey: 'id' })
    return { success: true, taskUid: task.taskUid }
  } catch (error: any) {
    console.error('Failed to index customers:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Clear an index
 */
export async function clearIndex(indexName: string) {
  const client = getMeilisearchClient()
  const index = client.index(indexName)

  try {
    const task = await index.deleteAllDocuments()
    return { success: true, taskUid: task.taskUid }
  } catch (error: any) {
    console.error(`Failed to clear index ${indexName}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Get index stats
 */
export async function getIndexStats(indexName: string) {
  const client = getMeilisearchClient()
  const index = client.index(indexName)

  try {
    const stats = await index.getStats()
    return { success: true, stats }
  } catch (error: any) {
    console.error(`Failed to get stats for index ${indexName}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Health check for Meilisearch
 */
export async function checkSearchHealth() {
  const client = getMeilisearchClient()

  try {
    const health = await client.health()
    return { success: true, status: health.status }
  } catch (error: any) {
    console.error('Meilisearch health check failed:', error)
    return { success: false, error: error.message }
  }
}
