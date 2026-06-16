import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export interface CreatedCustomItem {
  itemId: string
  itemEmoji: string
  itemLabel: string
}

export function useCreateCustomItem() {
  const createMutation = useMutation(api.customItems.createCustomItem)
  const [isCreating, setIsCreating] = useState(false)

  const createCustomItem = useCallback(
    async (args: { label: string; emoji: string }) => {
      setIsCreating(true)
      try {
        const result = await createMutation(args)
        return {
          itemId: result.itemId,
          itemEmoji: result.emoji,
          itemLabel: result.label,
        } satisfies CreatedCustomItem
      } finally {
        setIsCreating(false)
      }
    },
    [createMutation]
  )

  return { createCustomItem, isCreating }
}
