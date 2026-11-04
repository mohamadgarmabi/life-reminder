import type { ReactNode } from 'react'
import { cn } from '#/modules/shell/utils/cn'

/** Centered glass card over a dimmed game, the same look as the arcade games' overlay. */
const Panel = ({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 p-6 animate-in fade-in duration-200">
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'flex max-h-full w-full max-w-sm flex-col items-stretch gap-3 overflow-y-auto rounded-3xl glass-strong p-6 text-center animate-in zoom-in-95 duration-200',
        className,
      )}
    >
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {children}
    </div>
  </div>
)

export { Panel }
