import { z } from 'zod'

export const isoDate = z.iso.date()
export const isoDateTime = z.iso.datetime({ offset: true })
export const id = z.string().min(1)
export const notes = z.string().max(2000).nullable()
