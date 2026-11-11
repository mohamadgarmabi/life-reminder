import { RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '#/components/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { Label } from '#/components/label'
import { Select } from '#/components/select'
import { Switch } from '#/components/switch'
import { SettingsRow } from '#/modules/settings/components/settings-row'
import { GlassPreview } from '#/modules/settings/components/glass-preview'
import { useGlassCard } from '#/modules/settings/hooks/glass-card.hook'
import { GLASS_CONTROLS, GLASS_MATERIAL_OPTIONS } from '#/modules/settings/utils/settings.constants'

const GlassCard = () => {
  const {
    open,
    setOpen,
    enabled,
    material,
    materialLabel,
    valueOf,
    handleMaterialChange,
    handleChange,
    handleEnabledChange,
    handleReset,
  } = useGlassCard()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <SettingsRow
        icon={Sparkles}
        tone="bg-violet-500"
        title="شیشهٔ مایع"
        trailing={<span className="text-sm text-muted-foreground">{materialLabel}</span>}
        onClick={() => setOpen(true)}
      />

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>شیشهٔ مایع</DrawerTitle>
          <DrawerDescription>ظاهر شیشهٔ همهٔ بخش‌های برنامه. تغییرها همان لحظه اعمال می‌شوند.</DrawerDescription>
        </DrawerHeader>
        <div data-vaul-no-drag className="space-y-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="glass-enabled">شیشهٔ مایع روشن باشد</Label>
            <Switch id="glass-enabled" checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>
          {enabled && (
            <>
              {/* Pinned so the effect stays in view while scrolling the sliders. */}
              <div className="sticky top-0 z-10 pb-2">
                <GlassPreview />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Select
                  nested
                  label="جنس شیشه"
                  value={material}
                  onValueChange={handleMaterialChange}
                  options={GLASS_MATERIAL_OPTIONS}
                />
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw aria-hidden />
                  بازنشانی
                </Button>
              </div>
              {GLASS_CONTROLS.map(({ key, label, min, max, step }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`glass-${key}`}>{label}</Label>
                    <output htmlFor={`glass-${key}`} dir="ltr" className="text-xs text-muted-foreground tabular-nums">
                      {valueOf(key)}
                    </output>
                  </div>
                  <input
                    id={`glass-${key}`}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={valueOf(key)}
                    onChange={handleChange(key)}
                    className="h-6 w-full cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { GlassCard }
