import { useLayoutEffect, useState, type ReactNode } from 'react'
import { CraftKeyboardDock } from './CraftKeyboardDock'
import { useCraftKeyboardContext } from './useCraftKeyboard'

interface CraftSheetKeyboardFooterProps {
  children?: ReactNode
  onHidden?: () => void
}

/** Keyboard dock + optional actions (e.g. Guardar). Renders nothing when no field is focused. */
export function CraftSheetKeyboardFooter({ children, onHidden }: CraftSheetKeyboardFooterProps) {
  return (
    <div className="space-y-2">
      <CraftKeyboardDock onHidden={onHidden} />
      {children}
    </div>
  )
}

export function useCraftKeyboardVisible() {
  const ctx = useCraftKeyboardContext()
  return Boolean(ctx?.session)
}

/** Keeps BottomSheet footer mounted while the keyboard exit animation plays. */
export function useCraftKeyboardFooterSlot(children?: ReactNode): ReactNode | undefined {
  const keyboardVisible = useCraftKeyboardVisible()
  const [slotOpen, setSlotOpen] = useState(false)

  useLayoutEffect(() => {
    if (keyboardVisible) setSlotOpen(true)
  }, [keyboardVisible])

  const showSlot = keyboardVisible || slotOpen
  if (!showSlot && !children) return undefined

  return (
    <CraftSheetKeyboardFooter
      onHidden={() => {
        if (!keyboardVisible) setSlotOpen(false)
      }}
    >
      {children}
    </CraftSheetKeyboardFooter>
  )
}
