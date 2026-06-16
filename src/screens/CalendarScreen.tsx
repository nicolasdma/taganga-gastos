import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { DayDetailSheet } from '@/components/DayDetailSheet'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { SectionLabel } from '@/components/craft/SectionLabel'
import { EditorialScreenHeader } from '@/components/editorial/EditorialScreenHeader'
import { ExpenseViewTransition } from '@/components/editorial/ExpenseViewTransition'
import { ExpenseMonthGrid } from '@/components/ExpenseMonthGrid'
import type { EditableExpense } from '@/lib/expenseTypes'
import { formatCOP } from '@/lib/currency'
import { useExpenseView } from '@/hooks/useExpenseView'
import { useReportTabScroll } from '@/hooks/useReportTabScroll'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { ExpenseView } from '@/lib/expenseScope'
import { formatMonthKey, subMonths, cn } from '@/lib/utils'

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

type PanelRole = 'active' | 'outgoing' | 'incoming'

interface CalendarViewPanelProps {
  panelView: ExpenseView
  panelRole: PanelRole
  active: boolean
  currentMonth: Date
  onMonthChange: (month: Date) => void
  selectedDate: string | null
  onDaySelect: (date: string) => void
}

function CalendarViewPanel({
  panelView,
  panelRole,
  active,
  currentMonth,
  onMonthChange,
  selectedDate,
  onDaySelect,
}: CalendarViewPanelProps) {
  const monthKeyStr = formatMonthKey(currentMonth)
  const prevMonthKeyStr = formatMonthKey(subMonths(currentMonth, 1))

  const byDayLive = useQuery(
    api.expenses.expensesByDay,
    active ? { month: monthKeyStr, view: panelView } : 'skip'
  )
  const prevByDayLive = useQuery(
    api.expenses.expensesByDay,
    active ? { month: prevMonthKeyStr, view: panelView } : 'skip'
  )

  const { value: byDay, isStale: byDayStale, isInitialLoad: byDayInitial } =
    useStaleWhileLoading(byDayLive, panelView)
  const { value: prevByDay, isStale: prevByDayStale } =
    useStaleWhileLoading(prevByDayLive, panelView)

  const total = useMemo(() => monthTotal(byDay), [byDay])
  const prevTotal = useMemo(() => monthTotal(prevByDay), [prevByDay])
  const comparison = useMemo(() => formatComparison(total, prevTotal), [total, prevTotal])
  const dimStale = (byDayStale || prevByDayStale) && panelRole !== 'outgoing'
  const showTotalSkeleton = byDayInitial && byDay === undefined

  return (
    <div
      className={cn(
        'tab-content px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] space-y-4',
        dimStale && 'expense-view-stale'
      )}
    >
      <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-4">
        <p className="label-stitch mb-1">Total del mes</p>
        {showTotalSkeleton ? (
          <div
            className="craft-skeleton craft-skeleton--row h-9 w-36 max-w-full"
            aria-busy="true"
            aria-label="Calculando total del mes"
          />
        ) : (
          <p className="font-display text-3xl font-bold font-tabular text-ink tracking-tight">
            {formatCOP(total)}
          </p>
        )}
        {comparison && byDay !== undefined && prevByDay !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">{comparison}</p>
        )}
      </div>

      <section>
        <SectionLabel overPhoto>Mes</SectionLabel>
        <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-4">
          <ExpenseMonthGrid
            currentMonth={currentMonth}
            onMonthChange={onMonthChange}
            selectedDate={selectedDate}
            onDaySelect={onDaySelect}
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
  )
}

export function CalendarScreen({
  active = true,
  onEditExpense,
}: {
  active?: boolean
  onEditExpense: (expense: EditableExpense) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { view, direction, isTransitioning } = useExpenseView()
  const scrollRef = useReportTabScroll('calendar')

  return (
    <div
      ref={scrollRef}
      className="tab-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none"
    >
      <EditorialScreenHeader
        kicker="Día a día"
        title="Calendario"
        subtitle="con cariño 🐾"
      />

      <ExpenseViewTransition view={view} direction={direction} isTransitioning={isTransitioning}>
        {(panelView, panelRole) => (
          <CalendarViewPanel
            panelView={panelView}
            panelRole={panelRole}
            active={active}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onDaySelect={setSelectedDate}
          />
        )}
      </ExpenseViewTransition>

      <DayDetailSheet
        date={selectedDate}
        view={view}
        onClose={() => setSelectedDate(null)}
        onEditExpense={(expense) => {
          setSelectedDate(null)
          onEditExpense(expense)
        }}
      />
    </div>
  )
}
