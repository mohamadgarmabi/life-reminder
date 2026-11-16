import type { ReactNode } from 'react'

// Card-coloured pill behind filter controls; the inner TabsList goes transparent so the pill shows.
// Active tab is a solid inverse pill and idle labels near full contrast.
const FilterPill = ({ children }: { children: ReactNode }) => {
  return (
    <div className="rounded-full bg-card p-0.5 **:data-[slot=tabs-list]:h-10 **:data-[slot=tabs-list]:rounded-full **:data-[slot=tabs-list]:bg-transparent **:data-[slot=tabs-trigger]:rounded-full **:data-[slot=tabs-trigger]:font-semibold **:data-[slot=tabs-trigger]:text-foreground/80 **:data-[slot=tabs-trigger]:data-[state=active]:bg-primary! **:data-[slot=tabs-trigger]:data-[state=active]:text-primary-foreground! **:data-[slot=tabs-trigger]:data-[state=active]:shadow-md">
      {children}
    </div>
  )
}

export { FilterPill }
