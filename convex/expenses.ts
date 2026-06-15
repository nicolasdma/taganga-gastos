import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { QueryCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import { periodRange } from './dates'
import {
  canModifyExpense,
  canViewExpense,
  expenseScope,
  matchesView,
  requireAuthContext,
  type ExpenseScope,
  type ExpenseView,
} from './lib/auth'

const expenseScopeValidator = v.union(v.literal('shared'), v.literal('personal'))
const expenseViewValidator = v.union(v.literal('shared'), v.literal('personal'))

function monthRange(monthKey: string): { start: number; end: number } {
  const [year, month] = monthKey.split('-').map(Number)
  const start = new Date(year, month - 1, 1).getTime()
  const end = new Date(year, month, 1).getTime()
  return { start, end }
}

function dayRange(dateKey: string): { start: number; end: number } {
  const [year, month, day] = dateKey.split('-').map(Number)
  const start = new Date(year, month - 1, day).getTime()
  const end = new Date(year, month - 1, day + 1).getTime()
  return { start, end }
}

function isCounted(e: { excluded?: boolean }) {
  return !e.excluded
}

function sumCounted(expenses: Array<{ amount: number; excluded?: boolean }>) {
  return expenses.filter(isCounted).reduce((sum, e) => sum + e.amount, 0)
}

function resolveScope(scope: ExpenseScope | undefined): ExpenseScope {
  return scope ?? 'personal'
}

async function loadVisibleExpensesInRange(
  ctx: QueryCtx,
  householdId: Id<'households'>,
  userId: Id<'users'>,
  start: number,
  end: number,
  view?: ExpenseView
): Promise<Doc<'expenses'>[]> {
  const expenses = await ctx.db
    .query('expenses')
    .withIndex('by_household_and_createdAt', (q) =>
      q.eq('householdId', householdId).gte('createdAt', start)
    )
    .filter((q) => q.lt(q.field('createdAt'), end))
    .collect()

  return expenses.filter((expense) => {
    if (!canViewExpense(expense, userId, householdId)) return false
    if (view && !matchesView(expense, userId, view)) return false
    return true
  })
}

async function requireOwnedExpense(
  ctx: QueryCtx,
  id: Id<'expenses'>,
  userId: Id<'users'>,
  householdId: Id<'households'>
) {
  const expense = await ctx.db.get(id)
  if (!expense) throw new Error('Expense not found')
  if (!canModifyExpense(expense, userId, householdId)) {
    throw new Error('Unauthorized')
  }
  return expense
}

export const addExpense = mutation({
  args: {
    amount: v.number(),
    categoryId: v.string(),
    itemId: v.optional(v.string()),
    itemEmoji: v.optional(v.string()),
    itemLabel: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    receiptGroupId: v.optional(v.string()),
    store: v.optional(v.string()),
    note: v.optional(v.string()),
    clientId: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    scope: v.optional(expenseScopeValidator),
  },
  returns: v.id('expenses'),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const scope = resolveScope(args.scope)

    if (args.clientId) {
      const existing = await ctx.db
        .query('expenses')
        .withIndex('by_clientId', (q) => q.eq('clientId', args.clientId))
        .first()
      if (existing) {
        if (!canModifyExpense(existing, userId, householdId)) {
          throw new Error('Unauthorized')
        }
        return existing._id
      }
    }

    return await ctx.db.insert('expenses', {
      amount: args.amount,
      categoryId: args.categoryId,
      itemId: args.itemId,
      itemEmoji: args.itemEmoji,
      itemLabel: args.itemLabel,
      sessionId: args.sessionId,
      receiptGroupId: args.receiptGroupId,
      store: args.store,
      note: args.note,
      clientId: args.clientId,
      createdAt: args.createdAt ?? Date.now(),
      householdId,
      scope,
      createdBy: userId,
    })
  },
})

export const setExpenseExcluded = mutation({
  args: {
    id: v.id('expenses'),
    excluded: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    await requireOwnedExpense(ctx, args.id, userId, householdId)
    await ctx.db.patch(args.id, { excluded: args.excluded })
    return null
  },
})

export const updateExpense = mutation({
  args: {
    id: v.id('expenses'),
    amount: v.number(),
    categoryId: v.string(),
    itemId: v.optional(v.string()),
    itemEmoji: v.optional(v.string()),
    itemLabel: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    receiptGroupId: v.optional(v.string()),
    store: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    await requireOwnedExpense(ctx, args.id, userId, householdId)

    const { id, ...fields } = args
    await ctx.db.patch(id, {
      amount: fields.amount,
      categoryId: fields.categoryId,
      itemId: fields.itemId,
      itemEmoji: fields.itemEmoji,
      itemLabel: fields.itemLabel,
      sessionId: fields.sessionId,
      receiptGroupId: fields.receiptGroupId,
      store: fields.store,
      note: fields.note,
    })
    return null
  },
})

