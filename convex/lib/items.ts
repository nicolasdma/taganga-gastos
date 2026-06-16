/** Labels/emojis para gastos que solo tenían categoryId (sin ítem). */
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

export interface ResolvedItemFields {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

const LEGACY_CATEGORY_ITEMS: Record<string, Record<string, ResolvedItemFields>> = {
  supermarket: {
    meat: { itemId: 'meat', itemEmoji: '🥩', itemLabel: 'Carne' },
    supplies: { itemId: 'grocery-supplies', itemEmoji: '🧻', itemLabel: 'Aseo' },
    water: { itemId: 'water', itemEmoji: '💧', itemLabel: 'Agua' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  'eating-out': {
    coffee: { itemId: 'cafe', itemEmoji: '☕', itemLabel: 'Café' },
    beer: { itemId: 'cerveza', itemEmoji: '🍺', itemLabel: 'Cerveza' },
    lunch: { itemId: 'lunch', itemEmoji: '🍽️', itemLabel: 'Almuerzo' },
    dinner: { itemId: 'dinner', itemEmoji: '🌙', itemLabel: 'Cena' },
    delivery: { itemId: 'delivery', itemEmoji: '🍕', itemLabel: 'Domicilio' },
    bakery: { itemId: 'bakery', itemEmoji: '🥐', itemLabel: 'Panadería' },
    drink: { itemId: 'drink', itemEmoji: '🥤', itemLabel: 'Bebida' },
    'ice-cream': { itemId: 'helado', itemEmoji: '🍦', itemLabel: 'Helado' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  transport: {
    gasoline: { itemId: 'gasoline', itemEmoji: '🛵', itemLabel: 'Gasolina' },
    taxi: { itemId: 'taxi', itemEmoji: '🚕', itemLabel: 'Taxi' },
    bus: { itemId: 'bus', itemEmoji: '🚌', itemLabel: 'Bus' },
    parking: { itemId: 'parking', itemEmoji: '🅿️', itemLabel: 'Parqueo' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  home: {
    rent: { itemId: 'rent', itemEmoji: '🏠', itemLabel: 'Arriendo' },
    utilities: { itemId: 'utilities', itemEmoji: '💡', itemLabel: 'Servicios' },
    internet: { itemId: 'internet', itemEmoji: '📶', itemLabel: 'Internet' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  household: {
    cleaning: { itemId: 'cleaning', itemEmoji: '🧹', itemLabel: 'Limpieza' },
    supplies: { itemId: 'household-supplies', itemEmoji: '🧴', itemLabel: 'Insumos' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  health: {
    pharmacy: { itemId: 'pharmacy', itemEmoji: '💊', itemLabel: 'Farmacia' },
    doctor: { itemId: 'doctor', itemEmoji: '👨‍⚕️', itemLabel: 'Médico' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  leisure: {
    movies: { itemId: 'movies', itemEmoji: '🎬', itemLabel: 'Cine' },
    games: { itemId: 'games', itemEmoji: '🎮', itemLabel: 'Juegos' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  misc: {
    gift: { itemId: 'gift', itemEmoji: '🎁', itemLabel: 'Regalo' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
  savings: {
    transfer: { itemId: 'savings-transfer', itemEmoji: '💰', itemLabel: 'Ahorro' },
    other: { itemId: 'other', itemEmoji: '➕', itemLabel: 'Otro' },
  },
}

/** IDs de comida del catálogo supermarket (itemId = id del catálogo). */
const FOOD_ITEM_IDS = new Set([
  'cafe', 'arepa', 'huevo', 'queso', 'arroz', 'pollo', 'fideos', 'salsa', 'pescado',
  'banana', 'manzana', 'frutilla', 'sandia', 'limon', 'naranja', 'pina', 'tropical',
  'uvas', 'avena', 'cacao', 'lentejas', 'verdura', 'mani', 'leche', 'pan', 'mayonesa',
  'aguacate', 'aceituna', 'tomate', 'papa', 'patacon', 'miel', 'limonada', 'suero',
  'chorizo', 'salchichon', 'tocino', 'choclo', 'manteca', 'pizza', 'soda', 'cerveza',
  'vino', 'aguardiente', 'helado', 'jugo', 'te', 'aguapanela', 'yogur', 'galletas',
  'empanada', 'almojabana', 'hamburguesa', 'sopa', 'jamon', 'coco', 'platano', 'yuca', 'dulce',
])

const FOOD_EMOJI_LABEL: Record<string, { emoji: string; label: string }> = {
  cafe: { emoji: '☕', label: 'Café' },
  arepa: { emoji: '🫓', label: 'Arepa' },
  huevo: { emoji: '🥚', label: 'Huevo' },
  queso: { emoji: '🧀', label: 'Queso' },
  arroz: { emoji: '🍚', label: 'Arroz' },
  pollo: { emoji: '🍗', label: 'Pollo' },
  fideos: { emoji: '🍝', label: 'Fideos' },
  salsa: { emoji: '🫙', label: 'Salsa tomate' },
  pescado: { emoji: '🐟', label: 'Pescado' },
  banana: { emoji: '🍌', label: 'Banana' },
  manzana: { emoji: '🍎', label: 'Manzana' },
  frutilla: { emoji: '🍓', label: 'Frutilla' },
  sandia: { emoji: '🍉', label: 'Sandía' },
  limon: { emoji: '🍋', label: 'Limón' },
  naranja: { emoji: '🍊', label: 'Naranja' },
  pina: { emoji: '🍍', label: 'Piña' },
  tropical: { emoji: '🥭', label: 'Tropical' },
  uvas: { emoji: '🍇', label: 'Uvas' },
  avena: { emoji: '🥣', label: 'Avena' },
  cacao: { emoji: '🍫', label: 'Cacao' },
  lentejas: { emoji: '🫘', label: 'Lentejas' },
  verdura: { emoji: '🥗', label: 'Verdura' },
  mani: { emoji: '🥜', label: 'Maní' },
  leche: { emoji: '🥛', label: 'Leche' },
  pan: { emoji: '🍞', label: 'Pan' },
  mayonesa: { emoji: '🥫', label: 'Mayonesa' },
  aguacate: { emoji: '🥑', label: 'Aguacate' },
  aceituna: { emoji: '🫒', label: 'Aceitunas' },
  tomate: { emoji: '🍅', label: 'Tomate' },
  papa: { emoji: '🥔', label: 'Papa' },
  patacon: { emoji: '🍌', label: 'Patacón' },
  miel: { emoji: '🍯', label: 'Miel' },
  limonada: { emoji: '🍋', label: 'Limonada' },
  suero: { emoji: '🍋', label: 'Suero cost.' },
  chorizo: { emoji: '🌭', label: 'Chorizo' },
  salchichon: { emoji: '🥩', label: 'Salchichón' },
  tocino: { emoji: '🥓', label: 'Tocino' },
  choclo: { emoji: '🌽', label: 'Choclo' },
  manteca: { emoji: '🧈', label: 'Manteca' },
  pizza: { emoji: '🍕', label: 'Pizza' },
  soda: { emoji: '🥤', label: 'Refresco' },
  cerveza: { emoji: '🍺', label: 'Cerveza' },
  vino: { emoji: '🍷', label: 'Vino' },
  aguardiente: { emoji: '🥃', label: 'Aguardiente' },
  helado: { emoji: '🍦', label: 'Helado' },
  jugo: { emoji: '🧃', label: 'Jugo' },
  te: { emoji: '🍵', label: 'Té' },
  aguapanela: { emoji: '☕', label: 'Aguapanela' },
  yogur: { emoji: '🥛', label: 'Yogur' },
  galletas: { emoji: '🍪', label: 'Galletas' },
  empanada: { emoji: '🥟', label: 'Empanada' },
  almojabana: { emoji: '🥐', label: 'Almojábana' },
  hamburguesa: { emoji: '🍔', label: 'Hamburguesa' },
  sopa: { emoji: '🍲', label: 'Sopa' },
  jamon: { emoji: '🥓', label: 'Jamón' },
  coco: { emoji: '🥥', label: 'Coco' },
  platano: { emoji: '🍌', label: 'Plátano' },
  yuca: { emoji: '🥔', label: 'Yuca' },
  dulce: { emoji: '🍫', label: 'Dulce' },
}

const LEGACY_ID_ALIASES: Record<string, string> = {
  coffee: 'cafe',
  beer: 'cerveza',
  'ice-cream': 'helado',
  eggs: 'huevo',
  milk: 'leche',
  bread: 'pan',
  chicken: 'pollo',
  fruit: 'banana',
  vegetables: 'verdura',
  transfer: 'savings-transfer',
}


export function resolveItemFields(
  categoryId: string,
  itemId?: string,
  itemEmoji?: string,
  itemLabel?: string
): ResolvedItemFields | null {
  if (itemLabel?.trim() && itemEmoji) {
    return {
      itemId: itemId ?? itemLabel.toLowerCase().replace(/\s+/g, '-'),
      itemEmoji,
      itemLabel: itemLabel.trim(),
    }
  }

  if (itemId) {
    const alias = LEGACY_ID_ALIASES[itemId] ?? itemId
    const fromCategory = LEGACY_CATEGORY_ITEMS[categoryId]?.[itemId]
    if (fromCategory) return fromCategory

    if (FOOD_ITEM_IDS.has(alias)) {
      const food = FOOD_EMOJI_LABEL[alias]
      if (food) return { itemId: alias, itemEmoji: food.emoji, itemLabel: food.label }
    }

    for (const items of Object.values(LEGACY_CATEGORY_ITEMS)) {
      const found = items[itemId] ?? items[alias]
      if (found) return found
    }

    if (itemLabel?.trim()) {
      return { itemId: alias, itemEmoji: itemEmoji ?? '💸', itemLabel: itemLabel.trim() }
    }
  }

  const cat = LEGACY_CATEGORY_DISPLAY[categoryId]
  if (cat) {
    return { itemId: categoryId, itemEmoji: cat.emoji, itemLabel: cat.label }
  }

  return null
}

export function itemGroupKey(itemId?: string, itemLabel?: string): string {
  if (itemId) return itemId
  if (itemLabel?.trim()) return itemLabel.trim().toLowerCase()
  return 'unknown'
}
