import { useEffect, useState } from 'react'
import { CraftCat } from '@/components/craft/CraftCat'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface TotalsHeaderProps {
  pulseKey?: number
}

export function TotalsHeader({ pulseKey = 0 }: TotalsHeaderProps) {
  const { today, week, month } = usePeriodTotals()
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (pulseKey > 0) {
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 550)
      return () => clearTimeout(t)
    }
  }, [pulseKey])

  return (
    <div className="relative rounded-[1.4rem_1.2rem_1.35rem_1.25rem] card-porcelain-rim shadow-porcelain p-5 tilt-gentle overflow-hidden">
      <CraftCat
        variant="sit"
        className="absolute -bottom-1 -right-1 w-14 h-16 opacity-[0.12] pointer-events-none"
      />

      <p className="label-stitch mb-1 relative">Hoy</p>
      <p
        className={cn(
          'font-display text-[2.85rem] font-bold font-tabular text-ink tracking-tight leading-none transition-transform duration-300 relative',
          pulsing && 'animate-total-pulse'
        )}
      >
        {today === undefined ? '—' : formatCOP(today)}
      </p>

      <div className="flex gap-4 mt-4 pt-4 border-t-2 border-dashed border-stitch/45 relative">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide font-display">
            Semana
          </p>
          <p className="text-sm font-bold font-tabular text-foreground/85 mt-0.5">
            {week === undefined ? '—' : formatCOP(week)}
          </p>
        </div>
        <div className="w-px bg-stitch/35 self-stretch" />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide font-display">
            Mes
          </p>
          <p className="text-sm font-bold font-tabular text-foreground/85 mt-0.5">
            {month === undefined ? '—' : formatCOP(month)}
          </p>
        </div>
      </div>
    </div>
  )
}
