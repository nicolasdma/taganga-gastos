import { cn } from '@/lib/utils'
import { ItemIcon } from '@/components/items/ItemIcon'

const TILTS = ['tilt-chip-1', 'tilt-chip-2', 'tilt-chip-3', 'tilt-chip-4', 'tilt-chip-5', 'tilt-chip-6'] as const

interface ExpenseChipProps {
  emoji: string
  label: string
  onClick: () => void
  compact?: boolean
  active?: boolean
  tiltIndex?: number
}

export function ExpenseChip({
  emoji,
  label,
  onClick,
  compact,
  active,
  tiltIndex = 0,
}: ExpenseChipProps) {
  const tilt = TILTS[tiltIndex % TILTS.length]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center transition-all',
        'active:translate-y-1 active:shadow-none',
        compact ? 'h-[68px] px-1' : 'h-[76px] px-1.5',
        active ? 'chip-tile-active' : 'chip-tile',
        tilt
      )}
    >
      <ItemIcon emoji={emoji} label={label} className={cn(compact ? 'text-xl' : 'text-2xl')} />
      <span className="text-[10px] font-bold text-foreground/75 mt-0.5 truncate max-w-full px-0.5 font-display">
        {label}
      </span>
    </button>
  )
}
