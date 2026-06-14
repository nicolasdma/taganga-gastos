import { AMOUNT_PRESETS, formatCOP } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Delete } from 'lucide-react'

interface AmountKeypadProps {
  title: string
  subtitle?: string
  value: number
  onChange: (value: number) => void
  onSave: () => void
  onCancel?: () => void
  saving?: boolean
  /** Preset tap saves immediately (quick expense flow) */
  autoSaveOnPreset?: boolean
  onPresetSelect?: (amount: number) => void
  /** FAB flow: continue to category picker */
  primaryAction?: 'save' | 'continue'
  primaryLabel?: string
}

export function AmountKeypad({
  title,
  subtitle,
  value,
  onChange,
  onSave,
  onCancel,
  saving,
  autoSaveOnPreset,
  onPresetSelect,
  primaryAction = 'save',
  primaryLabel,
}: AmountKeypadProps) {
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

  return (
    <div className="flex flex-col pb-2">
      {(onCancel || title) && (
        <div className="flex items-center justify-between mb-3">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="text-sm font-semibold text-muted-foreground">
              Cancelar
            </button>
          ) : (
            <div className="w-16" />
          )}
          <div className="text-center min-w-0 flex-1 px-3">
            <p className="font-display text-sm font-bold text-foreground truncate">{title}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div className="w-16" />
        </div>
      )}

      <div className="text-center mb-4">
        <p className="font-display text-4xl font-bold font-tabular text-ink tracking-tight">
          {formatCOP(value)}
        </p>
      </div>

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
