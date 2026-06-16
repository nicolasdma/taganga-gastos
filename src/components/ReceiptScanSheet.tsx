import { useCallback, useEffect, useRef, useState } from 'react'
import { useAction } from 'convex/react'
import { CraftLoading } from '@/components/craft/CraftLoading'
import { api } from '../../convex/_generated/api'
import { BottomSheet } from '@/components/BottomSheet'
import {
  ReceiptReviewContent,
  type ReceiptReviewFooterState,
} from '@/components/ReceiptReviewSheet'
import { resizeReceiptImage } from '@/lib/receiptImage'
import type { SaveReceiptResult } from '@/hooks/useReceiptSave'
import type { ReceiptScanResult } from '@/lib/receiptScan'
import { Button } from '@/components/ui/button'

export type { SaveReceiptResult }

interface ReceiptScanSheetProps {
  open: boolean
  onClose: () => void
  onSaved: (result: SaveReceiptResult) => void
}

type ScanPhase = 'idle' | 'loading' | 'error' | 'review'

export function ReceiptScanSheet({ open, onClose, onSaved }: ReceiptScanSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const scanReceipt = useAction(api.receiptScan.scanReceipt)

  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null)
  const [reviewFooter, setReviewFooter] = useState<ReceiptReviewFooterState | null>(null)

  const reset = () => {
    setPhase('idle')
    setError(null)
    setScanResult(null)
    setReviewFooter(null)
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
    if (!open) return
    const t = window.setTimeout(() => {
      setPhase('idle')
      setError(null)
      setScanResult(null)
      setReviewFooter(null)
      inputRef.current?.click()
    }, 50)
    return () => clearTimeout(t)
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

  const handleReviewFooterState = useCallback((state: ReceiptReviewFooterState) => {
    setReviewFooter(state)
  }, [])

  const showSheet = open && (phase === 'loading' || phase === 'error' || phase === 'review')

  const footer = (() => {
    if (phase === 'error') {
      return (
        <Button className="w-full rounded-2xl" size="lg" onClick={openCamera}>
          Reintentar
        </Button>
      )
    }
    if (phase === 'review' && reviewFooter) {
      return (
        <Button
          size="lg"
          className="w-full rounded-2xl"
          disabled={!reviewFooter.canSave || reviewFooter.saving}
          onClick={reviewFooter.save}
        >
          {reviewFooter.saving ? 'Guardando…' : 'Guardar'}
        </Button>
      )
    }
    return undefined
  })()

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

      <BottomSheet
        open={showSheet}
        onClose={handleClose}
        height="tall"
        title={phase === 'review' ? 'Revisar ticket' : undefined}
        headerAction="cancel"
        footer={footer}
        scrollKey={phase}
      >
        {phase === 'loading' && (
          <div className="relative py-8">
            <div className="craft-paw-collage absolute inset-0 pointer-events-none" aria-hidden />
            <CraftLoading
              variant="inline"
              message="Leyendo ticket…"
              showKitty
              showPaws={false}
              size="lg"
            />
            <p className="text-sm text-muted-foreground mt-1 text-center relative z-10">
              Esto puede tardar unos segundos
            </p>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-base font-bold text-foreground mb-2">No se pudo leer el ticket</p>
            <p className="text-sm text-muted-foreground px-4">{error}</p>
          </div>
        )}

        {phase === 'review' && scanResult && (
          <ReceiptReviewContent
            key={scanResult.items.map((i) => `${i.label}:${i.amount}`).join('|')}
            scanResult={scanResult}
            onSaved={(result) => {
              handleClose()
              onSaved(result)
            }}
            onFooterState={handleReviewFooterState}
          />
        )}
      </BottomSheet>
    </>
  )
}
