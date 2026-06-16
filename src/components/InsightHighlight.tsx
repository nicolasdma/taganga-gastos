import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { monthKey } from '@/lib/month'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

interface InsightHighlightProps {
  view: ExpenseView
  onOpenStats: () => void
  pulseKey?: number
}

export function InsightHighlight({
  view,
  onOpenStats,
  pulseKey = 0,
}: InsightHighlightProps) {
  const insights = useQuery(api.expenses.insights, { month: monthKey(), view })

  if (insights === undefined || insights.length === 0) return null

  const top = insights[0]

  return (
    <button
      key={pulseKey}
      type="button"
      onClick={onOpenStats}
      className={cn(
        'w-full text-left rounded-2xl px-4 py-3 card-stitched',
        'text-xs text-muted-foreground leading-snug font-medium',
        'active:scale-[0.99] transition-transform'
      )}
    >
      <span className="mr-1.5">💡</span>
      {top}
    </button>
  )
}
