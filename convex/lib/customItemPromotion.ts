import type { MutationCtx } from '../_generated/server'
import type { Doc, Id } from '../_generated/dataModel'

export const CUSTOM_ITEM_PREFIX = 'custom:'

export function isCustomItemId(itemId: string): boolean {
  return itemId.startsWith(CUSTOM_ITEM_PREFIX)
}

export interface CustomItemFields {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

async function findSharedByLabel(
  ctx: MutationCtx,
  householdId: Id<'households'>,
  normalizedLabel: string
): Promise<Doc<'customItems'> | undefined> {
  const shared = await ctx.db
    .query('customItems')
    .withIndex('by_household_and_scope', (q) =>
      q.eq('householdId', householdId).eq('scope', 'shared')
    )
    .collect()

  return shared.find((item) => item.normalizedLabel === normalizedLabel)
}

/**
 * Personal custom items become household-shared when used on a compartido expense.
 * Returns shared item fields to store on the expense when promotion happens.
 */
export async function promotePersonalCustomItemIfNeeded(
  ctx: MutationCtx,
  userId: Id<'users'>,
  householdId: Id<'households'>,
  itemId: string
): Promise<CustomItemFields | null> {
  if (!isCustomItemId(itemId)) return null

  const personal = await ctx.db
    .query('customItems')
    .withIndex('by_itemId', (q) => q.eq('itemId', itemId))
    .unique()

  if (!personal || personal.scope !== 'personal' || personal.createdBy !== userId) {
    return null
  }

  const existingShared = await findSharedByLabel(
    ctx,
    householdId,
    personal.normalizedLabel
  )

  if (existingShared) {
    return {
      itemId: existingShared.itemId,
      itemEmoji: existingShared.emoji,
      itemLabel: existingShared.label,
    }
  }

  const sharedItemId = `${CUSTOM_ITEM_PREFIX}${crypto.randomUUID()}`
  const createdAt = Date.now()

  await ctx.db.insert('customItems', {
    itemId: sharedItemId,
    label: personal.label,
    emoji: personal.emoji,
    normalizedLabel: personal.normalizedLabel,
    scope: 'shared',
    householdId,
    createdBy: userId,
    createdAt,
  })

  return {
    itemId: sharedItemId,
    itemEmoji: personal.emoji,
    itemLabel: personal.label,
  }
}

/** Resolve item fields for a shared expense (catalog ids pass through). */
export async function resolveCustomItemForSharedExpense(
  ctx: MutationCtx,
  userId: Id<'users'>,
  householdId: Id<'households'>,
  itemId: string,
  itemEmoji: string,
  itemLabel: string
): Promise<CustomItemFields> {
  const promoted = await promotePersonalCustomItemIfNeeded(
    ctx,
    userId,
    householdId,
    itemId
  )

  if (promoted) return promoted

  if (isCustomItemId(itemId)) {
    const existing = await ctx.db
      .query('customItems')
      .withIndex('by_itemId', (q) => q.eq('itemId', itemId))
      .unique()

    if (existing?.scope === 'shared') {
      return {
        itemId: existing.itemId,
        itemEmoji: existing.emoji,
        itemLabel: existing.label,
      }
    }
  }

  return { itemId, itemEmoji, itemLabel }
}
