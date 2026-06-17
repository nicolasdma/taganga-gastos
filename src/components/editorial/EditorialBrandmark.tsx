import { ExpenseViewFilter } from '@/components/ExpenseScopeToggle'
import { KittySprite } from '@/components/craft/KittySprite'
import { SyncPendingSticker } from '@/components/editorial/EditorialScreenHeader'
import type { ExpenseView } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'

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
  size,
  pendingCount = 0,
  filterSkeleton = false,
  className,
}: EditorialBrandmarkProps) {
  const kittyStyle =
    size === undefined ? undefined : ({ '--editorial-kitty-size': `${size}px` } as CSSProperties)
  const canToggle = view !== undefined && onViewChange !== undefined
  const nextView = view === 'shared' ? 'personal' : 'shared'
  const toggleLabel =
    view === 'shared' ? 'Cambiar a Míos' : 'Cambiar a Nosotros'

  const toggleView = () => {
    if (!canToggle) return
    onViewChange(nextView)
  }

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!canToggle) return
    if (event.target instanceof Element && event.target.closest('button')) return
    toggleView()
  }

  const handleKittiesKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggleView()
  }

  return (
    <div
      className={cn(
        'editorial-brandmark flex flex-col items-end gap-1.5',
        canToggle && 'editorial-brandmark--interactive',
        className
      )}
      style={kittyStyle}
      onClick={handleContainerClick}
    >
      <div
        className={cn(
          'editorial-brandmark__kitties',
          view === 'shared' && 'editorial-brandmark__kitties--pair'
        )}
        role={canToggle ? 'button' : undefined}
        tabIndex={canToggle ? 0 : undefined}
        aria-label={canToggle ? toggleLabel : undefined}
        aria-hidden={view === undefined ? true : undefined}
        onClick={(event) => {
          event.stopPropagation()
          toggleView()
        }}
        onKeyDown={handleKittiesKeyDown}
      >
        <div className="editorial-brandmark__kitty-slot editorial-brandmark__kitty-slot--lead">
          <KittySprite
            size={size}
            inheritSize={size === undefined}
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
            inheritSize={size === undefined}
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
