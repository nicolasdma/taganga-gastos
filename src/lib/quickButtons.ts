import { QUICK_EXPENSES } from '@/lib/categories'
import type { SheetIntent } from '@/components/ExpenseSheet'

export interface QuickButton {
  key: string
  emoji: string
  label: string
  intent: Extract<SheetIntent, { type: 'quick' }>
}

interface FrequentItem {
  categoryId: string
  itemId: string
  itemEmoji?: string
  itemLabel?: string
}

const QUICK_TARGET = 6

export function buildQuickButtons(
  frequent: FrequentItem[] | undefined,
  limit = QUICK_TARGET
): QuickButton[] {
  const seen = new Set<string>()
  const buttons: QuickButton[] = []

  const push = (item: {
    categoryId: string
    itemId: string
    emoji: string
    label: string
  }) => {
    const key = `${item.categoryId}:${item.itemId}`
    if (seen.has(key)) return
    seen.add(key)
    buttons.push({
      key,
      emoji: item.emoji,
      label: item.label,
      intent: {
        type: 'quick',
        categoryId: item.categoryId,
        itemId: item.itemId,
        itemEmoji: item.emoji,
        itemLabel: item.label,
      },
    })
  }

  for (const f of frequent ?? []) {
    if (buttons.length >= limit) break
    push({
      categoryId: f.categoryId,
      itemId: f.itemId,
      emoji: f.itemEmoji ?? '💸',
      label: f.itemLabel ?? f.itemId,
    })
  }

  for (const q of QUICK_EXPENSES) {
    if (buttons.length >= limit) break
    push({
      categoryId: q.categoryId,
      itemId: q.itemId,
      emoji: q.emoji,
      label: q.label,
    })
  }

  return buttons
}
