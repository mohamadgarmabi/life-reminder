import type { IslandLayerProps } from '#/modules/shell/types/island'
import { useIslandLayer } from '#/modules/shell/hooks/island-layer.hook'
import { IslandExpandedGrid } from '#/modules/shell/components/island-expanded-grid'

const IslandLayer = (props: IslandLayerProps) => {
  const {
    rootRef,
    kind,
    rootHidden,
    rootInert,
    rootStyle,
    leadingSlotRef,
    trailingSlotRef,
    attachedSlotRef,
    detachedSlotRef,
    splitAttachedLeadingSlotRef,
    splitAttachedTrailingSlotRef,
    splitDetachedLeadingSlotRef,
    splitDetachedTrailingSlotRef,
    expandedClipSlotRef,
    registerSlot,
    isCompact,
    compactStyle,
    compactLeading,
    compactTrailing,
    isMinimal,
    minimalStyle,
    minimalAttached,
    hasDetached,
    minimalDetached,
    hasSplit,
    splitAttachedLeading,
    splitAttachedTrailing,
    splitDetachedLeading,
    splitDetachedTrailing,
    expandedPresentation,
    expandedClipStyle,
    metrics,
    expandedWidth,
  } = useIslandLayer(props)

  return (
    <div ref={rootRef} data-layer={kind} aria-hidden={rootHidden} inert={rootInert} style={rootStyle}>
      {isCompact && (
        <>
          <div data-slot="leading" ref={leadingSlotRef} style={compactStyle}>
            {compactLeading}
          </div>
          <div data-slot="trailing" ref={trailingSlotRef} style={compactStyle}>
            {compactTrailing}
          </div>
        </>
      )}
      {isMinimal && (
        <>
          <div data-slot="attached" ref={attachedSlotRef} style={minimalStyle}>
            {minimalAttached}
          </div>
          {hasDetached && (
            <div data-slot="detached" ref={detachedSlotRef} style={minimalStyle}>
              {minimalDetached}
            </div>
          )}
          {hasSplit && (
            <>
              <div data-slot="splitAttachedLeading" ref={splitAttachedLeadingSlotRef} style={minimalStyle}>
                {splitAttachedLeading}
              </div>
              <div data-slot="splitAttachedTrailing" ref={splitAttachedTrailingSlotRef} style={minimalStyle}>
                {splitAttachedTrailing}
              </div>
              <div data-slot="splitDetachedLeading" ref={splitDetachedLeadingSlotRef} style={minimalStyle}>
                {splitDetachedLeading}
              </div>
              <div data-slot="splitDetachedTrailing" ref={splitDetachedTrailingSlotRef} style={minimalStyle}>
                {splitDetachedTrailing}
              </div>
            </>
          )}
        </>
      )}
      {expandedPresentation && (
        <div data-slot="expandedClip" ref={expandedClipSlotRef} style={expandedClipStyle}>
          <IslandExpandedGrid
            presentation={expandedPresentation}
            register={registerSlot}
            metrics={metrics}
            expandedWidth={expandedWidth}
          />
        </div>
      )}
    </div>
  )
}

export { IslandLayer }
