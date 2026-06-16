import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { createHouseholdForUser } from './lib/households'

const householdSummary = v.object({
  householdId: v.id('households'),
  name: v.optional(v.string()),
  inviteCode: v.string(),
})

export const getMyHousehold = query({
  args: {},
  returns: v.union(householdSummary, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()
    if (!membership) return null

    const household = await ctx.db.get('households', membership.householdId)
    if (!household) return null

    return {
      householdId: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
    }
  },
})

export const createHousehold = mutation({
  args: {
    name: v.optional(v.string()),
  },
  returns: householdSummary,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()
    if (existing) throw new Error('Already in a household')

    const { householdId, inviteCode } = await createHouseholdForUser(ctx, userId, args.name)

    return {
      householdId,
      name: args.name,
      inviteCode,
    }
  },
})

export const ensureUserReady = mutation({
  args: {},
  returns: householdSummary,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    if (existing) {
      const household = await ctx.db.get('households', existing.householdId)
      if (!household) throw new Error('Household not found')
      return {
        householdId: household._id,
        name: household.name,
        inviteCode: household.inviteCode,
      }
    }

    const { householdId, inviteCode } = await createHouseholdForUser(ctx, userId)

    return {
      householdId,
      name: undefined,
      inviteCode,
    }
  },
})

export const joinHousehold = mutation({
  args: {
    inviteCode: v.string(),
  },
  returns: householdSummary,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()
    if (existing) throw new Error('Already in a household')

    const normalizedCode = args.inviteCode.trim().toUpperCase()
    const household = await ctx.db
      .query('households')
      .withIndex('by_inviteCode', (q) => q.eq('inviteCode', normalizedCode))
      .unique()
    if (!household) throw new Error('Invalid invite code')

    await ctx.db.insert('householdMembers', {
      householdId: household._id,
      userId,
      joinedAt: Date.now(),
    })

    return {
      householdId: household._id,
      name: household.name,
      inviteCode: household.inviteCode,
    }
  },
})

/** One-off admin: move a user into an existing household (e.g. fix auto-created duplicate homes). */
export const adminMoveUserToHousehold = internalMutation({
  args: {
    userId: v.id('users'),
    targetHouseholdId: v.id('households'),
  },
  returns: v.object({
    ok: v.literal(true),
    oldHouseholdId: v.id('households'),
    newHouseholdId: v.id('households'),
    movedExpenseCount: v.number(),
    deletedOldHousehold: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query('householdMembers')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()
    if (!membership) throw new Error('User has no household membership')

    const target = await ctx.db.get('households', args.targetHouseholdId)
    if (!target) throw new Error('Target household not found')

    const oldHouseholdId = membership.householdId
    if (oldHouseholdId === args.targetHouseholdId) {
      throw new Error('User is already in the target household')
    }

    await ctx.db.patch(membership._id, {
      householdId: args.targetHouseholdId,
      joinedAt: Date.now(),
    })

    const expenses = await ctx.db
      .query('expenses')
      .withIndex('by_household_and_createdAt', (q) => q.eq('householdId', oldHouseholdId))
      .collect()

    let movedExpenseCount = 0
    for (const expense of expenses) {
      if (expense.createdBy !== args.userId) continue
      await ctx.db.patch(expense._id, { householdId: args.targetHouseholdId })
      movedExpenseCount += 1
    }

    const remainingMembers = await ctx.db
      .query('householdMembers')
      .withIndex('by_household', (q) => q.eq('householdId', oldHouseholdId))
      .collect()

    let deletedOldHousehold = false
    if (remainingMembers.length === 0) {
      await ctx.db.delete(oldHouseholdId)
      deletedOldHousehold = true
    }

    return {
      ok: true as const,
      oldHouseholdId,
      newHouseholdId: args.targetHouseholdId,
      movedExpenseCount,
      deletedOldHousehold,
    }
  },
})

export const lookupInvite = query({
  args: {
    inviteCode: v.string(),
  },
  returns: v.union(
    v.object({
      valid: v.literal(true),
      householdName: v.optional(v.string()),
    }),
    v.object({
      valid: v.literal(false),
    })
  ),
  handler: async (ctx, args) => {
    const normalizedCode = args.inviteCode.trim().toUpperCase()
    const household = await ctx.db
      .query('households')
      .withIndex('by_inviteCode', (q) => q.eq('inviteCode', normalizedCode))
      .unique()

    if (!household) return { valid: false as const }
    return { valid: true as const, householdName: household.name }
  },
})
