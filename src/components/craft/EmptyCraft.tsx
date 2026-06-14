import { CraftCat } from '@/components/craft/CraftCat'
import { cn } from '@/lib/utils'

interface EmptyCraftProps {
  emoji?: string
  title: string
  subtitle?: string
  className?: string
}

export function EmptyCraft({ emoji, title, subtitle, className }: EmptyCraftProps) {
  return (
    <div className={cn('card-stitched rounded-[1.6rem_1.2rem_1.5rem_1.3rem] p-7 text-center relative overflow-hidden tilt-gentle', className)}>
      <div className="craft-spatter absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden />
      <div className="relative">
        {emoji ? (
          <span className="text-4xl block mb-2 animate-float-gentle">{emoji}</span>
        ) : (
          <CraftCat variant="sleep" className="w-20 h-14 mx-auto mb-2 animate-float-gentle" />
        )}
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[220px] mx-auto font-medium">
            {subtitle}
          </p>
        )}
        <p className="text-[10px] text-stitch mt-3 font-display">🐾 playa · sol · limonada</p>
      </div>
    </div>
  )
}
