import { getItemById, isCustomItemId } from '@/lib/items'

export interface ExpenseLabelInput {
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  store?: string
  note?: string
}

export function formatExpenseLabel(expense: ExpenseLabelInput): { emoji: string; label: string } {
  if (expense.store && !expense.itemLabel) {
    return { emoji: '🛒', label: expense.store }
  }

  if (expense.itemLabel) {
    const detail = expense.note?.trim()
    const label = detail || expense.itemLabel
    return {
      emoji: expense.itemEmoji ?? '💸',
      label,
    }
  }

  if (expense.itemId) {
    const item = getItemById(expense.itemId)
    if (item) return { emoji: item.emoji, label: item.label }
    if (isCustomItemId(expense.itemId) && expense.itemEmoji) {
      return { emoji: expense.itemEmoji, label: expense.itemLabel ?? 'Ítem' }
    }
  }

  if (expense.store) {
    return { emoji: '🛒', label: expense.store }
  }

  return { emoji: '💸', label: 'Gasto' }
}
