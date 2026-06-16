import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  DEFAULT_EXPENSE_VIEW,
  type ExpenseView,
} from '@/lib/expenseScope'

interface ExpenseViewContextValue {
  view: ExpenseView
  setView: (next: ExpenseView) => void
  /** Convex preferences loaded (not undefined). */
  isReady: boolean
}

const ExpenseViewContext = createContext<ExpenseViewContextValue | null>(null)

function useExpenseViewState(): ExpenseViewContextValue {
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

  return { view, setView, isReady: saved !== undefined }
}

/**
 * Single source of truth for optimistic expense view.
 *
 * Convex already deduplicates network subscriptions for identical useQuery calls.
 * This provider exists to prevent fragmented optimistic state across Home, Calendar,
 * Stats, and Brandmark during view toggles (N hooks × separate useState otherwise).
 */
export function ExpenseViewProvider({ children }: { children: ReactNode }) {
  const value = useExpenseViewState()
  return createElement(ExpenseViewContext.Provider, { value }, children)
}

export function useExpenseView(): ExpenseViewContextValue {
  const ctx = useContext(ExpenseViewContext)
  if (!ctx) {
    throw new Error('useExpenseView must be used within ExpenseViewProvider')
  }
  return ctx
}
