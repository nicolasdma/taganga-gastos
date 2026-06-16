import { normalizeItemSearchText } from '@/lib/items'

export interface StaticItemAlias {
  emoji: string
  suggestedLabel?: string
}

/** Tier 4 static — marcas y términos colombianos frecuentes. */
export const STATIC_ITEM_ALIASES: Record<string, StaticItemAlias> = {
  tigo: { emoji: '📱' },
  claro: { emoji: '📱' },
  movistar: { emoji: '📱' },
  wom: { emoji: '📱' },
  virgin: { emoji: '📱' },
  celular: { emoji: '📱' },
  telefono: { emoji: '📱' },
  movil: { emoji: '📱' },
  nequi: { emoji: '💜', suggestedLabel: 'Nequi' },
  daviplata: { emoji: '💙', suggestedLabel: 'Daviplata' },
  bancolombia: { emoji: '💳' },
  rappi: { emoji: '🛵', suggestedLabel: 'Rappi' },
  epm: { emoji: '💡' },
  codensa: { emoji: '💡' },
  uber: { emoji: '🚕' },
  didi: { emoji: '🚕' },
  cabify: { emoji: '🚕' },
  cafe: { emoji: '☕' },
  cerveza: { emoji: '🍺' },
}

export interface HouseholdItemAlias {
  normalizedAlias: string
  emoji: string
  label?: string
  itemId?: string
}

export function lookupStaticAlias(query: string): StaticItemAlias | null {
  const key = normalizeItemSearchText(query.trim())
  return STATIC_ITEM_ALIASES[key] ?? null
}

export function lookupHouseholdAlias(
  query: string,
  householdAliases: HouseholdItemAlias[] | undefined
): HouseholdItemAlias | null {
  if (!householdAliases?.length) return null
  const key = normalizeItemSearchText(query.trim())
  return householdAliases.find((a) => a.normalizedAlias === key) ?? null
}
