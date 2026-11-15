import { describe, expect, it } from 'vitest'
import { plantDiagnosisSchema, plantIdentifySchema } from '#/modules/plants/utils/plants.schema'

describe('plant AI schemas', () => {
  it('clamps and coerces a messy identify reply', () => {
    expect(plantIdentifySchema.parse({ name: ' پوتوس ', wateringIntervalDays: '999', care: 1 })).toEqual({
      name: 'پوتوس',
      wateringIntervalDays: 365,
      care: '',
    })
    expect(plantIdentifySchema.parse({}).wateringIntervalDays).toBe(7)
  })

  it('falls back on missing diagnosis fields', () => {
    expect(plantDiagnosisSchema.parse({ healthy: true })).toEqual({
      name: '',
      healthy: true,
      summary: '',
      problems: [],
    })
  })
})
