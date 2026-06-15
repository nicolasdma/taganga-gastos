import { mutation, query } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { requireUserId } from './lib/auth'
import {
  mergeUserPreferences,
  userPreferencesPatchValidator,
  userPreferencesValidator,
  type UserPreferences,
} from './lib/userPreferences'

async function getPreferencesDoc(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>
): Promise<Doc<'userPreferences'> | null> {
  return await ctx.db
    .query('userPreferences')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique()
}

export const getMyPreferences = query({
  args: {},
  returns: userPreferencesValidator,
  handler: async (ctx): Promise<UserPreferences> => {
    const userId = await requireUserId(ctx)
    const doc = await getPreferencesDoc(ctx, userId)
    return doc?.preferences ?? {}
  },
})

export const patchMyPreferences = mutation({
  args: {
    patch: userPreferencesPatchValidator,
  },
  returns: userPreferencesValidator,
  handler: async (ctx, args): Promise<UserPreferences> => {
    const userId = await requireUserId(ctx)
    const existing = await getPreferencesDoc(ctx, userId)
    const current = existing?.preferences ?? {}
    const next = mergeUserPreferences(current, args.patch)

    if (existing) {
      await ctx.db.patch(existing._id, {
        preferences: next,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert('userPreferences', {
        userId,
        preferences: next,
        updatedAt: Date.now(),
      })
    }

    return next
  },
})
