import type { IslandExpandedGridProps } from '#/modules/shell/types/island'
import { useIslandExpandedGrid } from '#/modules/shell/hooks/island-expanded-grid.hook'

const IslandExpandedGrid = (props: IslandExpandedGridProps) => {
  const {
    gridRef,
    gridStyle,
    innerRef,
    innerStyle,
    intrinsicStyle,
    leadingRegionRef,
    leadingRegionStyle,
    leadingRef,
    leadingContent,
    centerRegionRef,
    centerRegionStyle,
    centerRef,
    centerContent,
    trailingRegionRef,
    trailingRegionStyle,
    trailingRef,
    trailingContent,
    hasBottom,
    bottomRegionRef,
    bottomRegionStyle,
    bottomContent,
  } = useIslandExpandedGrid(props)

  return (
    <div data-slot="expanded" ref={gridRef} style={gridStyle}>
      <div ref={innerRef} style={innerStyle}>
        <div ref={leadingRegionRef} style={leadingRegionStyle}>
          <div ref={leadingRef} style={intrinsicStyle}>
            {leadingContent}
          </div>
        </div>
        <div ref={centerRegionRef} style={centerRegionStyle}>
          <div ref={centerRef} style={intrinsicStyle}>
            {centerContent}
          </div>
        </div>
        <div ref={trailingRegionRef} style={trailingRegionStyle}>
          <div ref={trailingRef} style={intrinsicStyle}>
            {trailingContent}
          </div>
        </div>
        {hasBottom && (
          <div ref={bottomRegionRef} style={bottomRegionStyle}>
            {bottomContent}
          </div>
        )}
      </div>
    </div>
  )
}

export { IslandExpandedGrid }
