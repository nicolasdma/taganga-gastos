import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ExpenseChip } from '@/components/ExpenseChip'
import { getCategoryItems, type CatalogItem } from '@/lib/categories'
import { cn } from '@/lib/utils'

export interface SelectedItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

interface ItemPickerProps {
  categoryId: string
  categoryEmoji: string
  categoryLabel: string
  storeName?: string
  onSelect: (item: SelectedItem) => void
}

export function ItemPicker({
  categoryId,
  categoryEmoji,
  categoryLabel,
  storeName,
  onSelect,
}: ItemPickerProps) {
  const frequent = useQuery(api.expenses.frequentItems, { categoryId, limit: 6 })
  const catalog = getCategoryItems(categoryId)

  const frequentIds = new Set(frequent?.map((f) => f.itemId) ?? [])
  const rest = catalog.filter((item) => !frequentIds.has(item.id))

  const frequentItems: CatalogItem[] =
    frequent?.map((f) => ({
      id: f.itemId,
      emoji: f.itemEmoji ?? '⭐',
      label: f.itemLabel ?? f.itemId,
    })) ?? []

  return (
    <div className="pb-2">
      <div className="text-center mb-4">
        <p className="font-display text-xl font-bold text-ink">
          {categoryEmoji} {storeName ?? categoryLabel}
        </p>
        {storeName && (
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{categoryLabel}</p>
        )}
      </div>

      {frequentItems.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="label-stitch">⭐ Favoritos</p>
          <div className="grid grid-cols-4 gap-2">
            {frequentItems.map((item) => (
              <ExpenseChip
                key={item.id}
                emoji={item.emoji}
                label={item.label}
                compact
                onClick={() =>
                  onSelect({ itemId: item.id, itemEmoji: item.emoji, itemLabel: item.label })
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="label-stitch">Ítems</p>
        <div className={cn('grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto scrollbar-none')}>
          {rest.map((item) => (
            <ExpenseChip
              key={item.id}
              emoji={item.emoji}
              label={item.label}
              compact
              onClick={() =>
                onSelect({ itemId: item.id, itemEmoji: item.emoji, itemLabel: item.label })
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
