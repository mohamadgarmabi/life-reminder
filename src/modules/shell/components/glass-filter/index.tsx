import { GlassLayer } from '#/components/glass'
import type { ReactNode } from 'react'

// Liquid-glass pill behind filter controls; the inner TabsList goes transparent so the glass shows.
// Active tab is a solid inverse pill and idle labels near full contrast, so they stay legible over any glass.
const GlassFilter = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative isolate rounded-full p-0.5 **:data-[slot=tabs-list]:h-10 **:data-[slot=tabs-list]:rounded-full **:data-[slot=tabs-list]:bg-transparent **:data-[slot=tabs-trigger]:rounded-full **:data-[slot=tabs-trigger]:font-semibold **:data-[slot=tabs-trigger]:text-foreground/80 **:data-[slot=tabs-trigger]:data-[state=active]:bg-primary! **:data-[slot=tabs-trigger]:data-[state=active]:text-primary-foreground! **:data-[slot=tabs-trigger]:data-[state=active]:shadow-md">
      <GlassLayer radius={22} />
      {children}
    </div>
  )
}

export { GlassFilter }
