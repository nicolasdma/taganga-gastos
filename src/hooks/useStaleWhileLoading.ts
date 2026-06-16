import { useRef } from 'react'

export interface StaleWhileLoadingResult<T> {
  /** Latest defined value for this cache key, or the previous one while the query reloads. */
  value: T | undefined
  /** True when showing a cached value because the live query is undefined. */
  isStale: boolean
  /** True only on first load for this key — no cached value exists yet. */
  isInitialLoad: boolean
}

/**
 * Keeps the last defined Convex useQuery result during arg changes (e.g. view toggle).
 * Prevents skeleton / em-dash flashes while the new subscription hydrates.
 *
 * Pass `cacheKey` (e.g. expense view) so stale data from one scope is not shown for another.
 */
export function useStaleWhileLoading<T>(
  live: T | undefined,
  cacheKey = 'default'
): StaleWhileLoadingResult<T> {
  const cacheRef = useRef(new Map<string, T>())
  const hadValueRef = useRef(new Map<string, boolean>())

  if (live !== undefined) {
    cacheRef.current.set(cacheKey, live)
    hadValueRef.current.set(cacheKey, true)
  }

  const cached = cacheRef.current.get(cacheKey)
  const value = live ?? cached
  const isStale = live === undefined && cached !== undefined
  const isInitialLoad = !hadValueRef.current.get(cacheKey) && live === undefined

  return { value, isStale, isInitialLoad }
}
