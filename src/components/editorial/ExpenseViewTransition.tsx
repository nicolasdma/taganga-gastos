import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  EXPENSE_VIEW_TRANSITION_MS,
  type ExpenseViewDirection,
} from '@/hooks/useExpenseView'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

interface ExpenseViewTransitionProps {
  view: ExpenseView
  direction: ExpenseViewDirection
  isTransitioning: boolean
  children: (panelView: ExpenseView, role: 'active' | 'outgoing' | 'incoming') => ReactNode
}

/**
 * Horizontal slide for Nosotros ↔ Míos on Home.
 * Timing matches .editorial-brandmark__kitties / __kitty-slot in index.css (520ms, cubic-bezier(0.22, 1, 0.36, 1)).
 */
export function ExpenseViewTransition({
  view,
  direction,
  isTransitioning,
  children,
}: ExpenseViewTransitionProps) {
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined)
  const [layers, setLayers] = useState<{
    outgoing: ExpenseView | null
    incoming: ExpenseView
  }>({ outgoing: null, incoming: view })
  const measureRef = useRef<HTMLDivElement>(null)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const measure = useCallback(() => {
    const el = measureRef.current
    if (!el) return
    const next = el.offsetHeight
    setMinHeight((prev) => (prev === undefined ? next : Math.max(prev, next)))
  }, [])

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, layers.incoming, layers.outgoing])

  useEffect(() => {
    setLayers((prev) => {
      if (view === prev.incoming) return prev
      return { outgoing: prev.incoming, incoming: view }
    })

    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
    }

    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null
      setLayers({ outgoing: null, incoming: view })
      measure()
    }, EXPENSE_VIEW_TRANSITION_MS)

    return () => {
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
    }
  }, [view, measure])

  const dual = layers.outgoing !== null
  const dirClass =
    direction === 1
      ? 'expense-view-transition--to-shared'
      : direction === -1
        ? 'expense-view-transition--to-personal'
        : undefined

  return (
    <div
      className={cn('expense-view-transition', dirClass, isTransitioning && 'expense-view-transition--active')}
      style={minHeight !== undefined ? { minHeight } : undefined}
      data-view={view}
    >
      {dual ? (
        <>
          <div
            className="expense-view-transition__layer expense-view-transition__layer--outgoing"
            aria-hidden
          >
            {children(layers.outgoing!, 'outgoing')}
          </div>
          <div className="expense-view-transition__layer expense-view-transition__layer--incoming">
            {children(layers.incoming, 'incoming')}
          </div>
        </>
      ) : (
        <div ref={measureRef} className="expense-view-transition__layer expense-view-transition__layer--active">
          {children(layers.incoming, 'active')}
        </div>
      )}
    </div>
  )
}
