import { CameraFabIcon } from '@/components/CameraFabIcon'
import { cn } from '@/lib/utils'

interface FabStackProps {
  onAdd: () => void
  onScan: () => void
  pendingCount?: number
  hidden?: boolean
}

export function FabStack({ onAdd, onScan, pendingCount = 0, hidden }: FabStackProps) {
  if (hidden) return null

  return (
    <div
      className={cn(
        'fixed z-40 right-4 bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))]',
        'flex flex-col items-center gap-3 fab-stack-wrap'
      )}
    >
      <button
        type="button"
        onClick={onScan}
        aria-label="Escanear ticket"
        className={cn(
          'h-14 w-14 btn-cobalt fab-tilt-scan animate-float-gentle',
          'flex items-center justify-center overflow-hidden',
          'active:translate-y-1 active:shadow-none transition-all duration-150'
        )}
      >
        <CameraFabIcon className="h-[2.4rem] w-[2.4rem]" />
      </button>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Agregar gasto"
        className={cn(
          'relative h-[3.75rem] w-[3.75rem] btn-clay fab-tilt-add',
          'text-2xl font-bold font-display',
          'flex items-center justify-center',
          'active:translate-y-1 active:shadow-none transition-all duration-150'
        )}
      >
        +
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yarn-blush border-2 border-porcelain-cream text-[9px] flex items-center justify-center animate-wobble-soft">
            🐾
          </span>
        )}
      </button>
    </div>
  )
}
