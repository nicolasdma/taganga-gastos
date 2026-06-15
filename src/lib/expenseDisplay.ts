import { getCategory, getItem } from '@/lib/categories'

export interface ExpenseLabelInput {
  categoryId: string
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  store?: string
  note?: string
}

export function formatExpenseLabel(expense: ExpenseLabelInput): { emoji: string; label: string } {
  if (expense.store) {
    return { emoji: '🛒', label: expense.store }
  }

  if (expense.itemLabel) {
    const cat = getCategory(expense.categoryId)
    const detail = expense.note?.trim()
    const label = detail || expense.itemLabel
    return {
      emoji: expense.itemEmoji ?? cat?.emoji ?? '💸',
      label,
    }
  }

  if (expense.itemId) {
    const item = getItem(expense.categoryId, expense.itemId)
    if (item) return { emoji: item.emoji, label: item.label }
  }

  const cat = getCategory(expense.categoryId)
  return { emoji: cat?.emoji ?? '💸', label: cat?.label ?? expense.categoryId }
}
