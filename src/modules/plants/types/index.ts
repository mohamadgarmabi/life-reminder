import type { z } from 'zod'
import type { IsoDate } from '#/modules/shell/types'
import type { plantFormSchema, plantSchema, wateringSchema } from '#/modules/plants/utils/plants.schema'

type Plant = z.infer<typeof plantSchema>

type Watering = z.infer<typeof wateringSchema>

type PlantFormValues = z.infer<typeof plantFormSchema>

type PlantCardProps = {
  plant: Plant
  today: IsoDate
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}

type PlantFormProps = {
  initial?: Plant
  onSubmit: (values: PlantFormValues) => Promise<void>
}

type WateringHistoryProps = { plantId: string }

type PlantsDialog = { type: 'create' } | { type: 'edit' | 'history' | 'delete'; item: Plant } | null

export type { Plant, Watering, PlantFormValues, PlantCardProps, PlantFormProps, WateringHistoryProps, PlantsDialog }
