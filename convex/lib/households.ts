import type { GenericMutationCtx } from 'convex/server'
import type { DataModel, Id } from '../_generated/dataModel'

const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateInviteCode(length = 8): string {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)]
  }
  return code
}

export async function createHouseholdForUser(
  ctx: GenericMutationCtx<DataModel>,
  userId: Id<'users'>,
  name?: string
): Promise<{ householdId: Id<'households'>; inviteCode: string }> {
  const inviteCode = generateInviteCode()
  const householdId = await ctx.db.insert('households', {
    name,
    inviteCode,
    createdAt: Date.now(),
  })

  await ctx.db.insert('householdMembers', {
    householdId,
    userId,
    joinedAt: Date.now(),
  })

  await migrateOrphanExpenses(ctx, householdId)

  return { householdId, inviteCode }
}

export async function migrateOrphanExpenses(
  ctx: GenericMutationCtx<DataModel>,
  householdId: Id<'households'>
): Promise<number> {
  const expenses = await ctx.db.query('expenses').collect()
  let count = 0

  for (const expense of expenses) {
    if (expense.householdId !== undefined) continue
    await ctx.db.patch(expense._id, {
      householdId,
      scope: expense.scope ?? 'shared',
    })
    count += 1
  }

  return count
}
