import { CollageSticker } from '@/components/editorial/CollageSticker'
import { BrandmarkSlot } from '@/components/editorial/AppBrandmarkDock'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { formatCOP, formatCOPEditorial } from '@/lib/currency'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

type PanelRole = 'active' | 'outgoing' | 'incoming'

interface EditorialStageProps {
  pulseKey?: number
  view?: ExpenseView
  panelRole?: PanelRole
}

export function EditorialStage({ pulseKey = 0, view, panelRole = 'active' }: EditorialStageProps) {
  const { today, week, month, isStale, isInitialLoad } = usePeriodTotals(view)

  const editorial = today !== undefined ? formatCOPEditorial(today) : null
  const showPlaceholder = isInitialLoad && editorial === null
  const dimStale = isStale && panelRole !== 'outgoing'

  return (
    <section className={cn('editorial-stage relative', dimStale && 'expense-view-stale')}>
      <div className="editorial-stage__head panel-ink relative overflow-hidden">
        <MarqueeBand />
        <div className="px-4 pt-2 pb-5 relative">
          <MotionReveal step={1}>
            <div className="flex items-start justify-between gap-3 editorial-header__title-row">
              <div>
                <p className="editorial-kicker">
                  {view === 'shared' ? 'Compartidos' : 'Tu libreta'}
                </p>
                <h1 className="editorial-stage__title type-editorial-title text-white editorial-text-shadow">
                  Gastos
                </h1>
              </div>
              {panelRole !== 'outgoing' && <BrandmarkSlot />}
            </div>
          </MotionReveal>
        </div>
      </div>

      <div className="editorial-stage__body px-4 pt-2 relative z-10 pb-3">
        <div className="hero-total-sticky">
          <MotionReveal step={2}>
            <div className="relative pt-4">
              <CollageSticker tone="sage" rotate="right" className="absolute top-1 left-5 z-20">
                Hoy 🐾
              </CollageSticker>
              <div className="torn-sheet px-5 pt-9 pb-5">
                {editorial ? (
                  <div
                    key={pulseKey}
                    className={cn(
                      'type-display-massive transition-transform duration-300',
                      pulseKey > 0 && 'animate-total-pulse'
                    )}
                  >
                    <span className="type-display-symbol">{editorial.symbol}</span>
                    <span className="type-display-value">{editorial.value}</span>
                  </div>
                ) : showPlaceholder ? (
                  <p className="type-display-massive text-ink/30">—</p>
                ) : null}

                <p className="font-display italic text-sm text-muted-foreground mt-2 leading-snug">
                  lo que salió de tu bolsillo hoy
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>

        <MotionReveal step={3}>
          <div className="bento-stats grid grid-cols-2 gap-3 mt-3">
            <div className="bento-tile bento-tile--sage p-4 tilt-chip-2">
              <p className="bento-label">Semana</p>
              <p className="bento-value">
                {week === undefined && isInitialLoad ? '—' : week !== undefined ? formatCOP(week) : '—'}
              </p>
            </div>
            <div className="bento-tile bento-tile--blush p-4 tilt-chip-4">
              <p className="bento-label">Mes</p>
              <p className="bento-value">
                {month === undefined && isInitialLoad ? '—' : month !== undefined ? formatCOP(month) : '—'}
              </p>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
