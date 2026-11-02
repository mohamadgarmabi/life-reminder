import { Bell, Flower2, House, Settings, Wallet } from 'lucide-react'
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop'
import { Button } from '#/components/button'
import { GlassLayer } from '#/components/glass'

// Colourful stripes so refraction, blur and colour fringing are visible (the app's own background is plain).
const PATTERN = {
  background:
    'repeating-linear-gradient(45deg, rgb(255 255 255 / 0.4) 0 10px, transparent 10px 28px), linear-gradient(135deg, #ff8a5b, #7b61ff 50%, #2ec5ff)',
}
const ICONS = [House, Wallet, Flower2, Bell, Settings]

// Live sample of the app's glass surfaces with the current settings. Its own scene: on iOS the glass
// refracts a snapshot of this box instead of the page behind the sheet.
const GlassPreview = () => {
  return (
    <LiquidGlassScene data-vaul-no-drag className="relative isolate space-y-3 overflow-hidden rounded-2xl p-3">
      <div aria-hidden className="absolute inset-0 -z-10" style={PATTERN} />
      <div className="relative isolate rounded-2xl p-4">
        <GlassLayer radius={16} />
        <p className="font-semibold">کارت شیشه‌ای</p>
        <p className="text-sm text-muted-foreground">همهٔ کارت‌ها، پنجره‌ها و منوها همین شکلی می‌شوند.</p>
      </div>
      <div className="flex justify-center gap-2">
        <Button variant="outline">دکمه</Button>
        <Button variant="secondary" size="icon" aria-label="نمونهٔ دکمهٔ آیکون">
          <Bell />
        </Button>
      </div>
      <div className="relative isolate grid grid-cols-5 rounded-full p-1">
        <GlassLayer radius={28} />
        {ICONS.map((Icon, i) => (
          <span
            key={i}
            className={`flex h-12 items-center justify-center rounded-full ${i === 0 ? 'bg-accent text-foreground' : 'text-muted-foreground'}`}
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        ))}
      </div>
    </LiquidGlassScene>
  )
}

export { GlassPreview }
