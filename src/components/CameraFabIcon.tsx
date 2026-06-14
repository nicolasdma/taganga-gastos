import { cn } from '@/lib/utils'

interface CameraFabIconProps {
  className?: string
}

export function CameraFabIcon({ className }: CameraFabIconProps) {
  return (
    <img
      src="/camera-fab.png"
      alt=""
      aria-hidden
      draggable={false}
      className={cn('object-contain pointer-events-none select-none', className)}
    />
  )
}
