import { createClient } from '@supabase/supabase-js'
import { 
  Database, 
  Lead, 
  LeadInsert,
  LeadUpdate,
  BlogPost,
  BlogPostInsert,
  BlogPostUpdate,
  PricingOption,
  PricingOptionInsert,
  Quote,
  QuoteInsert,
  LeadActivity,
  LeadActivityInsert
} from './database.types'

// Admin client with service role key for bypassing RLS
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Check if current user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await adminSupabase
      .rpc('is_admin')
    
    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }
    
    return data || false
  } catch (error) {
    console.error('Error in isUserAdmin:', error)
    return false
  }
}

/**
 * Lead Management Functions
 */
export const leadAdmin = {
  // Get all leads with pagination and filtering
  async getLeads(options: {
    page?: number
    limit?: number
    status?: string
    search?: string
    orderBy?: 'created_at' | 'updated_at' | 'quote_amount'
    order?: 'asc' | 'desc'
  } = {}) {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search, 
      orderBy = 'created_at',
      order = 'desc' 
    } = options
    
    let query = adminSupabase
      .from('leads')
      .select('*', { count: 'exact' })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%`)
    }
    
    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range((page - 1) * limit, page * limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching leads:', error)
      return { leads: [], total: 0, error }
    }
    
    return { 
      leads: data || [], 
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  },
  
  // Get single lead with activities
  async getLead(id: string) {
    const [leadResult, activitiesResult] = await Promise.all([
      adminSupabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single(),
      adminSupabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false })
    ])
    
    if (leadResult.error) {
      return { lead: null, activities: [], error: leadResult.error }
    }
    
    return {
      lead: leadResult.data,
      activities: activitiesResult.data || []
    }
  },
  
  // Create new lead
  async createLead(lead: LeadInsert): Promise<Lead | null> {
    const { data, error } = await adminSupabase
      .from('leads')
      .insert(lead)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating lead:', error)
      return null
    }
    
    return data
  },
  
  // Update lead
  async updateLead(id: string, updates: LeadUpdate): Promise<Lead | null> {
    const { data, error } = await adminSupabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating lead:', error)
      return null
    }
    
    return data
  },
  
  // Add activity to lead
  async addActivity(activity: LeadActivityInsert): Promise<LeadActivity | null> {
    const { data, error } = await adminSupabase
      .from('lead_activities')
      .insert(activity)
      .select()
      .single()
    
    if (error) {
      console.error('Error adding activity:', error)
      return null
    }
    
    return data
  },
  
  // Get lead statistics
  async getStats(dateFrom?: Date, dateTo?: Date) {
    const { data, error } = await adminSupabase
      .rpc('get_lead_stats', {
        date_from: dateFrom?.toISOString(),
        date_to: dateTo?.toISOString()
      })
    
    if (error) {
      console.error('Error getting lead stats:', error)
      return null
    }
    
    return data
  }
}

/**
 * Blog Management Functions
 */
export const blogAdmin = {
  // Get all blog posts
  async getPosts(options: {
    page?: number
    limit?: number
    status?: string
    featured?: boolean
  } = {}) {
    const { page = 1, limit = 20, status, featured } = options
    
    let query = adminSupabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (featured !== undefined) {
      query = query.eq('featured', featured)
    }
    
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    const { data, error, count } = await query
    
    return {
      posts: data || [],
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
      error
    }
  },
  
  // Get single post
  async getPost(id: string) {
    const { data, error } = await adminSupabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    
    return { post: data, error }
  },
  
  // Create post
  async createPost(post: BlogPostInsert): Promise<BlogPost | null> {
    const { data, error } = await adminSupabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating post:', error)
      return null
    }
    
    return data
  },
  
  // Update post
  async updatePost(id: string, updates: BlogPostUpdate): Promise<BlogPost | null> {
    const { data, error } = await adminSupabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating post:', error)
      return null
    }
    
    return data
  },
  
  // Publish post
  async publishPost(id: string): Promise<boolean> {
    const { error } = await adminSupabase
      .from('blog_posts')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
    
    return !error
  },
  
  // Delete post
  async deletePost(id: string): Promise<boolean> {
    const { error } = await adminSupabase
      .from('blog_posts')
      .delete()
      .eq('id', id)
    
    return !error
  }
}

/**
 * Pricing Management Functions
 */
export const pricingAdmin = {
  // Get all pricing options
  async getOptions(model?: string) {
    let query = adminSupabase
      .from('pricing_options')
      .select('*')
      .order('model')
      .order('category')
      .order('display_order')
    
    if (model) {
      query = query.or(`model.eq.${model},model.eq.all`)
    }
    
    const { data, error } = await query
    
    return { options: data || [], error }
  },
  
  // Create pricing option
  async createOption(option: PricingOptionInsert): Promise<PricingOption | null> {
    const { data, error } = await adminSupabase
      .from('pricing_options')
      .insert(option)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating pricing option:', error)
      return null
    }
    
    return data
  },
  
  // Update pricing option
  async updateOption(id: string, updates: Partial<PricingOption>): Promise<PricingOption | null> {
    const { data, error } = await adminSupabase
      .from('pricing_options')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating pricing option:', error)
      return null
    }
    
    return data
  },
  
  // Bulk update prices (e.g., for price increases)
  async bulkUpdatePrices(percentageChange: number, model?: string) {
    let query = adminSupabase
      .from('pricing_options')
      .select('id, price')
    
    if (model) {
      query = query.eq('model', model)
    }
    
    const { data: options, error: fetchError } = await query
    
    if (fetchError || !options) {
      return { success: false, error: fetchError }
    }
    
    const updates = options.map(opt => ({
      id: opt.id,
      price: Math.round(opt.price * (1 + percentageChange / 100) * 100) / 100
    }))
    
    const results = await Promise.all(
      updates.map(update => 
        adminSupabase
          .from('pricing_options')
          .update({ price: update.price })
          .eq('id', update.id)
      )
    )
    
    const failures = results.filter(r => r.error).length
    
    return {
      success: failures === 0,
      updated: results.length - failures,
      failed: failures
    }
  }
}

/**
 * Quote Management Functions
 */
export const quoteAdmin = {
  // Generate quote number
  generateQuoteNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `JTH-${year}${month}-${random}`
  },
  
  // Create quote
  async createQuote(quote: QuoteInsert): Promise<Quote | null> {
    const quoteWithNumber = {
      ...quote,
      quote_number: quote.quote_number || this.generateQuoteNumber(),
      valid_until: quote.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    const { data, error } = await adminSupabase
      .from('quotes')
      .insert(quoteWithNumber)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating quote:', error)
      return null
    }
    
    return data
  },
  
  // Get quotes for a lead
  async getLeadQuotes(leadId: string) {
    const { data, error } = await adminSupabase
      .from('quotes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    
    return { quotes: data || [], error }
  },
  
  // Mark quote as sent
  async markQuoteSent(id: string): Promise<boolean> {
    const { error } = await adminSupabase
      .from('quotes')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', id)
    
    return !error
  },
  
  // Mark quote as viewed
  async markQuoteViewed(id: string): Promise<boolean> {
    const { error } = await adminSupabase
      .from('quotes')
      .update({ 
        status: 'viewed',
        viewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'sent') // Only update if currently sent
    
    return !error
  }
}

/**
 * Audit Log Functions
 */
export async function logAdminAction(
  userId: string,
  action: string,
  details: {
    tableName?: string
    recordId?: string
    oldData?: any
    newData?: any
  } = {}
) {
  try {
    await adminSupabase
      .from('admin_audit_log')
      .insert({
        user_id: userId,
        action,
        table_name: details.tableName,
        record_id: details.recordId,
        old_data: details.oldData,
        new_data: details.newData,
      })
  } catch (error) {
    console.error('Error logging admin action:', error)
  }
}

/**
 * Dashboard Statistics
 */
export async function getDashboardStats() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const [leads, quotes, posts, configs] = await Promise.all([
      adminSupabase
        .from('leads')
        .select('status', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      adminSupabase
        .from('quotes')
        .select('status, total_amount', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      adminSupabase
        .from('blog_posts')
        .select('status', { count: 'exact' }),
      adminSupabase
        .from('saved_configurations')
        .select('model', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString())
    ])
    
    // Calculate totals and breakdowns
    const stats = {
      leads: {
        total: leads.count || 0,
        byStatus: {} as Record<string, number>
      },
      quotes: {
        total: quotes.count || 0,
        totalValue: 0,
        byStatus: {} as Record<string, number>
      },
      posts: {
        total: posts.count || 0,
        published: 0,
        drafts: 0
      },
      configurations: {
        total: configs.count || 0,
        byModel: {} as Record<string, number>
      }
    }
    
    // Process lead statuses
    leads.data?.forEach(lead => {
      const status = lead.status as string
      stats.leads.byStatus[status] = (stats.leads.byStatus[status] || 0) + 1
    })
    
    // Process quotes
    quotes.data?.forEach(quote => {
      const status = quote.status as string
      stats.quotes.byStatus[status] = (stats.quotes.byStatus[status] || 0) + 1
      stats.quotes.totalValue += quote.total_amount || 0
    })
    
    // Process posts
    posts.data?.forEach(post => {
      const status = post.status as string
      if (status === 'published') {
        stats.posts.published++
      } else {
        stats.posts.drafts++
      }
    })
    
    // Process configurations
    configs.data?.forEach(config => {
      const model = config.model as string
      stats.configurations.byModel[model] = (stats.configurations.byModel[model] || 0) + 1
    })
    
    return stats
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return null
  }
}