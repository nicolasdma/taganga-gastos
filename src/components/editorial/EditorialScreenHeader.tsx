import type { ReactNode } from 'react'
import { BrandmarkSlot } from '@/components/editorial/AppBrandmarkDock'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { CollageSticker } from '@/components/editorial/CollageSticker'
import { cn } from '@/lib/utils'

interface EditorialScreenHeaderProps {
  kicker?: string
  title: string
  subtitle?: string
  showMarquee?: boolean
  sticker?: ReactNode
  className?: string
}

export function EditorialScreenHeader({
  kicker,
  title,
  subtitle,
  showMarquee = false,
  sticker,
  className,
}: EditorialScreenHeaderProps) {
  return (
    <header
      className={cn(
        'editorial-screen-header shrink-0',
        subtitle && 'editorial-screen-header--stacked',
        className
      )}
    >
      {showMarquee && <MarqueeBand />}
      <div className="px-4 pt-2 pb-5">
        <MotionReveal step={1}>
          <div className="flex items-start justify-between gap-3 editorial-header__title-row">
            <div className="editorial-header__copy min-w-0 flex-1">
              {kicker && <p className="editorial-kicker">{kicker}</p>}
              <h1 className="type-editorial-title text-white editorial-text-shadow">{title}</h1>
              {subtitle && (
                <p className="text-xs text-white/75 mt-2 font-medium editorial-text-shadow">{subtitle}</p>
              )}
              {sticker}
            </div>
            <BrandmarkSlot />
          </div>
        </MotionReveal>
      </div>
    </header>
  )
}

/** Badge de sync pendiente reutilizable */
export function SyncPendingSticker({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <CollageSticker tone="blush" rotate="right" className="craft-sync-wobble">
      ⏳ {count} sync
    </CollageSticker>
  )
}
