import { useEffect, useRef, useState } from 'react'
import { useAction } from 'convex/react'
import { CameraFabIcon } from '@/components/CameraFabIcon'
import { api } from '../../convex/_generated/api'
import { BottomSheet } from '@/components/BottomSheet'
import { ReceiptReviewSheet } from '@/components/ReceiptReviewSheet'
import { resizeReceiptImage } from '@/lib/receiptImage'
import type { ReceiptScanResult } from '@/lib/receiptScan'
import { Button } from '@/components/ui/button'

interface ReceiptScanSheetProps {
  open: boolean
  onClose: () => void
  onSaved: (result: import('@/hooks/useReceiptSave').SaveReceiptResult) => void
}

type ScanPhase = 'idle' | 'loading' | 'error' | 'review'

export function ReceiptScanSheet({ open, onClose, onSaved }: ReceiptScanSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const scanReceipt = useAction(api.receiptScan.scanReceipt)

  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null)

  const reset = () => {
    setPhase('idle')
    setError(null)
    setScanResult(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const openCamera = () => {
    setError(null)
    inputRef.current?.click()
  }

  useEffect(() => {
    if (open) {
      reset()
      const t = setTimeout(openCamera, 50)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      handleClose()
      return
    }
    setPhase('loading')
    setError(null)

    try {
      const { base64, mimeType } = await resizeReceiptImage(file)
      const result = await scanReceipt({ imageBase64: base64, mimeType })
      setScanResult(result)
      setPhase('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al leer el ticket')
      setPhase('error')
    }
  }

  if (phase === 'review' && scanResult) {
    return (
      <ReceiptReviewSheet
        open={open}
        scanResult={scanResult}
        onClose={handleClose}
        onSaved={(result) => {
          handleClose()
          onSaved(result)
        }}
      />
    )
  }

  const showSheet = open && (phase === 'loading' || phase === 'error')

  return (
    <>
      {phase === 'loading' && <div className="scan-flash" aria-hidden />}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          void handleFile(file)
        }}
      />

      <BottomSheet open={showSheet} onClose={handleClose}>
        {phase === 'loading' && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-border/40 shadow-sm">
              <CameraFabIcon className="h-12 w-12 animate-pulse" />
            </div>
            <p className="text-base font-bold text-foreground">Leyendo ticket…</p>
            <p className="text-sm text-muted-foreground mt-2">Esto puede tardar unos segundos</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-base font-bold text-foreground mb-2">No se pudo leer el ticket</p>
            <p className="text-sm text-muted-foreground mb-6 px-4">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={openCamera}>
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  )
}
