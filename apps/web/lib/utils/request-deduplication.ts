/**
 * Request Deduplication Utility
 *
 * Prevents duplicate identical requests from executing simultaneously.
 * When multiple identical requests come in, only the first executes and
 * all others wait for and share the same result.
 *
 * Perfect for search queries, expensive calculations, or any operation
 * where duplicate requests within a short time window are wasteful.
 */

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

class RequestDeduplicator {
  private pending: Map<string, PendingRequest<any>> = new Map()
  private readonly maxAge: number = 5000 // 5 seconds

  /**
   * Execute a request with deduplication
   *
   * @param key - Unique identifier for this request (e.g., query string)
   * @param fn - Function to execute if no duplicate is pending
   * @param maxAge - Maximum age in ms to consider a request fresh (default: 5000)
   */
  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>,
    maxAge: number = this.maxAge
  ): Promise<T> {
    // Clean up old pending requests
    this.cleanup()

    // Check if identical request is already pending
    const existing = this.pending.get(key)
    if (existing) {
      const age = Date.now() - existing.timestamp
      if (age < maxAge) {
        // Return the existing promise
        return existing.promise
      } else {
        // Existing request is too old, remove it
        this.pending.delete(key)
      }
    }

    // No pending request, execute the function
    const promise = fn()
      .finally(() => {
        // Clean up after completion
        this.pending.delete(key)
      })

    // Store the pending request
    this.pending.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  /**
   * Clean up expired pending requests
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.pending.forEach((request, key) => {
      if (now - request.timestamp > this.maxAge) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.pending.delete(key))
  }

  /**
   * Get statistics about pending requests
   */
  stats() {
    return {
      pendingRequests: this.pending.size,
      oldestRequest: this.getOldestRequestAge(),
    }
  }

  /**
   * Get age of oldest pending request in ms
   */
  private getOldestRequestAge(): number {
    let oldest = 0
    const now = Date.now()

    this.pending.forEach(request => {
      const age = now - request.timestamp
      if (age > oldest) {
        oldest = age
      }
    })

    return oldest
  }

  /**
   * Clear all pending requests (useful for testing)
   */
  clear(): void {
    this.pending.clear()
  }
}

// Singleton instance
const deduplicator = new RequestDeduplicator()

/**
 * Helper function for easy deduplication
 *
 * @example
 * ```typescript
 * // In API route
 * const results = await deduplicate(
 *   `search:${query}:${index}`,
 *   async () => {
 *     return await performExpensiveSearch(query, index)
 *   }
 * )
 * ```
 */
export async function deduplicate<T>(
  key: string,
  fn: () => Promise<T>,
  maxAge?: number
): Promise<T> {
  return deduplicator.deduplicate(key, fn, maxAge)
}

/**
 * Get deduplication statistics
 */
export function getDeduplicationStats() {
  return deduplicator.stats()
}

/**
 * Clear all pending requests
 */
export function clearDeduplication() {
  deduplicator.clear()
}

export default deduplicator
