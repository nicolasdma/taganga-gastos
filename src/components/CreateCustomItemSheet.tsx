import { useEffect, useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { useCreateCustomItem, type CreatedCustomItem } from '@/hooks/useCreateCustomItem'
import { cn } from '@/lib/utils'

const COMMON_EMOJIS = [
  '🐱', '🐶', '🍕', '🎁', '💊', '🏠', '🚕', '☕',
  '🛒', '💸', '🎮', '🎬', '🌮', '🍺', '💅', '🧸',
  '📚', '✈️', '💡', '🌿', '🧁', '👶', '🎵', '✏️',
]

export interface CreateCustomItemSheetProps {
  open: boolean
  onClose: () => void
  onCreated: (item: CreatedCustomItem) => void
  initialLabel?: string
}

export function CreateCustomItemSheet({
  open,
  onClose,
  onCreated,
  initialLabel = '',
}: CreateCustomItemSheetProps) {
  const { createCustomItem, isCreating } = useCreateCustomItem()
  const [label, setLabel] = useState(initialLabel)
  const [emoji, setEmoji] = useState('✏️')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLabel(initialLabel)
    setEmoji('✏️')
    setError(null)
  }, [open, initialLabel])

  const handleSave = async () => {
    const trimmed = label.trim()
    if (!trimmed) {
      setError('Escribí un nombre para el ítem')
      return
    }

    setError(null)
    try {
      const item = await createCustomItem({ label: trimmed, emoji })
      onCreated(item)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ítem')
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} portal elevated>
      <div className="pb-4">
        <div className="text-center mb-5">
          <p className="font-display text-[1.35rem] font-bold text-ink tracking-tight">
            ✏️ Nuevo ítem
          </p>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">
            Empieza en Míos. Si lo usás en un gasto compartido, queda para todo el hogar.
          </p>
        </div>

        <label className="block mb-4">
          <span className="label-stitch mb-1.5 block">Nombre</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="comida de gatito"
            autoFocus
            className={cn(
              'w-full rounded-2xl px-4 py-3 text-sm font-medium',
              'bg-porcelain-cream/90 border-2 border-stitch/45',
              'placeholder:text-muted-foreground/55',
              'focus:outline-none focus:border-cobalt-glaze/55 focus:ring-2 focus:ring-cobalt-glaze/15'
            )}
          />
        </label>

        <div className="mb-5">
          <div className="grid grid-cols-8 gap-1.5">
            {COMMON_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-95',
                  emoji === e ? 'chip-tile ring-2 ring-cobalt-glaze/40' : 'hover:bg-muted/40'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-3 font-medium">{error}</p>
        )}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isCreating}
          className={cn(
            'w-full h-12 rounded-2xl btn-cobalt text-sm font-bold',
            'active:shadow-none transition-transform active:translate-y-px',
            isCreating && 'opacity-60 pointer-events-none'
          )}
        >
          {isCreating ? 'Guardando…' : 'Guardar ítem'}
        </button>
      </div>
    </BottomSheet>
  )
}
