/**
 * Simple in-memory cache for Next.js
 * Note: This is a process-level cache. For multi-server deployments, use Redis.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  /**
   * Set a value in cache with TTL in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expired++
      } else {
        active++
      }
    })

    return {
      total: this.cache.size,
      active,
      expired,
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`)
    }
  }

  /**
   * Shutdown and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton instance
const cache = new MemoryCache()

// Cache key builders
export const CacheKeys = {
  // Dashboard
  dashboardStats: () => 'dashboard:stats',
  dashboardMetrics: (userId?: string) => `dashboard:metrics:${userId || 'all'}`,

  // Pipeline
  pipelineData: () => 'pipeline:data',
  pipelineStageCount: (stage: string) => `pipeline:stage:${stage}:count`,

  // Leads
  lead: (id: string) => `lead:${id}`,
  leadsPage: (page: number, filter?: string) => `leads:page:${page}:${filter || 'all'}`,

  // Customers
  customer: (id: string) => `customer:${id}`,
  customersPage: (page: number) => `customers:page:${page}`,

  // Inventory
  inventoryList: () => 'inventory:list',
  inventoryItem: (id: string) => `inventory:${id}`,
  inventoryPage: (page: number, filter?: string) => `inventory:page:${page}:${filter || 'all'}`,

  // Quotes
  quote: (id: string) => `quote:${id}`,
  quotesPage: (page: number, filter?: string) => `quotes:page:${page}:${filter || 'all'}`,

  // Pricing
  pricingConfig: () => 'pricing:config',
  modelPricing: (modelId: string) => `pricing:model:${modelId}`,
  pricingOptions: (model?: string, category?: string, availableOnly?: boolean) =>
    `pricing:options:${model || 'all'}:${category || 'all'}:${availableOnly ? 'available' : 'all'}`,

  // Knowledge Base
  kbArticle: (slug: string) => `kb:article:${slug}`,
  kbList: (category?: string) => `kb:list:${category || 'all'}`,

  // Search
  searchResults: (query: string, index: string) => `search:${index}:${query}`,
}

// Cache TTLs (in seconds)
export const CacheTTL = {
  short: 60,          // 1 minute
  medium: 300,        // 5 minutes
  long: 900,          // 15 minutes
  veryLong: 3600,     // 1 hour
  pricing: 86400,     // 24 hours (pricing rarely changes)
}

/**
 * Cached function wrapper
 */
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute function
  const result = await fn()

  // Store in cache
  cache.set(key, result, ttl)

  return result
}

/**
 * Invalidate cache by pattern
 */
export function invalidatePattern(pattern: string): number {
  let count = 0
  const regex = new RegExp(pattern)

  // Get all keys
  const keys: string[] = []
  cache['cache'].forEach((_, key) => {
    if (regex.test(key)) {
      keys.push(key)
    }
  })

  // Delete matching keys
  keys.forEach(key => {
    if (cache.delete(key)) {
      count++
    }
  })

  return count
}

export default cache
