import { useEffect, useMemo, useState } from 'react'
import { ItemIcon } from '@/components/items/ItemIcon'
import { EMOJI_INLINE_LIMIT, loadEmojiSearchIndex, searchEmojisFromIndex } from '@/lib/emojiSearch'
import { cn } from '@/lib/utils'

interface EmojiSuggestionGridProps {
  selectedEmoji: string
  searchQuery: string
  onSelect: (emoji: string) => void
  onDismissKeyboard?: () => void
  columns?: 6 | 8
}

export function EmojiSuggestionGrid({
  selectedEmoji,
  searchQuery,
  onSelect,
  onDismissKeyboard,
  columns = 6,
}: EmojiSuggestionGridProps) {
  const [suggestions, setSuggestions] = useState<Array<{ emoji: string; label: string }>>([])

  useEffect(() => {
    let cancelled = false
    void loadEmojiSearchIndex()
      .then((index) => {
        if (cancelled) return
        setSuggestions(searchEmojisFromIndex(index, searchQuery, EMOJI_INLINE_LIMIT))
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const displayEmojis = useMemo(() => {
    const seen = new Set<string>()
    const list: Array<{ emoji: string; label: string }> = []
    const add = (emoji: string, label: string) => {
      if (seen.has(emoji)) return
      seen.add(emoji)
      list.push({ emoji, label })
    }
    add(selectedEmoji, searchQuery.trim() || 'Seleccionado')
    for (const entry of suggestions) add(entry.emoji, entry.label)
    return list.slice(0, EMOJI_INLINE_LIMIT)
  }, [selectedEmoji, searchQuery, suggestions])

  return (
    <div className={cn('grid gap-1.5', columns === 8 ? 'grid-cols-8' : 'grid-cols-6')}>
      {displayEmojis.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          title={label}
          onPointerDown={onDismissKeyboard}
          onClick={() => onSelect(emoji)}
          className={cn(
            'h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-95',
            selectedEmoji === emoji ? 'chip-tile ring-2 ring-cobalt-glaze/40' : 'hover:bg-muted/40'
          )}
        >
          <ItemIcon emoji={emoji} label={label} className="text-xl" />
        </button>
      ))}
    </div>
  )
}
