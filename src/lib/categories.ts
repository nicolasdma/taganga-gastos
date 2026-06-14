export interface CatalogItem {
  id: string
  emoji: string
  label: string
}

export interface Category {
  id: string
  emoji: string
  label: string
}

export interface QuickExpense {
  id: string
  emoji: string
  label: string
  categoryId: string
  itemId: string
  itemLabel: string
}

export const CATEGORIES: Category[] = [
  { id: 'home', emoji: '🏠', label: 'Hogar' },
  { id: 'supermarket', emoji: '🛒', label: 'Super' },
  { id: 'eating-out', emoji: '🍽️', label: 'Comer afuera' },
  { id: 'transport', emoji: '🏍️', label: 'Transporte' },
  { id: 'household', emoji: '🧴', label: 'Limpieza' },
  { id: 'health', emoji: '🏥', label: 'Salud' },
  { id: 'leisure', emoji: '🎉', label: 'Ocio' },
  { id: 'misc', emoji: '📦', label: 'Varios' },
  { id: 'savings', emoji: '💰', label: 'Ahorro' },
]

export const QUICK_EXPENSES: QuickExpense[] = [
  { id: 'coffee', emoji: '☕', label: 'Café', categoryId: 'eating-out', itemId: 'coffee', itemLabel: 'Café' },
  { id: 'beer', emoji: '🍺', label: 'Cerveza', categoryId: 'eating-out', itemId: 'beer', itemLabel: 'Cerveza' },
  { id: 'ice-cream', emoji: '🍦', label: 'Helado', categoryId: 'eating-out', itemId: 'ice-cream', itemLabel: 'Helado' },
  { id: 'bakery', emoji: '🥐', label: 'Panadería', categoryId: 'eating-out', itemId: 'bakery', itemLabel: 'Panadería' },
  { id: 'drink', emoji: '🥤', label: 'Bebida', categoryId: 'eating-out', itemId: 'drink', itemLabel: 'Bebida' },
  { id: 'gasoline', emoji: '🛵', label: 'Gasolina', categoryId: 'transport', itemId: 'gasoline', itemLabel: 'Gasolina' },
  { id: 'taxi', emoji: '🚕', label: 'Taxi', categoryId: 'transport', itemId: 'taxi', itemLabel: 'Taxi' },
  { id: 'delivery', emoji: '🍕', label: 'Domicilio', categoryId: 'eating-out', itemId: 'delivery', itemLabel: 'Domicilio' },
]

export const CATEGORY_ITEMS: Record<string, CatalogItem[]> = {
  supermarket: [
    { id: 'eggs', emoji: '🥚', label: 'Huevos' },
    { id: 'milk', emoji: '🥛', label: 'Leche' },
    { id: 'bread', emoji: '🍞', label: 'Pan' },
    { id: 'chicken', emoji: '🍗', label: 'Pollo' },
    { id: 'meat', emoji: '🥩', label: 'Carne' },
    { id: 'fruit', emoji: '🍌', label: 'Fruta' },
    { id: 'vegetables', emoji: '🥬', label: 'Verduras' },
    { id: 'water', emoji: '💧', label: 'Agua' },
    { id: 'supplies', emoji: '🧻', label: 'Aseo' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  'eating-out': [
    { id: 'coffee', emoji: '☕', label: 'Café' },
    { id: 'beer', emoji: '🍺', label: 'Cerveza' },
    { id: 'lunch', emoji: '🍽️', label: 'Almuerzo' },
    { id: 'dinner', emoji: '🌙', label: 'Cena' },
    { id: 'delivery', emoji: '🍕', label: 'Domicilio' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  transport: [
    { id: 'gasoline', emoji: '🛵', label: 'Gasolina' },
    { id: 'taxi', emoji: '🚕', label: 'Taxi' },
    { id: 'bus', emoji: '🚌', label: 'Bus' },
    { id: 'parking', emoji: '🅿️', label: 'Parqueo' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  home: [
    { id: 'rent', emoji: '🏠', label: 'Arriendo' },
    { id: 'utilities', emoji: '💡', label: 'Servicios' },
    { id: 'internet', emoji: '📶', label: 'Internet' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  household: [
    { id: 'cleaning', emoji: '🧹', label: 'Limpieza' },
    { id: 'supplies', emoji: '🧴', label: 'Insumos' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  health: [
    { id: 'pharmacy', emoji: '💊', label: 'Farmacia' },
    { id: 'doctor', emoji: '👨‍⚕️', label: 'Médico' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  leisure: [
    { id: 'movies', emoji: '🎬', label: 'Cine' },
    { id: 'games', emoji: '🎮', label: 'Juegos' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  misc: [
    { id: 'gift', emoji: '🎁', label: 'Regalo' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
  savings: [
    { id: 'transfer', emoji: '💰', label: 'Ahorro' },
    { id: 'other', emoji: '➕', label: 'Otro' },
  ],
}

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function getCategoryItems(categoryId: string): CatalogItem[] {
  return CATEGORY_ITEMS[categoryId] ?? [{ id: 'other', emoji: '➕', label: 'Otro' }]
}

export function getItem(categoryId: string, itemId: string): CatalogItem | undefined {
  return getCategoryItems(categoryId).find((i) => i.id === itemId)
}
