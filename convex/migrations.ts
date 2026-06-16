import { internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { resolveItemFields } from './lib/items'

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
