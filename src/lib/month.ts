export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonthKey(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return monthKey(d)
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export const monthLabel = formatMonthLabel
