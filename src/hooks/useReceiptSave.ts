import { useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { hapticSave } from '@/lib/haptics'
import { setLastStore } from '@/lib/preferences'
import {
  enqueueReceiptGroup,
  removeReceiptGroupFromOutbox,
  type PendingReceiptGroup,
} from '@/lib/outbox'
import type { ExpenseScope } from '@/lib/expenseScope'

export interface SaveReceiptInput {
  store?: string
  items: Array<{ itemLabel: string; amount: number; itemEmoji?: string; itemId?: string }>
  receiptGroupId?: string
  scope?: ExpenseScope
}

export interface SaveReceiptResult {
  type: 'receipt'
  receiptGroupId: string
  expenseIds?: Id<'expenses'>[]
  clientIds: string[]
  itemCount: number
}

export function useReceiptSave(onSaved?: (result: SaveReceiptResult) => void) {
  const addReceiptGroup = useMutation(api.expenses.addReceiptGroup)

  const saveReceipt = useCallback(
    async (input: SaveReceiptInput): Promise<SaveReceiptResult> => {
      const pending = enqueueReceiptGroup(input)
      let expenseIds: Id<'expenses'>[] | undefined

      try {
        const result = await addReceiptGroup({
          receiptGroupId: pending.receiptGroupId,
          store: pending.store,
          items: pending.items.map((item) => ({
            amount: item.amount,
            itemLabel: item.itemLabel,
            itemEmoji: item.itemEmoji,
            itemId: item.itemId,
            clientId: item.clientId,
          })),
          createdAt: pending.createdAt,
          scope: pending.scope,
        })
        expenseIds = result.ids
        removeReceiptGroupFromOutbox(pending.receiptGroupId)
      } catch {
        // stays in receipt outbox
      }

      if (input.store) setLastStore(input.store)
      hapticSave()

      const result: SaveReceiptResult = {
        type: 'receipt',
        receiptGroupId: pending.receiptGroupId,
        expenseIds,
        clientIds: pending.items.map((i) => i.clientId),
        itemCount: pending.items.length,
      }
      onSaved?.(result)
      return result
    },
    [addReceiptGroup, onSaved]
  )

  return { saveReceipt }
}

export function pendingReceiptToListRows(group: PendingReceiptGroup) {
  return group.items.map((item) => ({
    _id: item.clientId,
    amount: item.amount,
    itemId: item.itemId,
    itemEmoji: item.itemEmoji ?? '🧾',
    itemLabel: item.itemLabel,
    store: group.store,
    receiptGroupId: group.receiptGroupId,
    excluded: false as const,
    pending: true as const,
    createdAt: group.createdAt,
  }))
}
