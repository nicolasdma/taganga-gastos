/**
 * Unified item search — 4 tiers (highest priority first):
 *
 * Tier 1: ITEM_CATALOG + customItems (curated chips)
 * Tier 2: CLDR emoji index (~1.900, lazy-loaded)
 * Tier 3: "Crear «query»" with auto-suggested emoji
 * Tier 4: Aliases — household (Convex) > static Colombian map
 */
import { itemMatchesSearch, normalizeItemSearchText, type CatalogItem } from '@/lib/items'
import {
  lookupHouseholdAlias,
  lookupStaticAlias,
  type HouseholdItemAlias,
} from '@/lib/itemAliases'
import {
  EMOJI_INLINE_LIMIT,
  searchEmojisFromIndex,
  suggestEmojiFromIndex,
  type EmojiSearchIndex,
} from '@/lib/emojiSearch'
import { lookupEmojiConcept } from '@/lib/emojiConcepts'

export interface ItemSearchResult {
  catalogItems: CatalogItem[]
  emojiSuggestions: Array<{ emoji: string; label: string }>
  createSuggestion: { label: string; emoji: string } | null
}

export interface ItemSearchInput {
  query: string
  catalog: CatalogItem[]
  householdAliases?: HouseholdItemAlias[]
  emojiIndex?: EmojiSearchIndex | null
  emojiLimit?: number
}

const DEFAULT_EMOJI = '✏️'

function resolveSuggestedEmoji(
  query: string,
  householdAliases: HouseholdItemAlias[] | undefined,
  emojiIndex: EmojiSearchIndex | null | undefined
): string {
  const trimmed = query.trim()
  if (!trimmed) return DEFAULT_EMOJI

  const household = lookupHouseholdAlias(trimmed, householdAliases)
  if (household) return household.emoji

  const staticAlias = lookupStaticAlias(trimmed)
  if (staticAlias) return staticAlias.emoji

  const concept = lookupEmojiConcept(trimmed)
  if (concept) return concept

  if (emojiIndex) {
    const cldr = suggestEmojiFromIndex(emojiIndex, trimmed)
    if (cldr) return cldr
  }

  return DEFAULT_EMOJI
}

export function searchItems(input: ItemSearchInput): ItemSearchResult {
  const trimmed = input.query.trim()
  const catalogItems = trimmed
    ? input.catalog.filter((item) => itemMatchesSearch(item, trimmed))
    : input.catalog

  if (!trimmed) {
    return { catalogItems, emojiSuggestions: [], createSuggestion: null }
  }

  const emojiSuggestions =
    input.emojiIndex != null
      ? searchEmojisFromIndex(input.emojiIndex, trimmed, input.emojiLimit ?? EMOJI_INLINE_LIMIT).map(
          (e) => ({
            emoji: e.emoji,
            label: e.label,
          })
        )
      : []

  const household = lookupHouseholdAlias(trimmed, input.householdAliases)
  const staticAlias = lookupStaticAlias(trimmed)
  const suggestedEmoji = resolveSuggestedEmoji(trimmed, input.householdAliases, input.emojiIndex)
  const suggestedLabel =
    household?.label ?? staticAlias?.suggestedLabel ?? trimmed

  const createSuggestion = {
    label: suggestedLabel,
    emoji: suggestedEmoji,
  }

  return { catalogItems, emojiSuggestions, createSuggestion }
}

/** Word-boundary aware alias check for short carrier names (tigo, claro). */
export function queryMatchesAlias(query: string, alias: string): boolean {
  const q = normalizeItemSearchText(query.trim())
  const a = normalizeItemSearchText(alias)
  if (q === a) return true
  return new RegExp(`(?:^|\\s)${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`).test(q)
}
