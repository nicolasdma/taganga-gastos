export interface ReceiptItemLike {
  _id: string
  amount: number
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
  scope?: 'shared' | 'personal'
}

export interface ReceiptGroup {
  key: string
  receiptGroupId: string
  store?: string
  total: number
  items: ReceiptItemLike[]
  pending?: boolean
}

export interface SessionGroupLike {
  key: string
  sessionId: string
  store?: string
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

export function receiptGroupTitle(group: Pick<ReceiptGroup, 'store'>) {
  if (group.store) {
    return { emoji: '🛒', title: group.store, subtitle: 'Compra' }
  }
  return { emoji: '🧾', title: 'Ticket', subtitle: undefined }
}
