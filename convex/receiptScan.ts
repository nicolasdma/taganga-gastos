'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'

declare const process: { env: Record<string, string | undefined> }

const SCAN_PROMPT = `Analizá esta imagen de un ticket o factura colombiana.
Extraé los ítems individuales con sus montos en pesos colombianos (COP), como enteros sin decimales.
Si hay nombre de establecimiento, incluilo en "store".
Si hay un total impreso en el ticket, incluilo en "total".

Respondé SOLO con JSON válido en este formato exacto:
{
  "store": "nombre del lugar o null",
  "items": [{ "label": "nombre del producto", "amount": 12345 }],
  "total": 12345
}

Reglas:
- Montos en COP enteros (sin centavos ni decimales)
- Ignorá IVA desglosado, subtotales y cambio — solo ítems de productos/servicios
- Si un ítem no tiene monto claro, omitilo
- Si el ticket es ilegible, devolvé "items": []`

interface ScanItem {
  label: string
  amount: number
}

interface ScanResult {
  store?: string
  items: ScanItem[]
  total?: number
}

function parseScanResponse(text: string): ScanResult {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned) as {
    store?: string | null
    items?: Array<{ label?: string; amount?: number }>
    total?: number | null
  }

  const items: ScanItem[] = (parsed.items ?? [])
    .filter((i) => i.label && typeof i.amount === 'number' && i.amount > 0)
    .map((i) => ({
      label: String(i.label).trim(),
      amount: Math.round(i.amount ?? 0),
    }))

  return {
    store: parsed.store ? String(parsed.store).trim() : undefined,
    items,
    total: typeof parsed.total === 'number' && parsed.total > 0 ? Math.round(parsed.total) : undefined,
  }
}

export const scanReceipt = action({
  args: {
    imageBase64: v.string(),
    mimeType: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada en Convex')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SCAN_PROMPT },
                {
                  inline_data: {
                    mime_type: args.mimeType,
                    data: args.imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Error de visión: ${response.status} ${errText.slice(0, 200)}`)
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('No se pudo leer el ticket — intentá con mejor luz o más cerca')
    }

    const result = parseScanResponse(text)
    if (result.items.length === 0) {
      throw new Error('Ticket ilegible — no se encontraron ítems. Podés agregarlos manualmente.')
    }

    return result
  },
})
