import type { CatalogItem } from '@/lib/categories'

const USAGE_KEY = 'gastos-item-usage'

interface ItemUsage {
  count: number
  lastUsedAt: number
}

type UsageStore = Record<string, ItemUsage>

function usageKey(categoryId: string, itemId: string) {
  return `${categoryId}:${itemId}`
}

function readStore(): UsageStore {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UsageStore
  } catch {
    return {}
  }
}

function writeStore(store: UsageStore) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(store))
}

export function recordItemUsage(categoryId: string, itemId: string, at = Date.now()) {
  const store = readStore()
  const key = usageKey(categoryId, itemId)
  const existing = store[key]
  store[key] = {
    count: (existing?.count ?? 0) + 1,
    lastUsedAt: at,
  }
  writeStore(store)
}

export function getLocalItemUsage(categoryId: string, itemId: string): ItemUsage | undefined {
  return readStore()[usageKey(categoryId, itemId)]
}

/** Frecuencia × peso + decaimiento por días desde el último uso. */
export function computeItemScore(
  local: ItemUsage | undefined,
  serverCount = 0,
  now = Date.now()
): number {
  const count = (local?.count ?? 0) + serverCount
  if (count === 0 && !local?.lastUsedAt) return 0

  const daysSince =
    local?.lastUsedAt != null ? Math.max(0, (now - local.lastUsedAt) / 86_400_000) : 30
  const recency = local?.lastUsedAt != null ? Math.exp(-daysSince / 12) : 0

  return count * 12 + recency * 10
}

export function sortCatalogByUsage(
  items: CatalogItem[],
  categoryId: string,
  serverCounts: Map<string, number>
): CatalogItem[] {
  const store = readStore()
  const now = Date.now()

  return [...items].sort((a, b) => {
    const scoreA = computeItemScore(
      store[usageKey(categoryId, a.id)],
      serverCounts.get(a.id) ?? 0,
      now
    )
    const scoreB = computeItemScore(
      store[usageKey(categoryId, b.id)],
      serverCounts.get(b.id) ?? 0,
      now
    )
    if (scoreB !== scoreA) return scoreB - scoreA
    return a.label.localeCompare(b.label, 'es')
  })
}
