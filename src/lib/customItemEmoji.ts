import { isCustomItemId } from '@/lib/items'

export function applyEmojiToItem(
  item: { itemId: string; itemEmoji: string; itemLabel: string },
  emoji: string
) {
  return { ...item, itemEmoji: emoji }
}

export function shouldSyncCustomItemEmoji(itemId: string): boolean {
  return isCustomItemId(itemId)
}
