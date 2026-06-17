import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CraftStatsShell } from '@/components/craft/CraftStatsShell'
import { pickStatsMessage } from '@/components/craft/craftLoadingMessages'
import { EditorialScreenHeader } from '@/components/editorial/EditorialScreenHeader'
import { ExpenseViewTransition } from '@/components/editorial/ExpenseViewTransition'
import { monthKey, shiftMonthKey } from '@/lib/month'
import { useExpenseView } from '@/hooks/useExpenseView'
import { useLocalToday } from '@/hooks/useLocalToday'
import { useReportTabScroll } from '@/hooks/useReportTabScroll'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'
import type { ExpenseView } from '@/lib/expenseScope'

function StatsViewPanel({
  panelView,
  panelRole,
  active,
  month,
  todayKey,
  onPrevMonth,
  onNextMonth,
  nextDisabled,
  statsMessage,
}: {
  panelView: ExpenseView
  panelRole: ExpenseViewPanelRole
  active: boolean
  month: string
  todayKey: string
  onPrevMonth: () => void
  onNextMonth: () => void
  nextDisabled: boolean
  statsMessage: string
}) {
  const byItemLive = useQuery(
    api.expenses.expensesByItem,
    active ? { month, view: panelView } : 'skip'
  )
  const insightsLive = useQuery(
    api.expenses.insights,
    active ? { month, view: panelView, todayKey } : 'skip'
  )

  const { value: byItem, isStale: byItemStale } = useStaleWhileLoading(byItemLive, panelView)
  const { value: insights, isStale: insightsStale } = useStaleWhileLoading(insightsLive, panelView)

  const { total, rows } = useMemo(() => {
    if (!byItem) {
      return {
        total: 0,
        rows: [] as Array<{ id: string; emoji: string; label: string; amount: number; pct: number }>,
      }
    }

    const sum = byItem.reduce((s, row) => s + row.amount, 0)
    const nextRows = byItem
      .map((row) => ({
        id: row.itemId,
        emoji: row.itemEmoji,
        label: row.itemLabel,
        amount: row.amount,
        pct: sum > 0 ? (row.amount / sum) * 100 : 0,
      }))
      .filter((r) => r.amount > 0)

    return { total: sum, rows: nextRows }
  }, [byItem])

  const itemsStatus =
    byItem === undefined && !byItemStale && panelRole !== 'dormant'
      ? 'loading'
      : rows.length === 0
        ? 'empty'
        : 'ready'
  const insightsStatus =
    insights === undefined && !insightsStale && panelRole !== 'dormant'
      ? 'loading'
      : !insights || insights.length === 0
        ? 'empty'
        : 'ready'

  const contentStale = (byItemStale || insightsStale) && panelRole === 'incoming'

  return (
    <CraftStatsShell
      month={month}
      onPrevMonth={onPrevMonth}
      onNextMonth={onNextMonth}
      nextDisabled={nextDisabled}
      interactive
      itemsStatus={itemsStatus}
      insightsStatus={insightsStatus}
      total={total}
      rows={rows}
      insights={insights ?? []}
      statsMessage={itemsStatus === 'loading' ? statsMessage : undefined}
      contentStale={contentStale}
      contentOnly
    />
  )
}

export function StatsScreen({ active = true }: { active?: boolean }) {
  const [month, setMonth] = useState(monthKey)
  const { view, direction, isTransitioning } = useExpenseView()
  const [statsMessage] = useState(() => pickStatsMessage())
  const scrollRef = useReportTabScroll()
  const { todayKey } = useLocalToday()

  return (
    <div
      ref={scrollRef}
      className="tab-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none"
    >
      <EditorialScreenHeader
        kicker="Contando patitas"
        title="Estadísticas"
        subtitle="por ítem 🐾"
      />

      <ExpenseViewTransition view={view} direction={direction} isTransitioning={isTransitioning}>
        {(panelView, panelRole) => (
          <StatsViewPanel
            panelView={panelView}
            panelRole={panelRole}
            active={active}
            month={month}
            todayKey={todayKey}
            onPrevMonth={() => setMonth((m) => shiftMonthKey(m, -1))}
            onNextMonth={() => setMonth((m) => shiftMonthKey(m, 1))}
            nextDisabled={month >= monthKey()}
            statsMessage={statsMessage}
          />
        )}
      </ExpenseViewTransition>
    </div>
  )
}
