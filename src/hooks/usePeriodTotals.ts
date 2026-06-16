import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { isTimestampInPeriod } from '@/lib/dates'
import { loadOutbox, loadReceiptOutbox, OUTBOX_CHANGED } from '@/lib/outbox'
import { useLocalToday } from '@/hooks/useLocalToday'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import { DEFAULT_EXPENSE_SCOPE, DEFAULT_EXPENSE_VIEW, type ExpenseView } from '@/lib/expenseScope'

type Period = 'today' | 'week' | 'month'

function pendingAmountForPeriod(
  period: Period,
  todayKey: string,
  tzOffsetMinutes: number,
  view: 'shared' | 'personal' = DEFAULT_EXPENSE_VIEW
): number {
  let total = 0

  for (const expense of loadOutbox()) {
    const scope = expense.scope ?? DEFAULT_EXPENSE_SCOPE
    if (view === 'shared' && scope !== 'shared') continue
    if (view === 'personal' && scope !== 'personal') continue
    if (isTimestampInPeriod(expense.createdAt, period, todayKey, tzOffsetMinutes)) {
      total += expense.amount
    }
  }

  for (const group of loadReceiptOutbox()) {
    const scope = group.scope ?? DEFAULT_EXPENSE_SCOPE
    if (view === 'shared' && scope !== 'shared') continue
    if (view === 'personal' && scope !== 'personal') continue
    for (const item of group.items) {
      if (isTimestampInPeriod(group.createdAt, period, todayKey, tzOffsetMinutes)) {
        total += item.amount
      }
    }
  }

  return total
}

export function usePeriodTotals(view: ExpenseView = DEFAULT_EXPENSE_VIEW) {
  const { todayKey, tzOffsetMinutes } = useLocalToday()
  const [outboxTick, setOutboxTick] = useState(0)

  useEffect(() => {
    const update = () => setOutboxTick((tick) => tick + 1)
    window.addEventListener(OUTBOX_CHANGED, update)
    return () => window.removeEventListener(OUTBOX_CHANGED, update)
  }, [])

  const totalsArgs = { todayKey, tzOffsetMinutes, view }
  const todayServer = useQuery(api.expenses.totals, {
    period: 'today' as const,
    ...totalsArgs,
  })
  const weekServer = useQuery(api.expenses.totals, {
    period: 'week' as const,
    ...totalsArgs,
  })
  const monthServer = useQuery(api.expenses.totals, {
    period: 'month' as const,
    ...totalsArgs,
  })

  const pending = useMemo(() => {
    void outboxTick
    return {
      today: pendingAmountForPeriod('today', todayKey, tzOffsetMinutes, view),
      week: pendingAmountForPeriod('week', todayKey, tzOffsetMinutes, view),
      month: pendingAmountForPeriod('month', todayKey, tzOffsetMinutes, view),
    }
  }, [outboxTick, todayKey, tzOffsetMinutes, view])

  const todayLive =
    todayServer === undefined ? undefined : todayServer + pending.today
  const weekLive = weekServer === undefined ? undefined : weekServer + pending.week
  const monthLive = monthServer === undefined ? undefined : monthServer + pending.month

  const { value: today, isStale: todayStale } = useStaleWhileLoading(todayLive, view)
  const { value: week, isStale: weekStale } = useStaleWhileLoading(weekLive, view)
  const { value: month, isStale: monthStale } = useStaleWhileLoading(monthLive, view)

  return {
    today,
    week,
    month,
    isStale: todayStale || weekStale || monthStale,
    isInitialLoad: todayLive === undefined && today === undefined,
  }
}
