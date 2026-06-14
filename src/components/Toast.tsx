import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
  durationMs?: number
}

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <div
      className={cn(
        'fixed z-50 left-4 right-4',
        'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]',
        'flex items-center justify-between gap-3',
        'rounded-2xl toast-ceramic toast-stamp px-4 py-3.5 animate-stamp-in'
      )}
      role="status"
    >
      <span className="text-sm font-semibold font-display">{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-bold text-clay-light shrink-0 active:opacity-70 underline decoration-dotted underline-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