export const startSession = mutation({
  args: {
    categoryId: v.string(),
    store: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx) => {
    await requireAuthContext(ctx)
    return crypto.randomUUID()
  },
})

export const closeSession = mutation({
  args: { sessionId: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx) => {
    await requireAuthContext(ctx)
    return { ok: true }
  },
})

const receiptItemArg = v.object({
  amount: v.number(),
  itemLabel: v.string(),
  clientId: v.optional(v.string()),
})

export const addReceiptGroup = mutation({
  args: {
    receiptGroupId: v.string(),
    categoryId: v.string(),
    store: v.optional(v.string()),
    items: v.array(receiptItemArg),
    createdAt: v.optional(v.number()),
    scope: v.optional(expenseScopeValidator),
  },
  returns: v.object({
    ids: v.array(v.id('expenses')),
    receiptGroupId: v.string(),
  }),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const createdAt = args.createdAt ?? Date.now()
    const scope = resolveScope(args.scope)
    const ids: Id<'expenses'>[] = []

    for (const item of args.items) {
      if (item.clientId) {
        const existing = await ctx.db
          .query('expenses')
          .withIndex('by_clientId', (q) => q.eq('clientId', item.clientId))
          .first()
        if (existing) {
          if (!canModifyExpense(existing, userId, householdId)) {
            throw new Error('Unauthorized')
          }
          ids.push(existing._id)
          continue
        }
      }

      const id = await ctx.db.insert('expenses', {
        amount: item.amount,
        categoryId: args.categoryId,
        itemLabel: item.itemLabel,
        receiptGroupId: args.receiptGroupId,
        store: args.store,
        clientId: item.clientId,
        createdAt,
        householdId,
        scope,
        createdBy: userId,
      })
      ids.push(id)
    }

    return { ids, receiptGroupId: args.receiptGroupId }
  },
})

export const excludeReceiptGroup = mutation({
  args: { receiptGroupId: v.string() },
  returns: v.object({ count: v.number() }),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const expenses = await ctx.db
      .query('expenses')
      .withIndex('by_receiptGroupId', (q) => q.eq('receiptGroupId', args.receiptGroupId))
      .collect()

    let count = 0
    for (const expense of expenses) {
      if (!canModifyExpense(expense, userId, householdId)) continue
      await ctx.db.patch(expense._id, { excluded: true })
      count += 1
    }

    return { count }
  },
})

export const recentExpenses = query({
  args: {
    limit: v.number(),
    view: expenseViewValidator,
  },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const since = Date.now() - 120 * 24 * 60 * 60 * 1000

    const expenses = await ctx.db
      .query('expenses')
      .withIndex('by_household_and_createdAt', (q) =>
        q.eq('householdId', householdId).gte('createdAt', since)
      )
      .order('desc')
      .collect()

    return expenses
      .filter(
        (expense) =>
          canViewExpense(expense, userId, householdId) &&
          matchesView(expense, userId, args.view)
      )
      .slice(0, args.limit)
  },
})

export const totals = query({
  args: {
    period: v.union(v.literal('today'), v.literal('week'), v.literal('month')),
    todayKey: v.string(),
    tzOffsetMinutes: v.number(),
    view: v.optional(expenseViewValidator),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const { start, end } = periodRange(args.period, args.todayKey, args.tzOffsetMinutes)
    const expenses = await loadVisibleExpensesInRange(
      ctx,
      householdId,
      userId,
      start,
      end,
      args.view ?? 'personal'
    )
    return sumCounted(expenses)
  },
})

export const expensesByDay = query({
  args: {
    month: v.string(),
    view: v.optional(expenseViewValidator),
  },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const { start, end } = monthRange(args.month)
    const expenses = await loadVisibleExpensesInRange(
      ctx,
      householdId,
      userId,
      start,
      end,
      args.view ?? 'personal'
    )

    const byDay: Record<string, { total: number; categories: Record<string, number> }> = {}

    for (const e of expenses) {
      if (!isCounted(e)) continue
      const d = new Date(e.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!byDay[key]) byDay[key] = { total: 0, categories: {} }
      byDay[key].total += e.amount
      byDay[key].categories[e.categoryId] = (byDay[key].categories[e.categoryId] ?? 0) + e.amount
    }

    return byDay
  },
})

