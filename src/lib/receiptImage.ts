const MAX_WIDTH = 1200
const JPEG_QUALITY = 0.8

export interface ResizedImage {
  base64: string
  mimeType: string
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo cargar la imagen'))
    }
    img.src = url
  })
}

export async function resizeReceiptImage(file: File): Promise<ResizedImage> {
  const img = await loadImage(file)
  const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')

  ctx.drawImage(img, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  const base64 = dataUrl.split(',')[1]
  if (!base64) throw new Error('Error al procesar imagen')

  return { base64, mimeType: 'image/jpeg' }
}
