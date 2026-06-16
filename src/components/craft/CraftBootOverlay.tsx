import { useCallback, useEffect, useRef, type TransitionEvent } from 'react'
import { CraftBootScreenContent } from '@/components/craft/CraftBootScreenContent'
import { screenMessageA11y } from '@/components/craft/CraftScreenMessage'
import { cn } from '@/lib/utils'

const EXIT_FALLBACK_MS = 600

interface CraftBootOverlayProps {
  message?: string
  exiting: boolean
  onExited: () => void
}

/** Boot screen fijo encima del app — fade out cuando el Home está listo. */
export function CraftBootOverlay({ message = '🐾 un momentito', exiting, onExited }: CraftBootOverlayProps) {
  const exitedRef = useRef(false)

  useEffect(() => {
    exitedRef.current = false
  }, [exiting])

  const finishExit = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    onExited()
  }, [onExited])

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(finishExit, EXIT_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [exiting, finishExit])

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (!exiting || event.propertyName !== 'opacity' || event.target !== event.currentTarget) return
      finishExit()
    },
    [exiting, finishExit]
  )

  return (
    <div
      className={cn('boot-screen boot-screen--ready boot-screen--overlay', exiting && 'boot-screen--exiting')}
      role="status"
      aria-busy={!exiting}
      aria-live="polite"
      aria-label={screenMessageA11y(message)}
      onTransitionEnd={handleTransitionEnd}
    >
      <CraftBootScreenContent message={message} kittyLive />
    </div>
  )
}
