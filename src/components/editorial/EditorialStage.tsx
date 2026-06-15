import { useEffect, useState } from 'react'
import { CollageSticker } from '@/components/editorial/CollageSticker'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { SyncPendingSticker } from '@/components/editorial/EditorialScreenHeader'
import { KittySprite } from '@/components/craft/KittySprite'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { formatCOP, formatCOPEditorial } from '@/lib/currency'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

interface EditorialStageProps {
  pulseKey?: number
  pendingCount?: number
  view?: ExpenseView
}

export function EditorialStage({ pulseKey = 0, pendingCount = 0, view }: EditorialStageProps) {
  const { today, week, month } = usePeriodTotals(view)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (pulseKey > 0) {
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 600)
      return () => clearTimeout(t)
    }
  }, [pulseKey])

  const editorial = today !== undefined ? formatCOPEditorial(today) : null

  return (
    <section className="editorial-stage relative">
      <div className="editorial-stage__head panel-ink relative overflow-hidden">
        <MarqueeBand />
        <div className="px-4 pt-2 pb-5 relative">
          <MotionReveal step={1}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="editorial-kicker">
                  {view === 'shared' ? 'Registro compartido' : 'Tu libreta'}
                </p>
                <h1 className="editorial-stage__title type-editorial-title text-white editorial-text-shadow">
                  Gastos
                </h1>
              </div>
              <div className="flex flex-col items-end gap-2">
                <KittySprite size={76} pulseKey={pulseKey} className="opacity-95" />
                <SyncPendingSticker count={pendingCount} />
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>

      <div className="editorial-stage__body px-4 -mt-4 relative z-10 pb-3">
        <div className="hero-total-sticky">
          <MotionReveal step={2}>
            <div className="relative pt-4">
              <CollageSticker tone="sage" rotate="right" className="absolute top-1 left-5 z-20">
                Hoy 🐾
              </CollageSticker>
              <div className="torn-sheet px-5 pt-9 pb-5">
                {editorial ? (
                  <div
                    className={cn(
                      'type-display-massive transition-transform duration-300',
                      pulsing && 'animate-total-pulse'
                    )}
                  >
                    <span className="type-display-symbol">{editorial.symbol}</span>
                    <span className="type-display-value">{editorial.value}</span>
                  </div>
                ) : (
                  <p className="type-display-massive text-ink/30">—</p>
                )}

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
              <p className="bento-value">{week === undefined ? '—' : formatCOP(week)}</p>
            </div>
            <div className="bento-tile bento-tile--blush p-4 tilt-chip-4">
              <p className="bento-label">Mes</p>
              <p className="bento-value">{month === undefined ? '—' : formatCOP(month)}</p>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}
