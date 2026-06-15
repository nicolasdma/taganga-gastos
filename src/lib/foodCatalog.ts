export interface FoodItem {
  id: string
  emoji: string
  label: string
  keywords: string[]
}

type CatalogLike = Pick<FoodItem, 'id' | 'emoji' | 'label'>

/** Catálogo compartido con calendario (comidas típicas). */
export const FOOD_CATALOG: FoodItem[] = [
  { id: 'cafe', emoji: '☕', label: 'Café', keywords: ['café', 'cafe', 'café negro'] },
  { id: 'arepa', emoji: '🫓', label: 'Arepa', keywords: ['arepa'] },
  { id: 'huevo', emoji: '🥚', label: 'Huevo', keywords: ['huevo', 'huevos', 'huevo hervido', 'huevos duros'] },
  { id: 'queso', emoji: '🧀', label: 'Queso', keywords: ['queso', 'queso costeño', 'queso costeno', 'queso crema', 'crema'] },
  { id: 'arroz', emoji: '🍚', label: 'Arroz', keywords: ['arroz', 'arroz blanco', 'arroz de coco', 'arroz con'] },
  {
    id: 'pollo',
    emoji: '🍗',
    label: 'Pollo',
    keywords: ['pollo', 'pechuga', 'tacos pollo', 'fideos con pollo', 'fideos pollo', 'pollo fideos'],
  },
  {
    id: 'fideos',
    emoji: '🍝',
    label: 'Fideos',
    keywords: ['fideos', 'pasta', 'espagueti', 'espaguetti', 'spaghetti', 'fideos con salsa'],
  },
  {
    id: 'salsa',
    emoji: '🫙',
    label: 'Salsa tomate',
    keywords: ['salsa de tomate', 'salsa tomate', 'pomarola', 'salsa para pasta'],
  },
  { id: 'pescado', emoji: '🐟', label: 'Pescado', keywords: ['pescado', 'sardina', 'sierra', 'cojinua', 'pescado frito'] },
  { id: 'banana', emoji: '🍌', label: 'Banana', keywords: ['banana', 'banana split'] },
  { id: 'manzana', emoji: '🍎', label: 'Manzana', keywords: ['manzana'] },
  { id: 'tropical', emoji: '🥭', label: 'Tropical', keywords: ['papaya', 'mango', 'manguito', 'jugo papaya', 'licuado banana'] },
  { id: 'uvas', emoji: '🍇', label: 'Uvas', keywords: ['uva', 'uvas'] },
  { id: 'avena', emoji: '🥣', label: 'Avena', keywords: ['avena', 'avena cacao', 'avena con cacao', 'avena miel', 'avena con miel'] },
  { id: 'cacao', emoji: '🍫', label: 'Cacao', keywords: ['cacao', 'cacao en polvo', 'cacao amargo', 'chocolate amargo'] },
  { id: 'lentejas', emoji: '🫘', label: 'Lentejas', keywords: ['lentejas'] },
  { id: 'verdura', emoji: '🥗', label: 'Verdura', keywords: ['ensalada', 'verdura', 'verduras', 'champiñon', 'champiñones', 'cebolla'] },
  { id: 'mani', emoji: '🥜', label: 'Maní', keywords: ['maní', 'mani', 'mantequilla de maní', 'pasas', 'maní con pasas'] },
  { id: 'leche', emoji: '🥛', label: 'Leche', keywords: ['leche', 'licuado', 'café con leche'] },
  {
    id: 'pan',
    emoji: '🍞',
    label: 'Pan',
    keywords: ['pan', 'masa madre', 'sandwich', 'sándwich', 'tacos', 'pan con queso', 'pan queso'],
  },
  { id: 'mayonesa', emoji: '🥫', label: 'Mayonesa', keywords: ['mayonesa', 'mayo', 'pan con mayonesa', 'pan mayo'] },
  { id: 'aguacate', emoji: '🥑', label: 'Aguacate', keywords: ['aguacate'] },
  { id: 'aceituna', emoji: '🫒', label: 'Aceitunas', keywords: ['aceituna', 'aceitunas'] },
  { id: 'tomate', emoji: '🍅', label: 'Tomate', keywords: ['tomate', 'tomates cherry'] },
  { id: 'papa', emoji: '🥔', label: 'Papa', keywords: ['papa', 'bolas de papa', 'bolas de papa chicas'] },
  { id: 'patacon', emoji: '🍌', label: 'Patacón', keywords: ['patacón', 'patacon'] },
  { id: 'miel', emoji: '🍯', label: 'Miel', keywords: ['miel'] },
  { id: 'limonada', emoji: '🍋', label: 'Limonada', keywords: ['limonada'] },
  { id: 'suero', emoji: '🍋', label: 'Suero cost.', keywords: ['suero', 'suero costeño', 'suero costeno', 'salsa agria'] },
  { id: 'chorizo', emoji: '🌭', label: 'Chorizo', keywords: ['chorizo'] },
  { id: 'salchichon', emoji: '🥩', label: 'Salchichón', keywords: ['salchichon', 'salchichón', 'salchichón ahumado'] },
  { id: 'tocino', emoji: '🥓', label: 'Tocino', keywords: ['tocino', 'bacon', 'beicon'] },
  { id: 'choclo', emoji: '🌽', label: 'Choclo', keywords: ['choclo', 'maiz', 'maíz', 'mazorca', 'elote'] },
  { id: 'manteca', emoji: '🧈', label: 'Manteca', keywords: ['manteca', 'mantequilla'] },
  { id: 'pizza', emoji: '🍕', label: 'Pizza', keywords: ['pizza', 'porciones pizza'] },
  { id: 'soda', emoji: '🥤', label: 'Refresco', keywords: ['coca cola', 'coca-cola', 'refresco', 'vasos coca', 'vaso coca'] },
  { id: 'dulce', emoji: '🍪', label: 'Dulce', keywords: ['oreo', 'snickers', 'helado', 'paleta', 'churro', 'postre', 'barra snickers', 'helado de agua'] },
]

export const SUPERMARKET_EXTRAS: CatalogLike[] = [
  { id: 'meat', emoji: '🥩', label: 'Carne' },
  { id: 'supplies', emoji: '🧻', label: 'Aseo' },
  { id: 'water', emoji: '💧', label: 'Agua' },
  { id: 'other', emoji: '➕', label: 'Otro' },
]

/** Ítems destacados en la fila rápida del home (además del catálogo completo). */
export const FOOD_QUICK_PICKS: CatalogLike[] = [
  { id: 'huevo', emoji: '🥚', label: 'Huevo' },
  { id: 'leche', emoji: '🥛', label: 'Leche' },
  { id: 'pan', emoji: '🍞', label: 'Pan' },
  { id: 'pollo', emoji: '🍗', label: 'Pollo' },
  { id: 'pescado', emoji: '🐟', label: 'Pescado' },
  { id: 'soda', emoji: '🥤', label: 'Refresco' },
  { id: 'arroz', emoji: '🍚', label: 'Arroz' },
  { id: 'cafe', emoji: '☕', label: 'Café' },
]

const LEGACY_ITEM_IDS: Record<string, string> = {
  eggs: 'huevo',
  milk: 'leche',
  bread: 'pan',
  chicken: 'pollo',
  fruit: 'banana',
  vegetables: 'verdura',
}

export function getFoodById(id: string): FoodItem | undefined {
  const resolved = LEGACY_ITEM_IDS[id] ?? id
  return FOOD_CATALOG.find((f) => f.id === resolved)
}

export function formatItemDetail(detail: string): string {
  const trimmed = detail.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
