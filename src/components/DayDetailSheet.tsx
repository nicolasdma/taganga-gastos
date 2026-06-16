import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'
import { BottomSheet } from '@/components/BottomSheet'
import { CraftLoading } from '@/components/craft/CraftLoading'
import { ReceiptGroupRow } from '@/components/ReceiptGroupRow'
import { formatCOP } from '@/lib/currency'
import { ExpenseTimeOfDaySectionHeader, ExpenseTimeStamp } from '@/components/ExpenseTimeMeta'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { groupListRowsByTimeOfDay } from '@/lib/expenseTime'
import {
  excludedAmountClass,
  excludedBadgeClass,
  excludedLabelClass,
  excludedRowClass,
  isExpenseExcluded,
} from '@/lib/expenseExcluded'
import type { EditableExpense } from '@/components/ExpenseEditSheet'
import { groupExpensesForList, type ReceiptItemLike } from '@/lib/receiptGroups'
import { formatDisplayDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

import type { ExpenseView } from '@/lib/expenseScope'

interface DayDetailSheetProps {
  date: string | null
  view: ExpenseView
  onClose: () => void
  onEditExpense: (expense: EditableExpense) => void
}

type Expense = Doc<'expenses'>


function countedTotal(items: Array<{ amount: number; excluded?: boolean }>) {
  return items.filter((e) => !e.excluded).reduce((s, e) => s + e.amount, 0)
}

function toListItem(expense: Expense): ReceiptItemLike {
  return {
    _id: expense._id,
    amount: expense.amount,
    itemId: expense.itemId,
    itemEmoji: expense.itemEmoji,
    itemLabel: expense.itemLabel,
    sessionId: expense.sessionId,
    receiptGroupId: expense.receiptGroupId,
    store: expense.store,
    note: expense.note,
    excluded: expense.excluded,
    createdAt: expense.createdAt,
  }
}

function sessionGroupToReceiptGroup(group: Extract<ReturnType<typeof groupExpensesForList>[number], { type: 'session' }>['group']) {
  return {
    key: group.key,
    receiptGroupId: group.sessionId,
    store: group.store,
    total: group.total,
    items: group.items,
  }
}

function StandaloneRow({
  expense,
  onEditExpense,
}: {
  expense: ReceiptItemLike
  onEditExpense: (expense: EditableExpense) => void
}) {
  const { emoji, label } = formatExpenseLabel(expense)
  const excluded = isExpenseExcluded(expense.excluded)

  return (
    <button
      type="button"
      onClick={() =>
        onEditExpense({
          _id: expense._id as EditableExpense['_id'],
          amount: expense.amount,
          itemId: expense.itemId,
          itemEmoji: expense.itemEmoji,
          itemLabel: expense.itemLabel,
          sessionId: expense.sessionId,
          store: expense.store,
          excluded: expense.excluded,
        })
      }
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 shadow-sm text-left active:opacity-90',
        excluded ? excludedRowClass(true) : 'bg-card border-border/60 active:bg-muted/30'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl shrink-0">{emoji}</span>
        <div className="min-w-0">
          <span className={cn('text-sm font-semibold truncate block', excludedLabelClass(excluded))}>
            {label}
          </span>
          {expense.createdAt != null && (
            <ExpenseTimeStamp createdAt={expense.createdAt} />
          )}
        </div>
        {excluded && (
          <span className={excludedBadgeClass()}>No cuenta</span>
        )}
      </div>
      <span className={cn('text-sm font-extrabold font-tabular shrink-0', excludedAmountClass(excluded))}>
        {formatCOP(expense.amount)}
      </span>
    </button>
  )
}

export function DayDetailSheet({ date, view, onClose, onEditExpense }: DayDetailSheetProps) {
  const expenses = useQuery(
    api.expenses.expensesForDay,
    date ? { date, view } : 'skip'
  )

  const dayTotal = useMemo(
    () => (expenses ? countedTotal(expenses) : 0),
    [expenses]
  )

  const rows = useMemo(
    () => (expenses ? groupExpensesForList(expenses.map(toListItem)) : []),
    [expenses]
  )

  const timeSections = useMemo(
    () => groupListRowsByTimeOfDay(rows),
    [rows]
  )

  return (
    <BottomSheet
      open={!!date}
      onClose={onClose}
      height="tall"
      title={date ? formatDisplayDate(date) : undefined}
      subtitle={
        date
          ? expenses === undefined
            ? '—'
            : formatCOP(dayTotal)
          : undefined
      }
      headerAction="cancel"
      scrollKey={date ?? 'closed'}
    >
      {date && (
        <div className="pb-4">
          {expenses === undefined ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              <CraftLoading variant="skeleton-row" count={3} />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Sin gastos este día
            </p>
          ) : (
            <div className="space-y-2">
              {timeSections.map((section) => (
                <div key={section.bucket}>
                  <ExpenseTimeOfDaySectionHeader
                    label={section.label}
                    emoji={section.emoji}
                    accent={section.accent}
                  />
                  <div className="expense-rows-nest pl-3.5 space-y-2">
                    {section.rows.map((row) => {
                      if (row.type === 'receipt') {
                        return (
                          <ReceiptGroupRow
                            key={row.group.key}
                            group={row.group}
                            defaultExpanded
                            onEditExpense={onEditExpense}
                          />
                        )
                      }
                      if (row.type === 'session') {
                        return (
                          <ReceiptGroupRow
                            key={row.group.key}
                            group={sessionGroupToReceiptGroup(row.group)}
                            defaultExpanded
                            onEditExpense={(expense) => {
                              const original = row.group.items.find((i) => i._id === expense._id)
                              if (original?.sessionId) {
                                onEditExpense({ ...expense, sessionId: original.sessionId })
                              } else {
                                onEditExpense(expense)
                              }
                            }}
                          />
                        )
                      }
                      return (
                        <StandaloneRow
                          key={row.expense._id}
                          expense={row.expense}
                          onEditExpense={onEditExpense}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  )
}
