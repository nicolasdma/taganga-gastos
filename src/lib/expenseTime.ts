import { localDateKey } from '@/lib/dates'
import { formatDateKey, parseDateKey } from '@/lib/utils'
import type { ExpenseListRow } from '@/lib/receiptGroups'

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  evening: 'Noche',
}

export const TIME_OF_DAY_META: Record<
  TimeOfDay,
  { emoji: string; accent: 'sage' | 'clay' | 'cobalt' }
> = {
  morning: { emoji: '🌤️', accent: 'sage' },
  afternoon: { emoji: '☀️', accent: 'clay' },
  evening: { emoji: '🌙', accent: 'cobalt' },
}

const TIME_OF_DAY_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening']

export function timeOfDayFromTimestamp(ts: number): TimeOfDay {
  const hour = new Date(ts).getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

export function dateKeyFromTimestamp(ts: number): string {
  return localDateKey(new Date(ts))
}

function addDaysToDateKey(dateKey: string, days: number): string {
  const d = parseDateKey(dateKey)
  d.setDate(d.getDate() + days)
  return formatDateKey(d)
}

export function formatExpenseClockTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatListDayHeader(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'Hoy'
  if (dateKey === addDaysToDateKey(todayKey, -1)) return 'Ayer'

  const date = parseDateKey(dateKey)
  const today = parseDateKey(todayKey)
  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays > 0 && diffDays < 7) {
    const weekday = date.toLocaleDateString('es-CO', { weekday: 'long' })
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`
  }

  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function listRowCreatedAt(row: ExpenseListRow): number | undefined {
  if (row.type === 'standalone') return row.expense.createdAt
  const times = row.group.items
    .map((item) => item.createdAt)
    .filter((ts): ts is number => ts != null)
  if (times.length === 0) return undefined
  return Math.max(...times)
}

export function groupListRowsByDay(rows: ExpenseListRow[], todayKey: string) {
  const sorted = [...rows].sort((a, b) => (listRowCreatedAt(b) ?? 0) - (listRowCreatedAt(a) ?? 0))
  const sections: Array<{
    dayKey: string
    label: string
    rows: ExpenseListRow[]
  }> = []

  for (const row of sorted) {
    const ts = listRowCreatedAt(row)
    if (!ts) {
      if (sections.length === 0) {
        sections.push({ dayKey: 'unknown', label: 'Recientes', rows: [row] })
      } else {
        sections[sections.length - 1].rows.push(row)
      }
      continue
    }

    const dayKey = dateKeyFromTimestamp(ts)
    const last = sections[sections.length - 1]
    if (!last || last.dayKey !== dayKey) {
      sections.push({
        dayKey,
        label: formatListDayHeader(dayKey, todayKey),
        rows: [row],
      })
    } else {
      last.rows.push(row)
    }
  }

  return sections
}

export function groupListRowsByTimeOfDay(rows: ExpenseListRow[]) {
  const buckets: Record<TimeOfDay, ExpenseListRow[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  }

  const sorted = [...rows].sort((a, b) => (listRowCreatedAt(b) ?? 0) - (listRowCreatedAt(a) ?? 0))

  for (const row of sorted) {
    const ts = listRowCreatedAt(row)
    if (!ts) {
      buckets.evening.push(row)
      continue
    }
    buckets[timeOfDayFromTimestamp(ts)].push(row)
  }

  return TIME_OF_DAY_ORDER.filter((bucket) => buckets[bucket].length > 0).map((bucket) => ({
    bucket,
    label: TIME_OF_DAY_LABELS[bucket],
    emoji: TIME_OF_DAY_META[bucket].emoji,
    accent: TIME_OF_DAY_META[bucket].accent,
    rows: buckets[bucket],
  }))
}
