import {
  normalizeItemSearchText,
  searchWordVariants,
  tokenizeSearchQuery,
  tokenMatchesHaystack,
} from '@/lib/items'
import {
  conceptAliasMatchesQuery,
  collectConceptKeys,
  EMOJI_CONCEPT_ALIASES,
  EMOJI_CONCEPT_EXPANSIONS,
} from '@/lib/emojiConcepts'

export interface EmojiSearchEntry {
  emoji: string
  label: string
  group?: number
}

export interface EmojiSearchIndex {
  entries: EmojiSearchEntry[]
  aliases: Record<string, string[]>
}

/** Máximo de emojis inline en ItemPicker / formulario crear ítem. */
export const EMOJI_INLINE_LIMIT = 24

const entriesByEmoji = new WeakMap<EmojiSearchIndex, Map<string, EmojiSearchEntry>>()

function getEntryMap(index: EmojiSearchIndex): Map<string, EmojiSearchEntry> {
  let map = entriesByEmoji.get(index)
  if (!map) {
    map = new Map(index.entries.map((entry) => [entry.emoji, entry]))
    entriesByEmoji.set(index, map)
  }
  return map
}

let cachedIndex: EmojiSearchIndex | null = null
let loadPromise: Promise<EmojiSearchIndex> | null = null

export async function loadEmojiSearchIndex(): Promise<EmojiSearchIndex> {
  if (cachedIndex) return cachedIndex
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const res = await fetch('/emoji-search-es.json')
    if (!res.ok) throw new Error('No se pudo cargar el índice de emojis')
    const data = (await res.json()) as EmojiSearchIndex
    cachedIndex = data
    return data
  })()

  return loadPromise
}

