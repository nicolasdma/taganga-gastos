import { getCategory } from '@/lib/categories'

export interface ReceiptItemLike {
  _id: string
  amount: number
  categoryId: string
  itemId?: string
  itemLabel?: string
  itemEmoji?: string
  sessionId?: string
  store?: string
  note?: string
  receiptGroupId?: string
  excluded?: boolean
  pending?: boolean
  createdAt?: number
}

export interface ReceiptGroup {
  key: string
  receiptGroupId: string
  store?: string
  categoryId: string
  total: number
  items: ReceiptItemLike[]
  pending?: boolean
}

export interface SessionGroupLike {
  key: string
  sessionId: string
  store?: string
  categoryId: string
  total: number
  items: ReceiptItemLike[]
}

export type ExpenseListRow =
  | { type: 'standalone'; expense: ReceiptItemLike }
  | { type: 'session'; group: SessionGroupLike }
  | { type: 'receipt'; group: ReceiptGroup }

function countedTotal(items: Array<{ amount: number; excluded?: boolean }>) {
  return items.filter((e) => !e.excluded).reduce((s, e) => s + e.amount, 0)
}

export function groupExpensesForList(expenses: ReceiptItemLike[]): ExpenseListRow[] {
  const sessionMap = new Map<string, SessionGroupLike>()
  const receiptMap = new Map<string, ReceiptGroup>()
  const standalone: ReceiptItemLike[] = []

  for (const expense of expenses) {
    if (expense.receiptGroupId) {
      const key = expense.receiptGroupId
      const existing = receiptMap.get(key)
      if (existing) {
        existing.items.push(expense)
      } else {
        receiptMap.set(key, {
          key,
          receiptGroupId: expense.receiptGroupId,
          store: expense.store,
          categoryId: expense.categoryId,
          total: 0,
          items: [expense],
          pending: expense.pending,
        })
      }
    } else if (expense.sessionId) {
      const key = expense.sessionId
      const existing = sessionMap.get(key)
      if (existing) {
        existing.items.push(expense)
      } else {
        sessionMap.set(key, {
          key,
          sessionId: expense.sessionId,
          store: expense.store,
          categoryId: expense.categoryId,
          total: 0,
          items: [expense],
        })
      }
    } else {
      standalone.push(expense)
    }
  }

  const sessions = Array.from(sessionMap.values()).map((g) => ({
    ...g,
    total: countedTotal(g.items),
  }))

  const receipts = Array.from(receiptMap.values()).map((g) => ({
    ...g,
    total: countedTotal(g.items),
    pending: g.items.some((i) => i.pending),
  }))

  const rows: ExpenseListRow[] = [
    ...receipts.map((g) => ({ type: 'receipt' as const, group: g })),
    ...sessions.map((g) => ({ type: 'session' as const, group: g })),
    ...standalone.map((e) => ({ type: 'standalone' as const, expense: e })),
  ]

  return rows
}

const SUPERMARKET_HINTS = [
  'olimpica',
  'olímpica',
  'exito',
  'éxito',
  'carulla',
  'd1',
  'ara',
  'makro',
  'jumbo',
  'surtimax',
  'justo',
  'euro',
  'metro',
  'carnicer',
  'panader',
]

const RESTAURANT_HINTS = [
  'restaur',
  'cafe',
  'café',
  'juan valdez',
  'starbucks',
  'mcdonald',
  'domino',
  'kfc',
  'subway',
  'burger',
  'pizza',
  'sushi',
  'bar ',
]

export function inferCategoryFromStore(store?: string): string | undefined {
  if (!store) return undefined
  const s = store.toLowerCase()

  if (SUPERMARKET_HINTS.some((h) => s.includes(h))) return 'supermarket'
  if (RESTAURANT_HINTS.some((h) => s.includes(h))) return 'eating-out'

  return undefined
}

export function receiptGroupTitle(group: Pick<ReceiptGroup, 'store' | 'categoryId'>) {
  if (group.store) {
    const cat = getCategory(group.categoryId)
    return { emoji: cat?.emoji ?? '🧾', title: group.store, subtitle: cat?.label }
  }
  const cat = getCategory(group.categoryId)
  return { emoji: cat?.emoji ?? '🧾', title: cat?.label ?? 'Ticket', subtitle: undefined }
}
