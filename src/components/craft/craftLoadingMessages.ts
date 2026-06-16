/** Copy bank — mensajes cortos, cálidos, rotables en pantallas de espera. */

export const SCREEN_MESSAGES = [
  '🐾 un momentito',
] as const

export const INLINE_MESSAGES = [
  'Un momentito…',
  'Revuelve la arcilla…',
  'Afilando el lápiz cerámico…',
] as const

export function pickScreenMessage(): string {
  return SCREEN_MESSAGES[Math.floor(Math.random() * SCREEN_MESSAGES.length)]!
}

export function pickInlineMessage(): string {
  return INLINE_MESSAGES[Math.floor(Math.random() * INLINE_MESSAGES.length)]!
}
