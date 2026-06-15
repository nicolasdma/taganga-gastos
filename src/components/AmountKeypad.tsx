import { useEffect, useRef, useState } from 'react'
import { AMOUNT_PRESETS, formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Delete } from 'lucide-react'
import { formatItemDetail } from '@/lib/foodCatalog'
import { ExpenseScopeToggle } from '@/components/ExpenseScopeToggle'
import type { ExpenseScope } from '@/lib/expenseScope'

export interface EditableItemHeader {
  emoji: string
  catalogLabel: string
  detail: string
  onDetailChange: (detail: string) => void
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
  autoSaveOnPreset?: boolean
  onPresetSelect?: (amount: number) => void
  primaryAction?: 'save' | 'continue'
  primaryLabel?: string
  scope?: ExpenseScope
  onScopeChange?: (scope: ExpenseScope) => void
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
  autoSaveOnPreset,
  onPresetSelect,
  primaryAction = 'save',
  primaryLabel,
  scope,
  onScopeChange,
}: AmountKeypadProps) {
  const [editingLabel, setEditingLabel] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingLabel) inputRef.current?.focus()
  }, [editingLabel])

  const appendDigit = (digit: number) => {
    const next = value * 10 + digit
    if (next > 99_999_999) return
    onChange(next)
  }

  const backspace = () => {
    onChange(Math.floor(value / 10))
  }

  const handlePreset = (amount: number) => {
    onChange(amount)
    if (autoSaveOnPreset && onPresetSelect) {
      onPresetSelect(amount)
    }
  }

  const canProceed = value > 0 && !saving
  const showSaveButton = !autoSaveOnPreset || value > 0

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

  const headerLabel = itemHeader
    ? itemHeader.detail.trim() || itemHeader.catalogLabel
    : title

  return (
    <div className="flex flex-col pb-2">
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
            <span className="text-3xl leading-none shrink-0">{itemHeader.emoji}</span>
            {editingLabel ? (
              <input
                key={itemHeader.detail}
                ref={inputRef}
                type="text"
                defaultValue={itemHeader.detail}
                placeholder={itemHeader.catalogLabel}
                className={cn(
                  'min-w-0 flex-1 max-w-[12rem] rounded-xl px-3 py-2 text-base font-display font-bold text-ink',
                  'bg-porcelain-cream/90 border-2 border-cobalt-glaze/45',
                  'placeholder:text-muted-foreground/45 placeholder:font-medium placeholder:text-sm',
                  'focus:outline-none focus:border-cobalt-glaze/70 focus:ring-2 focus:ring-cobalt-glaze/15'
                )}
                enterKeyHint="done"
                onBlur={(e) => commitDetail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitDetail(e.currentTarget.value)
                  }
                  if (e.key === 'Escape') {
                    setEditingLabel(false)
                  }
                }}
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

      {scope && onScopeChange && (
        <ExpenseScopeToggle value={scope} onChange={onScopeChange} className="mb-3" />
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        {AMOUNT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePreset(preset)}
            className={cn(
              'h-11 rounded-xl text-xs font-bold transition-all active:translate-y-px',
              value === preset ? 'btn-cobalt active:shadow-none' : 'chip-tile'
            )}
          >
            {formatCOP(preset)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(0)}
          className="h-11 rounded-xl text-xs font-bold chip-tile text-muted-foreground active:translate-y-px"
        >
          Limpiar
        </button>
      </div>

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

      {showSaveButton && (
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
