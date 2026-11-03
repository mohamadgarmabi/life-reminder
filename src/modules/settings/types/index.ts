import type { ReactNode } from 'react'
import type { z } from 'zod'
import type { backupSchema } from '#/modules/settings/apis/backup.api'
import type { settingsSchema } from '#/modules/settings/stores/settings.store'

type Backup = z.infer<typeof backupSchema>

type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string }

type Settings = z.infer<typeof settingsSchema>

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
}

type GlassSettings = Settings['glass']
type GlassMaterial = GlassSettings['material']
type GlassControlKey = Exclude<keyof GlassSettings, 'material'>

interface GlassControl {
  key: GlassControlKey
  label: string
  min: number
  max: number
  step: number
}

export type {
  Backup,
  GlassControl,
  GlassControlKey,
  GlassMaterial,
  GlassSettings,
  ParseResult,
  Settings,
  SettingsSectionProps,
}
