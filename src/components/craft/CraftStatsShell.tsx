import { useId } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ItemDonutChart from '@/components/ItemDonutChart'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { SectionLabel } from '@/components/craft/SectionLabel'
import { EditorialScreenHeader } from '@/components/editorial/EditorialScreenHeader'
import { ExpenseViewFilter } from '@/components/ExpenseScopeToggle'
import { formatCOP } from '@/lib/currency'
import type { ExpenseScope } from '@/lib/expenseScope'
import { formatMonthLabel } from '@/lib/month'
import { cn } from '@/lib/utils'

export type StatsDataStatus = 'loading' | 'empty' | 'ready'

export interface StatsRow {
  id: string
  emoji: string
  label: string
  amount: number
  pct: number
}

interface CraftStatsShellProps {
  month: string
  onPrevMonth?: () => void
  onNextMonth?: () => void
  nextDisabled?: boolean
  view?: ExpenseScope
  onViewChange?: (view: ExpenseScope) => void
  /** Suspense fallback — nav inert, filter as skeleton */
  interactive?: boolean
  itemsStatus: StatsDataStatus
  insightsStatus: StatsDataStatus
  total?: number
  rows?: StatsRow[]
  insights?: string[]
  /** Single discreet loading line — no kitty */
  statsMessage?: string
  className?: string
}

const ROW_WIDTHS = ['72%', '58%', '84%', '64%'] as const
const INSIGHT_WIDTHS = ['92%', '78%', '65%'] as const

function CraftStatsDonutSkeleton() {
  const gradientId = useId()

  return (
    <div className="craft-stats-donut h-48 w-full flex items-center justify-center" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-[9.5rem] w-[9.5rem]" role="presentation">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(40 52% 98%)" />
            <stop offset="55%" stopColor="hsl(36 40% 93%)" />
            <stop offset="100%" stopColor="hsl(38 44% 95%)" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="hsl(218 20% 84%)"
          strokeWidth="3"
          strokeDasharray="5 7"
          className="craft-stats-donut__ring"
        />
        <circle cx="60" cy="60" r="34" fill={`url(#${gradientId})`} stroke="hsl(218 20% 84%)" strokeWidth="2" />
        <circle cx="60" cy="60" r="22" fill="hsl(36 38% 91%)" opacity="0.65" />
      </svg>
    </div>
  )
}

function CraftStatsItemRowSkeleton({ widthPct }: { widthPct: string }) {
  return (
    <div className="px-4 py-3" aria-hidden>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="craft-skeleton h-6 w-6 rounded-full shrink-0" />
          <div className="craft-skeleton h-3.5 rounded-md" style={{ width: '5.5rem' }} />
        </div>
        <div className="craft-skeleton h-3.5 w-14 rounded-md shrink-0" />
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="craft-skeleton h-full rounded-full" style={{ width: widthPct }} />
      </div>
    </div>
  )
}

function CraftStatsItemRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/40 border-t border-border/40">
      {Array.from({ length: count }, (_, i) => (
        <CraftStatsItemRowSkeleton key={i} widthPct={ROW_WIDTHS[i % ROW_WIDTHS.length]!} />
      ))}
    </div>
  )
}

function CraftStatsInsightsSkeleton() {
  return (
    <div className="rounded-3xl card-stitched p-4 space-y-3" aria-busy="true" aria-label="Cargando insights">
      {INSIGHT_WIDTHS.map((width, i) => (
        <div key={i} className="craft-skeleton h-3.5 rounded-md" style={{ width }} aria-hidden />
      ))}
    </div>
  )
}

function CraftStatsViewFilterSkeleton() {
  return (
    <div
      className="craft-skeleton craft-skeleton--row h-9 w-[7.25rem] rounded-2xl shrink-0"
      aria-hidden
    />
  )
}

