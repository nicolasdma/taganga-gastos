import { useCallback, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  loadOutbox,
  loadReceiptOutbox,
  removeFromOutbox,
  removeReceiptGroupFromOutbox,
} from '@/lib/outbox'

export function useOutboxSync() {
  const addExpense = useMutation(api.expenses.addExpense)
  const addReceiptGroup = useMutation(api.expenses.addReceiptGroup)

  const flushOutbox = useCallback(async () => {
    const receiptGroups = loadReceiptOutbox()
    for (const group of receiptGroups) {
      try {
        await addReceiptGroup({
          receiptGroupId: group.receiptGroupId,
          categoryId: group.categoryId,
          store: group.store,
          items: group.items.map((item) => ({
            amount: item.amount,
            itemLabel: item.itemLabel,
            clientId: item.clientId,
          })),
          createdAt: group.createdAt,
        })
        removeReceiptGroupFromOutbox(group.receiptGroupId)
      } catch {
        break
      }
    }

    const pending = loadOutbox()
    for (const item of pending) {
      try {
        await addExpense({
          amount: item.amount,
          categoryId: item.categoryId,
          itemId: item.itemId,
          itemEmoji: item.itemEmoji,
          itemLabel: item.itemLabel,
          sessionId: item.sessionId,
          receiptGroupId: item.receiptGroupId,
          store: item.store,
          note: item.note,
          clientId: item.clientId,
          createdAt: item.createdAt,
        })
        removeFromOutbox(item.clientId)
      } catch {
        break
      }
    }
  }, [addExpense, addReceiptGroup])

  useEffect(() => {
    flushOutbox()
    const onOnline = () => flushOutbox()
    window.addEventListener('online', onOnline)
    const interval = setInterval(flushOutbox, 5000)
    return () => {
      window.removeEventListener('online', onOnline)
      clearInterval(interval)
    }
  }, [flushOutbox])

  return { flushOutbox }
}
