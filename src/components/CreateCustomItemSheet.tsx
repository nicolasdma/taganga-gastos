import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import {
  CraftKeyboardProvider,
  useCraftKeyboardContext,
  useCraftKeyboardFooterSlot,
} from '@/components/keyboard'
import { useCreateCustomItem, type CreatedCustomItem } from '@/hooks/useCreateCustomItem'
import { cn } from '@/lib/utils'

const COMMON_EMOJIS = [
  '🐱', '🐶', '🍕', '🎁', '💊', '🏠', '🚕', '☕',
  '🛒', '💸', '🎮', '🎬', '🌮', '🍺', '💅', '🧸',
  '📚', '✈️', '💡', '🌿', '🧁', '👶', '🎵', '✏️',
]

export interface CreateCustomItemFormProps {
  initialLabel?: string
  onCreated: (item: CreatedCustomItem) => void
  onCancel?: () => void
}

export function CreateCustomItemForm({
  initialLabel = '',
  onCreated,
}: CreateCustomItemFormProps) {
  const { createCustomItem, isCreating } = useCreateCustomItem()
  const keyboardCtx = useCraftKeyboardContext()
  const [label, setLabel] = useState(initialLabel)
  const [emoji, setEmoji] = useState('✏️')
  const [error, setError] = useState<string | null>(null)

  const dismissKeyboard = () => {
    keyboardCtx?.dismissKeyboard()
  }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ítem')
    }
  }

  return (
    <div className="pb-4">
      <label className="block mb-4">
        <span className="label-stitch mb-1.5 block">Nombre</span>
        <CraftTextField
          value={label}
          onChange={setLabel}
          placeholder="comida de gatito"
          maxLength={40}
          autoFocus
          compactKeyboard
        />
      </label>

      <div className="mb-5">
        <span className="label-stitch mb-1.5 block">Emoji</span>
        <div className="grid grid-cols-8 gap-1.5">
          {COMMON_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onPointerDown={dismissKeyboard}
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
        onPointerDown={dismissKeyboard}
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
  )
}

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
  const handleCreated = (item: CreatedCustomItem) => {
    onCreated(item)
    onClose()
  }

  return (
    <CraftKeyboardProvider dock>
      <CreateCustomItemSheetPanel
        open={open}
        onClose={onClose}
        initialLabel={initialLabel}
        onCreated={handleCreated}
      />
    </CraftKeyboardProvider>
  )
}

function CreateCustomItemSheetPanel({
  open,
  onClose,
  initialLabel,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  initialLabel: string
  onCreated: (item: CreatedCustomItem) => void
}) {
  const footer = useCraftKeyboardFooterSlot()

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      portal
      elevated
      height="standard"
      title="✏️ Nuevo ítem"
      headerAction="cancel"
      footer={footer}
    >
      <CreateCustomItemForm key={initialLabel} initialLabel={initialLabel} onCreated={onCreated} />
    </BottomSheet>
  )
}
