import type { TokenStorage } from '@convex-dev/auth/react'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'

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

export interface StoredAuthTokens {
  jwt: string | null
  refresh: string | null
}

/** Read Convex Auth tokens from localStorage for this deployment. */
export function getStoredAuthTokens(convexUrl: string): StoredAuthTokens {
  const keys = authKeys(convexUrl)
  return {
    jwt: localStorage.getItem(keys.jwt),
    refresh: localStorage.getItem(keys.refresh),
  }
}

/** True when Convex Auth tokens exist in localStorage for this deployment. */
export function hasLocalAuthToken(convexUrl?: string): boolean {
  if (typeof window === 'undefined' || !convexUrl) return false
  const { jwt, refresh } = getStoredAuthTokens(convexUrl)
  return Boolean(jwt || refresh)
}

/** Persist tokens to all storage layers used by the resilient storage adapter. */
export function setStoredAuthTokens(
  convexUrl: string,
  tokens: { token: string; refreshToken: string }
) {
  const keys = authKeys(convexUrl)
  for (const [storageKey, value] of [
    [keys.jwt, tokens.token],
    [keys.refresh, tokens.refreshToken],
  ] as const) {
    localStorage.setItem(storageKey, value)
    sessionStorage.setItem(storageKey, value)
  }
}

export function clearStoredAuthTokens(convexUrl: string) {
  const keys = authKeys(convexUrl)
  for (const key of [keys.jwt, keys.refresh]) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

/**
 * iOS can drop localStorage entries on refresh while sessionStorage survives
 * within the same tab. Restore missing JWT/refresh from the session mirror.
 */
export function restoreAuthFromSessionMirror(convexUrl: string) {
  const keys = authKeys(convexUrl)
  for (const key of [keys.jwt, keys.refresh]) {
    if (!localStorage.getItem(key)) {
      const mirrored = sessionStorage.getItem(key)
      if (mirrored) localStorage.setItem(key, mirrored)
    }
  }
}

/**
 * Convex Auth only reads the JWT on mount. If the JWT is missing but a refresh
 * token remains, proactively refresh before the provider initializes.
 */
export async function refreshAccessTokenIfNeeded(convexUrl: string): Promise<boolean> {
  restoreAuthFromSessionMirror(convexUrl)
  const { jwt, refresh } = getStoredAuthTokens(convexUrl)
  if (jwt || !refresh) return false

  const client = new ConvexHttpClient(convexUrl)
  try {
    const result = await client.action(api.auth.signIn, { refreshToken: refresh })
    if (result.tokens?.token && result.tokens.refreshToken) {
      setStoredAuthTokens(convexUrl, result.tokens)
      return true
    }
    clearStoredAuthTokens(convexUrl)
  } catch {
    clearStoredAuthTokens(convexUrl)
  }
  return false
}

/**
 * TokenStorage that mirrors writes to sessionStorage and restores from the
 * mirror when localStorage returns null (common iOS refresh quirk).
 */
export function createResilientTokenStorage(): TokenStorage {
  return {
    getItem(key: string) {
      const fromLocal = localStorage.getItem(key)
      if (fromLocal != null) return fromLocal

      const fromSession = sessionStorage.getItem(key)
      if (fromSession != null) {
        localStorage.setItem(key, fromSession)
        return fromSession
      }
      return null
    },
    setItem(key: string, value: string) {
      localStorage.setItem(key, value)
      sessionStorage.setItem(key, value)
    },
    removeItem(key: string) {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    },
  }
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
