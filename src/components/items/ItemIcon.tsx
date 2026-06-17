import { cn } from '@/lib/utils'

const PLANT_EMOJI = '🪴'
const PLANT_ICON_SRC = '/planta.png'

interface ItemIconProps {
  emoji: string
  label?: string
  className?: string
}

export function usesPlantImage(emoji: string): boolean {
  return emoji === PLANT_EMOJI
}

export function ItemIcon({ emoji, label, className }: ItemIconProps) {
  if (usesPlantImage(emoji)) {
    return (
      <img
        src={PLANT_ICON_SRC}
        alt={label ?? 'Planta'}
        className={cn('inline-block h-[1.35em] w-[1.35em] object-contain align-[-0.18em]', className)}
        draggable={false}
      />
    )
  }

  return <span className={className}>{emoji}</span>
}
