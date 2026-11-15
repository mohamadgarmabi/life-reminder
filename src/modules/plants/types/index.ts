import type { z } from 'zod'
import type { IsoDate } from '#/modules/shell/types'
import type {
  plantDiagnosisSchema,
  plantFormSchema,
  plantIdentifySchema,
  plantSchema,
  wateringSchema,
} from '#/modules/plants/utils/plants.schema'

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

type PlantIdentify = z.infer<typeof plantIdentifySchema>

type PlantDiagnosis = z.infer<typeof plantDiagnosisSchema>

type PlantsDialog = { type: 'create' | 'doctor' } | { type: 'edit' | 'history'; item: Plant } | null

export type {
  Plant,
  Watering,
  PlantFormValues,
  PlantCardProps,
  PlantFormProps,
  WateringHistoryProps,
  PlantsDialog,
  PlantDiagnosis,
  PlantIdentify,
}
