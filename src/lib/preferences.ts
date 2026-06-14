const RECENT_CATEGORIES_KEY = 'gastos-recent-categories'
const LAST_STORE_KEY = 'gastos-last-store'

export function getRecentCategories(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_CATEGORIES_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function pushRecentCategory(categoryId: string): void {
  const recent = getRecentCategories().filter((id) => id !== categoryId)
  recent.unshift(categoryId)
  localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(recent.slice(0, 3)))
}

export function getLastStore(): string {
  return localStorage.getItem(LAST_STORE_KEY) ?? ''
}

export function setLastStore(store: string): void {
  if (store.trim()) {
    localStorage.setItem(LAST_STORE_KEY, store.trim())
  }
}
