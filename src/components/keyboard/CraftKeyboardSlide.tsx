import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CraftKeyboardSlideProps {
  visible: boolean
  children: ReactNode
  className?: string
  onHidden?: () => void
}

/** Slide keyboard in from bottom / out to bottom. Keeps children mounted during exit. */
export function CraftKeyboardSlide({
  visible,
  children,
  className,
  onHidden,
}: CraftKeyboardSlideProps) {
  const [mounted, setMounted] = useState(visible)
  const [open, setOpen] = useState(false)

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

  if (!mounted) return null

  return (
    <div
      className={cn('craft-keyboard-slide', open && 'craft-keyboard-slide--open', className)}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (open) return
        setMounted(false)
        onHidden?.()
      }}
    >
      {children}
    </div>
  )
}
