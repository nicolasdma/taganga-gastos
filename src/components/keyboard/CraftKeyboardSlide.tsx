import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CraftKeyboardSlideProps {
  visible: boolean
  children: ReactNode
  className?: string
  onHidden?: () => void
  /** dock = sheet footer chrome; inline = below a field */
  variant?: 'dock' | 'inline'
}

/** Slide keyboard in from bottom / out to bottom. Keeps children mounted during exit. */
export function CraftKeyboardSlide({
  visible,
  children,
  className,
  onHidden,
  variant = 'inline',
}: CraftKeyboardSlideProps) {
  const [mounted, setMounted] = useState(visible)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setOpen(true))
      })
      return () => cancelAnimationFrame(frame)
    }
    setOpen(false)
  }, [visible])

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== panelRef.current) return
    if (event.propertyName !== 'transform') return
    if (open) return
    setMounted(false)
    onHidden?.()
  }

  if (!mounted) return null

  return (
    <div
      className={cn(
        'craft-keyboard-slide',
        open && 'craft-keyboard-slide--open',
        variant === 'dock' && 'craft-keyboard-slide--dock',
        className
      )}
    >
      <div
        ref={panelRef}
        className={cn(
          'craft-keyboard-slide__panel',
          variant === 'dock' && 'craft-keyboard-slide__panel--dock'
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
    </div>
  )
}
