import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

const MAX_SIDE = 2400
const MAX_BYTES = 15 * 1024 * 1024
const KEEP_AS_IS = ['image/gif', 'image/svg+xml']

function extFor(type) {
  return { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' }[type] || 'bin'
}

function measure(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({ w: 0, h: 0 }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

// Screenshots and photos are re-encoded as WebP and capped at MAX_SIDE, which
// usually shrinks them 3-10x; the original wins if re-encoding does not help.
export async function prepareImage(file) {
  if (KEEP_AS_IS.includes(file.type) || typeof createImageBitmap !== 'function') {
    const { w, h } = await measure(file)
    return { blob: file, type: file.type || 'application/octet-stream', w, h }
  }
  let bitmap
  try { bitmap = await createImageBitmap(file) } catch {
    const { w, h } = await measure(file)
    return { blob: file, type: file.type, w, h }
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const blob = await new Promise(r => canvas.toBlob(r, 'image/webp', 0.86))
  if (!blob || (scale === 1 && blob.size >= file.size)) return { blob: file, type: file.type, w, h }
  return { blob, type: 'image/webp', w, h }
}

export async function uploadImage(storage, noteId, file, onProgress) {
  const { blob, type, w, h } = await prepareImage(file)
  if (blob.size > MAX_BYTES) throw new Error('too-big')
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extFor(type)}`
  const task = uploadBytesResumable(ref(storage, `notes/${noteId}/${name}`), blob, {
    contentType: type,
    cacheControl: 'public, max-age=31536000, immutable',
  })
  if (onProgress) task.on('state_changed', s => onProgress(s.bytesTransferred / Math.max(1, s.totalBytes)))
  await task
  const url = await getDownloadURL(task.snapshot.ref)
  return w && h ? `${url}#w=${w}&h=${h}` : url
}

export function imageSize(url) {
  const m = /#w=(\d+)&h=(\d+)/.exec(url || '')
  return m ? { w: +m[1], h: +m[2] } : null
}
