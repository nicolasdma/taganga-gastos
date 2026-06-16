import { useState } from 'react'
import { getLastStore } from '@/lib/preferences'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StorePromptProps {
  onConfirm: (store: string) => void
  onCancel: () => void
}

export function StorePrompt({ onConfirm, onCancel }: StorePromptProps) {
  const [store, setStore] = useState(getLastStore())

  return (
    <div className="pb-2">
      <p className="text-lg font-bold text-center mb-1">🛒 Supermercado</p>
      <p className="text-xs text-muted-foreground text-center mb-4">¿En qué tienda estás?</p>

      <Input
        value={store}
        onChange={(e) => setStore(e.target.value)}
        placeholder="Ej. Olímpica, Éxito…"
        inputMode="text"
        enterKeyHint="done"
        autoFocus
        className="mb-4 text-center"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && store.trim()) onConfirm(store.trim())
        }}
      />

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          className="flex-1 rounded-xl"
          disabled={!store.trim()}
          onClick={() => onConfirm(store.trim())}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
