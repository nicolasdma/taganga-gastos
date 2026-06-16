import { useEffect, useState } from 'react'

const DEFAULT_THRESHOLD_PX = 150

/**
 * Detects the OS virtual keyboard via visualViewport shrink (iOS Safari, Chrome Android).
 * CraftTextField uses readOnly + inputMode="none" so this should stay false during custom typing.
 */
export function useKeyboardOpen(thresholdPx = DEFAULT_THRESHOLD_PX) {
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardOpen(keyboardHeight > thresholdPx)
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [thresholdPx])

  return keyboardOpen
}
