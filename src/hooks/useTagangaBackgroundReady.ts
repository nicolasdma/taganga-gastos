import { useEffect, useState } from 'react'

export const TAGANGA_BG_SRC = '/taganga-bg.jpg'

export function useTagangaBackgroundReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const img = new Image()
    const onReady = () => setReady(true)
    img.onload = onReady
    img.onerror = onReady
    img.src = TAGANGA_BG_SRC
    if (img.complete) onReady()
  }, [])

  return ready
}
