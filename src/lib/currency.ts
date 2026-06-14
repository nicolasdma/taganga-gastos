export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Para hero editorial: símbolo + cifra apilados */
export function formatCOPEditorial(amount: number): { symbol: string; value: string } {
  return {
    symbol: '$',
    value: new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount),
  }
}

export function formatCOPShort(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (amount >= 1000) {
    const k = amount / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  return String(amount)
}

export const AMOUNT_PRESETS = [5_000, 10_000, 20_000, 50_000, 100_000] as const
