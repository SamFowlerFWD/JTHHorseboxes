/**
 * Query Performance Monitoring Utility
 *
 * Tracks query performance, detects slow queries, and provides
 * statistics for optimization analysis.
 */

interface QueryLog {
  query: string
  duration: number
  timestamp: number
  endpoint?: string
  cached?: boolean
  error?: string
}

interface QueryStats {
  totalQueries: number
  slowQueries: number
  averageDuration: number
  fastestQuery: number
  slowestQuery: number
  cacheHits: number
  cacheHitRate: number
  errorCount: number
}

class QueryMonitor {
  private logs: QueryLog[] = []
  private readonly maxLogs: number = 1000
  private slowQueryThreshold: number = 1000 // 1 second

  /**
   * Log a query execution
   */
  log(query: string, duration: number, options?: {
    endpoint?: string
    cached?: boolean
    error?: string
  }): void {
    const log: QueryLog = {
      query,
      duration,
      timestamp: Date.now(),
      ...options
    }

    this.logs.push(log)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Log slow queries to console
    if (duration > this.slowQueryThreshold && !options?.cached) {
      console.warn(`[SLOW QUERY] ${duration}ms - ${query}`, {
        endpoint: options?.endpoint,
        duration
      })
    }

    // Log errors
    if (options?.error) {
      console.error(`[QUERY ERROR] ${query}`, {
        error: options.error,
        endpoint: options?.endpoint
      })
    }
  }

  /**
   * Get statistics for all queries
   */
  getStats(): QueryStats {
    if (this.logs.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageDuration: 0,
        fastestQuery: 0,
        slowestQuery: 0,
        cacheHits: 0,
        cacheHitRate: 0,
        errorCount: 0
      }
    }

    const durations = this.logs
      .filter(log => !log.cached)
      .map(log => log.duration)

    const slowQueries = this.logs.filter(
      log => log.duration > this.slowQueryThreshold && !log.cached
    )

    const cacheHits = this.logs.filter(log => log.cached)
    const errors = this.logs.filter(log => log.error)

    return {
      totalQueries: this.logs.length,
      slowQueries: slowQueries.length,
      averageDuration: durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
      fastestQuery: durations.length > 0 ? Math.min(...durations) : 0,
      slowestQuery: durations.length > 0 ? Math.max(...durations) : 0,
      cacheHits: cacheHits.length,
      cacheHitRate: this.logs.length > 0
        ? (cacheHits.length / this.logs.length) * 100
        : 0,
      errorCount: errors.length
    }
  }

  /**
   * Get slow queries (above threshold)
   */
  getSlowQueries(limit: number = 10): QueryLog[] {
    return this.logs
      .filter(log => log.duration > this.slowQueryThreshold && !log.cached)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit: number = 50): QueryLog[] {
    return this.logs
      .slice(-limit)
      .reverse()
  }

  /**
   * Get queries by endpoint
   */
  getQueriesByEndpoint(endpoint: string): QueryLog[] {
    return this.logs.filter(log => log.endpoint === endpoint)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms
  }
}

// Singleton instance
const monitor = new QueryMonitor()

/**
 * Wrapper function to monitor query execution
 *
 * @example
 * ```typescript
 * const results = await monitorQuery(
 *   'fetch_leads',
 *   async () => {
 *     return await supabase.from('leads').select('*')
 *   },
 *   { endpoint: '/api/ops/pipeline' }
 * )
 * ```
 */
export async function monitorQuery<T>(
  queryName: string,
  fn: () => Promise<T>,
  options?: {
    endpoint?: string
    cached?: boolean
  }
): Promise<T> {
  const startTime = Date.now()

  try {
    const result = await fn()
    const duration = Date.now() - startTime

    monitor.log(queryName, duration, options)

    return result
  } catch (error: any) {
    const duration = Date.now() - startTime

    monitor.log(queryName, duration, {
      ...options,
      error: error.message
    })

    throw error
  }
}

/**
 * Get query statistics
 */
export function getQueryStats(): QueryStats {
  return monitor.getStats()
}

/**
 * Get slow queries
 */
export function getSlowQueries(limit?: number): QueryLog[] {
  return monitor.getSlowQueries(limit)
}

/**
 * Get recent queries
 */
export function getRecentQueries(limit?: number): QueryLog[] {
  return monitor.getRecentQueries(limit)
}

/**
 * Clear query logs
 */
export function clearQueryLogs(): void {
  monitor.clear()
}

/**
 * Set slow query threshold
 */
export function setSlowQueryThreshold(ms: number): void {
  monitor.setSlowQueryThreshold(ms)
}

export default monitor
