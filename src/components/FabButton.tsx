import { cn } from '@/lib/utils'

interface FabButtonProps {
  onClick: () => void
  pendingCount?: number
}

export function FabButton({ onClick, pendingCount = 0 }: FabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Agregar gasto"
      className={cn(
        'fixed z-40 right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]',
        'h-14 w-14 rounded-full ocean-gradient text-white text-2xl font-bold',
        'shadow-coral flex items-center justify-center',
        'active:scale-[0.94] transition-transform'
      )}
    >
      +
      {pendingCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-background" />
      )}
    </button>
  )
}
