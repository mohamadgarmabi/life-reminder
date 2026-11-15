import type { IslandSurfaceProps } from '#/modules/shell/types/island'
import { useIslandSurface } from '#/modules/shell/hooks/island-surface.hook'
import { IslandLayer } from '#/modules/shell/components/island-layer'

/** Draws one island: the black shape, the content layers, and the pressable hit areas. The frame loop moves them. */
const IslandSurface = (props: IslandSurfaceProps) => {
  const {
    rootRef,
    regionLabel,
    presentationKind,
    rootStyle,
    surfaceCss,
    stageStyle,
    stageWidth,
    stageHeight,
    viewBox,
    shadowBoxStyle,
    shadowPillRef,
    shadowBubbleRef,
    svgRef,
    svgStyle,
    filterId,
    filterBox,
    keyDeviation,
    keyOffset,
    shadowKeyRef,
    tailDeviation,
    tailOffset,
    shadowTailRef,
    hasGrain,
    hasPlainShade,
    grainHref,
    grainSize,
    grainGateSlope,
    grainRaise,
    grainLower,
    keylineWidth,
    kPillRef,
    kBridgeRef,
    kBubbleRef,
    svgPillRef,
    svgBridgeRef,
    svgBubbleRef,
    initialPaths,
    hasPill,
    pillHitRef,
    pillLabel,
    pillHidden,
    pillTabIndex,
    expanded,
    pillHandlers,
    hitStyle,
    hasBubble,
    bubbleHitRef,
    bubbleLabel,
    bubbleHandlers,
    bubbleHitStyle,
    contentRef,
    contentStyle,
    layers,
    register,
    metrics,
    expandedWidth,
    hasSensor,
    sensorStyle,
    sensorPath,
    liveLabel,
    srOnlyStyle,
  } = useIslandSurface(props)

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={regionLabel}
      data-islandcn=""
      data-presentation={presentationKind}
      style={rootStyle}
    >
      <style href="islandcn-surface" precedence="islandcn">
        {surfaceCss}
      </style>
      <div style={stageStyle}>
        {/* The shadow in Apple's WebKit (`placeShadow`); hidden elsewhere. */}
        <div ref={shadowPillRef} aria-hidden="true" style={shadowBoxStyle} />
        <div ref={shadowBubbleRef} aria-hidden="true" style={shadowBoxStyle} />
        <svg
          ref={svgRef}
          aria-hidden="true"
          width={stageWidth}
          height={stageHeight}
          viewBox={viewBox}
          shapeRendering="geometricPrecision"
          style={svgStyle}
        >
          {/* The shadow: a key layer and a broad, faint tail, each the shape's alpha blurred, moved down and scaled per frame. */}
          <defs>
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              x={filterBox.x}
              y={filterBox.y}
              width={filterBox.width}
              height={filterBox.height}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation={keyDeviation} result="keyBlur" />
              <feOffset in="keyBlur" dx={0} dy={keyOffset} result="keyMoved" />
              <feComponentTransfer in="keyMoved" result="key">
                <feFuncA ref={shadowKeyRef} type="linear" slope={0} />
              </feComponentTransfer>
              <feGaussianBlur in="SourceAlpha" stdDeviation={tailDeviation} result="tailBlur" />
              <feOffset in="tailBlur" dx={0} dy={tailOffset} result="tailMoved" />
              <feComponentTransfer in="tailMoved" result="tail">
                <feFuncA ref={shadowTailRef} type="linear" slope={0} />
              </feComponentTransfer>
              <feMerge result="shade">
                <feMergeNode in="tail" />
                <feMergeNode in="key" />
              </feMerge>
              {/* The grain: shade + g x (noise - 1/2) x levels / 255, the half taken off after the noise (results clamp to 0..1). */}
              {hasGrain && (
                <>
                  <feImage
                    href={grainHref}
                    x={0}
                    y={0}
                    width={grainSize}
                    height={grainSize}
                    preserveAspectRatio="none"
                    result="grainTile"
                  />
                  <feTile in="grainTile" result="grainNoise" />
                  <feComponentTransfer in="shade" result="grainGate">
                    <feFuncA type="linear" slope={grainGateSlope} />
                  </feComponentTransfer>
                  <feComposite
                    in="grainGate"
                    in2="grainNoise"
                    operator="arithmetic"
                    k1={1}
                    k2={0}
                    k3={0}
                    k4={0}
                    result="grainScaled"
                  />
                  <feComposite
                    in="shade"
                    in2="grainScaled"
                    operator="arithmetic"
                    k1={0}
                    k2={1}
                    k3={grainRaise}
                    k4={0}
                    result="shadeRaised"
                  />
                  <feComposite
                    in="shadeRaised"
                    in2="grainGate"
                    operator="arithmetic"
                    k1={0}
                    k2={1}
                    k3={grainLower}
                    k4={0}
                    result="shadeGrain"
                  />
                  <feMerge>
                    <feMergeNode in="shadeGrain" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </>
              )}
              {hasPlainShade && (
                <feMerge>
                  <feMergeNode in="shade" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              )}
            </filter>
          </defs>
          {/* Keyline strokes under the fills: only their outer half shows, outside the black edge. */}
          <g fill="none" stroke="#fff" strokeWidth={keylineWidth} strokeOpacity={0} strokeLinejoin="round">
            <path ref={kPillRef} d={initialPaths.pill} />
            <path ref={kBridgeRef} d={initialPaths.bridge} />
            <path ref={kBubbleRef} d={initialPaths.bubble} />
          </g>
          <path ref={svgPillRef} d={initialPaths.pill} fill="#000" />
          <path ref={svgBridgeRef} d={initialPaths.bridge} fill="#000" />
          <path ref={svgBubbleRef} d={initialPaths.bubble} fill="#000" />
        </svg>
        {hasPill && (
          <button
            ref={pillHitRef}
            type="button"
            data-islandcn-hit="pill"
            aria-label={pillLabel}
            aria-hidden={pillHidden}
            tabIndex={pillTabIndex}
            aria-expanded={expanded}
            style={hitStyle}
            {...pillHandlers}
          />
        )}
        {hasBubble && (
          <button
            ref={bubbleHitRef}
            type="button"
            data-islandcn-hit="bubble"
            aria-label={bubbleLabel}
            style={bubbleHitStyle}
            {...bubbleHandlers}
          />
        )}
        <div ref={contentRef} style={contentStyle}>
          {layers.map((layer) => (
            <IslandLayer
              key={layer.key}
              layerKey={layer.key}
              presentation={layer.presentation}
              register={register}
              metrics={metrics}
              expandedWidth={expandedWidth}
              leaving={layer.leaving}
            />
          ))}
        </div>
        {/* The sensor housing stays put above the content, as the hardware does. */}
        {hasSensor && (
          <svg
            aria-hidden="true"
            data-islandcn-sensor=""
            width={stageWidth}
            height={stageHeight}
            viewBox={viewBox}
            shapeRendering="geometricPrecision"
            style={sensorStyle}
          >
            <path d={sensorPath} fill="#000" />
          </svg>
        )}
      </div>
      <span aria-live="polite" style={srOnlyStyle}>
        {liveLabel}
      </span>
    </div>
  )
}

export { IslandSurface }
