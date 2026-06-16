import { useEffect } from 'react'

/** Syncs visual viewport dimensions to CSS vars for keyboard-aware layout. */
export function useVisualViewportHeight() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--vv-height', `${vv.height}px`)
      document.documentElement.style.setProperty('--vv-offset-top', `${vv.offsetTop}px`)
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`)
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.removeProperty('--vv-height')
      document.documentElement.style.removeProperty('--vv-offset-top')
      document.documentElement.style.removeProperty('--keyboard-height')
    }
  }, [])
}