export const expensesForDay = query({
  args: {
    date: v.string(),
    view: v.optional(expenseViewValidator),
  },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const { start, end } = dayRange(args.date)
    const expenses = await loadVisibleExpensesInRange(
      ctx,
      householdId,
      userId,
      start,
      end,
      args.view
    )
    return expenses.sort((a, b) => b.createdAt - a.createdAt)
  },
})

export const expensesByCategory = query({
  args: {
    month: v.string(),
    view: v.optional(expenseViewValidator),
  },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const { start, end } = monthRange(args.month)
    const expenses = await loadVisibleExpensesInRange(
      ctx,
      householdId,
      userId,
      start,
      end,
      args.view ?? 'personal'
    )

    const byCategory: Record<string, number> = {}
    for (const e of expenses) {
      if (!isCounted(e)) continue
      byCategory[e.categoryId] = (byCategory[e.categoryId] ?? 0) + e.amount
    }
    return byCategory
  },
})

export const sessionExpenses = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const expenses = await ctx.db
      .query('expenses')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', args.sessionId))
      .collect()

    return expenses.filter((expense) => canViewExpense(expense, userId, householdId))
  },
})

export const frequentItems = query({
  args: {
    categoryId: v.optional(v.string()),
    excludeCategoryId: v.optional(v.string()),
    limit: v.number(),
    view: v.optional(expenseViewValidator),
  },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const since = Date.now() - 90 * 24 * 60 * 60 * 1000
    let expenses = await ctx.db
      .query('expenses')
      .withIndex('by_household_and_createdAt', (q) =>
        q.eq('householdId', householdId).gte('createdAt', since)
      )
      .collect()

    expenses = expenses.filter(
      (expense) =>
        canViewExpense(expense, userId, householdId) &&
        matchesView(expense, userId, args.view ?? 'personal')
    )

    if (args.categoryId) {
      expenses = expenses.filter((e) => e.categoryId === args.categoryId)
    }
    if (args.excludeCategoryId) {
      expenses = expenses.filter((e) => e.categoryId !== args.excludeCategoryId)
    }

    const counts = new Map<
      string,
      { categoryId: string; itemId: string; itemEmoji?: string; itemLabel?: string; count: number }
    >()

    for (const e of expenses) {
      if (!isCounted(e) || !e.itemId) continue
      const key = `${e.categoryId}:${e.itemId}`
      const existing = counts.get(key)
      if (existing) {
        existing.count += 1
      } else {
        counts.set(key, {
          categoryId: e.categoryId,
          itemId: e.itemId,
          itemEmoji: e.itemEmoji,
          itemLabel: e.itemLabel,
          count: 1,
        })
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, args.limit)
  },
})

const CATEGORY_LABELS: Record<string, string> = {
  home: 'Hogar',
  supermarket: 'Supermercado',
  'eating-out': 'Comer afuera',
  transport: 'Transporte',
  household: 'Limpieza',
  health: 'Salud',
  leisure: 'Ocio',
  misc: 'Varios',
  savings: 'Ahorro',
}

const DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]

function formatCOP(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CO')}`
}

function previousMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const d = new Date(year, month - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function daysElapsedInMonth(monthKey: string, now: number): number {
  const [year, month] = monthKey.split('-').map(Number)
  const currentKey = `${new Date(now).getFullYear()}-${String(new Date(now).getMonth() + 1).padStart(2, '0')}`
  if (monthKey === currentKey) return new Date(now).getDate()
  return new Date(year, month, 0).getDate()
}

function dayKeyFromTs(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function aggregateByCategory(
  expenses: Array<{ amount: number; categoryId: string; excluded?: boolean }>
) {
  const byCategory: Record<string, number> = {}
  for (const e of expenses) {
    if (!isCounted(e)) continue
    byCategory[e.categoryId] = (byCategory[e.categoryId] ?? 0) + e.amount
  }
  return byCategory
}

type InsightCandidate = { text: string; priority: number }

async function loadMonthExpenses(
  ctx: QueryCtx,
  householdId: Id<'households'>,
  userId: Id<'users'>,
  month: string
) {
  const { start, end } = monthRange(month)
  return await loadVisibleExpensesInRange(ctx, householdId, userId, start, end, 'shared')
}

export const insights = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)
    const now = Date.now()
    const expenses = await loadMonthExpenses(ctx, householdId, userId, args.month)
    const counted = expenses.filter(isCounted)
    if (counted.length === 0) return []

    const candidates: InsightCandidate[] = []
    const byCategory = aggregateByCategory(expenses)
    const total = sumCounted(expenses)

    const byItem: Record<string, { label: string; total: number }> = {}
    for (const e of counted) {
      if (!e.itemLabel) continue
      const key = e.itemLabel.toLowerCase()
      if (!byItem[key]) byItem[key] = { label: e.itemLabel, total: 0 }
      byItem[key].total += e.amount
    }

    const topItem = Object.values(byItem).sort((a, b) => b.total - a.total)[0]
    if (topItem && topItem.total >= 30_000) {
      candidates.push({
        text: `Gastaste ${formatCOP(topItem.total)} en ${topItem.label.toLowerCase()} este mes`,
        priority: topItem.total / 1000,
      })
    }

    const supermarket = byCategory['supermarket'] ?? 0
    if (supermarket >= 20_000) {
      const days = daysElapsedInMonth(args.month, now)
      const avg = Math.round(supermarket / days)
      candidates.push({
        text: `Supermercado promedia ${formatCOP(avg)}/día`,
        priority: 55 + avg / 2000,
      })
    }

    const prevKey = previousMonthKey(args.month)
    const prevExpenses = await loadMonthExpenses(ctx, householdId, userId, prevKey)
    if (prevExpenses.length > 0) {
      const prevByCategory = aggregateByCategory(prevExpenses)
      let bestCompare: InsightCandidate | null = null

      for (const [categoryId, currentAmount] of Object.entries(byCategory)) {
        const prevAmount = prevByCategory[categoryId] ?? 0
        if (currentAmount < 10_000) continue

        const diff = currentAmount - prevAmount
        if (Math.abs(diff) < 10_000) continue

        let pct: number
        if (prevAmount === 0) {
          if (currentAmount < 20_000) continue
          pct = 100
        } else {
          pct = Math.round((diff / prevAmount) * 100)
          if (Math.abs(pct) < 15) continue
        }

        const label = CATEGORY_LABELS[categoryId] ?? categoryId
        const verb = diff > 0 ? 'subió' : 'bajó'
        const candidate: InsightCandidate = {
          text: `${label} ${verb} ${Math.abs(pct)}% vs el mes pasado`,
          priority: Math.abs(pct) * 2 + Math.abs(diff) / 5000,
        }
        if (!bestCompare || candidate.priority > bestCompare.priority) {
          bestCompare = candidate
        }
      }

      if (bestCompare) candidates.push(bestCompare)
    }

    const byDay: Record<string, number> = {}
    for (const e of counted) {
      const key = dayKeyFromTs(e.createdAt)
      byDay[key] = (byDay[key] ?? 0) + e.amount
    }

    const uniqueDays = Object.keys(byDay).length
    const priciestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]
    if (uniqueDays > 1 && priciestDay && priciestDay[1] >= 50_000) {
      const [, year, month, day] = priciestDay[0].match(/^(\d+)-(\d+)-(\d+)$/) ?? []
      const date = new Date(Number(year), Number(month) - 1, Number(day))
      const dayName = DAY_NAMES[date.getDay()]
      candidates.push({
        text: `Tu día más caro fue el ${dayName} ${Number(day)} (${formatCOP(priciestDay[1])})`,
        priority: priciestDay[1] / 800,
      })
    }

    const currentMonthKey = `${new Date(now).getFullYear()}-${String(new Date(now).getMonth() + 1).padStart(2, '0')}`
    if (args.month === currentMonthKey) {
      const allRecent = await ctx.db
        .query('expenses')
        .withIndex('by_household_and_createdAt', (q) =>
          q.eq('householdId', householdId).gte('createdAt', now - 120 * 24 * 60 * 60 * 1000)
        )
        .collect()

      const visibleRecent = allRecent.filter(
        (expense) =>
          canViewExpense(expense, userId, householdId) &&
          expenseScope(expense) === 'shared'
      )

      const daysWithExpenses = new Set(visibleRecent.map((e) => dayKeyFromTs(e.createdAt)))
      let streak = 0
      const cursor = new Date(now)
      cursor.setHours(0, 0, 0, 0)

      if (!daysWithExpenses.has(dayKeyFromTs(cursor.getTime()))) {
        cursor.setDate(cursor.getDate() - 1)
      }

      while (daysWithExpenses.has(dayKeyFromTs(cursor.getTime()))) {
        streak += 1
        cursor.setDate(cursor.getDate() - 1)
      }

      if (streak >= 3) {
        candidates.push({
          text: `Llevás ${streak} días seguidos registrando`,
          priority: streak * 12,
        })
      }
    }

    if (total > 0 && candidates.length === 0) {
      const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
      if (topCategory && topCategory[1] >= 10_000) {
        const label = CATEGORY_LABELS[topCategory[0]] ?? topCategory[0]
        const share = Math.round((topCategory[1] / total) * 100)
        candidates.push({
          text: `${label} concentra el ${share}% de tus gastos`,
          priority: share,
        })
      }
    }

    return candidates
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map((c) => c.text)
  },
})
