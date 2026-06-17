import type { ExpenseView } from '@/lib/expenseScope'

export type RitualType = 'expense' | 'receipt'

export interface RitualCopyArgs {
  view: ExpenseView
  type: RitualType
  itemCount?: number
  itemLabel?: string
  amount?: number
}

export interface RitualCopy {
  toastMessage: string
  homeLine: string
  ariaLabel?: string
}

function formatItemCount(count: number): string {
  return `${count} ítem${count === 1 ? '' : 's'}`
}

export function getHomeRitualLine(args: Pick<RitualCopyArgs, 'view'>): string {
  return args.view === 'shared' ? 'Casa actualizada 🐾' : 'Tu libreta quedó al día 🐾'
}

export function getExpenseSavedRitualCopy(args: RitualCopyArgs): RitualCopy {
  const homeLine = getHomeRitualLine(args)

  return {
    toastMessage: args.view === 'shared' ? 'Casa actualizada 🐾' : 'Tu libreta quedó al día 🐾',
    homeLine,
    ariaLabel: args.view === 'shared' ? 'Casa actualizada' : 'Tu libreta quedó al día',
  }
}

export function getReceiptSavedRitualCopy(args: RitualCopyArgs): RitualCopy {
  const homeLine = getHomeRitualLine(args)

  if (args.itemCount === undefined) {
    return {
      toastMessage: args.view === 'shared' ? 'Ticket guardado para Nosotros 🧾' : 'Ticket guardado en Míos 🧾',
      homeLine,
      ariaLabel: args.view === 'shared' ? 'Ticket guardado para Nosotros' : 'Ticket guardado en Míos',
    }
  }

  const itemCount = formatItemCount(args.itemCount)
  const toastMessage =
    args.view === 'shared'
      ? `Casa actualizada con ${itemCount} 🐾`
      : `Tu libreta sumó ${itemCount} 🐾`

  return {
    toastMessage,
    homeLine,
    ariaLabel:
      args.view === 'shared'
        ? `Casa actualizada con ${itemCount}`
        : `Tu libreta sumó ${itemCount}`,
  }
}
