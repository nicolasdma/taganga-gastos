import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'gastos_install_prompt_dismissed'

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
    setDeferredPrompt(null)
  }

  const promptInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    dismiss()
  }

  return {
    canInstall: Boolean(deferredPrompt) && !dismissed,
    promptInstall,
    dismiss,
  }
}

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
      <span className="text-sm font-semibold text-ink">Instalá Gastos en tu pantalla de inicio</span>
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
