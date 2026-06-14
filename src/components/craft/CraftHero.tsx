import { CraftCat } from '@/components/craft/CraftCat'
import { cn } from '@/lib/utils'

interface CraftHeroProps {
  pendingCount?: number
}

export function CraftHero({ pendingCount = 0 }: CraftHeroProps) {
  return (
    <header className="shrink-0 pt-safe px-4 pb-4 relative">
      <div className="craft-hero-blob absolute -top-8 -right-6 w-40 h-40 pointer-events-none" aria-hidden />
      <div className="craft-paw-scatter absolute top-6 right-16 w-24 h-24 pointer-events-none opacity-[0.07]" aria-hidden />

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-end gap-2">
            <h1 className="font-display craft-title text-[2.1rem] font-bold text-ink leading-[0.95] tracking-tight">
              Gastos
            </h1>
            <CraftCat variant="peek" className="w-12 h-9 -mb-0.5 animate-float-gentle shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium leading-snug">
            nuestro dinerito compartido
            <span className="text-stitch mx-1">·</span>
            <span className="font-display italic">hecho a mano</span>
            <span className="ml-1">🐾</span>
          </p>
        </div>

        {pendingCount > 0 && (
          <span
            className={cn(
              'text-[10px] font-bold text-clay-deep',
              'bg-clay-light/50 border-2 border-dashed border-clay/40',
              'rounded-full px-2.5 py-1 shrink-0 mb-1 tilt-alt animate-wobble-soft'
            )}
          >
            ⏳ {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </header>
  )
}
