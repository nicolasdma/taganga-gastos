import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ReceiptGroupRow } from '@/components/ReceiptGroupRow'
import { EmptyCraft } from '@/components/craft/EmptyCraft'
import { formatCOP } from '@/lib/currency'
import { ExpenseDaySectionHeader, ExpenseTimeStamp } from '@/components/ExpenseTimeMeta'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { groupListRowsByDay } from '@/lib/expenseTime'
import { useLocalToday } from '@/hooks/useLocalToday'
import {
  excludedAmountClass,
  excludedBadgeClass,
  excludedLabelClass,
  excludedRowClass,
  isExpenseExcluded,
} from '@/lib/expenseExcluded'
import type { EditableExpense } from '@/lib/expenseTypes'
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

interface RecentExpensesProps {
  limit?: number
  view?: ExpenseView
  onEdit?: (expense: EditableExpense) => void
  onPendingRemoved?: () => void
}

export function RecentExpenses({
  limit = 8,
  view = DEFAULT_EXPENSE_VIEW,
  onEdit,
  onPendingRemoved,
}: RecentExpensesProps) {
  const { todayKey } = useLocalToday()
  const expenses = useQuery(api.expenses.recentExpenses, { limit: limit + 20, view })
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
    }))

    const pendingReceiptRows = pendingReceipts
      .filter((group) => (group.scope ?? DEFAULT_EXPENSE_SCOPE) === view)
      .flatMap(pendingReceiptToListRows)

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
      }))

    const all = [...pendingReceiptRows, ...pendingRows, ...serverRows]
    const rows = groupExpensesForList(all)

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
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (merged.every((section) => section.rows.length === 0)) {
    return (
      <EmptyCraft
        title="Sin gastos aún"
        subtitle="Usá acceso rápido, el + de barro, o escaneá un ticket 🐾"
      />
    )
  }

  return (
    <div className="space-y-1">
      {merged.map((section) => (
        <div key={section.dayKey} className="mb-1">
          <ExpenseDaySectionHeader label={section.label} />
          <div className="expense-rows-nest pl-3.5 space-y-2">
            {section.rows.map((row) => {
              if (row.type === 'receipt') {
                return (
                  <ReceiptGroupRow
                    key={row.group.key}
                    group={row.group}
                    defaultExpanded={false}
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
                    'w-full flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left',
                    'transition-all active:translate-y-px',
                    excluded
                      ? excludedRowClass(true)
                      : 'row-porcelain',
                    expense.pending && 'opacity-70 border-dashed',
                    canEdit && !excluded && 'active:opacity-90',
                    expense.pending && 'active:bg-red-500/5'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{emoji}</span>
                    <div className="min-w-0 flex flex-col gap-1">
                      <span className={cn('text-sm font-semibold truncate', excludedLabelClass(excluded))}>
                        {label}
                      </span>
                      {expense.createdAt != null && (
                        <ExpenseTimeStamp createdAt={expense.createdAt} />
                      )}
                    </div>
                    {excluded && (
                      <span className={excludedBadgeClass()}>
                        No cuenta
                      </span>
                    )}
                    {expense.pending && (
                      <span className="text-[10px] text-amber-600 shrink-0">⏳ tap quitar</span>
                    )}
                  </div>
                  <span className={cn('text-sm font-extrabold font-tabular shrink-0', excludedAmountClass(excluded))}>
                    {formatCOP(expense.amount)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