export function CraftStatsShell({
  month,
  onPrevMonth,
  onNextMonth,
  nextDisabled = false,
  view,
  onViewChange,
  interactive = true,
  itemsStatus,
  insightsStatus,
  total = 0,
  rows = [],
  insights = [],
  statsMessage,
  className,
}: CraftStatsShellProps) {
  const itemsLoading = itemsStatus === 'loading'
  const insightsLoading = insightsStatus === 'loading'

  return (
    <div className={cn('tab-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none', className)}>
      <EditorialScreenHeader
        kicker="Tejido a mano"
        title="Estadísticas"
        subtitle="por ítem 🐾"
        catVariant="sit"
      />

      <div className="tab-content px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="month-nav-over-photo flex items-center justify-between flex-1">
            <button
              type="button"
              onClick={interactive ? onPrevMonth : undefined}
              disabled={!interactive}
              tabIndex={interactive ? 0 : -1}
              className={cn('month-nav-btn', !interactive && 'pointer-events-none opacity-90')}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              className={cn(
                'text-sm font-bold capitalize text-white editorial-text-shadow',
                itemsLoading && interactive && 'craft-stats-month-shimmer'
              )}
            >
              {formatMonthLabel(month)}
            </span>
            <button
              type="button"
              onClick={interactive ? onNextMonth : undefined}
              disabled={!interactive || nextDisabled}
              tabIndex={interactive ? 0 : -1}
              className={cn(
                'month-nav-btn',
                !interactive && 'pointer-events-none opacity-90',
                nextDisabled && 'opacity-30 pointer-events-none'
              )}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {interactive && view !== undefined && onViewChange ? (
            <ExpenseViewFilter value={view} onChange={onViewChange} />
          ) : (
            <CraftStatsViewFilterSkeleton />
          )}
        </div>

        <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-5">
          <p className="label-stitch mb-1">Total del mes</p>
          {itemsLoading ? (
            <div
              className="craft-skeleton craft-skeleton--row h-9 w-40 max-w-full rounded-xl"
              aria-busy="true"
              aria-label="Calculando total del mes"
            />
          ) : (
            <p className="font-display text-3xl font-bold font-tabular text-ink tracking-tight stats-reveal-total">
              {formatCOP(total)}
            </p>
          )}
        </div>

        <section aria-busy={itemsLoading} aria-live="polite">
          <SectionLabel overPhoto>Por ítem</SectionLabel>
          {itemsStatus === 'loading' ? (
            <div className="rounded-3xl card-porcelain shadow-porcelain overflow-hidden">
              <CraftStatsDonutSkeleton />
              {statsMessage ? (
                <p className="text-xs text-center text-muted-foreground px-4 pb-3 -mt-1 font-medium">
                  {statsMessage}
                </p>
              ) : null}
              <CraftStatsItemRowsSkeleton />
            </div>
          ) : itemsStatus === 'empty' ? (
            <EmptyCraft
              emoji="📊"
              title="Sin gastos este mes"
              subtitle="El + de barro te espera cuando quieras anotar algo"
            />
          ) : (
            <div className="rounded-3xl card-porcelain shadow-porcelain overflow-hidden">
              <div className="stats-reveal-chart border-b border-border/40">
                <ItemDonutChart rows={rows} />
              </div>
              <div className="divide-y divide-border/40">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="px-4 py-3 stats-reveal-row"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {row.emoji} {row.label}
                      </span>
                      <span className="text-sm font-bold font-tabular text-foreground/90">
                        {formatCOP(row.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cobalt-glaze/80 transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(row.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section aria-busy={insightsLoading} aria-live="polite">
          <SectionLabel overPhoto>Insights</SectionLabel>
          {insightsStatus === 'loading' ? (
            <CraftStatsInsightsSkeleton />
          ) : insightsStatus === 'empty' ? (
            <div className="rounded-3xl card-stitched p-4 text-sm text-muted-foreground">
              Registrá más gastos para ver observaciones automáticas.
            </div>
          ) : (
            <ul className="rounded-3xl card-porcelain shadow-porcelain divide-y divide-stitch/30">
              {insights.map((line, index) => (
                <li
                  key={line}
                  className="px-4 py-3 text-sm text-foreground leading-snug stats-reveal-insight"
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <span className="mr-1.5">💡</span>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
