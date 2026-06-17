import { MotionReveal } from '@/components/editorial/MotionReveal'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { formatCOP } from '@/lib/currency'
import type { ExpenseView } from '@/lib/expenseScope'
import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'
import { cn } from '@/lib/utils'

interface HomeStatsSummaryProps {
  view: ExpenseView
  panelRole?: ExpenseViewPanelRole
}

function StatsDecorPlaceholder() {
  return (
    <div className="stats-decor-placeholder illustration-placeholder" aria-hidden>
      <img src="/planta.png" alt="" className="stats-decor-placeholder__image" draggable={false} />
    </div>
  )
}

export function HomeStatsSummary({ view, panelRole = 'active' }: HomeStatsSummaryProps) {
  const { week, month, isStale, isInitialLoad } = usePeriodTotals(view)
  const dimStale = isStale && panelRole === 'incoming'

  return (
    <MotionReveal step={6}>
      <section
        className={cn('home-stats-card', dimStale && 'expense-view-stale')}
        aria-label="Resumen de gastos"
      >
        <div className="home-stats-card__metric">
          <p className="home-stats-card__label">Esta semana</p>
          <p className="home-stats-card__value">
            {week === undefined && isInitialLoad ? '—' : week !== undefined ? formatCOP(week) : '—'}
          </p>
          <p className="home-stats-card__note">↗ visto con calma</p>
        </div>

        <div className="home-stats-card__divider" aria-hidden />

        <div className="home-stats-card__metric">
          <p className="home-stats-card__label">Este mes</p>
          <p className="home-stats-card__value">
            {month === undefined && isInitialLoad ? '—' : month !== undefined ? formatCOP(month) : '—'}
          </p>
          <p className="home-stats-card__note">↗ libreta al día</p>
        </div>

        <StatsDecorPlaceholder />
      </section>
    </MotionReveal>
  )
}
