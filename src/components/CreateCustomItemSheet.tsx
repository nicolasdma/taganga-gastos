import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import {
  CraftKeyboardProvider,
  useCraftKeyboardContext,
  useCraftKeyboardFooterSlot,
} from '@/components/keyboard'
import { EmojiSuggestionGrid } from '@/components/items/EmojiSuggestionGrid'
import { useCreateCustomItem, type CreatedCustomItem } from '@/hooks/useCreateCustomItem'
import { useUpdateCustomItem } from '@/hooks/useUpdateCustomItem'
import { cn } from '@/lib/utils'

const DEFAULT_EMOJI = '✏️'

export interface CreateCustomItemFormProps {
  initialLabel?: string
  initialEmoji?: string
  /** Modo edición de ítem custom existente */
  editItemId?: string
  onCreated: (item: CreatedCustomItem) => void
  onCancel?: () => void
}

export function CreateCustomItemForm({
  initialLabel = '',
  initialEmoji,
  editItemId,
  onCreated,
}: CreateCustomItemFormProps) {
  const isEdit = Boolean(editItemId)
  const { createCustomItem, isCreating: isCreatingNew } = useCreateCustomItem()
  const { updateCustomItem } = useUpdateCustomItem()
  const keyboardCtx = useCraftKeyboardContext()
  const [label, setLabel] = useState(initialLabel)
  const [emoji, setEmoji] = useState(initialEmoji ?? DEFAULT_EMOJI)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
    setSaving(true)
    try {
      const item = isEdit && editItemId
        ? await updateCustomItem({ itemId: editItemId, label: trimmed, emoji })
        : await createCustomItem({ label: trimmed, emoji })
      onCreated(item)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el ítem')
    } finally {
      setSaving(false)
    }
  }

  const isCreating = isCreatingNew || saving

  return (
    <div className="pb-4">
      <label className="block mb-4">
        <span className="label-stitch mb-1.5 block">Nombre</span>
        <CraftTextField
          value={label}
          onChange={setLabel}
          placeholder="comida de gatito"
          maxLength={40}
          compactKeyboard
        />
      </label>

      <div className="mb-5">
        <span className="label-stitch mb-1.5 block">Emoji</span>
        <div className="flex justify-center mb-3">
          <span className="text-5xl leading-none" aria-hidden>
            {emoji}
          </span>
        </div>
        <EmojiSuggestionGrid
          selectedEmoji={emoji}
          searchQuery={label}
          onSelect={setEmoji}
          onDismissKeyboard={dismissKeyboard}
        />
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
        {isCreating ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Guardar ítem'}
      </button>
    </div>
  )
}

export interface CreateCustomItemSheetProps {
  open: boolean
  onClose: () => void
  onCreated: (item: CreatedCustomItem) => void
  initialLabel?: string
  initialEmoji?: string
  editItemId?: string
}

export function CreateCustomItemSheet({
  open,
  onClose,
  onCreated,
  initialLabel = '',
  initialEmoji,
  editItemId,
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
        initialEmoji={initialEmoji}
        editItemId={editItemId}
        onCreated={handleCreated}
      />
    </CraftKeyboardProvider>
  )
}

function CreateCustomItemSheetPanel({
  open,
  onClose,
  initialLabel,
  initialEmoji,
  editItemId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  initialLabel: string
  initialEmoji?: string
  editItemId?: string
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
      title={editItemId ? '✏️ Editar ítem' : '✏️ Nuevo ítem'}
      headerAction="cancel"
      footer={footer}
    >
      <CreateCustomItemForm
        key={`${editItemId ?? 'new'}:${initialLabel}:${initialEmoji ?? ''}`}
        initialLabel={initialLabel}
        initialEmoji={initialEmoji}
        editItemId={editItemId}
        onCreated={onCreated}
      />
    </BottomSheet>
  )
}
