/**
 * Cache Warming Utility
 *
 * Pre-loads critical data into cache on application startup or
 * on a schedule to ensure fast response times for common queries.
 */

import { getPricingOptions } from '@/lib/supabase/optimized-queries'
import { getDashboardMetrics } from '@/lib/supabase/optimized-queries'
import { getPipelineDataOptimized } from '@/lib/supabase/optimized-queries'

interface WarmupTask {
  name: string
  fn: () => Promise<any>
  priority: 'critical' | 'high' | 'medium' | 'low'
}

class CacheWarmer {
  private isWarming: boolean = false
  private lastWarmup: number = 0
  private readonly cooldown: number = 60000 // 1 minute between warmups

  /**
   * Warm up critical caches
   */
  async warmCriticalCaches(): Promise<void> {
    if (this.isWarming) {
      console.log('[Cache Warmer] Already warming, skipping...')
      return
    }

    const now = Date.now()
    if (now - this.lastWarmup < this.cooldown) {
      console.log('[Cache Warmer] Cooldown period, skipping...')
      return
    }

    this.isWarming = true
    this.lastWarmup = now

    const startTime = Date.now()
    console.log('[Cache Warmer] Starting cache warmup...')

    const tasks: WarmupTask[] = [
      // Critical: Pricing data (used on every configurator load)
      {
        name: 'pricing_3.5t',
        fn: () => getPricingOptions('3.5t', undefined, true),
        priority: 'critical'
      },
      {
        name: 'pricing_4.5t',
        fn: () => getPricingOptions('4.5t', undefined, true),
        priority: 'critical'
      },
      {
        name: 'pricing_7.2t',
        fn: () => getPricingOptions('7.2t', undefined, true),
        priority: 'critical'
      },
      {
        name: 'pricing_all',
        fn: () => getPricingOptions(undefined, undefined, true),
        priority: 'critical'
      },

      // High: Dashboard metrics (viewed frequently)
      {
        name: 'dashboard_metrics',
        fn: () => getDashboardMetrics(),
        priority: 'high'
      },

      // High: Pipeline data (viewed frequently)
      {
        name: 'pipeline_data',
        fn: () => getPipelineDataOptimized(),
        priority: 'high'
      },
    ]

    // Run tasks in priority order
    const criticalTasks = tasks.filter(t => t.priority === 'critical')
    const highTasks = tasks.filter(t => t.priority === 'high')

    try {
      // Critical tasks in parallel
      await Promise.all(
        criticalTasks.map(task => this.runTask(task))
      )

      // High priority tasks in parallel
      await Promise.all(
        highTasks.map(task => this.runTask(task))
      )

      const duration = Date.now() - startTime
      console.log(`[Cache Warmer] Completed in ${duration}ms`)
    } catch (error) {
      console.error('[Cache Warmer] Error during warmup:', error)
    } finally {
      this.isWarming = false
    }
  }

  /**
   * Run a single warmup task
   */
  private async runTask(task: WarmupTask): Promise<void> {
    const startTime = Date.now()

    try {
      await task.fn()
      const duration = Date.now() - startTime
      console.log(`[Cache Warmer] ✓ ${task.name} (${duration}ms)`)
    } catch (error: any) {
      console.error(`[Cache Warmer] ✗ ${task.name}:`, error.message)
    }
  }

  /**
   * Schedule periodic cache warming
   *
   * @param intervalMs - Interval in milliseconds (default: 30 minutes)
   */
  scheduleWarmup(intervalMs: number = 30 * 60 * 1000): NodeJS.Timeout {
    console.log(`[Cache Warmer] Scheduling warmup every ${intervalMs / 1000}s`)

    // Initial warmup
    this.warmCriticalCaches().catch(err =>
      console.error('[Cache Warmer] Initial warmup failed:', err)
    )

    // Periodic warmup
    return setInterval(() => {
      this.warmCriticalCaches().catch(err =>
        console.error('[Cache Warmer] Periodic warmup failed:', err)
      )
    }, intervalMs)
  }
}

// Singleton instance
const warmer = new CacheWarmer()

/**
 * Warm critical caches
 */
export async function warmCriticalCaches(): Promise<void> {
  return warmer.warmCriticalCaches()
}

/**
 * Schedule periodic cache warming
 */
export function scheduleCacheWarmup(intervalMs?: number): NodeJS.Timeout {
  return warmer.scheduleWarmup(intervalMs)
}

export default warmer
