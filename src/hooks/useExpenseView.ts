import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  DEFAULT_EXPENSE_VIEW,
  type ExpenseView,
} from '@/lib/expenseScope'

export function useExpenseView() {
  const saved = useQuery(api.userPreferences.getMyPreferences)
  const patchPreferences = useMutation(api.userPreferences.patchMyPreferences)
  const [view, setViewState] = useState<ExpenseView>(DEFAULT_EXPENSE_VIEW)

  useEffect(() => {
    if (saved === undefined) return
    setViewState(saved.expenseView ?? DEFAULT_EXPENSE_VIEW)
  }, [saved])

  const setView = useCallback(
    (next: ExpenseView) => {
      setViewState(next)
      void patchPreferences({ patch: { expenseView: next } })
    },
    [patchPreferences]
  )

  return { view, setView }
}
