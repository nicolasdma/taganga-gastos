import { useEffect, useMemo, useRef, useState } from 'react'
import { ExpenseChip } from '@/components/ExpenseChip'
import { CreateCustomItemSheet } from '@/components/CreateCustomItemSheet'
import { ITEM_CATALOG, itemMatchesSearch } from '@/lib/items'
import { mergeCatalogWithCustom } from '@/lib/mergeCatalog'
import { sortCatalogByUsage } from '@/lib/itemUsage'
import { useCustomItems } from '@/hooks/useCustomItems'
import { useFrequentItemCounts } from '@/hooks/useFrequentQuickItems'
import { useExpenseView } from '@/hooks/useExpenseView'
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen'
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

/** Minimum query length before offering inline custom-item creation. */
const CREATE_CTA_MIN_QUERY = 2

const SEARCH_MODE_ATTR = 'data-item-picker-search'

export function ItemPicker({ storeName, onSelect }: ItemPickerProps) {
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardOpen = useKeyboardOpen()
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
  const compact = searchFocused || keyboardOpen
  const showCreateCta =
    customItems !== undefined &&
    serverCounts !== undefined &&
    trimmedSearch.length >= CREATE_CTA_MIN_QUERY &&
    displayItems.length === 0

  useEffect(() => {
    const root = document.documentElement
    if (compact) {
      root.setAttribute(SEARCH_MODE_ATTR, '')
    } else {
      root.removeAttribute(SEARCH_MODE_ATTR)
    }
    return () => root.removeAttribute(SEARCH_MODE_ATTR)
  }, [compact])

  const handleSearchFocus = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current)
      blurTimer.current = null
    }
    setSearchFocused(true)
  }

  const handleSearchBlur = () => {
    blurTimer.current = window.setTimeout(() => setSearchFocused(false), 120)
  }

  useEffect(
    () => () => {
      if (blurTimer.current) clearTimeout(blurTimer.current)
    },
    []
  )

  const handleCreated = (item: {
    itemId: string
    itemEmoji: string
    itemLabel: string
  }) => {
    setCreateOpen(false)
    setSearch('')
    onSelect(item)
  }

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
      <div
        className={cn(
          'item-picker flex min-h-0 flex-1 flex-col',
          compact && 'item-picker--compact'
        )}
      >
        {!compact && (
          <div className="shrink-0 pb-3 text-center">
            <p className="font-display text-[1.35rem] font-bold text-ink tracking-tight">
              {titleEmoji} {title}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">{subtitle}</p>
          </div>
        )}

        {isLargeCatalog && (
          <div className="item-picker-search shrink-0 pb-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Buscar pescado, taxi, arriendo…"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className={cn(
                'item-picker-search-input w-full font-medium',
                'bg-porcelain-cream/90 border-2 border-stitch/45',
                'placeholder:text-muted-foreground/55',
                'focus:outline-none focus:border-cobalt-glaze/55 focus:ring-2 focus:ring-cobalt-glaze/15',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
              )}
            />
          </div>
        )}

        <div className="item-picker-results min-h-0 flex-1 space-y-2.5 overflow-y-auto scrollbar-none overscroll-y-contain">
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

      <CreateCustomItemSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialLabel={trimmedSearch}
        onCreated={handleCreated}
      />
    </>
  )
}
