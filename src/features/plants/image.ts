/**
 * Downscale a photo to at most `max` px and re-encode as JPEG. Phone photos are several MB;
 * this keeps each plant image ~30–80 KB in IndexedDB and in JSON backups.
 */
export async function resizeImage(file: File, max = 640): Promise<string> {
  const bitmap = await createImageBitmap(file) // applies EXIF orientation
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('پردازش تصویر در این مرورگر ممکن نیست.')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}
