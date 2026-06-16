import { useEffect } from 'react'

/** Logs display mode once for mobile layout debugging. */
export function useDisplayModeAnalytics() {
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    const mode = standalone ? 'standalone' : 'browser'
    console.info('[gastos] display-mode:', mode, {
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [])
}
