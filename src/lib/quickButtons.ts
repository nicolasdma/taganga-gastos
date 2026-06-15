import { getCategory } from '@/lib/categories'
import type { SheetIntent } from '@/components/ExpenseSheet'

export interface CategoryQuickButton {
  key: string
  emoji: string
  label: string
  intent: Extract<SheetIntent, { type: 'category' }>
}

/** Categorías fijas en acceso rápido (reemplazan café/helado/cerveza). */
export const QUICK_CATEGORY_IDS = ['eating-out', 'transport', 'leisure'] as const

export function buildCategoryQuickButtons(): CategoryQuickButton[] {
  return QUICK_CATEGORY_IDS.flatMap((categoryId) => {
    const cat = getCategory(categoryId)
    if (!cat) return []
    return [
      {
        key: categoryId,
        emoji: cat.emoji,
        label: cat.label,
        intent: { type: 'category', categoryId },
      },
    ]
  })
}
