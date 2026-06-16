/** Shared BottomSheet + craft-keyboard motion — keep in sync with index.css tokens. */
export const SHEET_MOTION_MS = 420
export const SHEET_MOTION_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

export function sheetHeightTransition(property = 'height'): string {
  return `${property} ${SHEET_MOTION_MS}ms ${SHEET_MOTION_EASE}`
}

export function lockedSheetPanelHeight(variant: 'standard' | 'tall'): number {
  const vv = window.visualViewport?.height ?? window.innerHeight
  const ratio = variant === 'standard' ? 0.8 : 0.9
  return Math.round(Math.min(vv * ratio, vv))
}

export function prefersReducedSheetMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
