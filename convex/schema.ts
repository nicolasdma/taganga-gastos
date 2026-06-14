import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  expenses: defineTable({
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
    createdAt: v.number(),
    /** Si true: visible en historial pero no suma en totales */
    excluded: v.optional(v.boolean()),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_clientId', ['clientId'])
    .index('by_sessionId', ['sessionId'])
    .index('by_receiptGroupId', ['receiptGroupId']),
})
