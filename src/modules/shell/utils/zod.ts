import { z } from 'zod'

const isoDate = z.iso.date()
const isoDateTime = z.iso.datetime({ offset: true })
const id = z.string().min(1)
const notes = z.string().max(2000).nullable()

export { isoDate, isoDateTime, id, notes }
