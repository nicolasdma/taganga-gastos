import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ReceiptGroupRow } from '@/components/ReceiptGroupRow'
import { CraftLoading } from '@/components/craft/CraftLoading'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { formatCOP } from '@/lib/currency'
import { ExpenseDaySectionHeader, ExpenseTimeStamp } from '@/components/ExpenseTimeMeta'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { groupListRowsByDay, listRowCreatedAt } from '@/lib/expenseTime'
import { useLocalToday } from '@/hooks/useLocalToday'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import {
  excludedAmountClass,
  excludedLabelClass,
  isExpenseExcluded,
} from '@/lib/expenseExcluded'
import type { EditableExpense } from '@/lib/expenseTypes'

export type { EditableExpense }
import { groupExpensesForList, type ReceiptItemLike } from '@/lib/receiptGroups'
import {
  loadOutbox,
  loadReceiptOutbox,
  OUTBOX_CHANGED,
  removeFromOutbox,
  removeReceiptGroupFromOutbox,
} from '@/lib/outbox'
import { pendingReceiptToListRows } from '@/hooks/useReceiptSave'
import { cn } from '@/lib/utils'

import type { ExpenseView } from '@/lib/expenseScope'
import { DEFAULT_EXPENSE_SCOPE, DEFAULT_EXPENSE_VIEW } from '@/lib/expenseScope'

import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'

interface RecentExpensesProps {
  limit?: number
  view?: ExpenseView
  panelRole?: ExpenseViewPanelRole
  onEdit?: (expense: EditableExpense) => void
  onPendingRemoved?: () => void
}

function scopeLabel(scope?: 'shared' | 'personal'): string {
  return scope === 'personal' ? 'Míos' : 'Nosotros'
}

