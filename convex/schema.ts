import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { userPreferencesValidator } from './lib/userPreferences'

const expenseScope = v.union(v.literal('shared'), v.literal('personal'))

export default defineSchema({
  ...authTables,

  households: defineTable({
    name: v.optional(v.string()),
    inviteCode: v.string(),
    createdAt: v.number(),
  }).index('by_inviteCode', ['inviteCode']),

  householdMembers: defineTable({
    householdId: v.id('households'),
    userId: v.id('users'),
    joinedAt: v.number(),
  })
    .index('by_household', ['householdId'])
    .index('by_user', ['userId'])
    .index('by_household_and_user', ['householdId', 'userId']),

  userPreferences: defineTable({
    userId: v.id('users'),
    preferences: userPreferencesValidator,
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

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
    householdId: v.optional(v.id('households')),
    scope: v.optional(expenseScope),
    createdBy: v.optional(v.id('users')),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_clientId', ['clientId'])
    .index('by_sessionId', ['sessionId'])
    .index('by_receiptGroupId', ['receiptGroupId'])
    .index('by_household_and_createdAt', ['householdId', 'createdAt']),
})
