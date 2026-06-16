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

export type SheetHeight = 'standard' | 'tall'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** standard = 60dvh (expense flows), tall = up to 90dvh */
  height?: SheetHeight
  title?: string
  subtitle?: string
  /** Left header action. Default cancel when title is set, none otherwise. */
  headerAction?: 'cancel' | 'back' | 'none'
  cancelLabel?: string
  backLabel?: string
  onBack?: () => void
  /**
   * Fixed CTA below the scrollable body (does not scroll with content).
   * Use for primary actions: Guardar, Reintentar, confirmaciones.
   * Keep secondary edits and lists in children; use body CTAs only when
   * the action is contextual to scrolled content (e.g. keypad presets).
   */
  footer?: ReactNode
  /** Resets body scroll to top when this value changes (e.g. wizard step). */
  scrollKey?: string | number
  /** Render at document.body to escape parent stacking contexts. */
  portal?: boolean
  /** Above FABs (z-40), nav (z-45) and default sheets (z-50). */
  elevated?: boolean
}

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  height = 'tall',
  title,
  subtitle,
  headerAction,
  cancelLabel = 'Cancelar',
  backLabel = 'Atrás',
  onBack,
  footer,
  scrollKey,
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
  const bodyRef = useRef<HTMLDivElement>(null)

  const startY = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  if (children) {
    childRef.current = children
  }

  const resolvedHeaderAction =
    headerAction ?? (title !== undefined ? 'cancel' : 'none')

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

  useEffect(() => {
    if (!mounted || !entered) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (resolvedHeaderAction === 'back' && onBack) {
          onBack()
        } else {
          dismiss()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mounted, entered, dismiss, resolvedHeaderAction, onBack])

  useEffect(() => {
    if (!mounted || !entered) return
    bodyRef.current?.scrollTo({ top: 0, left: 0 })
  }, [mounted, entered, scrollKey])

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

  const handleHeaderAction = () => {
    if (resolvedHeaderAction === 'back' && onBack) {
      onBack()
      return
    }
    dismiss()
  }

  if (!mounted) return null

  const dragStyle =
    entered && dragY > 0 && !closingRef.current
      ? { transform: `translate3d(0, ${dragY}px, 0)` }
      : undefined

  const showHeader = title !== undefined || resolvedHeaderAction !== 'none'

  const sheet = (
    <div
      className={cn(
        'sheet-root fixed inset-0 flex flex-col justify-end pointer-events-none',
        elevated ? 'z-[60]' : 'z-50'
      )}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Cerrar"
        className={cn(
          'sheet-backdrop absolute inset-0 pointer-events-auto',
          entered && 'sheet-backdrop--open'
        )}
        onClick={dismiss}
      />

      <div
        ref={panelRef}
        className={cn(
          'sheet-panel relative sheet-porcelain flex flex-col pointer-events-auto',
          entered && 'sheet-panel--open',
          dragging && 'sheet-panel--dragging',
          height === 'standard' && 'sheet-panel--standard',
          className
        )}
        style={dragStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
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

        {showHeader && (
          <div className="sheet-header shrink-0 px-4 pb-1">
            <div className="flex items-center justify-between gap-3 min-h-[2rem]">
              {resolvedHeaderAction !== 'none' ? (
                <button
                  type="button"
                  onClick={handleHeaderAction}
                  className="text-sm font-semibold text-muted-foreground shrink-0"
                >
                  {resolvedHeaderAction === 'back' ? backLabel : cancelLabel}
                </button>
              ) : (
                <div className="w-16 shrink-0" />
              )}

              {title !== undefined && (
                <p
                  id="sheet-title"
                  className="flex-1 min-w-0 text-center font-display text-[1.1rem] font-bold text-ink tracking-tight truncate"
                >
                  {title}
                </p>
              )}

              <div className="w-16 shrink-0" aria-hidden />
            </div>
          </div>
        )}

        <div
          ref={bodyRef}
          className="sheet-body flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-safe touch-pan-y"
        >
          {subtitle && (
            <p className="text-[11px] text-muted-foreground font-medium text-center pb-3">
              {subtitle}
            </p>
          )}
          {childRef.current}
        </div>

        {footer && (
          <div className="sheet-footer shrink-0 px-4 pt-2 pb-safe border-t border-stitch/25 bg-porcelain-cream/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return portal ? createPortal(sheet, document.body) : sheet
}
