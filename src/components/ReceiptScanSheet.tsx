import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { CameraFabIcon } from '@/components/CameraFabIcon'
import type { SaveReceiptResult } from '@/hooks/useReceiptSave'
import { Button } from '@/components/ui/button'

export type { SaveReceiptResult }

interface ReceiptScanSheetProps {
  open: boolean
  onClose: () => void
  onSaved: (result: SaveReceiptResult) => void
}

const scanBenefits = [
  'Lee tickets de compra',
  'Agrega los ítems automáticamente',
  'Ahorra tiempo en compras largas',
]

export function ReceiptScanSheet({ open, onClose }: ReceiptScanSheetProps) {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const handleClose = () => {
    setShowComingSoon(false)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      height="standard"
      title="Por+"
      headerAction="cancel"
      footer={
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-cobalt-glaze/18 bg-cobalt-glaze/8 px-4 py-3">
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-none text-ink">US$1/mes</p>
              <p className="mt-1 text-[11px] font-semibold leading-snug text-muted-foreground">
                Un upgrade simple para registrar más rápido.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-stitch/45 bg-porcelain-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cobalt-glaze">
              Por+
            </span>
          </div>
          <Button
            size="lg"
            className="btn-cobalt w-full rounded-2xl"
            onClick={() => setShowComingSoon(true)}
          >
            Activar Por+
          </Button>
          <p className="px-2 text-center text-[11px] font-medium leading-snug text-muted-foreground">
            {showComingSoon
              ? 'Coming soon. Podés seguir cargando gastos manualmente.'
              : 'Por ahora el escaneo está en camino.'}
          </p>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <div className="relative overflow-hidden rounded-[1.55rem] border-2 border-stitch/35 bg-porcelain-cream/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div
            className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cobalt-glaze/8"
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-cobalt-glaze/25 bg-white/60">
              <CameraFabIcon className="h-10 w-10" />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cobalt-glaze">
                Ticket detectado
              </p>
              <p className="mt-1 font-display text-lg font-bold leading-tight text-ink">
                Leche, pan, café y 4 ítems más
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Listos para revisar y guardar.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-center">
          <p className="label-stitch">Por+ escaneo</p>
          <h2 className="font-display text-[1.65rem] font-bold leading-[1.05] tracking-tight text-ink">
            Escaneá tickets sin cargar ítem por ítem
          </h2>
          <p className="mx-auto max-w-[19rem] text-sm font-medium leading-relaxed text-muted-foreground">
            Sacá una foto y Gatonomía arma el gasto con los productos detectados. Revisás y
            guardás.
          </p>
        </div>

        <div className="space-y-2 rounded-[1.35rem] border border-border/55 bg-white/35 p-3">
          {scanBenefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 text-left">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cobalt-glaze/25 bg-cobalt-glaze/10"
                aria-hidden
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cobalt-glaze" />
              </span>
              <p className="text-sm font-bold leading-snug text-foreground/85">{benefit}</p>
            </div>
          ))}
        </div>

        <p className="px-2 text-center text-[12px] font-medium leading-relaxed text-muted-foreground">
          Ideal para supermercados, farmacias y compras con muchos productos.
        </p>
      </div>
    </BottomSheet>
  )
}
