import { useMemo, useState } from 'react'
import { ExpenseChip } from '@/components/ExpenseChip'
import { CreateCustomItemSheet } from '@/components/CreateCustomItemSheet'
import { ITEM_CATALOG, itemSearchHaystack, type CatalogItem } from '@/lib/items'
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
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function matchesSearch(item: CatalogItem, query: string): boolean {
  if (!query) return true
  return itemSearchHaystack(item).includes(normalizeSearch(query))
}

export function ItemPicker({ storeName, onSelect }: ItemPickerProps) {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
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
    const filtered = catalog.filter((item) => matchesSearch(item, search))
    return sortCatalogByUsage(filtered, serverCounts)
  }, [catalog, search, serverCounts, customItems])

  const trimmedSearch = search.trim()
  const showCreateCta =
    customItems !== undefined &&
    serverCounts !== undefined &&
    trimmedSearch.length > 0 &&
    displayItems.length === 0

  const title = storeName ?? '¿Qué fue?'
  const titleEmoji = storeName ? '🛒' : '✏️'
  const subtitle = storeName
    ? 'Elegí un ítem de la compra'
    : isLargeCatalog
      ? `${catalog.length} ítems · elegí y después el monto`
      : 'Elegí y después el monto'

  const sectionLabel = search ? 'Resultados' : 'Tus frecuentes primero'

  return (
    <>
      <div className="pb-3 -mx-1">
        <div className="sticky top-0 z-10 -mx-1 px-1 pt-0.5 pb-3 bg-gradient-to-b from-[hsl(40_60%_99%)] from-75% to-transparent">
          <div className="text-center mb-3">
            <p className="font-display text-[1.35rem] font-bold text-ink tracking-tight">
              {titleEmoji} {title}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">{subtitle}</p>
          </div>

          {isLargeCatalog && (
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pescado, taxi, arriendo…"
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
          {serverCounts === undefined || customItems === undefined ? (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : showCreateCta ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Sin resultados para “{trimmedSearch}”
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
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

      <CreateCustomItemSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialLabel={trimmedSearch}
        onCreated={(item) =>
          onSelect({
            itemId: item.itemId,
            itemEmoji: item.itemEmoji,
            itemLabel: item.itemLabel,
          })
        }
      />
    </>
  )
}
