import type { SheetIntent } from '@/components/ExpenseSheet'
import type { FrequentQuickItem } from '@/hooks/useFrequentQuickItems'

export interface ItemQuickButton {
  key: string
  emoji: string
  label: string
  intent: Extract<SheetIntent, { type: 'quick' }>
}

export function buildRecentQuickButtons(items: FrequentQuickItem[]): ItemQuickButton[] {
  return items.map((item) => ({
    key: item.itemId,
    emoji: item.itemEmoji,
    label: item.itemLabel,
    intent: {
      type: 'quick',
      itemId: item.itemId,
      itemEmoji: item.itemEmoji,
      itemLabel: item.itemLabel,
    },
  }))
}
