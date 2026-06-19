import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { monthKey } from '@/lib/month'
import { useDateContextArgs } from '@/hooks/useLocalToday'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { ExpenseView } from '@/lib/expenseScope'
import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'
import { cn } from '@/lib/utils'

function MichiInsightBulb() {
  return (
    <svg
      className="home-insight-card__bulb"
      viewBox="0 0 42 42"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M15.6 18.6c0-3.32 2.43-6.03 5.44-6.03 3.03 0 5.42 2.71 5.42 6.03 0 2.07-.93 3.59-2.02 4.78-.82.9-1.27 1.65-1.35 2.57h-4.1c-.07-.92-.51-1.67-1.34-2.57-1.09-1.19-2.05-2.71-2.05-4.78Z"
        fill="#f6e6b5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M18.9 28.08h4.26M19.42 30.52h3.23M21.03 8.55V5.9M12.94 11.83l-1.82-1.93M29.07 11.83l1.82-1.93M10.02 19.76H7.65M34.34 19.76h-2.38"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M29.3 27.35c1.18.12 2.08.55 2.44 1.23.42.8-.2 1.7-1.48 2.12m-15.84-3.35c-1.17.12-2.07.55-2.43 1.23-.43.8.19 1.7 1.47 2.12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.85"
        opacity="0.68"
      />
    </svg>
  )
}

function MichiExcitementLines() {
  return (
    <svg
      className="home-insight-card__spark"
      viewBox="0 0 24 20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.5 11.4 2.9 9.1" />
      <path d="M10.6 7.2 8.3 2.6" />
      <path d="M13.9 11.6 19.7 7.5" />
    </svg>
  )
}

interface InsightHighlightProps {
  view: ExpenseView
  onOpenStats: () => void
  pulseKey?: number
  panelRole?: ExpenseViewPanelRole
}

export function InsightHighlight({
  view,
  onOpenStats,
  pulseKey = 0,
  panelRole = 'active',
}: InsightHighlightProps) {
  const dateContext = useDateContextArgs()
  const insightsLive = useQuery(api.expenses.insights, {
    month: monthKey(),
    view,
    ...dateContext,
  })
  const { value: insights, isStale, isInitialLoad } = useStaleWhileLoading(insightsLive, view)

  const top = insights && insights.length > 0 ? insights[0] : null
  const reserveSlot =
    top !== null || isInitialLoad || (isStale && panelRole === 'incoming')
  const dimStale = isStale && panelRole === 'incoming'

  if (!top && !reserveSlot) return null

  return (
    <div className={cn('insight-highlight-slot', !top && 'invisible')} aria-hidden={!top}>
      {top ? (
        <button
          key={pulseKey}
          type="button"
          onClick={onOpenStats}
          aria-label={`Abrir estadísticas: ${top}`}
          className={cn(
            'home-insight-card w-full text-left',
            'active:scale-[0.99] transition-transform',
            dimStale && 'expense-view-stale'
          )}
        >
          <span className="home-insight-card__medallion" aria-hidden>
            <MichiInsightBulb />
          </span>
          <span className="home-insight-card__copy">
            <span className="home-insight-card__eyebrow">
              <span>Michi encontró algo</span>
              <MichiExcitementLines />
            </span>
            <span className="home-insight-card__text">{top}</span>
          </span>
          <span className="home-insight-card__chevron" aria-hidden>
            ›
          </span>
        </button>
      ) : null}
    </div>
  )
}
