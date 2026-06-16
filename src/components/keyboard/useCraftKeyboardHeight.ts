import { useLayoutEffect, type RefObject } from 'react'

/** Publishes dock height as --craft-keyboard-height on :root for sheet layout. */
export function useCraftKeyboardHeight(
  ref: RefObject<HTMLElement | null>,
  visible: boolean
) {
  useLayoutEffect(() => {
    const el = ref.current
    const root = document.documentElement

    if (!el || !visible) {
      root.style.removeProperty('--craft-keyboard-height')
      return
    }

    const update = () => {
      root.style.setProperty('--craft-keyboard-height', `${el.offsetHeight}px`)
    }

    const observer = new ResizeObserver(update)
    observer.observe(el)
    update()

    return () => {
      observer.disconnect()
      root.style.removeProperty('--craft-keyboard-height')
    }
  }, [ref, visible])
}
