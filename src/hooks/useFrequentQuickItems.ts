import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ITEM_CATALOG } from '@/lib/items'
import { getTopCatalogItems } from '@/lib/itemUsage'
import type { ExpenseView } from '@/lib/expenseScope'

export interface FrequentQuickItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

/** Conteos server de ítems frecuentes, filtrados por vista Nosotros/Míos. */
export function useFrequentItemCounts(view: ExpenseView): Map<string, number> | undefined {
  const frequent = useQuery(api.expenses.frequentItems, { limit: 80, view })

  return useMemo(() => {
    if (frequent === undefined) return undefined
    const counts = new Map<string, number>()
    for (const row of frequent) {
      if (row.itemId) counts.set(row.itemId, row.count)
    }
    return counts
  }, [frequent])
}

/** Top N ítems con la misma regla de orden que el picker completo. */
export function useFrequentQuickItems(
  view: ExpenseView,
  limit = 3
): FrequentQuickItem[] | undefined {
  const serverCounts = useFrequentItemCounts(view)

  return useMemo(() => {
    if (serverCounts === undefined) return undefined
    return getTopCatalogItems(ITEM_CATALOG, serverCounts, limit).map((item) => ({
      itemId: item.id,
      itemEmoji: item.emoji,
      itemLabel: item.label,
    }))
  }, [serverCounts, limit])
}
