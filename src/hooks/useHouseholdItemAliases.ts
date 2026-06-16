import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { HouseholdItemAlias } from '@/lib/itemAliases'

export function useHouseholdItemAliases(): HouseholdItemAlias[] | undefined {
  const rows = useQuery(api.itemAliases.listMyAliases)
  if (rows === undefined) return undefined
  return rows.map((row) => ({
    normalizedAlias: row.normalizedAlias,
    emoji: row.emoji,
    label: row.label,
    itemId: row.itemId,
  }))
}
