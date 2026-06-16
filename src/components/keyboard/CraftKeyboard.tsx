import { CornerDownLeft, Delete } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ALPHANUMERIC_ROWS,
  TEXT_ROW_BOT_LOWER,
  TEXT_ROW_BOT_UPPER,
  TEXT_ROW_MID_LOWER,
  TEXT_ROW_MID_UPPER,
  TEXT_ROW_TOP_LOWER,
  TEXT_ROW_TOP_UPPER,
  doneLabelForLayout,
  type KeyboardLayout,
} from './keyboardLayouts'

interface CraftKeyboardProps {
  layout: KeyboardLayout
  onChar: (char: string) => void
  onBackspace: () => void
  onSpace?: () => void
  onDone: () => void
  uppercase?: boolean
  onToggleCase?: () => void
  compact?: boolean
  className?: string
}

function KeyButton({
  children,
  onClick,
  className,
  ariaLabel,
  primary,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'font-display font-bold active:translate-y-px transition-transform',
        primary ? 'btn-cobalt active:shadow-none' : 'chip-tile active:shadow-none',
        className
      )}
    >
      {children}
    </button>
  )
}

function LetterRow({
  keys,
  onChar,
  keyClassName,
  className,
}: {
  keys: readonly string[]
  onChar: (char: string) => void
  keyClassName: string
  className?: string
}) {
  return (
    <div className={cn('flex gap-1', className)}>
      {keys.map((key) => (
        <KeyButton
          key={key}
          onClick={() => onChar(key)}
          ariaLabel={key}
          className={cn('flex-1 min-w-0 rounded-xl', keyClassName)}
        >
          {key}
        </KeyButton>
      ))}
    </div>
  )
}

export function CraftKeyboard({
  layout,
  onChar,
  onBackspace,
  onSpace,
  onDone,
  uppercase = false,
  onToggleCase,
  compact = false,
  className,
}: CraftKeyboardProps) {
  const keyH = compact ? 'h-9 text-[13px]' : 'h-10 text-sm'
  const doneH = compact ? 'h-9 text-xs' : 'h-10 text-sm'
  const doneLabel = doneLabelForLayout(layout)

  if (layout === 'alphanumeric') {
    return (
      <div className={cn('craft-keyboard select-none', className)} role="group" aria-label="Teclado alfanumérico">
        <div className="grid gap-1.5">
          {ALPHANUMERIC_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((key) => (
                <KeyButton
                  key={key}
                  onClick={() => onChar(key)}
                  ariaLabel={key}
                  className={cn('flex-1 min-w-0 rounded-xl', keyH)}
                >
                  {key}
                </KeyButton>
              ))}
            </div>
          ))}
          <div className="flex gap-1.5">
            <KeyButton
              onClick={onBackspace}
              ariaLabel="Borrar"
              className={cn('flex-1 rounded-xl flex items-center justify-center', doneH)}
            >
              <Delete className="h-4 w-4 text-muted-foreground" />
            </KeyButton>
            <KeyButton onClick={onDone} primary className={cn('flex-[2] rounded-xl', doneH)}>
              {doneLabel}
            </KeyButton>
          </div>
        </div>
      </div>
    )
  }

  const topRow = uppercase ? TEXT_ROW_TOP_UPPER : TEXT_ROW_TOP_LOWER
  const midRow = uppercase ? TEXT_ROW_MID_UPPER : TEXT_ROW_MID_LOWER
  const botRow = uppercase ? TEXT_ROW_BOT_UPPER : TEXT_ROW_BOT_LOWER

  return (
    <div className={cn('craft-keyboard select-none', className)} role="group" aria-label="Teclado de texto">
      <div className="grid gap-1.5">
        <LetterRow keys={topRow} onChar={onChar} keyClassName={keyH} />

        <LetterRow keys={midRow} onChar={onChar} keyClassName={keyH} className="px-2" />

        <div className="flex gap-1 items-stretch">
          {onToggleCase && (
            <KeyButton
              onClick={onToggleCase}
              ariaLabel={uppercase ? 'Minúsculas' : 'Mayúsculas'}
              className={cn(
                'shrink-0 rounded-xl px-2.5',
                compact ? 'w-10' : 'w-11',
                keyH,
                uppercase && 'ring-2 ring-cobalt-glaze/35'
              )}
            >
              ⇧
            </KeyButton>
          )}
          <div className="flex flex-1 gap-1 min-w-0">
            {botRow.map((key) => (
              <KeyButton
                key={key}
                onClick={() => onChar(key)}
                ariaLabel={key}
                className={cn('flex-1 min-w-0 rounded-xl', keyH)}
              >
                {key}
              </KeyButton>
            ))}
          </div>
          <KeyButton
            onClick={onBackspace}
            ariaLabel="Borrar"
            className={cn(
              'shrink-0 rounded-xl flex items-center justify-center',
              compact ? 'w-10' : 'w-11',
              keyH
            )}
          >
            <Delete className="h-4 w-4 text-muted-foreground" />
          </KeyButton>
        </div>

        <div className="flex gap-1.5">
          <KeyButton
            onClick={() => (onSpace ? onSpace() : onChar(' '))}
            ariaLabel="Espacio"
            className={cn('flex-[3] rounded-xl', keyH)}
          >
            espacio
          </KeyButton>
          <KeyButton
            onClick={onDone}
            primary
            ariaLabel={doneLabel}
            className={cn('flex-1 rounded-xl flex items-center justify-center gap-1', doneH)}
          >
            <CornerDownLeft className="h-4 w-4 shrink-0" />
            <span>{doneLabel}</span>
          </KeyButton>
        </div>
      </div>
    </div>
  )
}
