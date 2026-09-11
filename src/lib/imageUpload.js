export async function imageFileToDataUrl(file, options = {}) {
  if (!file) return ''
  if (!file.type?.startsWith('image/')) throw new Error('Please choose an image file.')
  const maxInputBytes = options.maxInputBytes || 8 * 1024 * 1024
  if (file.size > maxInputBytes) throw new Error('That image is too large. Please choose an image under 8 MB.')

  const src = await readFile(file)
  const img = await loadImage(src)
  const size = options.size || 420
  const quality = options.quality ?? 0.78
  const cropSquare = options.cropSquare !== false

  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
  if (cropSquare) {
    const side = Math.min(sw, sh)
    sx = Math.max(0, (sw - side) / 2)
    sy = Math.max(0, (sh - side) / 2)
    sw = side
    sh = side
  }

  const ratio = Math.min(1, size / Math.max(sw, sh))
  const width = Math.max(1, Math.round(sw * ratio))
  const height = Math.max(1, Math.round(sh * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)

  let result = canvas.toDataURL('image/jpeg', quality)
  const maxOutputBytes = options.maxOutputBytes || 220 * 1024
  if (approxBytes(result) > maxOutputBytes) {
    result = canvas.toDataURL('image/jpeg', Math.max(0.48, quality - 0.18))
  }
  if (approxBytes(result) > maxOutputBytes * 1.35) {
    throw new Error('The image could not be compressed enough. Please choose a smaller image.')
  }
  return result
}

function approxBytes(dataUrl) {
  const comma = dataUrl.indexOf(',')
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  return Math.ceil((b64.length * 3) / 4)
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('The selected image could not be opened.'))
    img.src = src
  })
}
