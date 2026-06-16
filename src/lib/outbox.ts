import { getItemById, LEGACY_CATEGORY_DISPLAY, resolveItemId } from '@/lib/items'

export interface PendingExpense {
  clientId: string
  amount: number
  itemId: string
  itemEmoji: string
  itemLabel: string
  sessionId?: string
  receiptGroupId?: string
  store?: string
  note?: string
  createdAt: number
  scope?: 'shared' | 'personal'
}

export interface PendingReceiptGroup {
  receiptGroupId: string
  store?: string
  items: Array<{
    clientId: string
    itemLabel: string
    itemEmoji?: string
    itemId?: string
    amount: number
  }>
  createdAt: number
  scope?: 'shared' | 'personal'
}

const OUTBOX_KEY = 'gastos-outbox'
const RECEIPT_OUTBOX_KEY = 'gastos-receipt-outbox'
const SESSION_KEY = 'gastos-active-session'

export const OUTBOX_CHANGED = 'gastos-outbox-changed'
export const SESSION_CHANGED = 'gastos-session-changed'

interface LegacyPendingExpense {
  clientId: string
  amount: number
  categoryId?: string
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  sessionId?: string
  receiptGroupId?: string
  store?: string
  note?: string
  createdAt: number
  scope?: 'shared' | 'personal'
}

function migrateLegacyPendingExpense(raw: LegacyPendingExpense): PendingExpense | null {
  if (raw.itemId && raw.itemEmoji && raw.itemLabel) {
    return {
      clientId: raw.clientId,
      amount: raw.amount,
      itemId: resolveItemId(raw.itemId),
      itemEmoji: raw.itemEmoji,
      itemLabel: raw.itemLabel,
      sessionId: raw.sessionId,
      receiptGroupId: raw.receiptGroupId,
      store: raw.store,
      note: raw.note,
      createdAt: raw.createdAt,
      scope: raw.scope,
    }
  }

  if (raw.itemId) {
    const item = getItemById(raw.itemId)
    if (item) {
      return {
        clientId: raw.clientId,
        amount: raw.amount,
        itemId: item.id,
        itemEmoji: item.emoji,
        itemLabel: raw.itemLabel?.trim() || item.label,
        sessionId: raw.sessionId,
        receiptGroupId: raw.receiptGroupId,
        store: raw.store,
        note: raw.note,
        createdAt: raw.createdAt,
        scope: raw.scope,
      }
    }
  }

  if (raw.categoryId) {
    const cat = LEGACY_CATEGORY_DISPLAY[raw.categoryId]
    if (cat) {
      return {
        clientId: raw.clientId,
        amount: raw.amount,
        itemId: raw.categoryId,
        itemEmoji: cat.emoji,
        itemLabel: cat.label,
        sessionId: raw.sessionId,
        receiptGroupId: raw.receiptGroupId,
        store: raw.store,
        note: raw.note,
        createdAt: raw.createdAt,
        scope: raw.scope,
      }
    }
  }

  return null
}

function notifyOutboxChange(): void {
  window.dispatchEvent(new Event(OUTBOX_CHANGED))
}

function notifySessionChange(): void {
  window.dispatchEvent(new Event(SESSION_CHANGED))
}

export interface ActiveSession {
  sessionId: string
  store?: string
  startedAt: number
}

export function loadOutbox(): PendingExpense[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<PendingExpense | (PendingExpense & { categoryId?: string })>
    return parsed
      .map((item) =>
        'itemLabel' in item && item.itemId && item.itemEmoji && item.itemLabel
          ? (item as PendingExpense)
          : migrateLegacyPendingExpense(item as Parameters<typeof migrateLegacyPendingExpense>[0])
      )
      .filter((item): item is PendingExpense => item != null)
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
    scope: expense.scope ?? 'personal',
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
    const parsed = JSON.parse(raw) as Array<
      PendingReceiptGroup | (PendingReceiptGroup & { categoryId?: string })
    >
    return parsed.map((group) => {
      if (!('categoryId' in group) || !group.categoryId) return group as PendingReceiptGroup
      const { categoryId: _removed, ...rest } = group
      return rest as PendingReceiptGroup
    })
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
  store?: string
  items: Array<{ itemLabel: string; amount: number; itemEmoji?: string; itemId?: string }>
  scope?: 'shared' | 'personal'
}): PendingReceiptGroup {
  const receiptGroupId = input.receiptGroupId ?? crypto.randomUUID()
  const createdAt = Date.now()
  const group: PendingReceiptGroup = {
    receiptGroupId,
    store: input.store,
    createdAt,
    scope: input.scope ?? 'personal',
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
