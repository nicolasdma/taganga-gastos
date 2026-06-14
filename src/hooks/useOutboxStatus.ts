import { useEffect, useState } from 'react'
import { loadOutbox, loadReceiptOutbox, OUTBOX_CHANGED } from '@/lib/outbox'

export function useOutboxStatus(): number {
  const [count, setCount] = useState(
    () => loadOutbox().length + loadReceiptOutbox().length
  )

  useEffect(() => {
    const update = () => setCount(loadOutbox().length + loadReceiptOutbox().length)
    window.addEventListener(OUTBOX_CHANGED, update)
    window.addEventListener('online', update)
    const interval = setInterval(update, 3000)
    return () => {
      window.removeEventListener(OUTBOX_CHANGED, update)
      window.removeEventListener('online', update)
      clearInterval(interval)
    }
  }, [])

  return count
}
