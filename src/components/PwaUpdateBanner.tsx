import { useRegisterSW } from 'virtual:pwa-register/react'
import { cn } from '@/lib/utils'

export function PwaUpdateBanner() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
  })
  const [showRefresh] = needRefresh

  if (!showRefresh) return null

  return (
    <div
      className={cn(
        'fixed z-[70] left-4 right-4 top-[calc(env(safe-area-inset-top,0px)+0.75rem)]',
        'flex items-center justify-between gap-3',
        'rounded-2xl toast-ceramic px-4 py-3'
      )}
      role="status"
    >
      <span className="text-sm font-semibold font-display">Nueva versión disponible</span>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="text-sm font-bold text-clay-light shrink-0 active:opacity-70 underline decoration-dotted underline-offset-2"
      >
        Recargar
      </button>
    </div>
  )
}
