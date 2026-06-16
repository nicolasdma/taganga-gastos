const RECENT_ITEMS_KEY = 'gastos-recent-items'
const LAST_STORE_KEY = 'gastos-last-store'

export function getRecentItems(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function pushRecentItem(itemId: string): void {
  const recent = getRecentItems().filter((id) => id !== itemId)
  recent.unshift(itemId)
  localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(recent.slice(0, 5)))
}

export function getLastStore(): string {
  return localStorage.getItem(LAST_STORE_KEY) ?? ''
}

export function setLastStore(store: string): void {
  if (store.trim()) {
    localStorage.setItem(LAST_STORE_KEY, store.trim())
  }
}
