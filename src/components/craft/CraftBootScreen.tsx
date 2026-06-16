import { useEffect, useState } from 'react'
import { CraftBootScreenContent } from '@/components/craft/CraftBootScreenContent'
import { screenMessageA11y } from '@/components/craft/CraftScreenMessage'

export const KITTY_SPRITE_SRC = '/kitty-sprite.png'

function isKittySpriteReady(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('boot-ready')
}

export function useKittySpriteReady() {
  const [ready, setReady] = useState(isKittySpriteReady)

  useEffect(() => {
    if (ready) return

    const img = new Image()
    const onReady = () => {
      document.documentElement.classList.add('boot-ready')
      setReady(true)
    }
    img.onload = onReady
    img.onerror = onReady
    img.src = KITTY_SPRITE_SRC
    if (img.complete) onReady()
  }, [ready])

  return ready
}

/** Zero-deps boot gate — paints before Convex, fonts, or full app bundle load. */
interface CraftBootScreenProps {
  message?: string
}

export function CraftBootScreen({ message = '🐾 un momentito' }: CraftBootScreenProps) {
  const kittyReady = useKittySpriteReady()

  if (!kittyReady) return null

  return (
    <div
      className="boot-screen boot-screen--ready"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={screenMessageA11y(message)}
    >
      <CraftBootScreenContent message={message} kittyLive />
    </div>
  )
}
