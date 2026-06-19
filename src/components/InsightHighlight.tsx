import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { monthKey } from '@/lib/month'
import { useDateContextArgs } from '@/hooks/useLocalToday'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { ExpenseView } from '@/lib/expenseScope'
import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'
import { cn } from '@/lib/utils'

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
            💡
          </span>
          <span className="home-insight-card__copy">
            <span className="home-insight-card__eyebrow">Michi encontró algo</span>
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
