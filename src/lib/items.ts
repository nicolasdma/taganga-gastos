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
  { id: 'utilities', emoji: '💡', label: 'Servicios', keywords: ['servicios', 'luz', 'agua', 'gas'] },
  { id: 'internet', emoji: '📶', label: 'Internet', keywords: ['internet', 'wifi', 'fibra'] },
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

export function itemSearchHaystack(item: CatalogItem): string {
  const keywords = item.keywords?.join(' ') ?? ''
  return `${item.label} ${item.id} ${keywords}`.toLowerCase()
}
