import { NextRequest, NextResponse } from 'next/server'
import cache from '@/lib/cache/memory-cache'
import { getQueryStats, getSlowQueries } from '@/lib/utils/query-monitor'
import { getDeduplicationStats } from '@/lib/utils/request-deduplication'

/**
 * GET /api/ops/monitoring - Get performance metrics
 *
 * Returns comprehensive performance statistics including:
 * - Cache statistics (hit rate, size, etc.)
 * - Query performance metrics
 * - Request deduplication stats
 * - Slow query detection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    // Get cache statistics
    const cacheStats = cache.stats()

    // Get query performance statistics
    const queryStats = getQueryStats()

    // Get deduplication statistics
    const deduplicationStats = getDeduplicationStats()

    // Get slow queries (if requested)
    const slowQueries = type === 'all' || type === 'slow'
      ? getSlowQueries(20)
      : []

    const response: any = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }

    if (type === 'all' || type === 'cache') {
      response.cache = {
        ...cacheStats,
        hitRate: queryStats.cacheHitRate,
        efficiency: cacheStats.active / (cacheStats.total || 1) * 100
      }
    }

    if (type === 'all' || type === 'queries') {
      response.queries = {
        ...queryStats,
        slowQueriesCount: slowQueries.length,
        performanceScore: calculatePerformanceScore(queryStats)
      }
    }

    if (type === 'all' || type === 'deduplication') {
      response.deduplication = deduplicationStats
    }

    if (type === 'all' || type === 'slow') {
      response.slowQueries = slowQueries.map(q => ({
        query: q.query,
        duration: `${q.duration}ms`,
        endpoint: q.endpoint,
        timestamp: new Date(q.timestamp).toISOString()
      }))
    }

    // Add recommendations
    if (type === 'all') {
      response.recommendations = generateRecommendations(cacheStats, queryStats)
    }

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    console.error('Monitoring API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore(stats: ReturnType<typeof getQueryStats>): number {
  if (stats.totalQueries === 0) return 100

  // Factors:
  // - Average duration (target: < 200ms)
  // - Cache hit rate (target: > 80%)
  // - Slow query rate (target: < 5%)
  // - Error rate (target: < 1%)

  const avgDurationScore = Math.max(0, 100 - (stats.averageDuration / 200) * 100)
  const cacheHitScore = stats.cacheHitRate
  const slowQueryScore = Math.max(0, 100 - (stats.slowQueries / stats.totalQueries) * 100 * 20)
  const errorScore = Math.max(0, 100 - (stats.errorCount / stats.totalQueries) * 100 * 100)

  return Math.round(
    (avgDurationScore * 0.3) +
    (cacheHitScore * 0.4) +
    (slowQueryScore * 0.2) +
    (errorScore * 0.1)
  )
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(
  cacheStats: ReturnType<typeof cache.stats>,
  queryStats: ReturnType<typeof getQueryStats>
): string[] {
  const recommendations: string[] = []

  // Cache recommendations
  if (queryStats.cacheHitRate < 60) {
    recommendations.push('Cache hit rate is below 60%. Consider increasing cache TTLs for frequently accessed data.')
  }

  if (cacheStats.expired > cacheStats.active * 0.5) {
    recommendations.push('High number of expired cache entries. Consider adjusting TTLs or implementing cache warming.')
  }

  // Query performance recommendations
  if (queryStats.averageDuration > 300) {
    recommendations.push('Average query duration is above 300ms. Review slow queries and add indexes where needed.')
  }

  if (queryStats.slowQueries > queryStats.totalQueries * 0.1) {
    recommendations.push('More than 10% of queries are slow (>1000ms). Review the slow queries list and optimize.')
  }

  // Error recommendations
  if (queryStats.errorCount > queryStats.totalQueries * 0.05) {
    recommendations.push('Error rate is above 5%. Check database connectivity and query syntax.')
  }

  // Success message if everything is good
  if (recommendations.length === 0) {
    recommendations.push('✅ All performance metrics are within optimal ranges!')
  }

  return recommendations
}
