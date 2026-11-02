import { GlassLayer } from '#/components/glass'
import type { ReactNode } from 'react'

// Liquid-glass pill behind filter controls; the inner TabsList goes transparent so the glass shows.
const GlassFilter = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative isolate rounded-full p-0.5 **:data-[slot=tabs-list]:h-10 **:data-[slot=tabs-list]:rounded-full **:data-[slot=tabs-list]:bg-transparent **:data-[slot=tabs-trigger]:rounded-full">
      <GlassLayer radius={22} />
      {children}
    </div>
  )
}

export { GlassFilter }
