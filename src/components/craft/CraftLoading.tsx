/**
 * Craft loading system — motion language aligned with sheets (480ms cubic-bezier),
 * toast stamp (450ms), tab-enter, and porcelain craft tokens.
 *
 * Variants: fullscreen gate, inline moment, skeleton chips/rows/tiles.
 * Respects prefers-reduced-motion via index.css (.craft-skeleton, .craft-paw-collage).
 */
import { useState } from 'react'
import { KittySprite } from '@/components/craft/KittySprite'
import { cn } from '@/lib/utils'
import { CraftScreenMessage, screenMessageA11y } from '@/components/craft/CraftScreenMessage'
import { pickInlineMessage, pickScreenMessage } from './craftLoadingMessages'

export type CraftLoadingVariant =
  | 'screen'
  | 'inline'
  | 'skeleton-chip'
  | 'skeleton-row'
  | 'skeleton-tile'

const TILTS = [
  'tilt-chip-1',
  'tilt-chip-2',
  'tilt-chip-3',
  'tilt-chip-4',
  'tilt-chip-5',
  'tilt-chip-6',
] as const

const KITTY_SIZE = { sm: 48, md: 64, lg: 80 } as const

interface CraftLoadingProps {
  variant?: CraftLoadingVariant
  message?: string
  showKitty?: boolean
  showPaws?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Skeleton variants — how many placeholders to render */
  count?: number
  className?: string
  /** Starting tilt index for skeleton chips/tiles */
  tiltStart?: number
}

function CraftSkeleton({
  variant,
  className,
  tiltIndex = 0,
}: {
  variant: 'skeleton-chip' | 'skeleton-row' | 'skeleton-tile'
  className?: string
  tiltIndex?: number
}) {
  const tilt = TILTS[tiltIndex % TILTS.length]

  if (variant === 'skeleton-chip') {
    return (
      <div
        className={cn('craft-skeleton craft-skeleton--chip h-[76px] w-full', tilt, className)}
        aria-hidden
      />
    )
  }

  if (variant === 'skeleton-tile') {
    return (
      <div
        className={cn(
          'craft-skeleton craft-skeleton--tile bento-tile bento-tile--cream h-[76px] w-full',
          tilt,
          className
        )}
        aria-hidden
      />
    )
  }

  return (
    <div className={cn('craft-skeleton craft-skeleton--row h-12 w-full', className)} aria-hidden />
  )
}

export function CraftLoading({
  variant = 'inline',
  message,
  showKitty,
  showPaws,
  size = 'md',
  count = 1,
  className,
  tiltStart = 0,
}: CraftLoadingProps) {
  const [screenMsg] = useState(() => message ?? pickScreenMessage())
  const [inlineMsg] = useState(() => message ?? pickInlineMessage())

  const kittySize = KITTY_SIZE[size]

  const resolvedShowKitty =
    showKitty ?? (variant !== 'skeleton-chip' && variant !== 'skeleton-row' && variant !== 'skeleton-tile')
  const resolvedShowPaws = showPaws ?? variant === 'screen'

  if (variant === 'skeleton-chip' || variant === 'skeleton-row' || variant === 'skeleton-tile') {
    if (count <= 1) {
      return (
        <CraftSkeleton
          variant={variant}
          className={className}
          tiltIndex={tiltStart}
        />
      )
    }

    return (
      <div className={cn('contents', className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: count }, (_, i) => (
          <CraftSkeleton
            key={i}
            variant={variant}
            tiltIndex={tiltStart + i}
          />
        ))}
      </div>
    )
  }

  if (variant === 'screen') {
    return (
      <div
        className={cn('app-shell boot-screen relative', className)}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={screenMessageA11y(screenMsg)}
      >
        <div className="boot-screen__paws" aria-hidden />
        <div className="relative z-10 flex flex-col items-center gap-4 px-8 text-center">
          {resolvedShowKitty ? (
            <div aria-hidden>
              <KittySprite
                anim="idle"
                size={kittySize + 16}
                playful
                className="animate-float-gentle"
                flip
              />
            </div>
          ) : (
            <div className="boot-screen__kitty-float" aria-hidden>
              <div className="boot-screen__kitty-wrap">
                <div className="boot-screen__kitty boot-screen__kitty--live" />
              </div>
            </div>
          )}
          {screenMsg && <CraftScreenMessage text={screenMsg} className="font-display" />}
        </div>
      </div>
    )
  }

  const displayMsg = message ?? inlineMsg

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-6 text-center', className)}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={displayMsg}
    >
      {resolvedShowPaws && (
        <div className="craft-paw-collage absolute inset-0 pointer-events-none opacity-50" aria-hidden />
      )}
      {resolvedShowKitty && (
        <div aria-hidden>
          <KittySprite
            anim="look"
            size={kittySize}
            playful={false}
            className="animate-float-gentle"
            flip={false}
          />
        </div>
      )}
      {displayMsg && (
        <p className="font-display text-sm font-semibold text-foreground">{displayMsg}</p>
      )}
    </div>
  )
}

/** Grid de chips skeleton — imita ItemPicker / QuickAccess */
export function CraftSkeletonChipGrid({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number
  columns?: number
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-busy="true"
      aria-live="polite"
    >
      <CraftLoading variant="skeleton-chip" count={count} tiltStart={0} />
    </div>
  )
}

/** Bloque stats lazy — header + cards porcelain */
export function CraftStatsFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn('tab-scroll h-full min-h-0 overflow-y-auto scrollbar-none px-4 pt-safe', className)}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-8 w-32 craft-skeleton craft-skeleton--row mb-6 mt-4" aria-hidden />
      <CraftSkeleton variant="skeleton-row" className="h-24 mb-5 rounded-[1.35rem]" />
      <CraftSkeleton variant="skeleton-row" className="h-24 mb-5 rounded-[1.35rem]" />
      <div className="rounded-3xl card-porcelain p-4 space-y-3">
        <CraftSkeleton variant="skeleton-row" className="h-40 rounded-xl" />
        <CraftLoading variant="skeleton-row" count={3} className="rounded-lg h-10" />
      </div>
    </div>
  )
}
