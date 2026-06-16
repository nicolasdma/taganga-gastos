import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  DEFAULT_EXPENSE_VIEW,
  type ExpenseView,
} from '@/lib/expenseScope'

/** Matches editorial-brandmark__kitties width / slot timing in index.css */
export const EXPENSE_VIEW_TRANSITION_MS = 520

export type ExpenseViewDirection = -1 | 0 | 1

interface ExpenseViewContextValue {
  view: ExpenseView
  setView: (next: ExpenseView) => void
  /** Convex preferences loaded (not undefined). */
  isReady: boolean
  /** +1 personal→shared, -1 shared→personal, 0 idle */
  direction: ExpenseViewDirection
  isTransitioning: boolean
}

const ExpenseViewContext = createContext<ExpenseViewContextValue | null>(null)

function useExpenseViewState(): ExpenseViewContextValue {
  const saved = useQuery(api.userPreferences.getMyPreferences)
  const patchPreferences = useMutation(api.userPreferences.patchMyPreferences)
  const [optimisticView, setOptimisticView] = useState<ExpenseView | null>(null)
  const [direction, setDirection] = useState<ExpenseViewDirection>(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewRef = useRef<ExpenseView>(DEFAULT_EXPENSE_VIEW)

  const syncedView =
    saved === undefined ? DEFAULT_EXPENSE_VIEW : (saved.expenseView ?? DEFAULT_EXPENSE_VIEW)
  const view = optimisticView ?? syncedView
  viewRef.current = view

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  const setView = useCallback(
    (next: ExpenseView) => {
      const current = viewRef.current
      if (next !== current) {
        setDirection(next === 'shared' ? 1 : -1)
        setIsTransitioning(true)
        if (transitionTimerRef.current !== null) {
          clearTimeout(transitionTimerRef.current)
        }
        transitionTimerRef.current = setTimeout(() => {
          transitionTimerRef.current = null
          setIsTransitioning(false)
          setDirection(0)
        }, EXPENSE_VIEW_TRANSITION_MS)
      }

      setOptimisticView(next)
      void patchPreferences({ patch: { expenseView: next } }).finally(() => {
        setOptimisticView((currentOptimistic) => (currentOptimistic === next ? null : currentOptimistic))
      })
    },
    [patchPreferences]
  )

  return { view, setView, isReady: saved !== undefined, direction, isTransitioning }
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
