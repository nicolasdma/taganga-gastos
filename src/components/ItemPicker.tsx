import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ExpenseChip } from '@/components/ExpenseChip'
import { getCategoryItems, type CatalogItem } from '@/lib/categories'
import { getFoodById } from '@/lib/foodCatalog'
import { sortCatalogByUsage } from '@/lib/itemUsage'
import { cn } from '@/lib/utils'

export interface SelectedItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

interface ItemPickerProps {
  categoryId: string
  variant?: 'default' | 'supermarket'
  categoryEmoji: string
  categoryLabel: string
  storeName?: string
  onSelect: (item: SelectedItem) => void
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function itemSearchHaystack(item: CatalogItem, categoryId: string): string {
  const food = categoryId === 'supermarket' ? getFoodById(item.id) : undefined
  const keywords = food?.keywords.join(' ') ?? ''
  return normalizeSearch(`${item.label} ${item.id} ${keywords}`)
}

function matchesSearch(item: CatalogItem, query: string, categoryId: string): boolean {
  if (!query) return true
  return itemSearchHaystack(item, categoryId).includes(normalizeSearch(query))
}

export function ItemPicker({
  categoryId,
  variant = 'default',
  categoryEmoji,
  categoryLabel,
  storeName,
  onSelect,
}: ItemPickerProps) {
  const [search, setSearch] = useState('')
  const catalog = getCategoryItems(categoryId)
  const isLargeCatalog = catalog.length > 16
  const isSupermarket = variant === 'supermarket'

  const frequent = useQuery(api.expenses.frequentItems, { categoryId, limit: 80 })

  const serverCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of frequent ?? []) {
      if (row.itemId) counts.set(row.itemId, row.count)
    }
    return counts
  }, [frequent])

  const displayItems = useMemo(() => {
    const filtered = catalog.filter((item) => matchesSearch(item, search, categoryId))
    return sortCatalogByUsage(filtered, categoryId, serverCounts)
  }, [catalog, search, categoryId, serverCounts])

  const title = storeName ?? (isSupermarket ? categoryLabel : '¿Qué fue?')
  const titleEmoji = isSupermarket ? categoryEmoji : '✏️'
  const subtitle = storeName
    ? categoryLabel
    : isSupermarket
      ? isLargeCatalog
        ? `${catalog.length} ítems · elegí y después el detalle`
        : 'Elegí un ítem'
      : isLargeCatalog
        ? `${catalog.length} comidas y más · después el precio`
        : 'Elegí y después el precio'

  const sectionLabel = search ? 'Resultados' : 'Tus frecuentes primero'

  return (
    <div className="pb-3 -mx-1">
      <div className="sticky top-0 z-10 -mx-1 px-1 pt-0.5 pb-3 bg-gradient-to-b from-[hsl(40_60%_99%)] from-75% to-transparent">
        <div className="text-center mb-3">
          <p className="font-display text-[1.35rem] font-bold text-ink tracking-tight">
            {titleEmoji} {title}
          </p>
          {storeName ? (
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{subtitle}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground font-medium mt-1">{subtitle}</p>
          )}
        </div>

        {isLargeCatalog && (
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pescado, frutilla, cerveza…"
            className={cn(
              'w-full rounded-2xl pl-4 pr-4 py-3 text-sm font-medium',
              'bg-porcelain-cream/90 border-2 border-stitch/45',
              'placeholder:text-muted-foreground/55',
              'focus:outline-none focus:border-cobalt-glaze/55 focus:ring-2 focus:ring-cobalt-glaze/15',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
            )}
          />
        )}
      </div>

      <div className="space-y-2.5">
        <p className="label-stitch px-0.5">{sectionLabel}</p>
        {displayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Sin resultados para “{search}”
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {displayItems.map((item, i) => (
              <ExpenseChip
                key={item.id}
                emoji={item.emoji}
                label={item.label}
                compact
                tiltIndex={i}
                onClick={() =>
                  onSelect({ itemId: item.id, itemEmoji: item.emoji, itemLabel: item.label })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
