import { useEffect, useState } from 'react'

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
