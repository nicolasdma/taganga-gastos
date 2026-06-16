import { normalizeItemSearchText, searchWordVariants, type CatalogItem } from '@/lib/items'

export interface CustomItemRecord {
  itemId: string
  emoji: string
  label: string
}

function labelKeywords(label: string): string[] {
  const words = normalizeItemSearchText(label)
    .split(/\s+/)
    .filter((word) => word.length >= 2)
  const expanded = new Set<string>()
  for (const word of words) {
    for (const variant of searchWordVariants(word)) expanded.add(variant)
  }
  return [...expanded]
}

export function customItemToCatalog(item: CustomItemRecord): CatalogItem {
  return {
    id: item.itemId,
    emoji: item.emoji,
    label: item.label,
    keywords: labelKeywords(item.label),
  }
}

export function mergeCatalogWithCustom(
  catalog: CatalogItem[],
  customItems: CustomItemRecord[] | undefined
): CatalogItem[] {
  if (!customItems?.length) return catalog
  return [...catalog, ...customItems.map(customItemToCatalog)]
}
