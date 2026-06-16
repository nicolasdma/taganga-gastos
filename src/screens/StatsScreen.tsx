import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { SectionLabel } from '@/components/craft/SectionLabel'
import { EditorialScreenHeader } from '@/components/editorial/EditorialScreenHeader'
import { formatCOP } from '@/lib/currency'
import { monthKey, formatMonthLabel, shiftMonthKey } from '@/lib/month'
import { useExpenseView } from '@/hooks/useExpenseView'
import { ExpenseViewFilter } from '@/components/ExpenseScopeToggle'
import { cn } from '@/lib/utils'

const ItemDonutChart = lazy(() => import('@/components/ItemDonutChart'))

export function StatsScreen() {
  const [month, setMonth] = useState(monthKey)
  const { view, setView } = useExpenseView()
  const byItem = useQuery(api.expenses.expensesByItem, { month, view })
  const insights = useQuery(api.expenses.insights, { month, view })

  const { total, rows } = useMemo(() => {
    if (!byItem) return { total: 0, rows: [] as Array<{ id: string; emoji: string; label: string; amount: number; pct: number }> }

    const total = byItem.reduce((s, row) => s + row.amount, 0)
    const rows = byItem
      .map((row) => ({
        id: row.itemId,
        emoji: row.itemEmoji,
        label: row.itemLabel,
        amount: row.amount,
        pct: total > 0 ? (row.amount / total) * 100 : 0,
      }))
      .filter((r) => r.amount > 0)

    return { total, rows }
  }, [byItem])

  return (
    <div className="tab-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none">
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
            onClick={() => setMonth((m) => shiftMonthKey(m, -1))}
            className="month-nav-btn"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold capitalize text-white editorial-text-shadow">
            {formatMonthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonthKey(m, 1))}
            disabled={month >= monthKey()}
            className={cn(
              'month-nav-btn',
              month >= monthKey() && 'opacity-30 pointer-events-none'
            )}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          </div>
          <ExpenseViewFilter value={view} onChange={setView} />
        </div>

        <div className="rounded-3xl card-porcelain-rim shadow-porcelain p-5">
          <p className="label-stitch mb-1">Total del mes</p>
          <p className="font-display text-3xl font-bold font-tabular text-ink tracking-tight">
            {byItem === undefined ? '—' : formatCOP(total)}
          </p>
        </div>

        <section>
          <SectionLabel overPhoto>Por ítem</SectionLabel>
          {byItem === undefined ? (
            <div className="rounded-3xl card-porcelain p-4 space-y-3">
              <div className="h-40 rounded-xl bg-muted/40 animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyCraft
              emoji="📊"
              title="Sin gastos este mes"
              subtitle="El + de barro te espera cuando quieras anotar algo"
            />
          ) : (
            <div className="rounded-3xl card-porcelain shadow-porcelain overflow-hidden">
              <Suspense
                fallback={<div className="h-48 bg-muted/30 animate-pulse border-b border-border/40" />}
              >
                <ItemDonutChart rows={rows} />
              </Suspense>
              <div className="divide-y divide-border/40">
                {rows.map((row) => (
                  <div key={row.id} className="px-4 py-3">
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
                        className="h-full rounded-full bg-cobalt-glaze/80 transition-all"
                        style={{ width: `${Math.max(row.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <SectionLabel overPhoto>Insights</SectionLabel>
          {insights === undefined ? (
            <div className="rounded-3xl card-stitched p-4 text-sm text-muted-foreground">Cargando…</div>
          ) : insights.length === 0 ? (
            <div className="rounded-3xl card-stitched p-4 text-sm text-muted-foreground">
              Registrá más gastos para ver observaciones automáticas.
            </div>
          ) : (
            <ul className="rounded-3xl card-porcelain shadow-porcelain divide-y divide-stitch/30">
              {insights.map((line) => (
                <li key={line} className="px-4 py-3 text-sm text-foreground leading-snug">
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
