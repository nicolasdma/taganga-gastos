import type { TokenStorage } from '@convex-dev/auth/react'

const JWT_KEY = '__convexAuthJWT'
const REFRESH_KEY = '__convexAuthRefreshToken'

function escapeNamespace(url: string) {
  return url.replace(/[^a-zA-Z0-9]/g, '')
}

function authKeys(convexUrl: string) {
  const ns = escapeNamespace(convexUrl)
  return {
    jwt: `${JWT_KEY}_${ns}`,
    refresh: `${REFRESH_KEY}_${ns}`,
  }
}

/** True when Convex Auth tokens exist in localStorage for this deployment. */
export function hasLocalAuthToken(convexUrl?: string): boolean {
  if (typeof window === 'undefined' || !convexUrl) return false
  const keys = authKeys(convexUrl)
  const jwt = localStorage.getItem(keys.jwt)
  const refresh = localStorage.getItem(keys.refresh)
  return Boolean(jwt || refresh)
}

export interface AuthStoragePresence {
  hasJwt: boolean
  hasRefresh: boolean
}

/** Debug helper: report localStorage token presence without exposing token values. */
export function getLocalAuthStoragePresence(convexUrl?: string): AuthStoragePresence {
  if (typeof window === 'undefined' || !convexUrl) {
    return { hasJwt: false, hasRefresh: false }
  }

  const keys = authKeys(convexUrl)
  return {
    hasJwt: Boolean(localStorage.getItem(keys.jwt)),
    hasRefresh: Boolean(localStorage.getItem(keys.refresh)),
  }
}

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // Ignore storage failures in constrained browser contexts (iOS Safari).
  }
}

/**
 * iOS Safari can reject localStorage writes in some contexts. This storage
 * writes to sessionStorage first and mirrors to localStorage when possible.
 */
export function createRobustAuthStorage(): TokenStorage {
  const memory = new Map<string, string>()

  return {
    getItem(key: string): string | null {
      const fromSession = safeGet(sessionStorage, key)
      if (fromSession !== null) return fromSession

      const fromLocal = safeGet(localStorage, key)
      if (fromLocal !== null) return fromLocal

      return memory.get(key) ?? null
    },
    setItem(key: string, value: string): void {
      const wroteSession = safeSet(sessionStorage, key, value)
      const wroteLocal = safeSet(localStorage, key, value)

      if (!wroteSession && !wroteLocal) {
        memory.set(key, value)
      } else {
        memory.delete(key)
      }
    },
    removeItem(key: string): void {
      safeRemove(sessionStorage, key)
      safeRemove(localStorage, key)
      memory.delete(key)
    },
  }
}

const HANDLED_CODE_KEY = '__convexAuthHandledCode'

function readHandledCode(): string | null {
  if (typeof window === 'undefined') return null
  return safeGet(sessionStorage, HANDLED_CODE_KEY) ?? safeGet(localStorage, HANDLED_CODE_KEY)
}

function writeHandledCode(code: string): void {
  safeSet(sessionStorage, HANDLED_CODE_KEY, code)
  safeSet(localStorage, HANDLED_CODE_KEY, code)
}

/**
 * Returns `true` at most once per OAuth `code` value, then `false` forever after.
 *
 * iOS Safari (and the PWA service worker) can re-navigate to the post-OAuth URL
 * while `?code=` is still present, so Convex Auth redeems the same code twice.
 * The second redemption fails server-side ("Invalid verification code") and the
 * action returns `{ tokens: null }`. Convex Auth's client treats `tokens: null`
 * as a sign-out and wipes the tokens the first redemption just stored, logging
 * the user out on the next refresh.
 *
 * Used as `ConvexAuthProvider`'s `shouldHandleCode` prop to make redemption
 * idempotent: the second navigation skips redemption and reads the already
 * stored tokens instead.
 */
export function shouldHandleOAuthCode(): boolean {
  if (typeof window === 'undefined') return false
  const code = new URLSearchParams(window.location.search).get('code')
  if (!code) return false
  if (readHandledCode() === code) return false
  writeHandledCode(code)
  return true
}

/** Debug helper: whether an OAuth code has already been marked as handled. */
export function hasHandledOAuthCodeMarker(): boolean {
  return readHandledCode() !== null
}

export interface StorageAvailability {
  localWritable: boolean
  sessionWritable: boolean
}

export function getStorageAvailability(): StorageAvailability {
  if (typeof window === 'undefined') {
    return { localWritable: false, sessionWritable: false }
  }

  const testKey = '__gastos_storage_test__'
  const localWritable = safeSet(localStorage, testKey, '1')
  const sessionWritable = safeSet(sessionStorage, testKey, '1')
  safeRemove(localStorage, testKey)
  safeRemove(sessionStorage, testKey)

  return { localWritable, sessionWritable }
}

/**
 * Ask the browser to mark storage as persistent (reduces eviction on mobile).
 * Note: Safari browser tab vs installed PWA use separate storage partitions on iOS.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
