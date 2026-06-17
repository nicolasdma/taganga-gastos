import { useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useUpdateCustomItem() {
  const updateMutation = useMutation(api.customItems.updateCustomItem)

  const updateCustomItem = useCallback(
    async (args: { itemId: string; label?: string; emoji?: string }) => {
      const result = await updateMutation(args)
      return {
        itemId: result.itemId,
        itemEmoji: result.emoji,
        itemLabel: result.label,
      }
    },
    [updateMutation]
  )

  return { updateCustomItem }
}
