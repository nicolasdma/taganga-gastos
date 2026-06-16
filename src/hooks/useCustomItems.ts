import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { ExpenseView } from '@/lib/expenseScope'

export function useCustomItems(view: ExpenseView) {
  return useQuery(api.customItems.listVisibleCustomItems, { view })
}
