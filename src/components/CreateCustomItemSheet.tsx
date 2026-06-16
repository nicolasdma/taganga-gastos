import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { useEffect, useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import {
  CraftKeyboardProvider,
  useCraftKeyboardContext,
  useCraftKeyboardFooterSlot,
} from '@/components/keyboard'
import { useCreateCustomItem, type CreatedCustomItem } from '@/hooks/useCreateCustomItem'
import { EMOJI_INLINE_LIMIT, loadEmojiSearchIndex, searchEmojisFromIndex } from '@/lib/emojiSearch'
import { lookupHouseholdAlias, lookupStaticAlias } from '@/lib/itemAliases'
import { useHouseholdItemAliases } from '@/hooks/useHouseholdItemAliases'
import { cn } from '@/lib/utils'

const DEFAULT_EMOJI = '✏️'

export interface CreateCustomItemFormProps {
  initialLabel?: string
  initialEmoji?: string
  onCreated: (item: CreatedCustomItem) => void
  onCancel?: () => void
}

function resolveDefaultEmoji(
  label: string,
  emojiIndex: Awaited<ReturnType<typeof loadEmojiSearchIndex>> | null,
  householdAliases: ReturnType<typeof useHouseholdItemAliases>
): string {
  const trimmed = label.trim()
  if (!trimmed) return DEFAULT_EMOJI

  const household = lookupHouseholdAlias(trimmed, householdAliases)
  if (household) return household.emoji

  const staticAlias = lookupStaticAlias(trimmed)
  if (staticAlias) return staticAlias.emoji

  if (emojiIndex) {
    const hits = searchEmojisFromIndex(emojiIndex, trimmed, 1)
    if (hits[0]) return hits[0].emoji
  }

  return DEFAULT_EMOJI
}

export function CreateCustomItemForm({
  initialLabel = '',
  initialEmoji,
  onCreated,
}: CreateCustomItemFormProps) {
  const { createCustomItem, isCreating } = useCreateCustomItem()
  const keyboardCtx = useCraftKeyboardContext()
  const householdAliases = useHouseholdItemAliases()
  const [label, setLabel] = useState(initialLabel)
  const [emoji, setEmoji] = useState(initialEmoji ?? DEFAULT_EMOJI)
  const [suggestedEmojis, setSuggestedEmojis] = useState<Array<{ emoji: string; label: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [emojiReady, setEmojiReady] = useState(Boolean(initialEmoji))

  useEffect(() => {
    if (initialEmoji) {
      setEmoji(initialEmoji)
      setEmojiReady(true)
      return
    }

    let cancelled = false
    void loadEmojiSearchIndex()
      .then((index) => {
        if (cancelled) return
        const suggested = resolveDefaultEmoji(initialLabel, index, householdAliases)
        setEmoji(suggested)
        setSuggestedEmojis(searchEmojisFromIndex(index, initialLabel || label, EMOJI_INLINE_LIMIT))
        setEmojiReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setEmoji(resolveDefaultEmoji(initialLabel, null, householdAliases))
        setEmojiReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [initialLabel, initialEmoji, householdAliases])

  useEffect(() => {
    if (!emojiReady || initialEmoji) return
    let cancelled = false
    void loadEmojiSearchIndex()
      .then((index) => {
        if (cancelled) return
        setSuggestedEmojis(searchEmojisFromIndex(index, label, EMOJI_INLINE_LIMIT))
        if (!label.trim()) return
        const next = resolveDefaultEmoji(label, index, householdAliases)
        setEmoji((current) => (current === DEFAULT_EMOJI ? next : current))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [label, emojiReady, initialEmoji, householdAliases])

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

  const displaySuggested = (() => {
    const seen = new Set<string>()
    const list: Array<{ emoji: string; label: string }> = []
    const add = (emoji: string, label: string) => {
      if (seen.has(emoji)) return
      seen.add(emoji)
      list.push({ emoji, label })
    }
    add(emoji, label.trim() || 'Seleccionado')
    for (const entry of suggestedEmojis) add(entry.emoji, entry.label)
    return list.slice(0, EMOJI_INLINE_LIMIT)
  })()

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
        <div className="grid grid-cols-6 gap-1.5">
          {displaySuggested.map(({ emoji: e, label: emojiLabel }) => (
            <button
              key={e}
              type="button"
              title={emojiLabel}
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
  initialEmoji?: string
}

export function CreateCustomItemSheet({
  open,
  onClose,
  onCreated,
  initialLabel = '',
  initialEmoji,
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
  onCreated,
}: {
  open: boolean
  onClose: () => void
  initialLabel: string
  initialEmoji?: string
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
      <CreateCustomItemForm
        key={`${initialLabel}:${initialEmoji ?? ''}`}
        initialLabel={initialLabel}
        initialEmoji={initialEmoji}
        onCreated={onCreated}
      />
    </BottomSheet>
  )
}
