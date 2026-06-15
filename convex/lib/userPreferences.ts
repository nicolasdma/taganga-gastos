import { v } from 'convex/values'

export const expenseViewPreference = v.union(v.literal('shared'), v.literal('personal'))

/** Stored user preferences — extend with theme, locale, etc. */
export const userPreferencesValidator = v.object({
  expenseView: v.optional(expenseViewPreference),
})

export const userPreferencesPatchValidator = v.object({
  expenseView: v.optional(expenseViewPreference),
})

export type UserPreferences = {
  expenseView?: 'shared' | 'personal'
}

export function mergeUserPreferences(
  current: UserPreferences,
  patch: Partial<UserPreferences>
): UserPreferences {
  const next: UserPreferences = { ...current }
  for (const [key, value] of Object.entries(patch) as Array<
    [keyof UserPreferences, UserPreferences[keyof UserPreferences]]
  >) {
    if (value !== undefined) {
      next[key] = value
    }
  }
  return next
}
