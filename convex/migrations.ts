import { internalMutation, mutation, type MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { dayRange } from './dates'
import { requireAuthContext } from './lib/auth'
import { resolveItemFields } from './lib/items'

async function markDayAsShared(
  ctx: MutationCtx,
  targetHouseholdId: Id<'households'>,
  dateKey: string,
  tzOffsetMinutes: number,
  dryRun: boolean | undefined
) {
  const { start, end } = dayRange(dateKey, tzOffsetMinutes)
  let scanned = 0
  let matchedHousehold = 0
  let matchedOrphan = 0
  let skippedOtherHousehold = 0
  let alreadyShared = 0
  let updated = 0

  for await (const expense of ctx.db
    .query('expenses')
    .withIndex('by_createdAt', (q) => q.gte('createdAt', start))
    .order('asc')) {
    if (expense.createdAt >= end) break

    scanned += 1
    if (expense.householdId === undefined) {
      matchedOrphan += 1
    } else if (expense.householdId === targetHouseholdId) {
      matchedHousehold += 1
    } else {
      skippedOtherHousehold += 1
      continue
    }

    if (expense.scope === 'shared' && expense.householdId === targetHouseholdId) {
      alreadyShared += 1
      continue
    }

    if (!dryRun) {
      await ctx.db.patch(expense._id, {
        householdId: targetHouseholdId,
        scope: 'shared',
      })
    }
    updated += 1
  }

  return {
    scanned,
    matchedHousehold,
    matchedOrphan,
    skippedOtherHousehold,
    alreadyShared,
    updated,
  }
}

/** Backfill itemId/itemEmoji/itemLabel desde categoryId legacy. Correr una vez en prod. */
export const backfillExpenseItems = internalMutation({
  args: {
    cursor: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  returns: v.object({
    processed: v.number(),
    updated: v.number(),
    done: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100
    const page = await ctx.db.query('expenses').paginate({
      numItems: batchSize,
      cursor: args.cursor ?? null,
    })

    let updated = 0
    for (const expense of page.page) {
      const needsBackfill = !expense.itemLabel || !expense.itemEmoji
      if (!needsBackfill) continue

      const resolved = resolveItemFields(
        expense.categoryId ?? 'misc',
        expense.itemId,
        expense.itemEmoji,
        expense.itemLabel
      )
      if (!resolved) continue

      await ctx.db.patch(expense._id, {
        itemId: resolved.itemId,
        itemEmoji: resolved.itemEmoji,
        itemLabel: resolved.itemLabel,
      })
      updated += 1
    }

    return {
      processed: page.page.length,
      updated,
      done: page.isDone,
      continueCursor: page.isDone ? null : page.continueCursor,
    }
  },
})

export const markExpensesForDayAsShared = internalMutation({
  args: {
    targetHouseholdId: v.id('households'),
    dateKey: v.string(),
    tzOffsetMinutes: v.number(),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    scanned: v.number(),
    matchedHousehold: v.number(),
    matchedOrphan: v.number(),
    skippedOtherHousehold: v.number(),
    alreadyShared: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx, args) => {
    return await markDayAsShared(
      ctx,
      args.targetHouseholdId,
      args.dateKey,
      args.tzOffsetMinutes,
      args.dryRun
    )
  },
})

export const markMyHouseholdExpensesForDayAsShared = mutation({
  args: {
    dateKey: v.string(),
    tzOffsetMinutes: v.number(),
    dryRun: v.optional(v.boolean()),
  },
  returns: v.object({
    scanned: v.number(),
    matchedHousehold: v.number(),
    matchedOrphan: v.number(),
    skippedOtherHousehold: v.number(),
    alreadyShared: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx, args) => {
    const { householdId } = await requireAuthContext(ctx)
    return await markDayAsShared(ctx, householdId, args.dateKey, args.tzOffsetMinutes, args.dryRun)
  },
})
