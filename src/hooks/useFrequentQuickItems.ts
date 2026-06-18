import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ITEM_CATALOG } from '@/lib/items'
import { mergeCatalogWithCustom } from '@/lib/mergeCatalog'
import { getTopCatalogItems } from '@/lib/itemUsage'
import { useCustomItems } from '@/hooks/useCustomItems'
import { useDateContextArgs } from '@/hooks/useLocalToday'
import type { ExpenseView } from '@/lib/expenseScope'

export interface FrequentQuickItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

/** Conteos server de ítems frecuentes, filtrados por vista Nosotros/Míos. */
export function useFrequentItemCounts(view: ExpenseView): Map<string, number> | undefined {
  const dateContext = useDateContextArgs()
  const frequent = useQuery(api.expenses.frequentItems, { limit: 80, view, ...dateContext })

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
  const customItems = useCustomItems(view)

  return useMemo(() => {
    if (serverCounts === undefined || customItems === undefined) return undefined
    const merged = mergeCatalogWithCustom(ITEM_CATALOG, customItems)
    return getTopCatalogItems(merged, serverCounts, limit).map((item) => ({
      itemId: item.id,
      itemEmoji: item.emoji,
      itemLabel: item.label,
    }))
  }, [serverCounts, customItems, limit])
}
