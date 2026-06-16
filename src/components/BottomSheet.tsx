import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const CLOSE_MS = 480

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** Render at document.body to escape parent stacking contexts (e.g. main z-10). */
  portal?: boolean
  /** Above FABs (z-40), nav (z-45) and default sheets (z-50). */
  elevated?: boolean
}

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  portal = false,
  elevated = false,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [entered, setEntered] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)

  const childRef = useRef<ReactNode>(children)
  const closingRef = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const startY = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  if (children) {
    childRef.current = children
  }

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const finishClose = useCallback(
    (notifyParent: boolean) => {
      clearCloseTimer()
      closeTimer.current = setTimeout(() => {
        closingRef.current = false
        setMounted(false)
        setDragY(0)
        setDragging(false)
        document.body.style.overflow = ''
        if (notifyParent) onClose()
      }, CLOSE_MS)
    },
    [onClose]
  )

  const beginClose = useCallback(
    (notifyParent: boolean, fromDragY = 0) => {
      if (closingRef.current) return
      closingRef.current = true
      setDragging(false)
      setEntered(false)
      document.body.style.overflow = ''

      const panel = panelRef.current
      if (fromDragY > 0 && panel) {
        panel.style.transition = 'none'
        panel.style.transform = `translate3d(0, ${fromDragY}px, 0)`
        void panel.offsetHeight
        panel.style.transition = ''
        requestAnimationFrame(() => {
          panel.style.transform = ''
          setDragY(0)
          finishClose(notifyParent)
        })
        return
      }

      setDragY(0)
      finishClose(notifyParent)
    },
    [finishClose]
  )

  useEffect(() => {
    if (open) {
      clearCloseTimer()
      closingRef.current = false
      setMounted(true)
      setDragY(0)
      setDragging(false)
      document.body.style.overflow = 'hidden'

      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true))
      })

      return () => cancelAnimationFrame(frame)
    }

    if (mounted && !closingRef.current) {
      beginClose(false)
    }
  }, [open, mounted, beginClose])

  useEffect(
    () => () => {
      clearCloseTimer()
      document.body.style.overflow = ''
    },
    []
  )

  const dismiss = useCallback(() => {
    beginClose(true)
  }, [beginClose])

  const onHandleTouchStart = (e: TouchEvent) => {
    if (closingRef.current) return
    const y = e.touches[0].clientY
    startY.current = y
    lastY.current = y
    lastTime.current = performance.now()
    velocity.current = 0
    setDragging(true)
  }

  const onHandleTouchMove = (e: TouchEvent) => {
    if (!dragging || closingRef.current) return
    const y = e.touches[0].clientY
    const now = performance.now()
    const dt = now - lastTime.current

    if (dt > 0) {
      velocity.current = (y - lastY.current) / dt
    }

    lastY.current = y
    lastTime.current = now
    setDragY(Math.max(0, y - startY.current))
  }

  const onHandleTouchEnd = () => {
    if (closingRef.current) return
    setDragging(false)

    const shouldDismiss = dragY > 96 || velocity.current > 0.65
    if (shouldDismiss) {
      beginClose(true, dragY)
      return
    }

    setDragY(0)
  }

  if (!mounted) return null

  const dragStyle =
    entered && dragY > 0 && !closingRef.current
      ? { transform: `translate3d(0, ${dragY}px, 0)` }
      : undefined

  const sheet = (
    <div
      className={cn(
        'sheet-root fixed inset-x-0 bottom-0 flex flex-col justify-end',
        elevated ? 'z-[60]' : 'z-50'
      )}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar"
        className={cn('sheet-backdrop absolute inset-0', entered && 'sheet-backdrop--open')}
        onClick={dismiss}
      />

      <div
        ref={panelRef}
        className={cn(
          'sheet-panel relative sheet-porcelain flex flex-col',
          entered && 'sheet-panel--open',
          dragging && 'sheet-panel--dragging',
          className
        )}
        style={dragStyle}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="sheet-handle shrink-0 touch-none select-none"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          onTouchCancel={onHandleTouchEnd}
        >
          <div className="sheet-handle-bar" />
        </div>

        <div className="sheet-content flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-safe">
          {childRef.current}
        </div>
      </div>
    </div>
  )

  return portal ? createPortal(sheet, document.body) : sheet
}
