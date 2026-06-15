import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { isTimestampInPeriod } from '@/lib/dates'
import { loadOutbox, loadReceiptOutbox, OUTBOX_CHANGED } from '@/lib/outbox'
import { useLocalToday } from '@/hooks/useLocalToday'

type Period = 'today' | 'week' | 'month'

function pendingAmountForPeriod(
  period: Period,
  todayKey: string,
  tzOffsetMinutes: number
): number {
  let total = 0

  for (const expense of loadOutbox()) {
    if (isTimestampInPeriod(expense.createdAt, period, todayKey, tzOffsetMinutes)) {
      total += expense.amount
    }
  }

  for (const group of loadReceiptOutbox()) {
    for (const item of group.items) {
      if (isTimestampInPeriod(group.createdAt, period, todayKey, tzOffsetMinutes)) {
        total += item.amount
      }
    }
  }

  return total
}

export function usePeriodTotals() {
  const { todayKey, tzOffsetMinutes } = useLocalToday()
  const [outboxTick, setOutboxTick] = useState(0)

  useEffect(() => {
    const update = () => setOutboxTick((tick) => tick + 1)
    window.addEventListener(OUTBOX_CHANGED, update)
    return () => window.removeEventListener(OUTBOX_CHANGED, update)
  }, [])

  const todayServer = useQuery(api.expenses.totals, {
    period: 'today',
    todayKey,
    tzOffsetMinutes,
  })
  const weekServer = useQuery(api.expenses.totals, {
    period: 'week',
    todayKey,
    tzOffsetMinutes,
  })
  const monthServer = useQuery(api.expenses.totals, {
    period: 'month',
    todayKey,
    tzOffsetMinutes,
  })

  const pending = useMemo(() => {
    void outboxTick
    return {
      today: pendingAmountForPeriod('today', todayKey, tzOffsetMinutes),
      week: pendingAmountForPeriod('week', todayKey, tzOffsetMinutes),
      month: pendingAmountForPeriod('month', todayKey, tzOffsetMinutes),
    }
  }, [outboxTick, todayKey, tzOffsetMinutes])

  return {
    today: todayServer === undefined ? undefined : todayServer + pending.today,
    week: weekServer === undefined ? undefined : weekServer + pending.week,
    month: monthServer === undefined ? undefined : monthServer + pending.month,
  }
}
