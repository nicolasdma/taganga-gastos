import type { ReactNode } from 'react'
import { KittySprite, kittyAnimFromVariant, kittyPlayfulFromVariant } from '@/components/craft/KittySprite'
import { CollageSticker } from '@/components/editorial/CollageSticker'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { cn } from '@/lib/utils'

interface EditorialScreenHeaderProps {
  kicker?: string
  title: string
  subtitle?: string
  catVariant?: 'peek' | 'sit' | 'sleep'
  showMarquee?: boolean
  sticker?: ReactNode
  className?: string
}

export function EditorialScreenHeader({
  kicker,
  title,
  subtitle,
  catVariant = 'peek',
  showMarquee = false,
  sticker,
  className,
}: EditorialScreenHeaderProps) {
  return (
    <header className={cn('editorial-screen-header shrink-0', className)}>
      {showMarquee && <MarqueeBand />}
      <div className="px-4 pt-2 pb-4">
        <MotionReveal step={1}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {kicker && (
                <p className="editorial-kicker">{kicker}</p>
              )}
              <h1 className="type-editorial-title text-white editorial-text-shadow">{title}</h1>
              {subtitle && (
                <p className="text-xs text-white/75 mt-2 font-medium editorial-text-shadow">{subtitle}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <KittySprite
                size={catVariant === 'sit' ? 60 : 68}
                anim={kittyAnimFromVariant(catVariant)}
                playful={kittyPlayfulFromVariant(catVariant)}
              />
              {sticker}
            </div>
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
    <CollageSticker tone="blush" rotate="right" className="animate-pulse">
      ⏳ {count} sync
    </CollageSticker>
  )
}
