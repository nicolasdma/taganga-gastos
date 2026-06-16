import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { monthKey } from '@/lib/month'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

type PanelRole = 'active' | 'outgoing' | 'incoming'

interface InsightHighlightProps {
  view: ExpenseView
  onOpenStats: () => void
  pulseKey?: number
  panelRole?: PanelRole
}

export function InsightHighlight({
  view,
  onOpenStats,
  pulseKey = 0,
  panelRole = 'active',
}: InsightHighlightProps) {
  const insightsLive = useQuery(api.expenses.insights, { month: monthKey(), view })
  const { value: insights, isStale, isInitialLoad } = useStaleWhileLoading(insightsLive, view)

  const top = insights && insights.length > 0 ? insights[0] : null
  const reserveSlot = top !== null || isInitialLoad || (isStale && panelRole !== 'outgoing')
  const dimStale = isStale && panelRole !== 'outgoing'

  if (!top && !reserveSlot) return null

  return (
    <div className={cn('insight-highlight-slot', !top && 'invisible')} aria-hidden={!top}>
      {top ? (
        <button
          key={pulseKey}
          type="button"
          onClick={onOpenStats}
          className={cn(
            'w-full text-left rounded-2xl px-4 py-3 card-stitched',
            'text-xs text-muted-foreground leading-snug font-medium',
            'active:scale-[0.99] transition-transform',
            dimStale && 'expense-view-stale'
          )}
        >
          <span className="mr-1.5">💡</span>
          {top}
        </button>
      ) : null}
    </div>
  )
}
