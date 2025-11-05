import { createServiceClient } from './server'
import cache, { CacheKeys, CacheTTL, cached } from '@/lib/cache/memory-cache'
import { monitorQuery } from '@/lib/utils/query-monitor'

/**
 * Optimized query utilities following best practices
 */

// Column specifications to avoid over-fetching
export const LEAD_COLUMNS = 'id,first_name,last_name,email,phone,company,stage,status,lead_score,quote_amount,created_at,updated_at,assigned_to,model_interest,configurator_snapshot'
export const CUSTOMER_COLUMNS = 'id,first_name,last_name,email,phone,company,address,status,total_spent,created_at,updated_at'
export const INVENTORY_COLUMNS = 'id,name,sku,quantity,unit_price,category,location,status,created_at,updated_at'
export const KB_ARTICLE_COLUMNS = 'id,title,slug,excerpt,content,category,tags,author,published,views,created_at,updated_at'
export const QUOTE_COLUMNS = 'id,lead_id,quote_number,total_price,status,created_at,valid_until,sent_at,viewed_at'
export const PRICING_COLUMNS = 'id,model,category,subcategory,name,description,sku,price,vat_rate,is_default,is_available,dependencies,incompatible_with,display_order,image_url'

/**
 * Get dashboard metrics with caching and monitoring
 */
export async function getDashboardMetrics() {
  return cached(
    CacheKeys.dashboardStats(),
    CacheTTL.medium,
    async () => {
      return monitorQuery(
        'dashboard_metrics',
        async () => {
          const supabase = await createServiceClient()

          // Use Promise.all for parallel queries instead of sequential
          const [leadsCount, activeBuilds, recentQuotes] = await Promise.all([
        // Total leads count
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true }),

        // Active builds count
        supabase
          .from('builds')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),

        // Recent quotes (last 30 days)
        supabase
          .from('leads')
          .select('quote_amount')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .not('quote_amount', 'is', null),
      ])

      // Calculate total pipeline value
      const totalPipelineValue = recentQuotes.data?.reduce(
        (sum, lead) => sum + (lead.quote_amount || 0),
        0
      ) || 0

          return {
            totalLeads: leadsCount.count || 0,
            activeBuilds: activeBuilds.count || 0,
            recentQuotes: recentQuotes.data?.length || 0,
            totalPipelineValue,
          }
        },
        { endpoint: 'getDashboardMetrics', cached: false }
      )
    }
  )
}

/**
 * Get pipeline data with optimized queries (fixes N+1 problem)
 */
export async function getPipelineDataOptimized() {
  return cached(
    CacheKeys.pipelineData(),
    CacheTTL.short,
    async () => {
      const supabase = await createServiceClient()

      // Single query with specific columns instead of multiple queries
      const { data: leads, error } = await supabase
        .from('leads')
        .select(LEAD_COLUMNS)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by stage in memory (more efficient than multiple DB queries)
      const leadsByStage = (leads || []).reduce((acc: any, lead) => {
        const stage = lead.stage || 'inquiry'
        if (!acc[stage]) {
          acc[stage] = []
        }
        acc[stage].push({
          id: lead.id,
          organization: lead.company || `${lead.first_name} ${lead.last_name}`,
          contact: `${lead.first_name} ${lead.last_name}`,
          email: lead.email,
          phone: lead.phone,
          value: lead.quote_amount || 0,
          model: 'Not specified', // Would need to join or fetch separately
          assignedTo: lead.assigned_to || 'Unassigned',
          createdAt: lead.created_at,
          score: lead.lead_score || 50,
          stage: stage,
        })
        return acc
      }, {})

      // Ensure all stages exist
      const stages = ['inquiry', 'qualification', 'specification', 'quotation', 'negotiation', 'closed_won', 'closed_lost']
      stages.forEach(stage => {
        if (!leadsByStage[stage]) {
          leadsByStage[stage] = []
        }
      })

      return leadsByStage
    }
  )
}

/**
 * Get paginated leads with efficient query
 */
