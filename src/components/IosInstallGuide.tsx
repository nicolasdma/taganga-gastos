import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const VISIT_KEY = 'gastos_visit_count'
const IOS_DISMISS_KEY = 'gastos_ios_install_dismissed'

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function IosInstallGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isIos() || isStandaloneMode()) return

    const visits = Number(localStorage.getItem(VISIT_KEY) ?? '0') + 1
    localStorage.setItem(VISIT_KEY, String(visits))

    if (visits > 2 && localStorage.getItem(IOS_DISMISS_KEY) !== '1') {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(IOS_DISMISS_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      className={cn(
        'fixed z-[55] left-4 right-4',
        'bottom-[calc(7.5rem+env(safe-area-inset-bottom,0px))]',
        'rounded-2xl card-porcelain px-4 py-3.5 shadow-porcelain'
      )}
      role="status"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-ink">Agregar a pantalla de inicio</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="text-sm text-muted-foreground active:opacity-70 shrink-0"
        >
          ✕
        </button>
      </div>
      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside leading-relaxed">
        <li>Tocá Compartir en Safari</li>
        <li>Elegí «Agregar a pantalla de inicio»</li>
        <li>Abrí Gastos desde el ícono en tu inicio</li>
      </ol>
    </div>
  )
}
