import { ExpenseViewFilter } from '@/components/ExpenseScopeToggle'
import { KittySprite } from '@/components/craft/KittySprite'
import { SyncPendingSticker } from '@/components/editorial/EditorialScreenHeader'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface EditorialBrandmarkProps {
  view?: ExpenseView
  onViewChange?: (view: ExpenseView) => void
  pulseKey?: number
  size?: number
  pendingCount?: number
  /** Stats suspense — chip inert skeleton */
  filterSkeleton?: boolean
  className?: string
}

function ViewFilterSkeleton() {
  return (
    <div
      className="craft-skeleton craft-skeleton--row h-8 w-[6.5rem] rounded-2xl editorial-brandmark__view-filter shrink-0"
      aria-hidden
    />
  )
}

export function EditorialBrandmark({
  view,
  onViewChange,
  pulseKey = 0,
  size = 76,
  pendingCount = 0,
  filterSkeleton = false,
  className,
}: EditorialBrandmarkProps) {
  const kittyStyle = { '--editorial-kitty-size': `${size}px` } as CSSProperties

  return (
    <div className={cn('editorial-brandmark flex flex-col items-end gap-1.5', className)} style={kittyStyle}>
      <div
        className={cn(
          'editorial-brandmark__kitties',
          view === 'shared' && 'editorial-brandmark__kitties--pair'
        )}
        aria-hidden={view === undefined}
      >
        <div className="editorial-brandmark__kitty-slot editorial-brandmark__kitty-slot--lead">
          <KittySprite
            size={size}
            pulseKey={pulseKey}
            flip
            className="kitty-sprite-wrap--rise opacity-95"
          />
        </div>
        <div
          className="editorial-brandmark__kitty-slot editorial-brandmark__kitty-slot--mate"
          aria-hidden={view !== 'shared'}
        >
          <KittySprite
            size={size}
            flip={false}
            playful
            className="kitty-sprite-wrap--rise opacity-[0.94]"
          />
        </div>
      </div>

      {filterSkeleton ? (
        <ViewFilterSkeleton />
      ) : (
        view !== undefined &&
        onViewChange && (
          <ExpenseViewFilter
            value={view}
            onChange={onViewChange}
            className="editorial-brandmark__view-filter"
          />
        )
      )}

      <SyncPendingSticker count={pendingCount} />
    </div>
  )
}
