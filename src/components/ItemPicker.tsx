import { useMemo, useState } from 'react'
import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { CraftSkeletonChipGrid } from '@/components/craft/CraftLoading'
import { ExpenseChip } from '@/components/ExpenseChip'
import { ITEM_CATALOG, itemMatchesSearch } from '@/lib/items'
import { mergeCatalogWithCustom } from '@/lib/mergeCatalog'
import { sortCatalogByUsage } from '@/lib/itemUsage'
import { useCustomItems } from '@/hooks/useCustomItems'
import { useFrequentItemCounts } from '@/hooks/useFrequentQuickItems'
import { useExpenseView } from '@/hooks/useExpenseView'
import { cn } from '@/lib/utils'

export interface SelectedItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

interface ItemPickerProps {
  storeName?: string
  onSelect: (item: SelectedItem) => void
  onRequestCreate?: (query: string) => void
}

/** Minimum query length before offering inline custom-item creation. */
const CREATE_CTA_MIN_QUERY = 2

export function ItemPicker({ storeName: _storeName, onSelect, onRequestCreate }: ItemPickerProps) {
  const [search, setSearch] = useState('')
  const { view } = useExpenseView()
  const customItems = useCustomItems(view)
  const catalog = useMemo(
    () => mergeCatalogWithCustom(ITEM_CATALOG, customItems),
    [customItems]
  )
  const isLargeCatalog = catalog.length > 16

  const serverCounts = useFrequentItemCounts(view)

  const displayItems = useMemo(() => {
    if (serverCounts === undefined || customItems === undefined) return []
    const filtered = catalog.filter((item) => itemMatchesSearch(item, search))
    return sortCatalogByUsage(filtered, serverCounts)
  }, [catalog, search, serverCounts, customItems])

  const trimmedSearch = search.trim()
  const showCreateCta =
    onRequestCreate !== undefined &&
    customItems !== undefined &&
    serverCounts !== undefined &&
    trimmedSearch.length >= CREATE_CTA_MIN_QUERY &&
    displayItems.length === 0

  const sectionLabel = search ? 'Resultados' : 'Tus frecuentes primero'

  return (
    <div className="item-picker pb-2">
      {isLargeCatalog && (
        <div className="item-picker-search pb-2">
          <CraftTextField
            value={search}
            onChange={setSearch}
            placeholder="Buscar pescado, taxi, arriendo…"
            layout="search"
            maxLength={60}
            compactKeyboard
            inputClassName="item-picker-search-input w-full font-medium"
          />
        </div>
      )}

      <div className="item-picker-results space-y-2.5">
        <p className="label-stitch px-0.5">{sectionLabel}</p>
        {serverCounts === undefined || customItems === undefined ? (
          <CraftSkeletonChipGrid count={8} columns={4} />
        ) : showCreateCta ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Sin resultados para “{trimmedSearch}”
            </p>
            <button
              type="button"
              onClick={() => onRequestCreate(trimmedSearch)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-3 rounded-2xl',
                'btn-cobalt text-sm font-bold active:shadow-none active:translate-y-px'
              )}
            >
              ✏️ Agregar «{trimmedSearch}»
            </button>
          </div>
        ) : displayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Sin resultados para “{search}”
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 pb-1">
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

/** Subtitle for the item-pick step header (e.g. receipt store context). */
export function itemPickerSubtitle(storeName?: string): string | undefined {
  if (storeName) return 'Elegí un ítem de la compra'
  return undefined
}

/** Title for the item-pick step header. */
export function itemPickerTitle(storeName?: string): string {
  return storeName ? `🛒 ${storeName}` : '✏️ ¿Qué fue?'
}
