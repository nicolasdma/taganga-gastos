export type KeyboardLayout = 'text' | 'search' | 'alphanumeric'

export const TEXT_ROW_TOP_LOWER = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
] as const

export const TEXT_ROW_MID_LOWER = [
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ',
] as const

export const TEXT_ROW_BOT_LOWER = [
  'z', 'x', 'c', 'v', 'b', 'n', 'm',
] as const

export const TEXT_ROW_TOP_UPPER = [
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
] as const

export const TEXT_ROW_MID_UPPER = [
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ',
] as const

export const TEXT_ROW_BOT_UPPER = [
  'Z', 'X', 'C', 'V', 'B', 'N', 'M',
] as const

/** A–Z + 0–9 for invite codes; always uppercase. */
export const ALPHANUMERIC_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z', '0', '1', '2', '3'],
  ['4', '5', '6', '7', '8', '9'],
] as const

export function doneLabelForLayout(layout: KeyboardLayout): string {
  return layout === 'search' ? 'Buscar' : 'Listo'
}
