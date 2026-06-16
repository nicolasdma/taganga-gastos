/**
 * Build-time: compact CLDR emoji index for lazy runtime load (~50–150 KB).
 * Reads emojibase-data (devDependency only — not shipped in app bundle).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const esCompact = require('emojibase-data/es/compact.json')
const enCompact = require('emojibase-data/en/compact.json')

/** @param {string} text */
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Prefer base emoji (no ZWJ, no skin-tone modifiers). */
function isBaseEmoji(unicode) {
  if (!unicode || unicode.includes('\u200d')) return false
  // Fitzpatrick modifiers U+1F3FB–U+1F3FF
  if (/[\u{1F3FB}-\u{1F3FF}]/u.test(unicode)) return false
  return true
}

/** @type {Map<string, { emoji: string; label: string; group?: number }>} */
const byEmoji = new Map()

/** @param {typeof esCompact[0]} row */
function ingestRow(row, locale) {
  const emoji = row.unicode ?? row.emoji
  if (!emoji || !row.label) return
  if (!isBaseEmoji(emoji)) return

  const existing = byEmoji.get(emoji)
  if (!existing) {
    byEmoji.set(emoji, { emoji, label: row.label, group: row.group })
    return
  }
  // Prefer Spanish label when merging EN tags
  if (locale === 'es') {
    byEmoji.set(emoji, { ...existing, label: row.label })
  }
}

for (const row of esCompact) ingestRow(row, 'es')
for (const row of enCompact) ingestRow(row, 'en')

/** @type {{ emoji: string; label: string; group?: number }[]} */
const entries = [...byEmoji.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'))

/** normalized alias → emoji[] (order = relevance at build time) */
/** @type {Record<string, string[]>} */
const aliases = {}

/** @param {string} alias @param {string} emoji */
function addAlias(alias, emoji) {
  const key = normalize(alias.trim())
  if (!key || key.length < 2) return
  if (!aliases[key]) aliases[key] = []
  if (!aliases[key].includes(emoji)) aliases[key].push(emoji)
}

for (const entry of entries) {
  addAlias(entry.label, entry.emoji)
  const esRow = esCompact.find((r) => (r.unicode ?? r.emoji) === entry.emoji)
  const enRow = enCompact.find((r) => (r.unicode ?? r.emoji) === entry.emoji)
  for (const tag of esRow?.tags ?? []) addAlias(tag, entry.emoji)
  for (const tag of enRow?.tags ?? []) addAlias(tag, entry.emoji)
}

const index = {
  entries: entries.map(({ emoji, label, group }) => ({
    emoji,
    label,
    ...(group !== undefined ? { group } : {}),
  })),
  aliases,
}

const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'emoji-search-es.json')
writeFileSync(outPath, JSON.stringify(index))
console.log(`Wrote ${entries.length} emojis → ${outPath} (${(JSON.stringify(index).length / 1024).toFixed(1)} KB raw)`)
