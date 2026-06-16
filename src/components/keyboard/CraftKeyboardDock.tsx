import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { CraftKeyboard } from './CraftKeyboard'
import { CraftKeyboardSlide } from './CraftKeyboardSlide'
import { useCraftKeyboardContext } from './useCraftKeyboard'
import { useCraftKeyboardHeight } from './useCraftKeyboardHeight'
import type { KeyboardLayout } from './keyboardLayouts'

interface CraftKeyboardDockProps {
  className?: string
  onHidden?: () => void
}

/** Fixed keyboard slot — use in BottomSheet footer or bottom of a form card. */
export function CraftKeyboardDock({ className, onHidden }: CraftKeyboardDockProps) {
  const ctx = useCraftKeyboardContext()
  const visible = Boolean(ctx?.session)
  const meta = ctx?.session
  const dockRef = useRef<HTMLDivElement>(null)

  // Stable sheet height while typing: BottomSheet uses --craft-keyboard-height + keyboard-open class.
  useCraftKeyboardHeight(dockRef, visible)

  const frozenMetaRef = useRef<{
    layout: KeyboardLayout
    compact: boolean
    uppercase: boolean
    enableShift: boolean
  } | null>(null)

  if (meta) {
    frozenMetaRef.current = {
      layout: meta.layout,
      compact: meta.compact,
      uppercase: meta.uppercase,
      enableShift: meta.enableShift,
    }
  }

  const displayMeta = meta ?? frozenMetaRef.current

  const onChar = useCallback((char: string) => ctx?.getSession()?.onChar(char), [ctx])
  const onBackspace = useCallback(() => ctx?.getSession()?.onBackspace(), [ctx])
  const onDone = useCallback(() => ctx?.getSession()?.onDone(), [ctx])
  const onToggleCase = useCallback(() => ctx?.getSession()?.onToggleCase(), [ctx])

  const handleHidden = useCallback(() => {
    frozenMetaRef.current = null
    ctx?.notifyKeyboardHidden()
    onHidden?.()
  }, [ctx, onHidden])

  if (!displayMeta) return null

  return (
    <CraftKeyboardSlide
      visible={visible}
      variant="dock"
      className={cn('craft-keyboard-dock', className)}
      onHidden={handleHidden}
    >
      <div ref={dockRef}>
        <CraftKeyboard
        layout={displayMeta.layout}
        compact={displayMeta.compact}
        uppercase={displayMeta.uppercase}
        onToggleCase={displayMeta.enableShift ? onToggleCase : undefined}
        onChar={onChar}
        onBackspace={onBackspace}
        onDone={onDone}
      />
      </div>
    </CraftKeyboardSlide>
  )
}
