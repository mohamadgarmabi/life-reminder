import type { ReactNode } from 'react'

// Frosted pill behind filter controls; the inner TabsList goes transparent so the glass shows.
const GlassFilter = ({ children }: { children: ReactNode }) => {
  return (
    <div className="rounded-full glass-strong p-0.5 **:data-[slot=tabs-list]:h-10 **:data-[slot=tabs-list]:rounded-full **:data-[slot=tabs-list]:bg-transparent **:data-[slot=tabs-trigger]:rounded-full">
      {children}
    </div>
  )
}

export { GlassFilter }
