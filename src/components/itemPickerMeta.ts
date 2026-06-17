import type { CreateItemRequest } from '@/components/ItemPicker'

/** Subtitle for the item-pick step header (e.g. receipt store context). */
export function itemPickerSubtitle(storeName?: string): string | undefined {
  if (storeName) return 'Elegí un ítem de la compra'
  return undefined
}

/** Title for the item-pick step header. */
export function itemPickerTitle(storeName?: string): string {
  return storeName ? `🛒 ${storeName}` : '✏️ ¿Qué fue?'
}

export function parseCreateRequest(request: CreateItemRequest): { query: string; emoji?: string } {
  return typeof request === 'string' ? { query: request } : request
}
