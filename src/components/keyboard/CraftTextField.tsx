import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { CraftKeyboard } from './CraftKeyboard'
import { CraftKeyboardSlide } from './CraftKeyboardSlide'
import type { KeyboardLayout } from './keyboardLayouts'
import { useCraftKeyboardContext, useCraftKeyboardField } from './useCraftKeyboard'

/**
 * Craft text entry: readOnly display + custom keyboard.
 * We never focus an editable <input> — iOS/Android would open the OS keyboard,
 * shrink visualViewport, and hide nav/FABs. inputMode="none" + readOnly keeps
 * the craft UI stable inside BottomSheet.
 *
 * With CraftKeyboardProvider + CraftKeyboardDock, the keyboard docks at the
 * sheet footer instead of appearing below this field.
 */
export interface CraftTextFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  layout?: KeyboardLayout
  maxLength?: number
  onDone?: () => void
  className?: string
  inputClassName?: string
  focused?: boolean
  onFocus?: () => void
  onBlur?: () => void
  /** Inline keyboard below field — only when no dock provider or dock=false. */
  showKeyboard?: boolean
  autoFocus?: boolean
  center?: boolean
  compactKeyboard?: boolean
  enablePaste?: boolean
  enableShift?: boolean
  id?: string
  variant?: 'default' | 'minimal' | 'dashed'
}

export function CraftTextField({
  value,
  onChange,
  placeholder,
  layout = 'text',
  maxLength = 60,
  onDone,
  className,
  inputClassName,
  focused: controlledFocused,
  onFocus,
  onBlur,
  showKeyboard = true,
  autoFocus = false,
  center = false,
  compactKeyboard = false,
  enablePaste = false,
  enableShift = true,
  id,
  variant = 'default',
}: CraftTextFieldProps) {
  const ctx = useCraftKeyboardContext()
  const setSession = ctx?.setSession
  const clearSession = ctx?.clearSession
  const { fieldId, isFocused, focus, blur } = useCraftKeyboardField(
    controlledFocused,
    onFocus,
    onBlur
  )
  const [uppercase, setUppercase] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const useDock = Boolean(ctx?.dock)
  const showInlineKeyboard = showKeyboard && isFocused && !useDock

  useEffect(() => {
    if (autoFocus) focus()
  }, [autoFocus, focus])

  const appendChar = useCallback(
    (char: string) => {
      if (value.length >= maxLength) return
      const next =
        layout === 'alphanumeric' ? value + char.toUpperCase() : value + char
      onChange(next.slice(0, maxLength))
    },
    [value, maxLength, layout, onChange]
  )

  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1))
  }, [value, onChange])

  const handleDone = useCallback(() => {
    onDone?.()
    blur()
  }, [blur, onDone])

  const handleDismiss = useCallback(() => {
    blur()
  }, [blur])

  const handleToggleCase = useCallback(() => {
    setUppercase((u) => !u)
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const trimmed = layout === 'alphanumeric' ? text.toUpperCase() : text
      onChange((value + trimmed).slice(0, maxLength))
    } catch {
      // clipboard denied or unavailable
    }
  }, [layout, maxLength, onChange, value])

  const showShift = enableShift && layout === 'text'

  const handlersRef = useRef({
    appendChar,
    handleBackspace,
    handleDone,
    handleDismiss,
    handleToggleCase,
  })
  handlersRef.current = {
    appendChar,
    handleBackspace,
    handleDone,
    handleDismiss,
    handleToggleCase,
  }

  useEffect(() => {
    // showKeyboard=false → parent owns the dock session (e.g. AmountKeypad detail edit).
    if (!useDock || !showKeyboard || !isFocused || !setSession || !clearSession) return

    setSession({
      fieldId,
      layout,
      compact: compactKeyboard,
      uppercase,
      enableShift: showShift,
      onChar: (char) => handlersRef.current.appendChar(char),
      onBackspace: () => handlersRef.current.handleBackspace(),
      onDone: () => handlersRef.current.handleDone(),
      onDismiss: () => handlersRef.current.handleDismiss(),
      onToggleCase: () => handlersRef.current.handleToggleCase(),
    })

    return () => {
      clearSession(fieldId)
    }
  }, [
    useDock,
    showKeyboard,
    isFocused,
    setSession,
    clearSession,
    fieldId,
    layout,
    compactKeyboard,
    uppercase,
    showShift,
  ])

  useEffect(() => {
    if (!showInlineKeyboard) return

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('.craft-text-field')) {
        return
      }
      handleDismiss()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [showInlineKeyboard, handleDismiss])

  const openField = () => {
    focus()
    inputRef.current?.focus({ preventScroll: true })
  }

  const displayValue = value || placeholder || ''
  const showPlaceholder = !value && placeholder

  return (
    <div className={cn('craft-text-field', className)}>
      <div className="relative">
        <div
          role="textbox"
          aria-multiline={false}
          aria-label={placeholder}
          tabIndex={-1}
          onClick={openField}
          className={cn(
            'relative cursor-text',
            variant === 'default' &&
              cn(
                'w-full rounded-xl border-2 px-4 py-2.5 text-base font-medium',
                'bg-porcelain-cream/90 border-stitch/45',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
                isFocused && 'border-cobalt-glaze/55 ring-2 ring-cobalt-glaze/15',
                center && 'text-center'
              ),
            variant === 'minimal' && 'min-w-0 flex-1 py-1',
            variant === 'dashed' &&
              cn(
                'font-display text-xl font-bold text-ink text-left',
                'border-b-2 border-dashed border-stitch/55 pb-0.5',
                center && 'text-center'
              ),
            inputClassName
          )}
        >
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            readOnly
            inputMode="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            tabIndex={0}
            onFocus={focus}
            className="sr-only"
            aria-hidden
          />
          <span
            className={cn(
              'inline-flex items-center min-h-[1.25rem] max-w-full',
              showPlaceholder && 'text-muted-foreground/55 font-medium',
              variant === 'dashed' && showPlaceholder && 'text-sm'
            )}
          >
            <span className={cn('truncate', showPlaceholder && 'italic')}>{displayValue}</span>
            {isFocused && (
              <span
                className="inline-block w-0.5 h-[1.1em] bg-cobalt-glaze ml-px shrink-0 animate-pulse"
                aria-hidden
              />
            )}
          </span>
        </div>

        {enablePaste && isFocused && (
          <button
            type="button"
            onClick={() => void handlePaste()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-cobalt-glaze/80 px-2 py-0.5 rounded-lg chip-tile"
          >
            Pegar
          </button>
        )}
      </div>

      {showKeyboard && !useDock && (
        <CraftKeyboardSlide visible={isFocused} className="mt-2 pt-1">
          <CraftKeyboard
            layout={layout}
            compact={compactKeyboard}
            uppercase={uppercase}
            onToggleCase={showShift ? handleToggleCase : undefined}
            onChar={appendChar}
            onBackspace={handleBackspace}
            onDone={handleDone}
          />
        </CraftKeyboardSlide>
      )}
    </div>
  )
}
