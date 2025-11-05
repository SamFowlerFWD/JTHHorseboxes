/**
 * Cache Warmup on Startup
 *
 * This module warms up critical caches when the application starts,
 * ensuring fast initial response times for common queries.
 *
 * Usage: Import this file in your main server file or app layout.
 */

import { warmCriticalCaches, scheduleCacheWarmup } from '@/lib/utils/cache-warming'

let isInitialized = false
let warmupInterval: NodeJS.Timeout | null = null

/**
 * Initialize cache warming on startup
 *
 * This function should be called once when the application starts.
 * It will warm critical caches and schedule periodic re-warming.
 */
export async function initializeCacheWarmup() {
  if (isInitialized) {
    console.log('[Startup] Cache warmup already initialized, skipping...')
    return
  }

  isInitialized = true

  console.log('[Startup] Initializing cache warmup...')

  try {
    // Initial warmup (non-blocking)
    warmCriticalCaches().catch(err =>
      console.error('[Startup] Cache warmup failed:', err)
    )

    // Schedule periodic warmup every 30 minutes
    warmupInterval = scheduleCacheWarmup(30 * 60 * 1000)

    console.log('[Startup] Cache warmup initialized successfully')
  } catch (error) {
    console.error('[Startup] Failed to initialize cache warmup:', error)
  }
}

/**
 * Cleanup cache warming (useful for testing or graceful shutdown)
 */
export function cleanupCacheWarmup() {
  if (warmupInterval) {
    clearInterval(warmupInterval)
    warmupInterval = null
  }
  isInitialized = false
  console.log('[Startup] Cache warmup cleaned up')
}

// Auto-initialize in production (but allow manual control in development)
if (process.env.NODE_ENV === 'production') {
  initializeCacheWarmup()
}

export default { initializeCacheWarmup, cleanupCacheWarmup }
