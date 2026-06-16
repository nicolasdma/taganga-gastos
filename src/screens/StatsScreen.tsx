import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CraftStatsShell } from '@/components/craft/CraftStatsShell'
import { pickStatsMessage } from '@/components/craft/craftLoadingMessages'
import { monthKey, shiftMonthKey } from '@/lib/month'
import { useExpenseView } from '@/hooks/useExpenseView'

export function StatsScreen() {
  const [month, setMonth] = useState(monthKey)
  const { view } = useExpenseView()
  const [statsMessage] = useState(() => pickStatsMessage())
  const byItem = useQuery(api.expenses.expensesByItem, { month, view })
  const insights = useQuery(api.expenses.insights, { month, view })

  const { total, rows } = useMemo(() => {
    if (!byItem) {
      return {
        total: 0,
        rows: [] as Array<{ id: string; emoji: string; label: string; amount: number; pct: number }>,
      }
    }

    const total = byItem.reduce((s, row) => s + row.amount, 0)
    const rows = byItem
      .map((row) => ({
        id: row.itemId,
        emoji: row.itemEmoji,
        label: row.itemLabel,
        amount: row.amount,
        pct: total > 0 ? (row.amount / total) * 100 : 0,
      }))
      .filter((r) => r.amount > 0)

    return { total, rows }
  }, [byItem])

  const itemsStatus = byItem === undefined ? 'loading' : rows.length === 0 ? 'empty' : 'ready'
  const insightsStatus =
    insights === undefined ? 'loading' : insights.length === 0 ? 'empty' : 'ready'

  return (
    <CraftStatsShell
      month={month}
      onPrevMonth={() => setMonth((m) => shiftMonthKey(m, -1))}
      onNextMonth={() => setMonth((m) => shiftMonthKey(m, 1))}
      nextDisabled={month >= monthKey()}
      interactive
      itemsStatus={itemsStatus}
      insightsStatus={insightsStatus}
      total={total}
      rows={rows}
      insights={insights ?? []}
      statsMessage={itemsStatus === 'loading' ? statsMessage : undefined}
    />
  )
}
