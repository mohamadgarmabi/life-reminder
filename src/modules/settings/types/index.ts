import type { LucideIcon } from 'lucide-react'
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

interface SettingsRowProps {
  icon: LucideIcon
  /** Tailwind bg class for the icon tile. */
  tone: string
  title: string
  description?: ReactNode
  /** Makes the title a label for this control id. */
  htmlFor?: string
  /** Control on the end side (switch, value, button). */
  trailing?: ReactNode
  /** Extra content under the title row. */
  children?: ReactNode
  onClick?: () => void
  to?: string
  destructive?: boolean
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
  SettingsRowProps,
  SettingsSectionProps,
}
