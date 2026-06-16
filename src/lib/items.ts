import { FOOD_CATALOG, SUPERMARKET_EXTRAS } from '@/lib/foodCatalog'

export interface CatalogItem {
  id: string
  emoji: string
  label: string
  keywords?: string[]
}

/** Ítems fuera del catálogo de comida/super. */
const EXTRA_ITEMS: CatalogItem[] = [
  { id: 'lunch', emoji: '🍽️', label: 'Almuerzo', keywords: ['almuerzo', 'comida'] },
  { id: 'dinner', emoji: '🌙', label: 'Cena', keywords: ['cena'] },
  { id: 'delivery', emoji: '🍕', label: 'Domicilio', keywords: ['domicilio', 'delivery', 'rappi'] },
  { id: 'bakery', emoji: '🥐', label: 'Panadería', keywords: ['panadería', 'panaderia'] },
  { id: 'drink', emoji: '🥤', label: 'Bebida', keywords: ['bebida'] },
  { id: 'gasoline', emoji: '🛵', label: 'Gasolina', keywords: ['gasolina', 'combustible'] },
  { id: 'taxi', emoji: '🚕', label: 'Taxi', keywords: ['taxi', 'uber', 'didi', 'cabify'] },
  { id: 'bus', emoji: '🚌', label: 'Bus', keywords: ['bus', 'transmilenio', 'sitp'] },
  { id: 'parking', emoji: '🅿️', label: 'Parqueo', keywords: ['parqueo', 'parking', 'estacionamiento'] },
  { id: 'rent', emoji: '🏠', label: 'Arriendo', keywords: ['arriendo', 'alquiler', 'canon'] },
  { id: 'utilities', emoji: '💡', label: 'Servicios', keywords: ['servicios', 'luz', 'agua', 'gas', 'epm', 'codensa', 'gas natural', 'acueducto'] },
  { id: 'internet', emoji: '📶', label: 'Internet', keywords: ['internet', 'wifi', 'fibra', 'claro hogar', 'tigo hogar', 'movistar hogar'] },
  {
    id: 'cellphone',
    emoji: '📱',
    label: 'Celular / Plan',
    keywords: [
      'celular',
      'telefono',
      'movil',
      'tigo',
      'claro',
      'movistar',
      'wom',
      'virgin',
      'plan',
      'recarga',
      'operador',
      'sim',
    ],
  },
  {
    id: 'digital-wallet',
    emoji: '💳',
    label: 'Billetera digital',
    keywords: ['nequi', 'daviplata', 'bancolombia', 'transferencia', 'billetera'],
  },
  { id: 'cleaning', emoji: '🧹', label: 'Limpieza', keywords: ['limpieza', 'aseo hogar'] },
  { id: 'household-supplies', emoji: '🧴', label: 'Insumos', keywords: ['insumos', 'detergente'] },
  { id: 'pharmacy', emoji: '💊', label: 'Farmacia', keywords: ['farmacia', 'medicina'] },
  { id: 'doctor', emoji: '👨‍⚕️', label: 'Médico', keywords: ['médico', 'medico', 'consulta'] },
  { id: 'movies', emoji: '🎬', label: 'Cine', keywords: ['cine', 'película'] },
  { id: 'games', emoji: '🎮', label: 'Juegos', keywords: ['juegos', 'videojuego'] },
  { id: 'gift', emoji: '🎁', label: 'Regalo', keywords: ['regalo'] },
  { id: 'savings-transfer', emoji: '💰', label: 'Ahorro', keywords: ['ahorro', 'transferencia'] },
  { id: 'other', emoji: '➕', label: 'Otro', keywords: ['otro'] },
]

const SUPERMARKET_EXTRAS_RESOLVED: CatalogItem[] = SUPERMARKET_EXTRAS.filter((i) => i.id !== 'other').map(
  (item) =>
    item.id === 'supplies'
      ? { ...item, id: 'grocery-supplies', label: 'Aseo' }
      : { ...item, keywords: [item.label.toLowerCase()] }
)

/** Catálogo global flat — única fuente de ítems. */
export const ITEM_CATALOG: CatalogItem[] = [
  ...FOOD_CATALOG,
  ...SUPERMARKET_EXTRAS_RESOLVED,
  ...EXTRA_ITEMS,
]

