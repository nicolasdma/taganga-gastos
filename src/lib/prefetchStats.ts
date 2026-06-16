let prefetched = false

/** Warm the Stats chunk (+ recharts) before the user opens the tab. */
export function prefetchStatsScreen(): void {
  if (prefetched) return
  prefetched = true
  void import('@/screens/StatsScreen')
}
