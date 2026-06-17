import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { cn } from '@/lib/utils'

export function AndroidInstallBanner() {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <div
      className={cn(
        'fixed z-[55] left-4 right-4',
        'bottom-[calc(7.5rem+env(safe-area-inset-bottom,0px))]',
        'flex items-center justify-between gap-3',
        'rounded-2xl card-porcelain px-4 py-3 shadow-porcelain'
      )}
      role="status"
    >
      <span className="text-sm font-semibold text-ink">Instalá Gatonomía en tu pantalla de inicio</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => void promptInstall()}
          className="text-sm font-bold text-cobalt-deep active:opacity-70"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="text-sm text-muted-foreground active:opacity-70 px-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
