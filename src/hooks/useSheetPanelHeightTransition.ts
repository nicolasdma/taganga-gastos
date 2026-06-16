import { useLayoutEffect, useRef, type RefObject } from 'react'
import {
  lockedSheetPanelHeight,
  prefersReducedSheetMotion,
  sheetHeightTransition,
} from '@/lib/sheetMotion'

function measureNaturalPanelHeight(panel: HTMLElement): number {
  const prev = {
    height: panel.style.height,
    minHeight: panel.style.minHeight,
    transition: panel.style.transition,
  }
  panel.style.transition = 'none'
  panel.style.height = 'auto'
  panel.style.minHeight = '0'
  const natural = Math.round(panel.getBoundingClientRect().height)
  panel.style.height = prev.height
  panel.style.minHeight = prev.minHeight
  panel.style.transition = prev.transition
  return natural
}

/**
 * FLIP height animation when the craft keyboard locks/unlocks sheet size.
 * Runs after the keyboard dock finishes its exit slide (panelExpanded → false).
 */
export function useSheetPanelHeightTransition(
  panelRef: RefObject<HTMLDivElement | null>,
  options: {
    keyboardOpen: boolean
    entered: boolean
    dragging: boolean
    closing: boolean
    heightVariant: 'standard' | 'tall'
  }
) {
  const prevKeyboardOpen = useRef(options.keyboardOpen)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    if (!options.entered || options.dragging || options.closing) {
      panel.style.height = ''
      panel.style.transition = ''
      panel.style.willChange = ''
      return
    }

    const keyboardChanged = prevKeyboardOpen.current !== options.keyboardOpen
    prevKeyboardOpen.current = options.keyboardOpen

    const applyLockedHeight = () => {
      const target = lockedSheetPanelHeight(options.heightVariant)
      panel.style.height = `${target}px`
    }

    if (!keyboardChanged) {
      if (options.keyboardOpen) applyLockedHeight()
      return
    }

    const fromHeight = Math.round(panel.getBoundingClientRect().height)
    const reduced = prefersReducedSheetMotion()

    if (options.keyboardOpen) {
      const target = lockedSheetPanelHeight(options.heightVariant)
      if (Math.abs(fromHeight - target) < 2) {
        applyLockedHeight()
        return
      }

      if (reduced) {
        applyLockedHeight()
        return
      }

      panel.style.willChange = 'height'
      panel.style.transition = sheetHeightTransition()
      panel.style.height = `${fromHeight}px`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.style.height = `${target}px`
        })
      })
      return
    }

    const natural = measureNaturalPanelHeight(panel)
    if (Math.abs(fromHeight - natural) < 2) {
      panel.style.height = ''
      panel.style.transition = ''
      panel.style.willChange = ''
      return
    }

    if (reduced) {
      panel.style.height = ''
      panel.style.transition = ''
      panel.style.willChange = ''
      return
    }

    panel.style.willChange = 'height'
    panel.style.transition = sheetHeightTransition()
    panel.style.height = `${fromHeight}px`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.height = `${natural}px`
      })
    })
  }, [
    options.keyboardOpen,
    options.entered,
    options.dragging,
    options.closing,
    options.heightVariant,
    panelRef,
  ])

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !options.entered || options.closing) return

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== panel || event.propertyName !== 'height') return
      if (!options.keyboardOpen) {
        panel.style.height = ''
      }
      panel.style.transition = ''
      panel.style.willChange = ''
    }

    panel.addEventListener('transitionend', onTransitionEnd)
    return () => panel.removeEventListener('transitionend', onTransitionEnd)
  }, [options.keyboardOpen, options.entered, options.closing, panelRef])

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel || !options.keyboardOpen || !options.entered) return

    const vv = window.visualViewport
    if (!vv) return

    const applyLocked = () => {
      panel.style.height = `${lockedSheetPanelHeight(options.heightVariant)}px`
    }

    const onResize = () => {
      panel.style.transition = prefersReducedSheetMotion() ? '' : sheetHeightTransition()
      applyLocked()
    }

    vv.addEventListener('resize', onResize)
    return () => vv.removeEventListener('resize', onResize)
  }, [options.keyboardOpen, options.entered, options.heightVariant, panelRef])
}
