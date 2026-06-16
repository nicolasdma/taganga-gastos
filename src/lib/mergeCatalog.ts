import type { CatalogItem } from '@/lib/items'

export interface CustomItemRecord {
  itemId: string
  emoji: string
  label: string
}

export function customItemToCatalog(item: CustomItemRecord): CatalogItem {
  return {
    id: item.itemId,
    emoji: item.emoji,
    label: item.label,
  }
}

export function mergeCatalogWithCustom(
  catalog: CatalogItem[],
  customItems: CustomItemRecord[] | undefined
): CatalogItem[] {
  if (!customItems?.length) return catalog
  return [...catalog, ...customItems.map(customItemToCatalog)]
}