function wordBoundaryMatch(haystack: string, needle: string): boolean {
  if (!needle) return false
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|\\s|_)${escaped}(?:\\s|_|$)`).test(haystack)
}

function bumpScore(scores: Map<string, number>, emoji: string, score: number) {
  scores.set(emoji, Math.max(scores.get(emoji) ?? 0, score))
}

function lookupCldrAliasScores(
  term: string,
  index: EmojiSearchIndex,
  baseScore: number
): Map<string, number> {
  const scores = new Map<string, number>()
  const key = normalizeItemSearchText(term)
  if (!key) return scores

  const exact = index.aliases[key]
  if (exact) {
    exact.forEach((emoji, i) => bumpScore(scores, emoji, baseScore - i * 8))
  }

  for (const variant of searchWordVariants(key)) {
    const hits = index.aliases[variant]
    if (hits) {
      hits.forEach((emoji, i) => bumpScore(scores, emoji, baseScore - 24 - i * 8))
    }
  }

  return scores
}

/** Conceptos curados + expansión a aliases CLDR (carne, steak, fire…). */
function buildConceptScores(query: string, index: EmojiSearchIndex): Map<string, number> {
  const scores = new Map<string, number>()
  const keys = collectConceptKeys(query)
  const normalizedQuery = normalizeItemSearchText(query.trim())

  for (const key of keys) {
    const direct = EMOJI_CONCEPT_ALIASES[key]
    if (direct) {
      const base = key === normalizedQuery ? 1200 : 760
      direct.forEach((emoji, i) => bumpScore(scores, emoji, base - i * 12))
    }

    const expansions = EMOJI_CONCEPT_EXPANSIONS[key]
    if (expansions) {
      for (const term of expansions) {
        const expanded = lookupCldrAliasScores(term, index, 520)
        for (const [emoji, score] of expanded) bumpScore(scores, emoji, score)
      }
    }

    for (const [alias, emojis] of Object.entries(EMOJI_CONCEPT_ALIASES)) {
      if (alias === key || !conceptAliasMatchesQuery(key, alias)) continue

      const base = key === normalizedQuery ? 900 : 620
      emojis.forEach((emoji, i) => bumpScore(scores, emoji, base - i * 12))

      const prefixExpansions = EMOJI_CONCEPT_EXPANSIONS[alias]
      if (!prefixExpansions) continue
      for (const term of prefixExpansions) {
        const expanded = lookupCldrAliasScores(term, index, 440)
        for (const [emoji, score] of expanded) bumpScore(scores, emoji, score)
      }
    }
  }

  return scores
}

/** Scores from CLDR alias index for query + tokens (incl. plurales). */
function buildAliasScores(query: string, index: EmojiSearchIndex): Map<string, number> {
  const scores = new Map<string, number>()
  const normalizedQuery = normalizeItemSearchText(query.trim())
  const tokens = tokenizeSearchQuery(query)

  const exact = index.aliases[normalizedQuery]
  if (exact) exact.forEach((emoji, i) => bumpScore(scores, emoji, 1000 - i * 8))

  for (const token of tokens) {
    for (const variant of searchWordVariants(token)) {
      const hits = index.aliases[variant]
      if (!hits) continue
      const score = variant === token ? 680 : 640
      hits.forEach((emoji, i) => bumpScore(scores, emoji, score - i * 8))
    }
  }

  return scores
}

function scoreEntryLabel(entry: EmojiSearchEntry, query: string): number {
  const normalizedLabel = normalizeItemSearchText(entry.label)
  const normalizedQuery = normalizeItemSearchText(query.trim())
  const tokens = tokenizeSearchQuery(query)

  if (normalizedLabel === normalizedQuery) return 920
  if (wordBoundaryMatch(normalizedLabel, normalizedQuery)) return 820
  if (normalizedLabel.startsWith(normalizedQuery)) return 620

  // Substring solo si la query es larga (evita grill → grillo, pan → empanada raro)
  if (normalizedQuery.length >= 5 && normalizedLabel.includes(normalizedQuery)) return 420

  if (tokens.length === 0) return 0

  const matched = tokens.filter((token) => tokenMatchesHaystack(token, normalizedLabel))
  if (matched.length === tokens.length) return tokens.length > 1 ? 540 : 480
  if (matched.length > 0) return 180 + matched.length * 90

  return 0
}

function conceptEntries(
  conceptScores: Map<string, number>,
  index: EmojiSearchIndex
): EmojiSearchEntry[] {
  const entryMap = getEntryMap(index)
  const results: EmojiSearchEntry[] = []

  for (const [emoji] of [...conceptScores.entries()].sort((a, b) => b[1] - a[1])) {
    const entry = entryMap.get(emoji)
    if (entry) results.push(entry)
    else results.push({ emoji, label: emoji })
  }

  return results
}

export function searchEmojisFromIndex(
  index: EmojiSearchIndex,
  query: string,
  limit = EMOJI_INLINE_LIMIT
): EmojiSearchEntry[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const conceptScores = buildConceptScores(trimmed, index)
  const aliasScores = buildAliasScores(trimmed, index)

  const scored = index.entries
    .map((entry) => ({
      entry,
      score: Math.max(
        conceptScores.get(entry.emoji) ?? 0,
        aliasScores.get(entry.emoji) ?? 0,
        scoreEntryLabel(entry, trimmed)
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, 'es'))

  const seen = new Set<string>()
  const results: EmojiSearchEntry[] = []

  // Conceptos con emoji que no está en entries (raro) primero
  for (const entry of conceptEntries(conceptScores, index)) {
    if (seen.has(entry.emoji)) continue
    seen.add(entry.emoji)
    results.push(entry)
    if (results.length >= limit) return results
  }

  for (const { entry } of scored) {
    if (seen.has(entry.emoji)) continue
    seen.add(entry.emoji)
    results.push(entry)
    if (results.length >= limit) break
  }

  return results
}

export async function searchEmojis(
  query: string,
  limit = EMOJI_INLINE_LIMIT
): Promise<EmojiSearchEntry[]> {
  const index = await loadEmojiSearchIndex()
  return searchEmojisFromIndex(index, query, limit)
}

export function suggestEmojiFromIndex(index: EmojiSearchIndex, query: string): string | null {
  const hits = searchEmojisFromIndex(index, query, 1)
  return hits[0]?.emoji ?? null
}

export async function suggestEmojiForQuery(query: string): Promise<string | null> {
  const index = await loadEmojiSearchIndex()
  return suggestEmojiFromIndex(index, query)
}
