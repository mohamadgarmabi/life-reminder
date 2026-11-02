import { ChevronLeft, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '#/components/button'
import { Card, CardTitle } from '#/components/card'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '#/components/drawer'
import { Label } from '#/components/label'
import { Select } from '#/components/select'
import { GlassPreview } from '#/modules/settings/components/glass-preview'
import { useGlassCard } from '#/modules/settings/hooks/glass-card.hook'
import { GLASS_CONTROLS, GLASS_MATERIAL_OPTIONS } from '#/modules/settings/utils/settings.constants'

const GlassCard = () => {
  const { open, setOpen, material, materialLabel, valueOf, handleMaterialChange, handleChange, handleReset } =
    useGlassCard()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-2xl text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Card className="flex-row items-center gap-3 px-4 transition-transform active:scale-[0.98]">
          <Sparkles className="size-5" aria-hidden />
          <CardTitle className="flex-1">شیشهٔ مایع</CardTitle>
          <span className="text-sm text-muted-foreground">{materialLabel}</span>
          <ChevronLeft className="size-5 text-muted-foreground" aria-hidden />
        </Card>
      </button>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>شیشهٔ مایع</DrawerTitle>
          <DrawerDescription>ظاهر شیشهٔ همهٔ بخش‌های برنامه. تغییرها همان لحظه اعمال می‌شوند.</DrawerDescription>
        </DrawerHeader>
        <div data-vaul-no-drag className="space-y-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { GlassCard }
