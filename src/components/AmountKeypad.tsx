import { useEffect, useRef, useState } from 'react'
import { formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Delete } from 'lucide-react'
import { formatItemDetail } from '@/lib/foodCatalog'
import { CraftKeyboard } from '@/components/keyboard/CraftKeyboard'
import { CraftKeyboardSlide } from '@/components/keyboard/CraftKeyboardSlide'
import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { useCraftKeyboardContext } from '@/components/keyboard/useCraftKeyboard'

const DETAIL_FIELD_ID = 'amount-keypad-detail'

export interface EditableItemHeader {
  emoji: string
  catalogLabel: string
  detail: string
  onDetailChange: (detail: string) => void
  onEmojiPress?: () => void
}

interface AmountKeypadProps {
  title?: string
  subtitle?: string
  categoryHeader?: { emoji: string; label: string }
  itemHeader?: EditableItemHeader
  value: number
  onChange: (value: number) => void
  onSave: () => void
  onCancel?: () => void
  onBack?: () => void
  saving?: boolean
  primaryAction?: 'save' | 'continue'
  primaryLabel?: string
  /** Hide cancel/back row — sheet header owns navigation. */
  hideNav?: boolean
}

export function AmountKeypad({
  title,
  subtitle,
  categoryHeader,
  itemHeader,
  value,
  onChange,
  onSave,
  onCancel,
  onBack,
  saving,
  primaryAction = 'save',
  primaryLabel,
  hideNav = false,
}: AmountKeypadProps) {
  const keyboardCtx = useCraftKeyboardContext()
  const keyboardDock = keyboardCtx?.dock
  const setKeyboardSession = keyboardCtx?.setSession
  const clearKeyboardSession = keyboardCtx?.clearSession
  const [editingLabel, setEditingLabel] = useState(false)
  const [detailDraft, setDetailDraft] = useState('')
  const [detailUppercase, setDetailUppercase] = useState(false)
  const detailDraftRef = useRef(detailDraft)
  detailDraftRef.current = detailDraft

  useEffect(() => {
    if (editingLabel && itemHeader) {
      setDetailDraft(itemHeader.detail)
      setDetailUppercase(false)
    }
  }, [editingLabel, itemHeader])

  const commitDetail = (raw: string) => {
    if (!itemHeader) return
    const trimmed = formatItemDetail(raw)
    if (!trimmed || trimmed.toLowerCase() === itemHeader.catalogLabel.toLowerCase()) {
      itemHeader.onDetailChange('')
    } else {
      itemHeader.onDetailChange(trimmed)
    }
    setEditingLabel(false)
  }

  useEffect(() => {
    if (!editingLabel || !keyboardDock || !setKeyboardSession || !clearKeyboardSession) return

    const handlers = {
      onChar: (char: string) => {
        setDetailDraft((draft) => (draft.length >= 40 ? draft : draft + char))
      },
      onBackspace: () => setDetailDraft((draft) => draft.slice(0, -1)),
      onDone: () => commitDetail(detailDraftRef.current),
      onDismiss: () => commitDetail(detailDraftRef.current),
      onToggleCase: () => setDetailUppercase((u) => !u),
    }

    setKeyboardSession({
      fieldId: DETAIL_FIELD_ID,
      layout: 'text',
      compact: true,
      uppercase: detailUppercase,
      enableShift: true,
      onChar: (char) => handlers.onChar(char),
      onBackspace: () => handlers.onBackspace(),
      onDone: () => handlers.onDone(),
      onDismiss: () => handlers.onDismiss(),
      onToggleCase: () => handlers.onToggleCase(),
    })

    return () => {
      clearKeyboardSession(DETAIL_FIELD_ID)
    }
  }, [
    editingLabel,
    keyboardDock,
    setKeyboardSession,
    clearKeyboardSession,
    detailUppercase,
  ])

  const appendDigit = (digit: number) => {
    const next = value * 10 + digit
    if (next > 99_999_999) return
    onChange(next)
  }

  const backspace = () => {
    onChange(Math.floor(value / 10))
  }

  const canProceed = value > 0 && !saving

  const headerLabel = itemHeader
    ? itemHeader.detail.trim() || itemHeader.catalogLabel
    : title

  return (
    <div className="flex flex-col pb-2">
      {!hideNav && (
        <div className="flex items-center justify-between mb-3">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted-foreground">
              Cancelar
            </button>
          ) : onBack ? (
            <button type="button" onClick={onBack} className="text-sm font-semibold text-muted-foreground">
              Atrás
            </button>
          ) : (
            <div className="w-16" />
          )}
          {!itemHeader && !categoryHeader && title && (
            <div className="text-center min-w-0 flex-1 px-3">
              <p className="font-display text-sm font-bold text-foreground truncate">{title}</p>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          )}
          {(itemHeader || categoryHeader) && <div className="flex-1" />}
          <div className="w-16" />
        </div>
      )}

      {categoryHeader && (
        <div className="text-center mb-4 px-1">
          <div className="flex items-center justify-center gap-2.5 min-h-[2.75rem]">
            <span className="text-3xl leading-none shrink-0">{categoryHeader.emoji}</span>
            <p className="font-display text-xl font-bold text-ink">{categoryHeader.label}</p>
          </div>
        </div>
      )}

      {itemHeader && (
        <div className="text-center mb-4 px-1">
          <div className="flex items-center justify-center gap-2.5 min-h-[2.75rem]">
            {itemHeader.onEmojiPress ? (
              <button
                type="button"
                onClick={itemHeader.onEmojiPress}
                className="text-3xl leading-none shrink-0 rounded-xl px-1 active:scale-95 transition-transform"
                aria-label="Cambiar emoji"
              >
                {itemHeader.emoji}
              </button>
            ) : (
              <span className="text-3xl leading-none shrink-0">{itemHeader.emoji}</span>
            )}
            {editingLabel ? (
              <CraftTextField
                variant="dashed"
                value={detailDraft}
                onChange={setDetailDraft}
                placeholder={itemHeader.catalogLabel}
                maxLength={40}
                showKeyboard={false}
                focused
                center
                className="min-w-0 flex-1 max-w-[12rem]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingLabel(true)}
                className={cn(
                  'font-display text-xl font-bold text-ink text-left',
                  'border-b-2 border-dashed border-stitch/55 pb-0.5',
                  'active:opacity-70 transition-opacity'
                )}
              >
                {headerLabel}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <p className="font-display text-4xl font-bold font-tabular text-ink tracking-tight">
          {formatCOP(value)}
        </p>
      </div>

      {editingLabel && !keyboardDock ? (
        <CraftKeyboardSlide visible className="mt-1">
          <CraftKeyboard
            layout="text"
            compact
            uppercase={detailUppercase}
            onToggleCase={() => setDetailUppercase((u) => !u)}
            onChar={(char) => {
              if (detailDraft.length >= 40) return
              setDetailDraft((d) => d + char)
            }}
            onBackspace={() => setDetailDraft((d) => d.slice(0, -1))}
            onDone={() => commitDetail(detailDraft)}
          />
        </CraftKeyboardSlide>
      ) : !editingLabel ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => appendDigit(digit)}
              className="h-12 rounded-2xl chip-tile text-xl font-bold text-foreground active:translate-y-0.5 active:shadow-none"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={backspace}
            className="h-12 rounded-2xl chip-tile flex items-center justify-center active:translate-y-0.5 active:shadow-none"
            aria-label="Borrar"
          >
            <Delete className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => appendDigit(0)}
            className="h-12 rounded-2xl chip-tile text-xl font-bold text-foreground active:translate-y-0.5 active:shadow-none col-span-2"
          >
            0
          </button>
        </div>
      ) : null}

      {!editingLabel && (
        <Button
          size="lg"
          className="w-full mt-4 rounded-2xl"
          disabled={!canProceed}
          onClick={onSave}
        >
          {saving
            ? 'Guardando…'
            : primaryLabel ?? (primaryAction === 'continue' ? 'Siguiente' : 'Guardar')}
        </Button>
      )}
    </div>
  )
}
