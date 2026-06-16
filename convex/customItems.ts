import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import type { Doc, Id } from './_generated/dataModel'
import {
  requireAuthContext,
  type ExpenseView,
} from './lib/auth'
import { upsertAliasInternal } from './itemAliases'

const expenseViewValidator = v.union(v.literal('shared'), v.literal('personal'))

const customItemValidator = v.object({
  itemId: v.string(),
  label: v.string(),
  emoji: v.string(),
  scope: v.union(v.literal('shared'), v.literal('personal')),
  createdBy: v.id('users'),
  createdAt: v.number(),
})

export function normalizeCustomLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function matchesCustomItemView(
  item: Doc<'customItems'>,
  userId: Id<'users'>,
  view: ExpenseView
): boolean {
  if (view === 'shared') return item.scope === 'shared'
  return item.scope === 'personal' && item.createdBy === userId
}

function toCustomItemResponse(item: Doc<'customItems'>) {
  return {
    itemId: item.itemId,
    label: item.label,
    emoji: item.emoji,
    scope: item.scope,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
  }
}

async function findPersonalDuplicate(
  ctx: MutationCtx,
  householdId: Id<'households'>,
  normalizedLabel: string,
  createdBy: Id<'users'>
) {
  const personal = await ctx.db
    .query('customItems')
    .withIndex('by_household_and_createdBy', (q) =>
      q.eq('householdId', householdId).eq('createdBy', createdBy)
    )
    .collect()

  return personal.find(
    (item) => item.scope === 'personal' && item.normalizedLabel === normalizedLabel
  )
}

export const listVisibleCustomItems = query({
  args: { view: expenseViewValidator },
  returns: v.array(customItemValidator),
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)

    let items: Doc<'customItems'>[]
    if (args.view === 'shared') {
      items = await ctx.db
        .query('customItems')
        .withIndex('by_household_and_scope', (q) =>
          q.eq('householdId', householdId).eq('scope', 'shared')
        )
        .collect()
    } else {
      items = await ctx.db
        .query('customItems')
        .withIndex('by_household_and_createdBy', (q) =>
          q.eq('householdId', householdId).eq('createdBy', userId)
        )
        .collect()
      items = items.filter((item) => item.scope === 'personal')
    }

    return items
      .filter((item) => matchesCustomItemView(item, userId, args.view))
      .map(toCustomItemResponse)
  },
})

export const createCustomItem = mutation({
  args: {
    label: v.string(),
    emoji: v.string(),
  },
  returns: customItemValidator,
  handler: async (ctx, args) => {
    const { userId, householdId } = await requireAuthContext(ctx)

    const label = args.label.trim()
    if (!label) throw new Error('El nombre del ítem es obligatorio')

    const emoji = [...args.emoji.trim()][0]
    if (!emoji) throw new Error('Elegí un emoji')

    const normalizedLabel = normalizeCustomLabel(label)
    const existing = await findPersonalDuplicate(ctx, householdId, normalizedLabel, userId)

    if (existing) {
      return toCustomItemResponse(existing)
    }

    const itemId = `custom:${crypto.randomUUID()}`
    const createdAt = Date.now()

    await ctx.db.insert('customItems', {
      itemId,
      label,
      emoji,
      normalizedLabel,
      scope: 'personal',
      householdId,
      createdBy: userId,
      createdAt,
    })

    await upsertAliasInternal(ctx, {
      householdId,
      userId,
      alias: label,
      emoji,
      label,
      itemId,
    })

    return {
      itemId,
      label,
      emoji,
      scope: 'personal' as const,
      createdBy: userId,
      createdAt,
    }
  },
})
