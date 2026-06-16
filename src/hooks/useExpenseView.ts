import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  DEFAULT_EXPENSE_VIEW,
  type ExpenseView,
} from '@/lib/expenseScope'

export function useExpenseView() {
  const saved = useQuery(api.userPreferences.getMyPreferences)
  const patchPreferences = useMutation(api.userPreferences.patchMyPreferences)
  const [optimisticView, setOptimisticView] = useState<ExpenseView | null>(null)

  const syncedView =
    saved === undefined ? DEFAULT_EXPENSE_VIEW : (saved.expenseView ?? DEFAULT_EXPENSE_VIEW)
  const view = optimisticView ?? syncedView

  const setView = useCallback(
    (next: ExpenseView) => {
      setOptimisticView(next)
      void patchPreferences({ patch: { expenseView: next } }).finally(() => {
        setOptimisticView((current) => (current === next ? null : current))
      })
    },
    [patchPreferences]
  )

  return { view, setView }
}
