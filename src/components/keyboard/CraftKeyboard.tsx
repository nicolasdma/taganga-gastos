import { CornerDownLeft, Delete } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { keyTapFeedback } from '@/lib/tapFeedback'
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
  haptic = true,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
  primary?: boolean
  haptic?: boolean
}) {
  const [flash, setFlash] = useState(false)

  const handlePointerDown = () => {
    if (haptic) keyTapFeedback()
    setFlash(true)
    window.setTimeout(() => setFlash(false), 50)
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'font-display font-bold active:scale-[0.97] transition-transform',
        primary ? 'btn-cobalt active:shadow-none' : 'chip-tile active:shadow-none',
        flash && !primary && 'bg-cobalt-glaze/10',
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
  keyGap,
  className,
}: {
  keys: readonly string[]
  onChar: (char: string) => void
  keyClassName: string
  keyGap: string
  className?: string
}) {
  return (
    <div className={cn('flex', keyGap, className)}>
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
  const keyH = compact ? 'h-10 text-sm' : 'h-11 text-[15px]'
  const keyGap = compact ? 'gap-0.5' : 'gap-1'
  const rowGap = compact ? 'gap-1' : 'gap-1.5'
  const sideKeyW = compact ? 'w-11' : 'w-12'
  const doneH = compact ? 'h-10 text-sm' : 'h-11 text-sm'
  const doneLabel = doneLabelForLayout(layout)

  if (layout === 'alphanumeric') {
    return (
      <div className={cn('craft-keyboard select-none', className)} role="group" aria-label="Teclado alfanumérico">
        <div className={cn('grid', rowGap)}>
          {ALPHANUMERIC_ROWS.map((row, ri) => (
            <div key={ri} className={cn('flex', keyGap)}>
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
          <div className={cn('flex', compact ? 'gap-1' : 'gap-1.5')}>
            <KeyButton
              onClick={onBackspace}
              ariaLabel="Borrar"
              className={cn('flex-1 rounded-xl flex items-center justify-center', doneH)}
            >
              <Delete className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
            </KeyButton>
            <KeyButton onClick={onDone} primary haptic={false} className={cn('flex-[2] rounded-xl', doneH)}>
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
      <div className={cn('grid', rowGap)}>
        <LetterRow keys={topRow} onChar={onChar} keyClassName={keyH} keyGap={keyGap} />

        <LetterRow
          keys={midRow}
          onChar={onChar}
          keyClassName={keyH}
          keyGap={keyGap}
          className="px-1.5"
        />

        <div className={cn('flex items-stretch', keyGap)}>
          {onToggleCase && (
            <KeyButton
              onClick={onToggleCase}
              ariaLabel={uppercase ? 'Minúsculas' : 'Mayúsculas'}
              className={cn(
                'shrink-0 rounded-xl px-2.5',
                sideKeyW,
                keyH,
                uppercase && 'ring-2 ring-cobalt-glaze/35'
              )}
            >
              ⇧
            </KeyButton>
          )}
          <div className={cn('flex flex-1 min-w-0', keyGap)}>
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
              sideKeyW,
              keyH
            )}
          >
            <Delete className="h-[1.125rem] w-[1.125rem] text-muted-foreground" />
          </KeyButton>
        </div>

        <div className={cn('flex', compact ? 'gap-1' : 'gap-1.5')}>
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
            haptic={false}
            ariaLabel={doneLabel}
            className={cn('flex-1 rounded-xl flex items-center justify-center gap-1', doneH)}
          >
            <CornerDownLeft className="h-[1.125rem] w-[1.125rem] shrink-0" />
            <span>{doneLabel}</span>
          </KeyButton>
        </div>
      </div>
    </div>
  )
}
