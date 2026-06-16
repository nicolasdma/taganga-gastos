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
import {
  type ExpenseViewPanelRole,
  isExpenseViewPanelVisible,
} from '@/components/editorial/expenseViewPanelRole'

/** Brief hold after slide ends so animation fill isn't stripped on the same frame */
const TRANSITION_COOLDOWN_MS = 120

const PERSISTENT_VIEWS = ['personal', 'shared'] as const satisfies readonly ExpenseView[]

interface ExpenseViewTransitionProps {
  view: ExpenseView
  direction: ExpenseViewDirection
  isTransitioning: boolean
  children: (panelView: ExpenseView, role: ExpenseViewPanelRole) => ReactNode
}

function resolvePanelRole(
  panelView: ExpenseView,
  targetView: ExpenseView,
  fromView: ExpenseView | null,
  motionActive: boolean
): ExpenseViewPanelRole {
  if (fromView !== null) {
    if (panelView === fromView) return 'outgoing'
    if (panelView === targetView) return 'incoming'
    return 'dormant'
  }

  if (motionActive) {
    return panelView === targetView ? 'incoming' : 'dormant'
  }

  return panelView === targetView ? 'active' : 'dormant'
}

/**
 * Persistent dual panels (personal + shared) — each keeps its own Convex subscriptions.
 * Toggle only swaps roles / slide; panel view props never change, so data never clears.
 *
 * Timing matches --expense-view-transition-duration in index.css (800ms).
 */
export function ExpenseViewTransition({
  view,
  direction,
  isTransitioning,
  children,
}: ExpenseViewTransitionProps) {
  const [committedView, setCommittedView] = useState(view)
  const [motionActive, setMotionActive] = useState(false)
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined)
  const measureRef = useRef<HTMLDivElement>(null)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fromView = view !== committedView ? committedView : null
  const dual = fromView !== null

  const measure = useCallback(() => {
    const el = measureRef.current
    if (!el) return
    const next = el.offsetHeight
    setMinHeight((prev) => (prev === undefined ? next : Math.max(prev, next)))
  }, [])

  const clearTimers = useCallback(() => {
    if (settleTimerRef.current !== null) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
    if (cooldownTimerRef.current !== null) {
      clearTimeout(cooldownTimerRef.current)
      cooldownTimerRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const el = measureRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, view, committedView, dual, motionActive])

  useEffect(() => () => clearTimers(), [clearTimers])

  useEffect(() => {
    if (view === committedView) return

    setMotionActive(true)
    clearTimers()

    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null
      setCommittedView(view)
      measure()
      cooldownTimerRef.current = setTimeout(() => {
        cooldownTimerRef.current = null
        setMotionActive(false)
      }, TRANSITION_COOLDOWN_MS)
    }, EXPENSE_VIEW_TRANSITION_MS)

    return clearTimers
  }, [view, committedView, measure, clearTimers])

  const showMotion = motionActive || isTransitioning || dual
  const dirClass =
    direction === 1
      ? 'expense-view-transition--to-shared'
      : direction === -1
        ? 'expense-view-transition--to-personal'
        : undefined

  return (
    <div
      className={cn('expense-view-transition', dirClass, showMotion && 'expense-view-transition--active')}
      style={minHeight !== undefined ? { minHeight } : undefined}
      data-view={view}
    >
      {PERSISTENT_VIEWS.map((panelView) => {
        const role = resolvePanelRole(panelView, view, fromView, motionActive)
        const visible = isExpenseViewPanelVisible(role)

        return (
          <div
            key={panelView}
            ref={visible ? measureRef : undefined}
            className={cn(
              'expense-view-transition__layer',
              role === 'dormant' && 'expense-view-transition__layer--dormant',
              role === 'outgoing' && 'expense-view-transition__layer--outgoing',
              visible && 'expense-view-transition__layer--primary',
              role === 'incoming' && dual && 'expense-view-transition__layer--entering'
            )}
            aria-hidden={!visible && role !== 'outgoing'}
          >
            {children(panelView, role)}
          </div>
        )
      })}
    </div>
  )
}
