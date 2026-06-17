import { ItemIcon } from '@/components/items/ItemIcon'
import { cn } from '@/lib/utils'

interface EmojiResultRowProps {
  emojis: Array<{ emoji: string; label: string }>
  onPick: (emoji: string, label: string) => void
  /** grid = más emojis en grilla compacta; row = fila flexible */
  layout?: 'grid' | 'row'
}

export function EmojiResultRow({ emojis, onPick, layout = 'grid' }: EmojiResultRowProps) {
  if (emojis.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="label-stitch px-0.5">Emojis</p>
      <div
        className={cn(
          'pb-1',
          layout === 'grid'
            ? 'grid grid-cols-6 sm:grid-cols-8 gap-1.5'
            : 'flex flex-wrap gap-2'
        )}
      >
        {emojis.map(({ emoji, label }) => (
          <button
            key={`${emoji}-${label}`}
            type="button"
            title={label}
            onClick={() => onPick(emoji, label)}
            className={cn(
              'rounded-xl text-xl flex items-center justify-center chip-tile active:scale-95 transition-transform',
              layout === 'grid' ? 'h-10' : 'h-11 min-w-11 px-2'
            )}
          >
            <ItemIcon emoji={emoji} label={label} className="text-xl" />
          </button>
        ))}
      </div>
    </div>
  )
}
