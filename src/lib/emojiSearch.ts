import {
  normalizeItemSearchText,
  searchWordVariants,
  tokenizeSearchQuery,
  tokenMatchesHaystack,
} from '@/lib/items'

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

/** Scores from CLDR alias index for query + tokens (incl. plurales). */
function buildAliasScores(query: string, index: EmojiSearchIndex): Map<string, number> {
  const scores = new Map<string, number>()
  const normalizedQuery = normalizeItemSearchText(query.trim())
  const tokens = tokenizeSearchQuery(query)

  const exact = index.aliases[normalizedQuery]
  if (exact) exact.forEach((emoji) => bumpScore(scores, emoji, 1000))

  for (const token of tokens) {
    for (const variant of searchWordVariants(token)) {
      const hits = index.aliases[variant]
      if (!hits) continue
      const score = variant === token ? 680 : 640
      hits.forEach((emoji) => bumpScore(scores, emoji, score))
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
  if (normalizedLabel.includes(normalizedQuery)) return 420

  if (tokens.length === 0) return 0

  const matched = tokens.filter((token) => tokenMatchesHaystack(token, normalizedLabel))
  if (matched.length === tokens.length) return tokens.length > 1 ? 540 : 480
  if (matched.length > 0) return 180 + matched.length * 90

  return 0
}

export function searchEmojisFromIndex(
  index: EmojiSearchIndex,
  query: string,
  limit = EMOJI_INLINE_LIMIT
): EmojiSearchEntry[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const aliasScores = buildAliasScores(trimmed, index)

  const scored = index.entries
    .map((entry) => ({
      entry,
      score: Math.max(aliasScores.get(entry.emoji) ?? 0, scoreEntryLabel(entry, trimmed)),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, 'es'))

  const seen = new Set<string>()
  const results: EmojiSearchEntry[] = []

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
