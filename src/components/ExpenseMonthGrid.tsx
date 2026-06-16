import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCOPShort } from '@/lib/currency'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  formatDateKey,
  formatMonthLabel,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  cn,
} from '@/lib/utils'

export type DayItemSummary = {
  emoji: string
  label: string
  amount: number
}

export type DaySummary = {
  total: number
  items: Record<string, DayItemSummary>
}

interface ExpenseMonthGridProps {
  currentMonth: Date
  onMonthChange: (month: Date) => void
  selectedDate: string | null
  onDaySelect: (date: string) => void
  byDay: Record<string, DaySummary> | undefined
  overPhoto?: boolean
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function topItemEmojis(items: Record<string, DayItemSummary>, limit = 3): string {
  return Object.values(items)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((item) => item.emoji)
    .join('')
}

export function ExpenseMonthGrid({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDaySelect,
  byDay,
  overPhoto = false,
}: ExpenseMonthGridProps) {
  const today = new Date()

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval(calStart, calEnd)
  }, [currentMonth])

  const navBtn = overPhoto
    ? 'month-nav-btn w-7 h-7'
    : 'w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 text-muted-foreground hover:bg-muted'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className={navBtn}
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            'text-2xs font-bold capitalize',
            overPhoto ? 'text-white editorial-text-shadow' : 'text-muted-foreground'
          )}
        >
          {formatMonthLabel(currentMonth)}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className={navBtn}
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold py-0.5 text-muted-foreground/60"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dateKey = formatDateKey(day)
          const summary = byDay?.[dateKey]
          const dayHasData = !!summary && summary.total > 0
          const isSelected = dateKey === selectedDate
          const isToday = isSameDay(day, today)
          const inMonth = isSameMonth(day, currentMonth)

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDaySelect(dateKey)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center tabular-nums transition-all active:scale-95 min-h-0 p-0.5',
                !inMonth && 'opacity-25',
                isSelected && 'btn-cobalt text-white active:shadow-none',
                !isSelected && isToday && 'ring-2 ring-cobalt-glaze/50',
                !isSelected && !isToday && dayHasData && 'row-porcelain',
                !isSelected && !isToday && !dayHasData && 'hover:bg-muted/50'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-bold leading-none',
                  dayHasData ? 'mb-0.5' : ''
                )}
              >
                {day.getDate()}
              </span>
              {dayHasData && summary && (
                <>
                  <span className="text-[8px] leading-none truncate max-w-full">
                    {topItemEmojis(summary.items)}
                  </span>
                  <span
                    className={cn(
                      'text-[8px] font-extrabold leading-none mt-0.5',
                      isSelected ? 'text-white/90' : 'text-muted-foreground'
                    )}
                  >
                    {formatCOPShort(summary.total)}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
