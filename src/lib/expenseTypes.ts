import type { Id } from '../../convex/_generated/dataModel'

export interface EditableExpense {
  _id: Id<'expenses'>
  amount: number
  itemId?: string
  itemEmoji?: string
  itemLabel?: string
  sessionId?: string
  store?: string
  note?: string
  excluded?: boolean
}
