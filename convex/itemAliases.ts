import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { requireAuthContext } from './lib/auth'
import { normalizeCustomLabel } from './customItems'

const itemAliasValidator = v.object({
  normalizedAlias: v.string(),
  emoji: v.string(),
  label: v.optional(v.string()),
  itemId: v.optional(v.string()),
})

export const listMyAliases = query({
  args: {},
  returns: v.array(itemAliasValidator),
  handler: async (ctx) => {
    const { householdId } = await requireAuthContext(ctx)

    const rows = await ctx.db
      .query('itemAliases')
      .withIndex('by_household', (q) => q.eq('householdId', householdId))
      .collect()

    return rows.map((row) => ({
      normalizedAlias: row.normalizedAlias,
      emoji: row.emoji,
      label: row.label,
      itemId: row.itemId,
    }))
  },
})

export const upsertAlias = mutation({
  args: {
    alias: v.string(),
    emoji: v.string(),
    label: v.optional(v.string()),
    itemId: v.optional(v.string()),
  },
  returns: itemAliasValidator,
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)

    const normalizedAlias = normalizeCustomLabel(args.alias)
    if (!normalizedAlias) throw new Error('Alias inválido')

    const emoji = [...args.emoji.trim()][0]
    if (!emoji) throw new Error('Elegí un emoji')

    const existing = await ctx.db
      .query('itemAliases')
      .withIndex('by_household_and_alias', (q) =>
        q.eq('householdId', householdId).eq('normalizedAlias', normalizedAlias)
      )
      .unique()

    const payload = {
      emoji,
      label: args.label?.trim() || undefined,
      itemId: args.itemId,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { normalizedAlias, ...payload }
    }

    await ctx.db.insert('itemAliases', {
      householdId,
      normalizedAlias,
      ...payload,
      createdBy: userId,
      createdAt: Date.now(),
    })

    return { normalizedAlias, ...payload }
  },
})

/** Internal helper — auto-save alias when creating custom items. */
export async function upsertAliasInternal(
  ctx: MutationCtx,
  args: {
    householdId: Id<'households'>
    userId: Id<'users'>
    alias: string
    emoji: string
    label?: string
    itemId?: string
  }
) {
  const normalizedAlias = normalizeCustomLabel(args.alias)
  if (!normalizedAlias) return

  const emoji = [...args.emoji.trim()][0]
  if (!emoji) return

  const existing = await ctx.db
    .query('itemAliases')
    .withIndex('by_household_and_alias', (q) =>
      q.eq('householdId', args.householdId).eq('normalizedAlias', normalizedAlias)
    )
    .unique()

  const payload = {
    emoji,
    label: args.label?.trim() || undefined,
    itemId: args.itemId,
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    return
  }

  await ctx.db.insert('itemAliases', {
    householdId: args.householdId,
    normalizedAlias,
    ...payload,
    createdBy: args.userId,
    createdAt: Date.now(),
  })
}
