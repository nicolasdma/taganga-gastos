import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  const [visible, setVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)
  const dragging = useRef(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setDragY(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    dragging.current = true
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 0) setDragY(delta)
  }

  const onTouchEnd = () => {
    dragging.current = false
    if (dragY > 100) handleClose()
    else setDragY(0)
  }

  if (!open && !visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-200',
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/40"
        onClick={handleClose}
      />

      <div
        className={cn(
          'relative sheet-porcelain rounded-t-3xl',
          'max-h-[88dvh] flex flex-col transition-transform duration-200 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
          className
        )}
        style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-cobalt-glaze/40" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-safe pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}
