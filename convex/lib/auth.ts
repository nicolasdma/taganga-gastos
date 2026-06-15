import { getAuthUserId } from '@convex-dev/auth/server'
import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server'
import type { DataModel, Doc, Id } from '../_generated/dataModel'

type Ctx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>

export type ExpenseScope = 'shared' | 'personal'
export type ExpenseView = 'shared' | 'personal'

export async function requireUserId(ctx: Ctx): Promise<Id<'users'>> {
  const userId = await getAuthUserId(ctx)
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function requireMembership(ctx: Ctx, userId: Id<'users'>) {
  const membership = await ctx.db
    .query('householdMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .first()
  if (!membership) throw new Error('No household')
  return membership
}

export async function requireAuthContext(ctx: Ctx) {
  const userId = await requireUserId(ctx)
  const membership = await requireMembership(ctx, userId)
  return { userId, householdId: membership.householdId }
}

export function expenseScope(doc: { scope?: ExpenseScope }): ExpenseScope {
  return doc.scope ?? 'shared'
}

export function canViewExpense(
  expense: Doc<'expenses'>,
  userId: Id<'users'>,
  householdId: Id<'households'>
): boolean {
  if (expense.householdId && expense.householdId !== householdId) return false
  const scope = expenseScope(expense)
  if (scope === 'shared') return true
  return expense.createdBy === userId
}

export function canModifyExpense(
  expense: Doc<'expenses'>,
  userId: Id<'users'>,
  householdId: Id<'households'>
): boolean {
  if (!canViewExpense(expense, userId, householdId)) return false
  const scope = expenseScope(expense)
  if (scope === 'shared') return true
  return expense.createdBy === userId
}

export function matchesView(
  expense: Doc<'expenses'>,
  userId: Id<'users'>,
  view: ExpenseView
): boolean {
  const scope = expenseScope(expense)
  if (view === 'shared') return scope === 'shared'
  return scope === 'personal' && expense.createdBy === userId
}