export function RecentExpenses({
  limit = 8,
  view = DEFAULT_EXPENSE_VIEW,
  panelRole = 'active',
  onEdit,
  onPendingRemoved,
}: RecentExpensesProps) {
  const { todayKey } = useLocalToday()
  const expensesLive = useQuery(api.expenses.recentExpenses, { limit: limit + 20, view })
  const { value: expenses, isStale, isInitialLoad } = useStaleWhileLoading(expensesLive, view)
  const [outboxTick, setOutboxTick] = useState(0)

  useEffect(() => {
    const update = () => setOutboxTick((t) => t + 1)
    window.addEventListener(OUTBOX_CHANGED, update)
    return () => window.removeEventListener(OUTBOX_CHANGED, update)
  }, [])

  const pending = useMemo(() => {
    void outboxTick
    return loadOutbox()
  }, [outboxTick])

  const pendingReceipts = useMemo(() => {
    void outboxTick
    return loadReceiptOutbox()
  }, [outboxTick])

  const pendingClientIds = new Set(pending.map((p) => p.clientId))

  const merged = useMemo(() => {
    if (!expenses) return null

    const pendingRows: ReceiptItemLike[] = pending
      .filter((p) => (p.scope ?? DEFAULT_EXPENSE_SCOPE) === view)
      .map((p) => ({
        _id: p.clientId,
        amount: p.amount,
        itemId: p.itemId,
        itemEmoji: p.itemEmoji,
        itemLabel: p.itemLabel,
        sessionId: p.sessionId,
        receiptGroupId: p.receiptGroupId,
        store: p.store,
        note: p.note,
        createdAt: p.createdAt,
        excluded: false,
        pending: true,
        scope: p.scope ?? DEFAULT_EXPENSE_SCOPE,
      }))

    const pendingReceiptRows = pendingReceipts
      .filter((group) => (group.scope ?? DEFAULT_EXPENSE_SCOPE) === view)
      .flatMap((group) =>
        pendingReceiptToListRows(group).map((row) => ({
          ...row,
          scope: group.scope ?? DEFAULT_EXPENSE_SCOPE,
        }))
      )

    const serverRows: ReceiptItemLike[] = expenses
      .filter((e) => !e.clientId || !pendingClientIds.has(e.clientId))
      .map((e) => ({
        _id: e._id,
        amount: e.amount,
        itemId: e.itemId,
        itemEmoji: e.itemEmoji,
        itemLabel: e.itemLabel,
        sessionId: e.sessionId,
        receiptGroupId: e.receiptGroupId,
        store: e.store,
        note: e.note,
        createdAt: e.createdAt,
        excluded: e.excluded,
        pending: false,
        scope: e.scope ?? 'shared',
      }))

    const all = [...pendingReceiptRows, ...pendingRows, ...serverRows]
    const rows = groupExpensesForList(all).sort(
      (a, b) => (listRowCreatedAt(b) ?? 0) - (listRowCreatedAt(a) ?? 0)
    )

    return groupListRowsByDay(rows.slice(0, limit), todayKey)
  }, [expenses, pending, pendingReceipts, pendingClientIds, limit, todayKey, view])

  const handlePendingDelete = (clientId: string) => {
    if (!window.confirm('¿Quitar este gasto pendiente de sincronización?')) return
    removeFromOutbox(clientId)
    onPendingRemoved?.()
  }

  const handlePendingReceiptDelete = (receiptGroupId: string) => {
    removeReceiptGroupFromOutbox(receiptGroupId)
    onPendingRemoved?.()
  }

  if (!merged) {
    if (!isInitialLoad) return null
    return (
      <div className="space-y-2" aria-busy="true" aria-live="polite">
        <CraftLoading variant="skeleton-row" count={3} />
      </div>
    )
  }

  const dimStale = isStale && panelRole === 'incoming'

  if (merged.every((section) => section.rows.length === 0)) {
    return (
      <div className={cn(dimStale && 'expense-view-stale')}>
        <EmptyCraft
          title="Sin gastos aún"
          subtitle="Usá acceso rápido, el + de barro, o escaneá un ticket 🐾"
        />
      </div>
    )
  }

  return (
    <div className={cn('recent-expenses-paper', dimStale && 'expense-view-stale')}>
      {merged.map((section) => (
        <div key={section.dayKey} className="recent-expenses-section">
          <ExpenseDaySectionHeader label={section.label} className="recent-expenses-day" />
          <div className="recent-expense-rows">
            {section.rows.map((row) => {
              if (row.type === 'receipt') {
                return (
                  <ReceiptGroupRow
                    key={row.group.key}
                    group={row.group}
                    defaultExpanded={false}
                    variant="recent"
                    onEditExpense={(expense) => onEdit?.(expense)}
                    onPendingDelete={handlePendingReceiptDelete}
                  />
                )
              }

              if (row.type === 'session') {
                return (
                  <ReceiptGroupRow
                    key={row.group.key}
                    group={{
                      ...row.group,
                      receiptGroupId: row.group.sessionId,
                    }}
                    defaultExpanded={false}
                    variant="recent"
                    onEditExpense={(expense) => onEdit?.(expense)}
                  />
                )
              }

              const expense = row.expense
              const { emoji, label } = formatExpenseLabel(expense)
              const excluded = isExpenseExcluded(expense.excluded)
              const canEdit = !expense.pending && onEdit

              return (
                <button
                  key={expense._id}
                  type="button"
                  disabled={!canEdit && !expense.pending}
                  onClick={() => {
                    if (expense.pending) {
                      handlePendingDelete(expense._id)
                      return
                    }
                    onEdit?.({
                      _id: expense._id as EditableExpense['_id'],
                      amount: expense.amount,
                      itemId: expense.itemId,
                      itemEmoji: expense.itemEmoji,
                      itemLabel: expense.itemLabel,
                      sessionId: expense.sessionId,
                      store: expense.store,
                      excluded: expense.excluded,
                    })
                  }}
                  className={cn(
                    'recent-expense-row',
                    excluded && 'recent-expense-row--excluded',
                    expense.pending && 'recent-expense-row--pending',
                    canEdit && !excluded && 'active:opacity-90',
                    expense.pending && 'active:bg-red-500/5'
                  )}
                >
                  <span className="recent-expense-row__icon" aria-hidden>
                    {emoji}
                  </span>

                  <div className="recent-expense-row__copy">
                    <span className={cn('recent-expense-row__title', excludedLabelClass(excluded))}>
                      {label}
                    </span>
                    <span className="recent-expense-row__meta">
                      {expense.createdAt != null && (
                        <ExpenseTimeStamp createdAt={expense.createdAt} />
                      )}
                      <span aria-hidden>·</span>
                      <span>{scopeLabel(expense.scope)}</span>
                    </span>
                  </div>

                  <div className="recent-expense-row__trail">
                    {excluded && (
                      <span className="recent-expense-row__badge">
                        No cuenta
                      </span>
                    )}
                    {expense.pending && (
                      <span className="recent-expense-row__pending">⏳ tap quitar</span>
                    )}
                    <span className={cn('recent-expense-row__amount', excludedAmountClass(excluded))}>
                      {formatCOP(expense.amount)}
                    </span>
                    <span className="recent-expense-row__chevron" aria-hidden>
                      ›
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
