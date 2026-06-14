import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { DayDetailSheet } from '@/components/DayDetailSheet'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { SectionLabel } from '@/components/craft/SectionLabel'
import { EditorialScreenHeader } from '@/components/editorial/EditorialScreenHeader'
import { ExpenseMonthGrid } from '@/components/ExpenseMonthGrid'
import type { EditableExpense } from '@/lib/expenseTypes'
import { formatCOP } from '@/lib/currency'
import { formatMonthKey, subMonths } from '@/lib/utils'
import { cn } from '@/lib/utils'

function monthTotal(byDay: Record<string, { total: number }> | undefined): number {
  if (!byDay) return 0
  return Object.values(byDay).reduce((sum, d) => sum + d.total, 0)
}

function formatComparison(current: number, previous: number): string | null {
  if (previous === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return 'igual que mes pasado'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}% vs mes pasado`
}

export function CalendarScreen({ onEditExpense }: { onEditExpense: (expense: EditableExpense) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthKey = formatMonthKey(currentMonth)
  const prevMonthKey = formatMonthKey(subMonths(currentMonth, 1))

  const byDay = useQuery(api.expenses.expensesByDay, { month: monthKey })
  const prevByDay = useQuery(api.expenses.expensesByDay, { month: prevMonthKey })

  const total = useMemo(() => monthTotal(byDay), [byDay])
  const prevTotal = useMemo(() => monthTotal(prevByDay), [prevByDay])
  const comparison = useMemo(() => formatComparison(total, prevTotal), [total, prevTotal])

  return (
    <div className="tab-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none">
      <EditorialScreenHeader
        kicker="Día a día"
        title="Calendario"
        subtitle="con cariño 🐾"
        catVariant="peek"
      />

      <div className="tab-content px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] space-y-4">
        <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-4">
          <p className="label-stitch mb-1">Total del mes</p>
          <p
            className={cn(
              'font-display text-3xl font-bold font-tabular text-ink tracking-tight',
              byDay === undefined && 'animate-pulse text-muted-foreground'
            )}
          >
            {byDay === undefined ? '—' : formatCOP(total)}
          </p>
          {comparison && byDay !== undefined && prevByDay !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">{comparison}</p>
          )}
        </div>

        <section>
          <SectionLabel overPhoto>Mes</SectionLabel>
          <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-4">
            <ExpenseMonthGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDaySelect={setSelectedDate}
              byDay={byDay}
              overPhoto
            />
          </div>
        </section>

        {byDay !== undefined && total === 0 && (
          <EmptyCraft
            emoji="📅"
            title="Mes sin gastos"
            subtitle="Tocá un día cuando registres algo — o dejalo dormir como el gatito"
          />
        )}
      </div>

      <DayDetailSheet
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
        onEditExpense={(expense) => {
          setSelectedDate(null)
          onEditExpense(expense)
        }}
      />
    </div>
  )
}