export async function getLeadsPaginated(
  page: number = 1,
  limit: number = 20,
  filter?: { stage?: string; status?: string; assigned_to?: string }
) {
  const offset = (page - 1) * limit
  const cacheKey = CacheKeys.leadsPage(page, JSON.stringify(filter))

  return cached(
    cacheKey,
    CacheTTL.short,
    async () => {
      const supabase = await createServiceClient()

      let query = supabase
        .from('leads')
        .select(LEAD_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filter?.stage) {
        query = query.eq('stage', filter.stage)
      }
      if (filter?.status) {
        query = query.eq('status', filter.status)
      }
      if (filter?.assigned_to) {
        query = query.eq('assigned_to', filter.assigned_to)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        leads: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }
  )
}

/**
 * Get single lead with related data (optimized join)
 */
export async function getLeadWithDetails(leadId: string) {
  const cacheKey = CacheKeys.lead(leadId)

  return cached(
    cacheKey,
    CacheTTL.medium,
    async () => {
      const supabase = await createServiceClient()

      // Single query with joins instead of multiple queries
      const { data, error } = await supabase
        .from('leads')
        .select(`
          ${LEAD_COLUMNS},
          lead_activities (
            id,
            activity_type,
            description,
            created_at,
            metadata
          )
        `)
        .eq('id', leadId)
        .single()

      if (error) throw error

      return data
    }
  )
}

/**
 * Get inventory list with caching (unpaginated - for dropdowns)
 */
export async function getInventoryList() {
  return cached(
    CacheKeys.inventoryList(),
    CacheTTL.medium,
    async () => {
      const supabase = await createServiceClient()

      const { data, error } = await supabase
        .from('inventory')
        .select(INVENTORY_COLUMNS)
        .order('name', { ascending: true })

      if (error) throw error

      return data || []
    }
  )
}

/**
 * Get inventory paginated with filtering
 */
export async function getInventoryPaginated(
  page: number = 1,
  limit: number = 50,
  filter?: { category?: string; status?: string }
) {
  const offset = (page - 1) * limit
  const cacheKey = CacheKeys.inventoryPage(page, JSON.stringify(filter))

  return cached(
    cacheKey,
    CacheTTL.short,
    async () => {
      const supabase = await createServiceClient()

      let query = supabase
        .from('inventory')
        .select(INVENTORY_COLUMNS, { count: 'exact' })
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filter?.category) {
        query = query.eq('category', filter.category)
      }
      if (filter?.status) {
        query = query.eq('status', filter.status)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        items: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }
  )
}

/**
 * Get customers paginated
 */
export async function getCustomersPaginated(
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit
  const cacheKey = CacheKeys.customersPage(page)

  return cached(
    cacheKey,
    CacheTTL.medium,
    async () => {
      const supabase = await createServiceClient()

      const { data, error, count } = await supabase
        .from('customers')
        .select(CUSTOMER_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        customers: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }
  )
}

/**
 * Get knowledge base articles with caching
 */
export async function getKnowledgeBaseArticles(
  category?: string
) {
  const cacheKey = CacheKeys.kbList(category)

  return cached(
    cacheKey,
    CacheTTL.long,
    async () => {
      const supabase = await createServiceClient()

      let query = supabase
        .from('knowledge_base')
        .select(KB_ARTICLE_COLUMNS)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    }
  )
}

/**
 * Get knowledge base article by slug with caching
 */
export async function getKnowledgeBaseArticle(slug: string) {
  const cacheKey = CacheKeys.kbArticle(slug)

  return cached(
    cacheKey,
    CacheTTL.long,
    async () => {
      const supabase = await createServiceClient()

      const { data, error } = await supabase
        .from('knowledge_base')
        .select(KB_ARTICLE_COLUMNS)
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error

      // Increment view count (fire and forget, don't block)
      supabase
        .from('knowledge_base')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
        .then(() => {}, () => {})

      return data
    }
  )
}

/**
 * Get quotes paginated with filtering
 */
export async function getQuotesPaginated(
  page: number = 1,
  limit: number = 20,
  filter?: { status?: string; lead_id?: string }
) {
  const offset = (page - 1) * limit
  const cacheKey = CacheKeys.quotesPage(page, JSON.stringify(filter))

  return cached(
    cacheKey,
    CacheTTL.short,
    async () => {
      const supabase = await createServiceClient()

      let query = supabase
        .from('quotes')
        .select(QUOTE_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filter?.status) {
        query = query.eq('status', filter.status)
      }
      if (filter?.lead_id) {
        query = query.eq('lead_id', filter.lead_id)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        quotes: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      }
    }
  )
}

/**
 * Get pricing options with long-term caching (pricing rarely changes)
 */
export async function getPricingOptions(
  model?: string,
  category?: string,
  availableOnly: boolean = true
) {
  const cacheKey = CacheKeys.pricingOptions(model, category, availableOnly)

  return cached(
    cacheKey,
    CacheTTL.pricing, // 24 hours - pricing rarely changes
    async () => {
      const supabase = await createServiceClient()

      let query = supabase
        .from('pricing_options')
        .select(PRICING_COLUMNS)
        .order('display_order', { ascending: true })
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (availableOnly) {
        query = query.eq('is_available', true)
      }

      if (model) {
        query = query.eq('model', model)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    }
  )
}

/**
 * Invalidate cache when data changes
 */
export function invalidateLeadsCache() {
  cache.delete(CacheKeys.pipelineData())
  cache.delete(CacheKeys.dashboardStats())
  // Invalidate all lead pages
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('leads:page:')) {
      cache.delete(key)
    }
  })
}

export function invalidateCustomersCache() {
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('customers:page:')) {
      cache.delete(key)
    }
  })
}

export function invalidateInventoryCache() {
  cache.delete(CacheKeys.inventoryList())
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('inventory:page:')) {
      cache.delete(key)
    }
  })
}

export function invalidateQuotesCache() {
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('quotes:page:')) {
      cache.delete(key)
    }
  })
}

export function invalidateKnowledgeBaseCache() {
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('kb:')) {
      cache.delete(key)
    }
  })
}

export function invalidatePricingCache() {
  return cache['cache'].forEach((_, key) => {
    if (key.startsWith('pricing:')) {
      cache.delete(key)
    }
  })
}
