export interface PendingExpense {
  clientId: string
  amount: number
  categoryId: string
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  sessionId?: string
  receiptGroupId?: string
  store?: string
  note?: string
  createdAt: number
}

export interface PendingReceiptGroup {
  receiptGroupId: string
  categoryId: string
  store?: string
  items: Array<{
    clientId: string
    itemLabel: string
    amount: number
  }>
  createdAt: number
}

const OUTBOX_KEY = 'gastos-outbox'
const RECEIPT_OUTBOX_KEY = 'gastos-receipt-outbox'
const SESSION_KEY = 'gastos-active-session'

export const OUTBOX_CHANGED = 'gastos-outbox-changed'
export const SESSION_CHANGED = 'gastos-session-changed'

function notifyOutboxChange(): void {
  window.dispatchEvent(new Event(OUTBOX_CHANGED))
}

function notifySessionChange(): void {
  window.dispatchEvent(new Event(SESSION_CHANGED))
}

export interface ActiveSession {
  sessionId: string
  categoryId: string
  store?: string
  startedAt: number
}

export function loadOutbox(): PendingExpense[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PendingExpense[]
  } catch {
    return []
  }
}

export function saveOutbox(items: PendingExpense[]): void {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items))
  notifyOutboxChange()
}

export function enqueueExpense(expense: Omit<PendingExpense, 'clientId' | 'createdAt'> & { clientId?: string }): PendingExpense {
  const pending: PendingExpense = {
    ...expense,
    clientId: expense.clientId ?? crypto.randomUUID(),
    createdAt: Date.now(),
  }
  const outbox = loadOutbox()
  outbox.push(pending)
  saveOutbox(outbox)
  return pending
}

export function removeFromOutbox(clientId: string): void {
  saveOutbox(loadOutbox().filter((e) => e.clientId !== clientId))
}

export function loadReceiptOutbox(): PendingReceiptGroup[] {
  try {
    const raw = localStorage.getItem(RECEIPT_OUTBOX_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PendingReceiptGroup[]
  } catch {
    return []
  }
}

function saveReceiptOutbox(groups: PendingReceiptGroup[]): void {
  localStorage.setItem(RECEIPT_OUTBOX_KEY, JSON.stringify(groups))
  notifyOutboxChange()
}

export function enqueueReceiptGroup(input: {
  receiptGroupId?: string
  categoryId: string
  store?: string
  items: Array<{ itemLabel: string; amount: number }>
}): PendingReceiptGroup {
  const receiptGroupId = input.receiptGroupId ?? crypto.randomUUID()
  const createdAt = Date.now()
  const group: PendingReceiptGroup = {
    receiptGroupId,
    categoryId: input.categoryId,
    store: input.store,
    createdAt,
    items: input.items.map((item) => ({
      ...item,
      clientId: crypto.randomUUID(),
    })),
  }
  const outbox = loadReceiptOutbox()
  outbox.push(group)
  saveReceiptOutbox(outbox)
  return group
}

export function removeReceiptGroupFromOutbox(receiptGroupId: string): void {
  saveReceiptOutbox(loadReceiptOutbox().filter((g) => g.receiptGroupId !== receiptGroupId))
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ActiveSession
  } catch {
    return null
  }
}

export function saveActiveSession(session: ActiveSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  notifySessionChange()
}