export const CUSTOM_ITEM_PREFIX = 'custom:'

export function isCustomItemId(id: string): boolean {
  return id.startsWith(CUSTOM_ITEM_PREFIX)
}

const catalogById = new Map(ITEM_CATALOG.map((item) => [item.id, item]))

/** Mapeo de IDs legacy (categoría + ítem viejo) → ID unificado. */
const LEGACY_ITEM_IDS: Record<string, string> = {
  coffee: 'cafe',
  beer: 'cerveza',
  'ice-cream': 'helado',
  eggs: 'huevo',
  milk: 'leche',
  bread: 'pan',
  chicken: 'pollo',
  fruit: 'banana',
  vegetables: 'verdura',
  supplies: 'grocery-supplies',
  transfer: 'savings-transfer',
}

export function resolveItemId(itemId: string): string {
  return LEGACY_ITEM_IDS[itemId] ?? itemId
}

export function getItemById(id: string): CatalogItem | undefined {
  return catalogById.get(resolveItemId(id))
}

/** Labels para gastos legacy que solo tenían categoryId. */
export const LEGACY_CATEGORY_DISPLAY: Record<string, { emoji: string; label: string }> = {
  home: { emoji: '🏠', label: 'Hogar' },
  supermarket: { emoji: '🛒', label: 'Super' },
  'eating-out': { emoji: '🍽️', label: 'Comer afuera' },
  transport: { emoji: '🚕', label: 'Transporte' },
  household: { emoji: '🧴', label: 'Limpieza' },
  health: { emoji: '🏥', label: 'Salud' },
  leisure: { emoji: '🎉', label: 'Ocio' },
  misc: { emoji: '📦', label: 'Varios' },
  savings: { emoji: '💰', label: 'Ahorro' },
}

export function normalizeItemSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

/** Stop words ignoradas al matchear por tokens (frases compuestas). */
const SEARCH_STOP_WORDS = new Set([
  'de',
  'la',
  'el',
  'en',
  'y',
  'a',
  'al',
  'del',
  'los',
  'las',
  'un',
  'una',
  'por',
  'para',
  'con',
])

/** Tokens significativos de una query — p.ej. "comida de gatito" → ["comida", "gatito"]. */
export function tokenizeSearchQuery(query: string): string[] {
  return normalizeItemSearchText(query.trim())
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !SEARCH_STOP_WORDS.has(word))
}

/** Raíz simple ES: gatitos → gatito, casas → casa. Sin tocar palabras cortas (gas, mes). */
export function searchWordStem(word: string): string {
  if (word.length <= 3) return word
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2)
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** Variantes para matchear singular/plural en búsqueda. */
export function searchWordVariants(word: string): string[] {
  const stem = searchWordStem(word)
  const variants = new Set([word])
  if (stem !== word) variants.add(stem)
  if (!word.endsWith('s')) variants.add(`${word}s`)
  if (!word.endsWith('es') && word.length > 3) variants.add(`${word}es`)
  return [...variants]
}

/** Un token de la query matchea el haystack (incluye plurales: gatitos ↔ gatito). */
export function tokenMatchesHaystack(token: string, haystack: string): boolean {
  const hayWords = haystack.split(/[\s_]+/)
  for (const variant of searchWordVariants(token)) {
    if (haystack.includes(variant)) return true
    for (const hw of hayWords) {
      if (hw === variant) return true
      if (searchWordStem(hw) === searchWordStem(variant)) return true
    }
  }
  return false
}

export function itemSearchHaystack(item: CatalogItem): string {
  const keywords = item.keywords?.join(' ') ?? ''
  return normalizeItemSearchText(`${item.label} ${item.id} ${keywords}`)
}

export function itemMatchesSearch(item: CatalogItem, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true

  const normalizedQuery = normalizeItemSearchText(trimmed)
  const haystack = itemSearchHaystack(item)

  // Frase completa (incluye "comida de gatito" tal cual)
  if (haystack.includes(normalizedQuery)) return true

  // Todas las palabras significativas deben matchear (con plurales)
  const tokens = tokenizeSearchQuery(trimmed)
  if (tokens.length === 0) return haystack.includes(normalizedQuery)
  return tokens.every((token) => tokenMatchesHaystack(token, haystack))
}
