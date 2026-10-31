import { abortTx, getDb, newId, validRecords } from '#/modules/database/apis/database.api'
import { notifyDbChange } from '#/modules/database/utils/live'
import { nowIso, todayIso } from '#/modules/shell/utils/dates'
import { plantSchema, wateringSchema } from '#/modules/plants/utils/plants.schema'
import { type Plant, type PlantFormValues, type Watering } from '#/modules/plants/types'

const plantRepo = {
  list: async (): Promise<Plant[]> => {
    const db = await getDb()
    return validRecords(plantSchema, await db.getAll('plants'), 'plants')
  },

  create: async (values: PlantFormValues): Promise<Plant> => {
    const now = nowIso()
    const record = plantSchema.parse({
      ...values,
      id: newId(),
      notes: values.notes.trim() || null,
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
      ...values,
      notes: values.notes.trim() || null,
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

  markWatered: async (id: string, now: Date = new Date()): Promise<boolean> => {
    const date = todayIso(now)
    const db = await getDb()
    const tx = db.transaction(['plants', 'waterings'], 'readwrite')
    const waterings = tx.objectStore('waterings')
    if (await waterings.index('byPlantDate').getKey([id, date])) {
      abortTx(tx)
      return false
    }
    const plant = plantSchema.parse(await tx.objectStore('plants').get(id))
    await waterings.add({ id: newId(), plantId: id, date, wateredAt: now.toISOString() })
    if (date > plant.lastWateredAt) {
      await tx.objectStore('plants').put({ ...plant, lastWateredAt: date, updatedAt: nowIso() })
    }
    await tx.done
    notifyDbChange()
    return true
  },
}

export { plantRepo }
