export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number)
  return { year, month, day }
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number)
  return { year, month }
}

/** UTC timestamp for local midnight on YYYY-MM-DD. */
export function localMidnightUtc(
  year: number,
  month: number,
  day: number,
  tzOffsetMinutes: number
): number {
  return Date.UTC(year, month - 1, day) + tzOffsetMinutes * 60_000
}

export function dateKeyFromTimestamp(ts: number, tzOffsetMinutes: number): string {
  const d = new Date(ts - tzOffsetMinutes * 60_000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export function monthKeyFromTimestamp(ts: number, tzOffsetMinutes: number): string {
  const d = new Date(ts - tzOffsetMinutes * 60_000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey)
  const d = new Date(Date.UTC(year, month - 1, day + days))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export function addMonthsToMonthKey(monthKey: string, months: number): string {
  const { year, month } = parseMonthKey(monthKey)
  const zeroBasedMonth = month - 1 + months
  const d = new Date(Date.UTC(year, zeroBasedMonth, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function weekdayFromDateKey(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function weekdayNameFromDateKey(dateKey: string): string {
  const dayNames = [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ]
  return dayNames[weekdayFromDateKey(dateKey)]!
}

export function formatRelativeDayReference(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return 'hoy'
  if (dateKey === addDaysToDateKey(todayKey, -1)) return 'ayer'

  const [, , , day] = dateKey.match(/^(\d+)-(\d+)-(\d+)$/) ?? []
  const dayName = weekdayNameFromDateKey(dateKey)
  return `el ${dayName} ${Number(day)}`
}

export function startOfWeekDateKey(todayKey: string): string {
  const weekday = weekdayFromDateKey(todayKey)
  const diff = weekday === 0 ? 6 : weekday - 1
  return addDaysToDateKey(todayKey, -diff)
}

export function dayRange(
  dateKey: string,
  tzOffsetMinutes: number
): { start: number; end: number } {
  const { year, month, day } = parseDateKey(dateKey)
  const endKey = addDaysToDateKey(dateKey, 1)
  const endParts = parseDateKey(endKey)
  return {
    start: localMidnightUtc(year, month, day, tzOffsetMinutes),
    end: localMidnightUtc(endParts.year, endParts.month, endParts.day, tzOffsetMinutes),
  }
}

export function monthRange(
  monthKey: string,
  tzOffsetMinutes: number
): { start: number; end: number } {
  const { year, month } = parseMonthKey(monthKey)
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  return {
    start: localMidnightUtc(year, month, 1, tzOffsetMinutes),
    end: localMidnightUtc(endYear, endMonth, 1, tzOffsetMinutes),
  }
}

export function periodRange(
  period: 'today' | 'week' | 'month',
  todayKey: string,
  tzOffsetMinutes: number
): { start: number; end: number } {
  const { year, month } = parseDateKey(todayKey)

  if (period === 'today') {
    return dayRange(todayKey, tzOffsetMinutes)
  }

  if (period === 'week') {
    const weekStartKey = startOfWeekDateKey(todayKey)
    const weekEndKey = addDaysToDateKey(weekStartKey, 7)
    const ws = parseDateKey(weekStartKey)
    const we = parseDateKey(weekEndKey)
    return {
      start: localMidnightUtc(ws.year, ws.month, ws.day, tzOffsetMinutes),
      end: localMidnightUtc(we.year, we.month, we.day, tzOffsetMinutes),
    }
  }

  return monthRange(`${year}-${String(month).padStart(2, '0')}`, tzOffsetMinutes)
}

export function isTimestampInPeriod(
  ts: number,
  period: 'today' | 'week' | 'month',
  todayKey: string,
  tzOffsetMinutes: number
): boolean {
  const { start, end } = periodRange(period, todayKey, tzOffsetMinutes)
  return ts >= start && ts < end
}

export function daysInMonth(monthKey: string): number {
  const { year, month } = parseMonthKey(monthKey)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function monthKeyFromDateKey(dateKey: string): string {
  const { year, month } = parseDateKey(dateKey)
  return `${year}-${String(month).padStart(2, '0')}`
}

export function daysElapsedInMonth(monthKey: string, todayKey: string): number {
  if (monthKeyFromDateKey(todayKey) === monthKey) {
    return parseDateKey(todayKey).day
  }
  return daysInMonth(monthKey)
}
