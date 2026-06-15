import { useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { hapticSave } from '@/lib/haptics'
import { pushRecentCategory, setLastStore } from '@/lib/preferences'
import { enqueueExpense, removeFromOutbox } from '@/lib/outbox'

export interface SaveExpenseInput {
  amount: number
  categoryId: string
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  sessionId?: string
  store?: string
  note?: string
}

export interface SaveExpenseResult {
  expenseId?: Id<'expenses'>
  clientId: string
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
          categoryId: pending.categoryId,
          itemId: pending.itemId,
          itemEmoji: pending.itemEmoji,
          itemLabel: pending.itemLabel,
          sessionId: pending.sessionId,
          store: pending.store,
          note: pending.note,
          clientId: pending.clientId,
          createdAt: pending.createdAt,
        })
        removeFromOutbox(pending.clientId)
      } catch {
        // stays in outbox
      }

      pushRecentCategory(input.categoryId)
      if (input.store) setLastStore(input.store)
      hapticSave()

      const result = { expenseId, clientId: pending.clientId }
      onSaved?.(result)
      return result
    },
    [addExpense, onSaved]
  )

  return { saveExpense }
}
