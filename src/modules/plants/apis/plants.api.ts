import { abortTx, getDb, newId, validRecords } from '#/modules/database/apis/database.api'
import { notifyDbChange } from '#/modules/database/utils/live'
import { nowIso, todayIso } from '#/modules/shell/utils/dates'
import { plantSchema, wateringSchema } from '#/modules/plants/utils/plants.schema'
import { type CareKind, type Plant, type PlantFormValues, type Watering } from '#/modules/plants/types'
import type { IsoDate } from '#/modules/shell/types'

/** Form values → stored fields: misting settings are kept only while misting is on. */
const fromForm = ({ misting, mistingIntervalDays, lastMistedAt, notes, ...rest }: PlantFormValues) => ({
  ...rest,
  notes: notes.trim() || null,
  mistingIntervalDays: misting ? mistingIntervalDays : null,
  lastMistedAt: misting ? lastMistedAt : null,
})

const plantRepo = {
  list: async (): Promise<Plant[]> => {
    const db = await getDb()
    return validRecords(plantSchema, await db.getAll('plants'), 'plants')
  },

  create: async (values: PlantFormValues): Promise<Plant> => {
    const now = nowIso()
    const record = plantSchema.parse({
      ...fromForm(values),
      id: newId(),
      createdAt: now,
      updatedAt: now,
    })
    await (await getDb()).add('plants', record)
    notifyDbChange()
    return record
  },

  update: async (id: string, values: PlantFormValues): Promise<Plant> => {
    const db = await getDb()
    const tx = db.transaction('plants', 'readwrite')
    const current = plantSchema.parse(await tx.store.get(id))
    const record = plantSchema.parse({
      ...current,
      ...fromForm(values),
      updatedAt: nowIso(),
    })
    await tx.store.put(record)
    await tx.done
    notifyDbChange()
    return record
  },

  remove: async (id: string) => {
    const db = await getDb()
    const tx = db.transaction(['plants', 'waterings'], 'readwrite')
    const waterings = tx.objectStore('waterings')
    for (const key of await waterings.index('byPlant').getAllKeys(id)) await waterings.delete(key)
    await tx.objectStore('plants').delete(id)
    await tx.done
    notifyDbChange()
  },

  waterings: async (plantId: string): Promise<Watering[]> => {
    const db = await getDb()
    const rows = await db.getAllFromIndex('waterings', 'byPlant', plantId)
    return validRecords(wateringSchema, rows, 'waterings').sort((a, b) => b.date.localeCompare(a.date))
  },

  /** Records a watering or misting on `date` (default today). False if that day is already recorded. */
  logCare: async (id: string, kind: CareKind, date: IsoDate = todayIso(), now: Date = new Date()): Promise<boolean> => {
    const db = await getDb()
    const tx = db.transaction(['plants', 'waterings'], 'readwrite')
    const logs = tx.objectStore('waterings')
    if (await logs.index('byPlantKindDate').getKey([id, kind, date])) {
      abortTx(tx)
      return false
    }
    const plant = plantSchema.parse(await tx.objectStore('plants').get(id))
    await logs.add({ id: newId(), plantId: id, kind, date, wateredAt: now.toISOString() })
    const field = kind === 'water' ? 'lastWateredAt' : 'lastMistedAt'
    // A back-dated entry only moves the schedule if it is newer than what is stored.
    const last = plant[field]
    if (!last || date > last) await tx.objectStore('plants').put({ ...plant, [field]: date, updatedAt: nowIso() })
    await tx.done
    notifyDbChange()
    return true
  },
}

export { plantRepo }
