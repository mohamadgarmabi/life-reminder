import { MoreVertical } from 'lucide-react'
import { Button } from '#/components/button'
import { ActionSheet } from '#/modules/shell/components/action-sheet'
import { SwipeRow } from '#/modules/shell/components/swipe-row'
import type { TimelineCardProps } from '#/modules/reminders/types'

// One block on the day timeline: icon tile, title, status tab; local reminders also get a ⋮ menu and swipe actions.
const TimelineCard = ({
  title,
  subtitle,
  badge,
  badgeClassName,
  cardClassName,
  titleClassName,
  Icon,
  menu,
  menuAriaLabel,
  swipe,
}: TimelineCardProps) => {
  const card = (
    <div className={cardClassName}>
      <span className="flex size-11 shrink-0 rotate-45 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="size-5 -rotate-45" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <span className={badgeClassName}>{badge}</span>
        <p className={titleClassName}>{title}</p>
        {subtitle && <p className="truncate text-xs opacity-70">{subtitle}</p>}
      </div>
      {menu && (
        <ActionSheet
          title={title}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={menuAriaLabel}>
              <MoreVertical />
            </Button>
          }
          groups={menu}
        />
      )}
    </div>
  )
  if (!swipe) return card
  return (
    <SwipeRow direction="right" label={title} radius={24} actions={swipe}>
      {card}
    </SwipeRow>
  )
}

export { TimelineCard }
