import type { ReactNode } from 'react'
import { EditorialBrandmark } from '@/components/editorial/EditorialBrandmark'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'
import { CollageSticker } from '@/components/editorial/CollageSticker'

interface EditorialScreenHeaderProps {
  kicker?: string
  title: string
  subtitle?: string
  showMarquee?: boolean
  sticker?: ReactNode
  className?: string
  view?: ExpenseView
  onViewChange?: (view: ExpenseView) => void
  pulseKey?: number
  pendingCount?: number
  filterSkeleton?: boolean
  kittySize?: number
}

export function EditorialScreenHeader({
  kicker,
  title,
  subtitle,
  showMarquee = false,
  sticker,
  className,
  view,
  onViewChange,
  pulseKey,
  pendingCount,
  filterSkeleton,
  kittySize,
}: EditorialScreenHeaderProps) {
  return (
    <header className={cn('editorial-screen-header shrink-0', className)}>
      {showMarquee && <MarqueeBand />}
      <div className="px-4 pt-2 pb-4">
        <MotionReveal step={1}>
          <div className="flex items-start justify-between gap-3">
            <div>
              {kicker && <p className="editorial-kicker">{kicker}</p>}
              <h1 className="type-editorial-title text-white editorial-text-shadow">{title}</h1>
              {subtitle && (
                <p className="text-xs text-white/75 mt-2 font-medium editorial-text-shadow">{subtitle}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <EditorialBrandmark
                view={view}
                onViewChange={onViewChange}
                pulseKey={pulseKey}
                pendingCount={pendingCount}
                filterSkeleton={filterSkeleton}
                size={kittySize}
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
    <CollageSticker tone="blush" rotate="right" className="craft-sync-wobble">
      ⏳ {count} sync
    </CollageSticker>
  )
}
