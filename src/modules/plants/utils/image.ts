import { t } from '#/modules/shell/utils/i18n'

const resizeImage = async (file: File, max = 640): Promise<string> => {
  const bitmap = await createImageBitmap(file) // applies EXIF orientation
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error(t('plants.imageUnsupported'))
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}

export { resizeImage }
