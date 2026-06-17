import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { CraftTextField } from '@/components/keyboard/CraftTextField'
import { CraftSkeletonChipGrid } from '@/components/craft/CraftLoading'
import { ExpenseChip } from '@/components/ExpenseChip'
import { ITEM_CATALOG, normalizeItemSearchText } from '@/lib/items'
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
const CREATE_EMOJI_LIMIT = 12

export function ItemPicker({ onSelect, onRequestCreate }: ItemPickerProps) {
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [emojiIndex, setEmojiIndex] = useState<EmojiSearchIndex | null>(null)
  const [selectedCreateEmoji, setSelectedCreateEmoji] = useState<{
    query: string
    emoji: string
  } | null>(null)
  const { view } = useExpenseView()
  const customItems = useCustomItems(view)
  const householdAliases = useHouseholdItemAliases()
  const catalog = useMemo(
    () => mergeCatalogWithCustom(ITEM_CATALOG, customItems),
    [customItems]
  )

  const serverCounts = useFrequentItemCounts(view)
  const trimmedInput = searchInput.trim()
  const trimmedSearch = deferredSearch.trim()
  const hasInputQuery = trimmedInput.length >= 1
  const hasQuery = trimmedSearch.length >= 1

  useEffect(() => {
    if (!hasInputQuery || emojiIndex) return
    void loadEmojiSearchIndex()
      .then(setEmojiIndex)
      .catch(() => {
        /* offline / missing index — catalog + aliases still work */
      })
  }, [hasInputQuery, emojiIndex])

  const searchResult = useMemo(() => {
    return searchItems({
      query: deferredSearch,
      catalog,
      householdAliases,
      emojiIndex,
      emojiLimit: EMOJI_INLINE_LIMIT,
    })
  }, [deferredSearch, catalog, householdAliases, emojiIndex])

  const displayItems = useMemo(() => {
    if (serverCounts === undefined || customItems === undefined) return []
    return sortCatalogByUsage(searchResult.catalogItems, serverCounts)
  }, [searchResult.catalogItems, serverCounts, customItems])

  const hasExactItemLabelMatch = useMemo(() => {
    const normalizedSearch = normalizeItemSearchText(trimmedSearch)
    if (!normalizedSearch) return false
    return searchResult.catalogItems.some(
      (item) => normalizeItemSearchText(item.label) === normalizedSearch
    )
  }, [searchResult.catalogItems, trimmedSearch])

  const showCreateCta =
    onRequestCreate !== undefined &&
    customItems !== undefined &&
    serverCounts !== undefined &&
    trimmedSearch.length >= CREATE_CTA_MIN_QUERY &&
    !hasExactItemLabelMatch

  const createSuggestion = searchResult.createSuggestion
  const sectionLabel = hasQuery ? 'Resultados' : 'Tus frecuentes primero'
  const isLoading = serverCounts === undefined || customItems === undefined

  const activeCreateEmoji =
    selectedCreateEmoji?.query === trimmedSearch
      ? selectedCreateEmoji.emoji
      : createSuggestion?.emoji ?? null

  const createEmojiOptions = useMemo(() => {
    if (!createSuggestion) return []

    const seen = new Set<string>()
    const options: Array<{ emoji: string; label: string }> = []
    const add = (emoji: string, label: string) => {
      if (seen.has(emoji)) return
      seen.add(emoji)
      options.push({ emoji, label })
    }

    add(createSuggestion.emoji, createSuggestion.label)
    for (const entry of searchResult.emojiSuggestions) add(entry.emoji, entry.label)
    if (activeCreateEmoji) add(activeCreateEmoji, 'Seleccionado')

    return options.slice(0, CREATE_EMOJI_LIMIT)
  }, [activeCreateEmoji, createSuggestion, searchResult.emojiSuggestions])

  const handleCreate = () => {
    if (!onRequestCreate || !trimmedSearch) return
    onRequestCreate({ query: trimmedSearch, emoji: activeCreateEmoji ?? createSuggestion?.emoji })
  }

  return (
    <div className="item-picker pb-2">
      <div className="item-picker-search pb-2">
        <CraftTextField
          value={searchInput}
          onChange={setSearchInput}
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

            {showCreateCta && createSuggestion && (
              <div className={cn(displayItems.length === 0 && 'pt-2')}>
                {displayItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Sin ítems para “{trimmedSearch}”
                  </p>
                )}
                <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm space-y-2.5">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className={cn(
                      'w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                      'btn-cobalt text-sm font-bold active:shadow-none active:translate-y-px'
                    )}
                  >
                    <span className="text-lg leading-none">
                      {activeCreateEmoji ?? createSuggestion.emoji}
                    </span>
                    Crear «{trimmedSearch}»
                  </button>

                  {createEmojiOptions.length > 1 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-1.5">
                        {createEmojiOptions.map(({ emoji, label }) => (
                          <button
                            key={emoji}
                            type="button"
                            title={label}
                            onClick={() => setSelectedCreateEmoji({ query: trimmedSearch, emoji })}
                            className={cn(
                              'h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-95',
                              (activeCreateEmoji ?? createSuggestion.emoji) === emoji
                                ? 'chip-tile ring-2 ring-cobalt-glaze/40'
                                : 'hover:bg-muted/40 bg-muted/20'
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground text-center font-medium">
                        Tocá un emoji para cambiarlo antes de crear.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!hasQuery && displayItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">Sin ítems</p>
            )}

            {hasQuery &&
              displayItems.length === 0 &&
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

