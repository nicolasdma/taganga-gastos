import { useEffect, useMemo, useState } from 'react'
import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { CraftSkeletonChipGrid } from '@/components/craft/CraftLoading'
import { ExpenseChip } from '@/components/ExpenseChip'
import { EmojiResultRow } from '@/components/items/EmojiResultRow'
import { ITEM_CATALOG } from '@/lib/items'
import { EMOJI_INLINE_LIMIT, loadEmojiSearchIndex, type EmojiSearchIndex } from '@/lib/emojiSearch'
import { mergeCatalogWithCustom } from '@/lib/mergeCatalog'
import { searchItems } from '@/lib/itemSearch'
import { sortCatalogByUsage } from '@/lib/itemUsage'
import { useCustomItems } from '@/hooks/useCustomItems'
import { useFrequentItemCounts } from '@/hooks/useFrequentQuickItems'
import { useHouseholdItemAliases } from '@/hooks/useHouseholdItemAliases'
import { useExpenseView } from '@/hooks/useExpenseView'
import { cn } from '@/lib/utils'

export interface SelectedItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

export type CreateItemRequest = string | { query: string; emoji?: string }

interface ItemPickerProps {
  storeName?: string
  onSelect: (item: SelectedItem) => void
  onRequestCreate?: (request: CreateItemRequest) => void
}

const CREATE_CTA_MIN_QUERY = 2

export function ItemPicker({ storeName: _storeName, onSelect, onRequestCreate }: ItemPickerProps) {
  const [search, setSearch] = useState('')
  const [emojiIndex, setEmojiIndex] = useState<EmojiSearchIndex | null>(null)
  const { view } = useExpenseView()
  const customItems = useCustomItems(view)
  const householdAliases = useHouseholdItemAliases()
  const catalog = useMemo(
    () => mergeCatalogWithCustom(ITEM_CATALOG, customItems),
    [customItems]
  )

  const serverCounts = useFrequentItemCounts(view)
  const trimmedSearch = search.trim()
  const hasQuery = trimmedSearch.length >= 1

  useEffect(() => {
    if (!hasQuery || emojiIndex) return
    void loadEmojiSearchIndex()
      .then(setEmojiIndex)
      .catch(() => {
        /* offline / missing index — catalog + aliases still work */
      })
  }, [hasQuery, emojiIndex])

  const searchResult = useMemo(() => {
    return searchItems({
      query: search,
      catalog,
      householdAliases,
      emojiIndex,
      emojiLimit: EMOJI_INLINE_LIMIT,
    })
  }, [search, catalog, householdAliases, emojiIndex])

  const displayItems = useMemo(() => {
    if (serverCounts === undefined || customItems === undefined) return []
    return sortCatalogByUsage(searchResult.catalogItems, serverCounts)
  }, [searchResult.catalogItems, serverCounts, customItems])

  const showCreateCta =
    onRequestCreate !== undefined &&
    customItems !== undefined &&
    serverCounts !== undefined &&
    trimmedSearch.length >= CREATE_CTA_MIN_QUERY

  const createSuggestion = searchResult.createSuggestion
  const sectionLabel = hasQuery ? 'Resultados' : 'Tus frecuentes primero'
  const isLoading = serverCounts === undefined || customItems === undefined

  const handleEmojiPick = (emoji: string) => {
    if (!onRequestCreate || !trimmedSearch) return
    onRequestCreate({ query: trimmedSearch, emoji })
  }

  return (
    <div className="item-picker pb-2">
      <div className="item-picker-search pb-2">
        <CraftTextField
          value={search}
          onChange={setSearch}
          placeholder="Buscar pescado, taxi, tigo…"
          layout="search"
          maxLength={60}
          compactKeyboard
          inputClassName="item-picker-search-input w-full font-medium"
        />
      </div>

      <div className="item-picker-results space-y-3">
        {isLoading ? (
          <CraftSkeletonChipGrid count={8} columns={4} />
        ) : (
          <>
            {displayItems.length > 0 && (
              <div className="space-y-2">
                <p className="label-stitch px-0.5">{hasQuery ? 'Ítems' : sectionLabel}</p>
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
              </div>
            )}

            {hasQuery && searchResult.emojiSuggestions.length > 0 && (
              <EmojiResultRow
                emojis={searchResult.emojiSuggestions}
                onPick={(emoji) => handleEmojiPick(emoji)}
                layout="grid"
              />
            )}

            {showCreateCta && createSuggestion && (
              <div className={cn(displayItems.length === 0 && searchResult.emojiSuggestions.length === 0 && 'pt-4')}>
                {displayItems.length === 0 && searchResult.emojiSuggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Sin ítems para “{trimmedSearch}”
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onRequestCreate({
                      query: trimmedSearch,
                      emoji: createSuggestion.emoji,
                    })
                  }
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl',
                    'btn-cobalt text-sm font-bold active:shadow-none active:translate-y-px'
                  )}
                >
                  {createSuggestion.emoji} Agregar «{trimmedSearch}»
                </button>
              </div>
            )}

            {!hasQuery && displayItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">Sin ítems</p>
            )}

            {hasQuery &&
              displayItems.length === 0 &&
              searchResult.emojiSuggestions.length === 0 &&
              !showCreateCta && (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Sin resultados para “{trimmedSearch}”
                </p>
              )}
          </>
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

function parseCreateRequest(request: CreateItemRequest): { query: string; emoji?: string } {
  return typeof request === 'string' ? { query: request } : request
}

export { parseCreateRequest }
