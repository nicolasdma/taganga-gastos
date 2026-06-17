import { useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { hapticSave } from '@/lib/haptics'
import { pushRecentItem, setLastStore } from '@/lib/preferences'
import { recordItemUsage } from '@/lib/itemUsage'
import { enqueueExpense, removeFromOutbox } from '@/lib/outbox'
import type { ExpenseScope } from '@/lib/expenseScope'

export interface SaveExpenseInput {
  amount: number
  itemId: string
  itemEmoji: string
  itemLabel: string
  sessionId?: string
  store?: string
  note?: string
  scope?: ExpenseScope
}

export interface SaveExpenseResult {
  expenseId?: Id<'expenses'>
  clientId: string
  scope: ExpenseScope
  itemLabel: string
  amount: number
}

export function useExpenseSave(onSaved?: (result: SaveExpenseResult) => void) {
  const addExpense = useMutation(api.expenses.addExpense)

  const saveExpense = useCallback(
    async (input: SaveExpenseInput): Promise<SaveExpenseResult> => {
      const pending = enqueueExpense(input)
      let expenseId: Id<'expenses'> | undefined

      try {
        expenseId = await addExpense({
          amount: pending.amount,
          itemId: pending.itemId,
          itemEmoji: pending.itemEmoji,
          itemLabel: pending.itemLabel,
          sessionId: pending.sessionId,
          store: pending.store,
          note: pending.note,
          clientId: pending.clientId,
          createdAt: pending.createdAt,
          scope: pending.scope,
        })
        removeFromOutbox(pending.clientId)
      } catch {
        // stays in outbox
      }

      pushRecentItem(input.itemId)
      recordItemUsage(input.itemId)
      if (input.store) setLastStore(input.store)
      hapticSave()

      const result = {
        expenseId,
        clientId: pending.clientId,
        scope: pending.scope ?? 'personal',
        itemLabel: pending.itemLabel,
        amount: pending.amount,
      }
      onSaved?.(result)
      return result
    },
    [addExpense, onSaved]
  )

  return { saveExpense }
}
