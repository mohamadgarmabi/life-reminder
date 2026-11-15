import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { shapeTransitions } from '#/modules/shell/utils/island/motion'
import type { AnimatedValue } from '#/modules/shell/utils/island/spring'

// choreography

/**
 * How one presentation change moves the shape: which spring drives each property, which legs go
 * through the idle shape, and how the detached bubble pinches off or merges. Pure: the renderer
 * and the headless simulator (`scripts/fidelity/sim.ts`) both call it, so a fitted curve is the
 * curve the page plays.
 */

/** "spring" plays the motion, "reduced" eases with no overshoot, "instant" snaps. */
type MotionMode = 'spring' | 'reduced' | 'instant'

interface ShapeChange {
  transition: ShapeTransition
  target: ShapeTarget
  /** The idle shape, which activity-swapping morphs pass through. */
  idle: ShapeTarget
  /** Clock time in seconds the change starts at. */
  t0: number
  motion: IslandMotion
  mode: MotionMode
}

// clock

/**
 * Island time. Everything that moves reads the time from a clock instead of the wall clock, so
 * a capture can pause it and step exact frames.
 *
 * Times are milliseconds. A clock also runs timers (long-press, alert hold) so they fire at the
 * same instant on every run.
 */
interface IslandClock {
  /** Current time in ms. */
  now(): number
  /** Calls `onFrame` once per frame until the returned function is called. */
  onFrame(onFrame: (now: number) => void): () => void
  /** Runs `run` once the clock reaches `at` (ms), passing the time it was due. Returns a cancel function. */
  at(at: number, run: (due: number) => void): () => void
}

// config

/** Every key optional, at every depth. Used for metrics and motion overrides. */
type DeepPartial<T> = { [K in keyof T]?: T[K] extends number ? number : DeepPartial<T[K]> }

type IslandMetricsOverrides = DeepPartial<IslandMetrics>

type IslandMotionOverrides = DeepPartial<IslandMotion>

// frame

/** The animated numbers behind the shape. One spring per property. */
interface ShapeAnimation {
  left: AnimatedValue
  right: AnimatedValue
  top: AnimatedValue
  height: AnimatedValue
  radius: AnimatedValue
  /**
   * The two left corners' radius. It moves with `radius` (same target, spring and wait) unless the
   * transition has its own (`islandMotion.cornerLead`): the return into the split keeps its leading
   * end rounder than its trailing one.
   */
  leadRadius: AnimatedValue
  bubbleLeft: AnimatedValue
  bubbleRight: AnimatedValue
  bubbleHeight: AnimatedValue
  /** 0 centres the bubble on the pill's height, 1 puts it at the pill's top (the collapse into the split). */
  bubbleRise: AnimatedValue
  /**
   * Points the attached pill rides above `top`, the bubble staying put: the collapse into the split
   * lifts the pill and lets it back down (split-alert-t1). 0 everywhere else.
   */
  lift: AnimatedValue
  /** 0 at rest, 1 fully pressed. Scales the pill about its centre by `squishFactor`. */
  squish: AnimatedValue
  /**
   * The same for the detached bubble, pressed on its own: only the bubble swells, the attached pill
   * keeps its place and size (held-out split-expand-b: 62.17 to 69.4 wide, the pill unmoved).
   */
  bubbleSquish: AnimatedValue
  /**
   * Points the pill is drawn wider than its edges and swell put it, about its centre: what an idle
   * island's swell leaves behind as it turns back (`press.idleWiden`). 0 everywhere else.
   */
  widen: AnimatedValue
  /**
   * How far the expanded shadow has come in, 0 to 1. It eases in on `islandMotion.shadowRamp` from
   * the start of an expansion and holds at 1 otherwise, so the shadow is the lesser of this and the
   * expansion: it trails the opening shape and leaves with the collapsing one.
   */
  shadow: AnimatedValue
  /** How much a full `squish` grows the pill: the long-press swell or the controlled hold squish. */
  squishFactor: number
  /** Height of the expanded shape at rest, which the shadow's strength is measured against. */
  restHeight: number
  /**
   * Where the split's neck breaks for the motion under way, and how it thins; null uses `metrics.bridge`.
   * `tip` draws the pointed nubs its first break leaves (`collapseSplitSpread.neckTip`), up to the
   * absolute time `until`.
   */
  neck: { gap: number; power: number; tip?: { length: number; reach: number; until: number } } | null
  /**
   * From `at` seconds the neck is drawn as in a merge (`metrics.bridge`) whatever `neck` says: a
   * pressed bubble whose join is decided starts joining ahead of the change (`bubble.joinLead`).
   */
  joinFrom: number | null
  /**
   * While the pill is at least `above` points tall its right corners take `leadRadius` too, and by
   * `below` they are back on `radius` (`cornerLead.trailing`). Kept until another change sets its
   * own, so an interrupted return carries on blending; with the two radii equal it draws nothing new.
   */
  cornerTrail: { above: number; below: number } | null
}

/** One drawn frame, in stage coordinates (x from the stage's left edge, y from its top). */
interface FrameGeometry {
  /** `radius` is the right corners', `lead` the left corners' (the same but on the return into the split). */
  pill: { x: number; y: number; width: number; height: number; radius: number; lead: number }
  /** The pill as drawn: inset by the shadow's pull (`expanded.shadow.pull`), its corner capped to fit. */
  drawn: { x: number; y: number; width: number; height: number; radius: number; lead: number }
  /**
   * Detached capsule box (left edge, top, size). Height 0 when there is none; width 0 while it is
   * too small to draw (under half a point). `span` is its width either way, which its content rides
   * so the content keeps moving when the capsule stops being drawn. `scale` is its press swell.
   */
  bubble: { x: number; y: number; width: number; height: number; span: number; scale: number }
  /**
   * `clip` is the content clip (concentric, its corner radius capped); `outline` the same boxes with
   * the island's own corners, which cuts content blurred past the clip (expanded content is clipped
   * before it is blurred, as on iOS).
   */
  paths: { pill: string; bubble: string; bridge: string; clip: string; outline: string; bubbleClip: string }
  /** 0 at capsule height, 1 at the expanded shape's resting height. */
  expansion: number
  /** The expanded shadow's strength, 0 to 1: the expansion, held back while the shadow eases in. */
  shadow: number
}

// geometry

/**
 * Where the shape is heading. x values are offsets from the screen's centre line, so the
 * sensor area always sits at 0; y values are from the top of the screen.
 */
interface ShapeTarget {
  left: number
  right: number
  top: number
  height: number
  radius: number
  /** Detached capsule edges. When there is none they sit inside the pill's trailing end. */
  bubbleLeft: number
  bubbleRight: number
  /** Detached capsule height. 0 when there is no second activity. */
  bubbleHeight: number
}

/** Natural content widths the shape has to fit, measured from the DOM. */
interface ContentMeasure {
  leading: number
  trailing: number
  /** Minimal content shown in the attached pill (the fallback split). */
  attached: number
  /** Minimal content shown in the detached capsule (the fallback split). */
  detached: number
  /** The iOS 27 split: compact content of the attached and the detached activity. */
  split: { attached: SlotPair; detached: SlotPair } | null
  /** Height of the expanded regions laid out at the expanded width, without padding. */
  expandedHeight: number
}

interface SlotPair {
  leading: number
  trailing: number
}

// metrics

/** One measured point of the keyline's fade: a page luma and the band's strength there. */
interface KeylineFadePoint {
  /** Page luma, 0 to 1, gamma-encoded Rec. 709 of the page's hex (as `colourLuma` reads it). */
  luma: number
  /** Strength as a share of `keyline.alpha`, so an override of the full strength scales the fade with it. */
  share: number
}

/** Shape of the metrics table, so overrides and calibration keep every key. */
interface IslandMetricsShape {
  screen: { width: number; height: number }
  top: number
  idle: { width: number; height: number }
  corner: { smoothing: number }
  compact: {
    height: number
    sensorWidth: number
    edgePadding: number
    innerPadding: { leading: number; trailing: number }
    maxSlotWidth: number
    maxWidth: number
    balance: number
  }
  minimal: {
    height: number
    attached: { outerPadding: number; innerPadding: number }
    detached: { padding: number; minWidth: number }
    gap: number
  }
  split: {
    attached: { outerPadding: number; gap: number; innerPadding: number }
    detached: {
      outerPadding: number
      gap: number
      trailingPadding: number
      width: number
      slotGap: number
      slotEnd: number
    }
    maxSpan: number
  }
  expanded: {
    sideInset: number
    top: number
    minHeight: number
    maxHeight: number
    radius: number
    cornerAspect: number
    cornerExponent: number
    padding: { top: number; side: number; bottom: number; trailing?: number }
    bottomInset: number
    centerTop: number
    rowGap: number
    shadow: {
      offsetY: number
      blur: number
      aspect: number
      opacity: number
      tail: { offsetY: number; blur: number; aspect: number; strength: number }
      pull: { side: number; top: number; bottom: number; opacity: number }
      grain: { levels: number; full: number }
    }
  }
  contentClip: { radius: number; chamfer: number }
  press: { squish: number; swell: number; bubbleSwell?: number }
  bridge: { handleSize: number; spread: number; maxGap: number }
  content: { blur: number; scale: number; follow: number; followMin: number; followMax: number }
  sensor: { opacity: number }
  keyline: {
    width: number
    alpha: number
    fullUntil: number
    noneFrom: number
    expandedDim: number
    ramp: number
  }
}

type IslandMetrics = IslandMetricsShape

// motion

/** The leading corners' own spring (`IslandMotion.cornerLead`), and how far the trailing ones share it. */
interface CornerLead extends DelayedSpring {
  /** Optional, default none (the right corners keep `corner`). Heights in points, `above` > `below`. */
  trailing?: { above: number; below: number }
}

interface DelayedSpring extends SpringConfig {
  /** Seconds to wait before the spring starts. */
  delay: number
}

/** How the incoming bubble's accent settles into its size from below (`ContentMotion.bubbleSettle`). */
interface BubbleSettle extends DelayedSpring {
  /** The share of its size the accent is drawn smaller at the change's start, falling to 0. */
  depth: number
}

/** How content crosses over during one transition. */
interface ContentMotion {
  enter: DelayedSpring
  exit: DelayedSpring
  /**
   * How the detached bubble's content leaves when the bubble joins the pill. Defaults to `exit`
   * (unsplit-t1 blurs the blue out with the rest). A `response` of 0 cuts it at once, `delay` after
   * the change starts. A negative `delay` leads the join when it is known ahead (a decided
   * long-press on the bubble), and cuts at the change's start otherwise: a long-pressed bubble
   * goes black just before it merges (`swap`).
   */
  bubbleExit?: DelayedSpring
  /**
   * Optional, defaults to false. With `bubbleExit`, only the bubble's accent is cut; its text leaves
   * with the layer, blurring into a patch that keeps its ink while the bubble merges.
   */
  bubbleExitAccent?: boolean
  /**
   * Optional. The incoming detached bubble's presence on a spring of its own, from the change's
   * start (its `delay` replaces `bubbleDelay`). Without it the bubble rides the layer's presence,
   * `bubbleDelay` behind. Round 23: returning into the split, iOS's green keeps its larger form
   * and lower peak about a frame longer than the attached pill's content would let it.
   */
  bubbleEnter?: DelayedSpring
  /**
   * Optional. The incoming compact trailing slot (its text) on a presence spring of its own, from
   * the change's start (it replaces `trailingDelay`), and, with `trailingEnterBlur`, its own peak
   * blur. Round 23: on appear iOS's digits come in about eight frames after its accent's first
   * sight, on a quicker curve than the accent's.
   */
  trailingEnter?: DelayedSpring
  /** Optional, defaults to `enterBlur`. The incoming trailing slot's peak blur with `trailingEnter`. */
  trailingEnterBlur?: number
  /**
   * Optional, defaults to `scale`. The scale an incoming compact trailing slot grows from, for its
   * size and for the place it follows (`anchor`). Round 43: W's "12:45" is twice as long as A's "42",
   * so scaling it about the island's centre pulled it 6 to 10 pt toward the sensor where iOS's
   * shows within 4 pt of its place.
   */
  trailingScale?: number
  /**
   * Optional, defaults to 0 (none). Coming into a compact pill, each slot's opacity is at least
   * this times the layer's presence, so the content shows as a faint glow before its own, steeper
   * curve takes over. Round 25: on appear t1, t2, t3, t9 and wide-appear t1, t2, t9 iOS's accent
   * and digits first show 4 to 6 frames after the onset, about 3 frames before the web's, and are
   * level with it again by +12 to +14.
   */
  enterGlow?: number
  /**
   * Optional, defaults to `enter` and `centerDelay`. How the incoming layer comes in when the change
   * absorbs the bubble as a lobe (a long-press on the bubble, `swap` out of the split): iOS shows the
   * expanded view's leading content sooner and its center later than out of a single pill.
   */
  absorb?: Pick<ContentMotion, 'enter' | 'centerDelay' | 'regions' | 'clipFollow' | 'regionBottomAnchor'> & {
    /** Optional: the absorbing change's own peak incoming blur (round 20: split-expand-b keeps 10 where swap took 12). */
    enterBlur?: number
    /**
     * Optional, defaults to this transition's. How the layer the absorbing change takes out fades
     * (`exitFade`) and how its accent's blur rises (`exitSharpen`), apart from a swap that does not
     * absorb the bubble (split-alert's alert takes A out on the same transition).
     */
    exitFade?: number
    exitSharpen?: number
  }
  /**
   * Optional, defaults to `enter`, `fade` and `regions`. How the incoming layer comes in when the
   * change ends a group's handoff: the island took the shown activity to idle, waited, and now
   * expands the alerting one (swap's B). Round 29 (t23 labelled judge A, yes/yes on swap-t23 and
   * -t24): at equal card width iOS's B stays softer through the growth than an activity that
   * alerts from idle without one (appear-alert), then sharpens on a steeper curve.
   */
  afterHandoff?: Pick<ContentMotion, 'enter' | 'fade' | 'regions'>
  /**
   * Optional, defaults to none. How the incoming layer comes in when the shape it comes into is at
   * least `from` points wide, over this transition's own fields: W's 178 pt compact pill against
   * A's 150 (round 43, wide-appear's "12:45"; `appearWide` does the same for the edges).
   */
  wide?: { from: number } & Partial<
    Pick<
      ContentMotion,
      | 'scale'
      | 'enterBlur'
      | 'sharpen'
      | 'trailingEnterBlur'
      | 'trailingEnter'
      | 'trailingScale'
      | 'trailingEnterClear'
      | 'enterGlow'
      | 'leadingFade'
    >
  >
  /**
   * Optional, defaults to none. How the layer this change takes out leaves when the compact pill it
   * leaves is at least `from` points wide, over this transition's own fields. `wide` reads the shape
   * the change goes to, so it cannot tell W's dismiss from A's: both go to idle.
   */
  exitWide?: { from: number } & Partial<
    Pick<
      ContentMotion,
      | 'scale'
      | 'blur'
      | 'exitScale'
      | 'exitTravel'
      | 'exitLeadingFade'
      | 'exitBlur'
      | 'exitSharpen'
      | 'exitFade'
      | 'anchor'
      | 'trailingExitPower'
    >
  >
  /**
   * Optional, defaults to the fields below. How the incoming layer comes in when the change leaves an
   * alert whose hold ran out, over this transition's own fields. Round 22: back into the split,
   * iOS brings split-alert's content in later and steeper than split-collapse-b's press outside
   * (split-alert-t1, t2, t9: the bubble's "7" shows nothing until +846 and is near full by +850).
   * Its accent rides the layer's presence, `bubbleDelay` behind, unless `bubbleEnter` gives it a
   * spring of its own here (this transition's own `bubbleEnter` is not used after an alert), and
   * may blur on a curve of its own (`bubbleBlur`, `bubbleSharpen`).
   */
  afterAlert?: Partial<
    Pick<
      ContentMotion,
      | 'enter'
      | 'bubbleEnter'
      | 'bubbleDelay'
      | 'bubbleFade'
      | 'bubbleResolve'
      | 'bubbleTrailingFade'
      | 'bubbleTrailingSlide'
      | 'bubbleBlur'
      | 'bubbleSharpen'
      | 'bubbleScale'
      | 'bubbleSpread'
      | 'bubbleHold'
      | 'bubbleSettle'
    >
  >
  /**
   * Optional, defaults to none. The incoming bubble's accent settles into its size from below: it
   * is drawn `depth` of its size smaller, a share that falls to 0 on a spring of its own from the
   * change's start, so it keeps growing after its presence is complete. Round 27: back into the
   * split after an alert, every seen take's blue is 20.7 pt wide at the pinch and grows to 21.7 to
   * 22 pt over the next 0.2 to 0.3 s, with its ink (split-alert t1 to t17).
   */
  bubbleSettle?: BubbleSettle
  /** Peak blur in px of the outgoing layer. */
  blur: number
  /** Peak blur in px of the incoming layer (usually `blur`). */
  enterBlur: number
  /** Scale content arrives from and leaves to. */
  scale: number
  /** Opacity of the incoming layer is presence to this power: under 1 keeps blurred content bright. */
  fade: number
  /** The same for the outgoing layer. */
  exitFade: number
  /** Extra seconds the detached bubble's content waits before it comes in; negative brings it in first. */
  bubbleDelay: number
  /**
   * Extra seconds the compact trailing slot waits before it comes in: iOS brings the text after
   * the leading shape (collapse-t1 +0.15 s, unsplit-t1 +0.15 s from first sight; blur hides
   * thin strokes longer than a circle, so the extra delay that matches is smaller).
   */
  trailingDelay: number
  /**
   * The compact trailing slot (text, usually) leaves faster than the leading shape: while a layer
   * goes, the trailing slot's presence is raised to this power. 1 leaves them together.
   */
  trailingExitPower: number
  /**
   * Where compact and split content sits while the shape morphs. 0: each slot keeps its fraction
   * of the shape's width. 1: the layer scales about the island's centre with the content's own
   * scale, so content leaving a shrinking pill slides in under the sensor and is cut by it, as
   * on the device (dismiss-t1). In between blends the two. Below 0 it pushes the other way, toward
   * the island's ends (the leading slot only), by the same measure: content coming back into a pill that is still growing
   * starts near its end and slides out with the presence (round 17: collapse-t1 and t2 put the
   * returning circle 6.6 pt from the outline at 115 pt wide, 0.88 of the half-width, against the
   * rest's 0.78; -2 matches).
   */
  anchor: number
  /**
   * The incoming layer's blur is (1 - presence) to this power times `enterBlur`. 1 ties blur to
   * presence; above 1 the layer sharpens ahead of its opacity, as compact content does coming back after a collapse (collapse-t1:
   * readable at 57% opacity, sharp at 75%).
   */
  sharpen: number
  /**
   * The leading slot (compact leading, the split's attached leading) comes in at presence to
   * `fade` x this: under 1 it brightens ahead of the text while sharpening with it, as the returning
   * circle does in split-alert-t1 (opacity 0.56 at 844 while "42" is at 0.23, both sharp at 851).
   */
  leadingFade: number
  /**
   * Optional, defaults to 1. How much of the blur's wide part (`blurSkirt`) this transition's
   * content draws, a factor on its weight: 0 draws one Gaussian as before (round 42).
   */
  skirt?: number
  /** Scale the detached bubble's content comes in from (usually `scale`). */
  bubbleScale: number
  /**
   * How far the bubble's content spreads out while it comes in. 0: it rides the moving bubble.
   * Above 0 it holds its resting place, each slot's distance from the resting bubble's centre
   * multiplied by 1 + `bubbleSpread` x (1 - presence) ^ `sharpen`: the near slot slides out from under the
   * sensor and the far one starts past the bubble's edge, revealed as it moves in (split-alert-t1).
   */
  bubbleSpread: number
  /**
   * Optional, defaults to 0. How far the bubble's content is stretched across while it comes in:
   * its width is multiplied by 1 + `bubbleStretch` x (1 - presence) ^ `sharpen`, its height is not,
   * so it closes with the spread and the blur. iOS lays the returning content out for the lobe it
   * comes back in, which is wider than the bubble while it is still joined to the pill: the circle
   * comes back as a horizontal patch, cut by the sensor, that narrows into the circle
   * (split-collapse-b-t1, t2 and t9; split-alert-t1, t2 and t9).
   */
  bubbleStretch?: number
  /**
   * Optional, defaults to 1. The power the accent's stretch closes on: its excess is `bubbleStretch`
   * x closing ^ `bubbleStretchPower`, where closing is what the scale and the spread close on. Over
   * 1 the patch narrows into the circle sooner while its size and the text keep their curve (round 42).
   */
  bubbleStretchPower?: number
  /**
   * Optional, defaults to none. Where the bubble's incoming content scales from, as a fraction of
   * the resting row's height from its top (0 the row's top, 0.5 its middle). Unset, the content is
   * centred in the island while that is taller than the bubble. iOS keeps the returning circle on
   * its row, grown about the row's top: its top edge holds 26 to 27 pt from first sight while the
   * row cuts its bottom, so the sensor bites it along its whole end (round 18: split-collapse-b-t1,
   * t2, t9 and split-alert-t1, t2, t9, where the web's centred patch started 34 to 39 pt down).
   */
  bubbleOrigin?: number
  /**
   * Optional, defaults to 0. With `bubbleOrigin`, the presence up to which the incoming content
   * keeps its larger, stretched form; past it the form resolves on `bubbleSharpen`'s power, the
   * blur's curve started sooner.
   */
  bubbleHold?: number
  /**
   * Optional, defaults to `bubbleSharpen`. With `bubbleHold`, the power the returning form resolves
   * on past the hold (its scale and `bubbleStretch`), apart from the blur's. Under `bubbleSharpen`
   * the patch narrows into the circle over more frames while its blur still falls on its own curve.
   */
  bubbleResolve?: number
  /**
   * Optional, defaults to `fade`. The incoming bubble content's opacity is presence to this power:
   * above `fade` its larger returning form stays dim, so it carries no more ink than the circle
   * it becomes (split-collapse-b-t1, t2, t9: 200 to 300 pt^2 against the circle's 345).
   */
  bubbleFade?: number
  /**
   * Optional, defaults to `scale`. The scale a leaving accent (the compact or split pill's leading
   * slot) shrinks toward: 1 keeps it its size while it blurs and fades, so it slides under the
   * sensor whole (round 19: dismiss-t1, t2, t9, the circle's half-height grows from 19 to 30 pt as
   * the sensor cuts it). Its text leaves on `scale`.
   */
  exitScale?: number
  /**
   * Optional, defaults to `scale`. The scale a leaving compact accent's place follows with `anchor`
   * (its text keeps `scale`): under `scale` it travels further toward the island's centre, so it
   * slides in under the sensor while it is still bright, and the sensor hides it rather than its fade.
   */
  exitTravel?: number
  /**
   * Optional, defaults to 1. A leaving accent (the compact or split pill's leading slot) fades at
   * presence to `exitFade` x this: under 1 it stays brighter than its text while it slides in under
   * the sensor.
   */
  exitLeadingFade?: number
  /**
   * Optional, defaults to `scale`. The scale an incoming accent (the compact or split pill's leading
   * slot) grows from; its text comes in on `scale`. Round 35: back into compact A after the
   * unsplit, iOS's circle shows 23 to 24 pt tall while the pill is at its narrowest (21.3 at rest)
   * where scale 0.8 drew it 16 to 18 pt.
   */
  enterScale?: number
  /**
   * Optional, defaults to 0 (none). While the compact pill is narrower than at rest, an incoming
   * accent is drawn narrower by (width / rest width) ^ `enterSqueeze`, its inner edge (toward the
   * sensor) where it would be unsqueezed. Round 36: back into compact A after the unsplit, iOS's
   * circle is narrower than tall and stays 2 to 6 pt inside the outline while the pill widens (at
   * 140 pt of width its half-peak left edge at 136.4 pt and 16.4 pt wide on all 15 seen takes),
   * where the web's was already 21 pt wide and met the outline.
   */
  enterSqueeze?: number
  /**
   * Optional, defaults to 0. Which edge of the squeezed accent (`enterSqueeze`) holds its place: 0
   * its inner edge (toward the sensor), 1 its outer edge (toward the pill's end), between the two in
   * proportion. Round 37 (-t37 triangle: "returning orange dot is rounder and brighter while the
   * real ones retain a taller blur/haze"): coming back after a collapse iOS's circle keeps its
   * outer side 2 to 4 pt inside the outline and its sensor side 2 to 6 pt short of the sensor while
   * the pill is narrower than at rest (collapse, all 17 seen takes), unlike unsplit's, which keeps
   * its sensor side at the sensor.
   */
  enterSqueezeOrigin?: number
  /**
   * Optional, defaults to 0 (none). An incoming accent is also drawn narrower by presence ^ this,
   * about `enterSqueezeOrigin`'s edge, whatever the pill's width: iOS's returning circle comes in
   * as a tall, narrow haze that is still narrower than tall once the pill is back at its width
   * (collapse, all 17 seen takes: half-peak 8.3 x 23 pt at +24 frames, 17.3 x 21 at +31, round by +40).
   */
  enterNarrow?: number
  /**
   * Optional, defaults to 0 (none). The incoming trailing slot of a compact or attached pill (its
   * text) starts this many points toward the sensor and closes the distance as
   * (1 - presence) ^ `trailingSlidePower`, so it comes out from under the sensor, cut by it, instead
   * of showing beside it. Round 37 (-t37 triangle on split: iOS "clips 42 against the centre"): on
   * all 17 seen split takes iOS's "42" touches the sensor's end from +25 to +29 frames (gap 0.1 pt,
   * white 0.10 to 0.29 at the cut) and slides about 14 pt to its place by +36, where the web's showed
   * 6 to 8 pt clear of the sensor. A negative distance starts the text away from the sensor
   * instead (round 38: iOS's digits returning from a collapse come in up to 3 pt further out than
   * their place and settle inward).
   */
  trailingSlide?: number
  /** Optional, defaults to 1. The power `trailingSlide` closes on: above 1 the text leaves the sensor sooner. */
  trailingSlidePower?: number
  /**
   * Optional, defaults to 0 (none). The share of an incoming layer's presence still to come when
   * its blur reaches zero: the blur follows (1 - presence - this) / (1 - this), so it starts at its
   * peak as before and clears this much sooner, which ends a long spring's soft tail without
   * changing the first frames. Round 38 (-t39 labelled judge A, yes/yes on collapse, collapse-dark,
   * wide-collapse, alert and appear-alert: iOS's returning circle and digits are sharp about 3
   * frames sooner at the same outline). From round 40 an incoming expanded view reads it too, its
   * shared blur and every region's own.
   */
  enterClear?: number
  /** Optional, defaults to `enterClear`. The same for the incoming trailing slot (the text) alone. */
  trailingEnterClear?: number
  /**
   * Optional, defaults to 0. How far an incoming expanded layer's content clip follows the content
   * instead of the island's outline: at 1 the resting clip is mapped onto the current shape as the
   * content is, so the cut on the leading tile's and the bar's outer corners holds while the island
   * grows (`followingClip`). Round 39 (held-out -t41 triangle, 65 to 75% on alert, appear-alert,
   * split-alert and swap: iOS's expanding tile shows "a flatter diagonal cut", the web's a rounder
   * corner at the same width).
   */
  clipFollow?: number
  /** Optional, defaults to `blur`. The leaving accent's peak blur, on `exitSharpen`'s curve. */
  exitBlur?: number
  /**
   * Optional, defaults to `blur`. The leaving detached bubble's accent's peak blur; its text keeps
   * `blur`. Round 37: unsplit's leaving text blurs from 6.5 px while the bubble's blue, beside the
   * sensor's end, keeps the 4.5 px it had (the proxy's sensor group read the softer blue as further out).
   */
  bubbleExitBlur?: number
  /**
   * Optional, defaults to 1. A leaving accent blurs by `exitBlur` x (1 - presence) ^ `exitSharpen`
   * px: over 1 it keeps its shape while it is bright and spreads into a broad patch as it fades.
   */
  exitSharpen?: number
  /**
   * Optional, defaults to 0. Coming back into a split, the attached pill's slots keep up to this
   * share of the way from their place in the collapsing shape (their fraction of its height)
   * to the resting row's middle. Round 20 (r19a and b): out of the expanded view iOS's returning
   * accent sits on the row from first sight (cy 33.9, 33.0, 32.5 pt at +11, +12, +14 frames on
   * split-collapse-b-t1, t2, t9, the row's middle at 31.8) where the web's rode the tall shape's
   * middle (43.5, 41.2, 37.7).
   */
  rowAnchor?: number
  /**
   * Optional, defaults to 0 (none). Coming back into a split, the bubble's leading content is cut by
   * a capsule the resting row's height whose right end comes out from under the sensor and travels
   * to the row's half-height past the content's resting centre, as 1 - (1 - presence) ^ `bubbleCap`:
   * a broad, blurred patch shows a crisp convex end inside the shape around it, and the sensor
   * bites its other end. Round 21 (r20b findings 1, 2): on
   * split-collapse-b-t1, t2, t9 and split-alert-t1, t2, t9 iOS's returning circle is first a flat, dim
   * patch whose right edge rises over 0.3 to 1.5 pt (rows 18 to 50 pt trace a circle of radius
   * 18.3, the row's half-height), 7 to 52 pt inside the outline; the web's faded over 13 to 25 pt.
   */
  bubbleCap?: number
  /**
   * Optional, defaults to `bubbleFade`. The incoming bubble's trailing slot (its text) comes in at
   * presence to this power: above `bubbleFade` its blurred form stays dark until the content is
   * nearly in, then brightens fast. Round 21: returning into the split, iOS shows almost nothing of
   * the bubble's text until +14 frames (split-collapse-b-t1, t2, t9: brightest 3 to 12 levels at +9
   * to +13), where the web's blurred "1..." showed as a grey patch from +8 (17 to 39 levels).
   */
  bubbleTrailingFade?: number
  /**
   * Optional, defaults to none. Points the incoming bubble's text starts right of its resting place
   * (left when negative), closing as (1 - the text's presence) ^ `power`, so the bubble's round end
   * cuts it while it slides in (the text is clipped to the island, so a far start never shows). Round 41 (-t47 and -t49 triangles, split-collapse-b: "the
   * satellite's numeral and ellipsis are readable while its green dot is still blurred; iOS shows only
   * a faint sliver"): on every seen take iOS's returning "1..." shows first at the bubble's right end,
   * its centre 6.5, 3.4, 2.6 and 1.0 pt right of its place at +15, +18, +20 and +22 frames, where the
   * web's showed whole in place, 6 to 8 pt left of iOS's.
   */
  bubbleTrailingSlide?: { by: number; power: number }
  /**
   * Optional, defaults to `bubbleBlur` and `bubbleSharpen`. The incoming bubble text's own blur, `by` x
   * (1 - its presence) ^ `power` px, never more than the bubble's peak. Round 41: on every seen take of
   * split-collapse-b iOS's returning "1..." stays soft while its green sharpens (focus 1.10, 0.96, 0.64
   * pt at +16 to +18 frames), where the web's text was sharp (0.63, 0.43, 0.39) and its green soft.
   */
  bubbleTrailingBlur?: { by: number; power: number }
  /**
   * The bubble's incoming blur is `bubbleBlur` x (1 - presence) ^ `bubbleSharpen` px, never more
   * than `enterBlur`. Defaults (`enterBlur`, `sharpen`) blur it like the rest; a large `bubbleBlur`
   * with a steep power holds it at full blur, then sharpens it over a few frames (split-alert-t1:
   * blue at 4.7 pt or more until 845, then 4.0, 2.7, 1.7, 0.7 pt).
   */
  bubbleBlur: number
  bubbleSharpen: number
  /**
   * Optional, defaults to `enterBlur`. The most the bubble's incoming content is blurred. Above
   * `enterBlur` it comes back softer than the pill's content: returning into a split, the bubble's
   * circle is a round blur about as tall as it is wide (10 to 90% edges of 17 to 20 pt on
   * split-collapse-b-t1 and split-alert-t1) while the pill's circle is already sharper.
   */
  bubbleBlurMax?: number
  /**
   * Optional, defaults to 0 (none). The detached bubble's content rides ahead of the bubble: it is
   * drawn where the bubble's left edge will be this many seconds later at its current speed, coming
   * in (the split) and going out (the unsplit's closing bubble) alike. At rest the speed is 0, so the content is in place; a retarget keeps the speed, so the
   * lead never jumps. Round 49: iOS's blue comes out of the sensor's end about a frame ahead of the
   * web's at an equal bubble outline (split, every seen take).
   */
  bubbleLead?: number
  /**
   * Optional, defaults to 0 (the whole lead at once). With `bubbleLead`, the points the bubble's left
   * edge must come out of the pill (from where it starts, its own height inside the attached pill's
   * end) before the lead is whole; it grows in as that share to `bubbleLeadPower`. iOS's blue shows
   * no lead while it is still under the sensor and a frame's worth once the bubble is half out.
   */
  bubbleLeadRamp?: number
  /** Optional, defaults to 2. The power `bubbleLeadRamp`'s share grows in on. */
  bubbleLeadPower?: number
  /**
   * Optional, defaults to 0 (none). Going out, the detached bubble's accent slides this many points
   * toward the sensor on (1 - the layer's presence) ^ `bubbleExitSlidePower`, past where the closing
   * bubble takes it, so the sensor covers it while it is bright. Round 49 (unsplit, every seen take):
   * iOS's blue speeds up into the sensor (its far edge 6, 8, 8.7, 9.6 pt a frame at +1 to +4, peak 0.70
   * to 0.40) where the web's slowed with the bubble's edge and dimmed (0.62 to 0.16).
   */
  bubbleExitSlide?: number
  /** Optional, defaults to 1. The power `bubbleExitSlide` closes on. */
  bubbleExitSlidePower?: number
  /**
   * Extra seconds the expanded view's center region waits before it comes in. appear-alert-t1
   * (judge round 5, finding 3): the label reaches half opacity about four frames after the square.
   */
  centerDelay: number
  /**
   * Optional, defaults to 0. How far the expanded view's regions follow the island's bottom edge
   * while its height is away from rest, instead of keeping their share of the height: 0 keeps the
   * share, 1 keeps each region's distance from the bottom, so content still laid out for the full
   * card rides up under the sensor as the card shrinks and is cut by it. Below 0 a region stays
   * nearer its resting place than its share would put it.
   */
  bottomAnchor?: number
  /**
   * Optional, defaults to none. How far (`by`) the compact or attached pill's trailing slot keeps
   * its resting distance from the pill's right end instead of its share of the width, never more
   * than `max` points from that share: at 1 text laid out beside the sensor rides toward it while
   * the pill is wide and comes back as the pill settles.
   */
  trailingRide?: { by: number; max: number }
  /**
   * Optional, defaults to none. Coming into a split, `at` seconds after the change starts the
   * attached pill's slots step `by` points toward the bubble at once and settle back on `spring`:
   * iOS lays the returning content out again as the bubble parts for good.
   */
  partStep?: { at: number; by: number; spring: SpringConfig }
  /**
   * Optional, defaults to `anchor` when that is 0 or more, else 0. The leaving layer's trailing slot
   * takes this `anchor` instead: a pill whose returning accent starts near its end (a negative
   * `anchor`) may still slide its leaving text in under the sensor.
   */
  trailingExitAnchor?: number
  /**
   * Optional, defaults to `metrics.content.follow`. How far this transition's compact and split
   * content scales with its container: 0 keeps it its own size while the pill is wider or taller.
   */
  follow?: number
  /**
   * Optional, defaults to none. Per region of the incoming expanded view, how many seconds its
   * opacity (`fade`) and its blur and scale (`blur`) lag the layer's presence, and `soften` keeps
   * it blurrier than the rest until the end. A region listed here
   * ignores `centerDelay`. iOS brings the expanded view in on one blur: every region sharpens
   * together while the center's text brightens later, and the leading accent stays a little softer
   * (round 17, `scripts/fidelity/CONTENT.md`).
   */
  regions?: Partial<Record<ExpandedRegion, RegionLag>>
  /**
   * Optional, defaults to none. Per region of an expanded view this change takes out, its own fade
   * power in place of `exitFade` (opacity is presence ^ power). The rest of the layer keeps
   * `exitFade`. On an alert's return iOS's title loses its ink faster than the square, the number
   * and the bar as the island closes (round 33, `content-size.py`: the web's title 1.2 to 1.7x the
   * takes' ink from 93 pt of height down, the other regions within 17%).
   */
  regionExitFade?: Partial<Record<ExpandedRegion, number>>
  /**
   * Optional, defaults to `bottomAnchor` for every region. Per region of the expanded view, its own
   * `bottomAnchor`. Round 37: on an alert's return iOS's leaving square rides up under the sensor
   * with the shrinking card (its top 31.7 to 28.5 pt at 77 pt of height, 18.8 at 53, swap's B on all
   * 32 seen takes) where round 30's -0.25, set for the title, held it near its resting place.
   */
  regionBottomAnchor?: Partial<Record<ExpandedRegion, number>>
}

/** The expanded view's four regions, as ActivityKit names them. */
type ExpandedRegion = 'leading' | 'center' | 'trailing' | 'bottom'

/**
 * The width an idle island's swell leaves behind (`press.idleWiden`): as the swell turns back the
 * pill widens about its centre on `rise`, its height returning with the swell, and from `hold`
 * seconds after the turn it returns to rest on `fall`.
 */
/** The pointed ends a split neck leaves at its first break (`bubble.collapseSplitSpread.neckTip`). */
interface NeckTip {
  /** Points each nub reaches past its round cap at the break. */
  length: number
  /** Points of gap past the break at which the nubs are gone. */
  reach: number
  /** Seconds into the return after which no nub is drawn. */
  until: number
}

interface IdleWiden {
  /** Points the pill widens toward, both ends together. */
  by: number
  rise: SpringConfig
  /** Seconds after the swell's turn that the width lets go. */
  hold: number
  fall: SpringConfig
}

/** How one expanded region comes in apart from its layer (`ContentMotion.regions`). */
interface RegionLag {
  /** Seconds its opacity lags the layer's presence. */
  fade: number
  /** Seconds its blur and scale lag the layer's presence. */
  blur: number
  /**
   * Optional, defaults to 0. Its blur is multiplied by 1 + `soften` x (1 - presence): softer than
   * the rest while it comes in, sharp with them at the end. Below 0 it starts sharper than its peak
   * and opens up to it as it comes in (round 36, swap's B square: iOS's edge holds near 15 to 16 pt
   * while the card grows to 79 pt, then sharpens).
   */
  soften?: number
  /**
   * Optional, defaults to 0. The opacity it may show ahead of its lag: until its lagged opacity
   * passes this, it shows on the layer's own presence, capped here. iOS's incoming title glows
   * faintly under the sensor from the start of an opening, then brightens on its own lag.
   */
  lead?: number
  /**
   * Optional, defaults to the layer's `enterBlur`. This region's own peak incoming blur in px.
   * Below the layer's, the layer's shared blur drops to it and the other regions add the rest on
   * their own element, so the region sharpens on its own curve. Round 21 (triangle r20, its four
   * confident sets; R20's title 4 to 5 levels dim mid-way): the centre title stayed smeared at
   * widths where iOS's had resolved, because it shared the square's wider halo.
   */
  peak?: number
  /**
   * Optional, defaults to the layer's `scale`. The scale this region grows from as it comes in
   * (on its blur's lagged presence). Round 36 (-t33 labelled judges, swap-t33 and -t34): at equal
   * card height iOS's incoming square is 6 to 8 pt wider than the web's from the layer's 0.6.
   */
  scale?: number
  /**
   * Optional, defaults to 0. Points the region sits above its place while it comes in, falling
   * as (1 - presence) on its blur's lagged presence: iOS's incoming square starts high in the
   * growing card (its top 22 to 25 pt at 52 to 67 pt of height on every seen swap take, the web's
   * 25 to 31).
   */
  lift?: number
  /**
   * Optional, defaults to the layer's `fade`. Its opacity is its lagged presence to this power:
   * above the layer's the larger, softer region brightens gradually.
   */
  power?: number
}

/** The legs that end one property's motion (`islandMotion.tail`). */
interface TailLegs {
  /**
   * Heads for the target plus `by` x the travel from `at` seconds after the change starts, never more
   * than `max` points past it. `by` 0 skips it.
   */
  lean: { by: number; at: number; max: number } & SpringConfig
  /** Settles onto the target from `at` seconds after the change starts. `at` 0 skips it. */
  settle: { at: number } & SpringConfig
}

/** How a transition's motion ends, per property. */
interface ShapeTail {
  /** The pill's width, about its centre (both edges move by half). */
  width: TailLegs
  height: TailLegs
  top: TailLegs
}

interface IslandMotionShape {
  shape: Record<ShapeTransition, SpringConfig>
  /**
   * A wide pill's appear: the edges' spring blends from `shape.appear` at `from` points of target
   * width to `spring` at `to` and wider. Optional; without it every appear uses `shape.appear`.
   */
  appearWide?: { from: number; to: number; spring: SpringConfig }
  body: Record<ShapeTransition, DelayedSpring>
  corner: Record<ShapeTransition, DelayedSpring>
  /**
   * Optional, per transition; a transition without an entry uses `corner`. The leading (left)
   * corners' radius on its own spring, toward the same target as `corner`'s, with the same wait
   * rules. `trailing` also gives the right corners that radius while the pill is at least `above`
   * points tall, blending back to `corner`'s by `below` points (a smoothstep on the height).
   */
  cornerLead?: Partial<Record<ShapeTransition, CornerLead>>
  viaIdle: Record<ShapeTransition, number>
  collapseLift: number
  retarget: { collapse: SpringConfig; alertCollapse: SpringConfig }
  tail: Record<ShapeTransition, ShapeTail>
  bubble: {
    split: DelayedSpring
    collapseSplit: DelayedSpring
    unsplit: SpringConfig
    unsplitSlide: SpringConfig
    unsplitAbsorb: number
    /** Optional, defaults to `viaIdle.unsplit`. When a swap that absorbs the bubble turns toward the expanded view. */
    absorbExpand?: number
    /**
     * Optional, defaults to `corner.swap` with its wait after the swap's own turn. The corner's
     * spring when a swap absorbs the bubble, `delay` seconds after that change's turn.
     */
    absorbExpandCorner?: DelayedSpring
    /**
     * Optional, defaults to 0 (none). A long-press on the bubble is decided before it joins the
     * pill; the join's shape starts this many seconds ahead of it: the bubble's left edge closes on
     * `unsplit` and the neck draws as in the merge, while the turn and the content keep their time.
     */
    joinLead?: number
    collapseSplitVia: { dip: number; at: number; down: SpringConfig } & SpringConfig
    collapseSplitRise: DelayedSpring
    collapseSplitLift: { by: number; back: { at: number } & SpringConfig } & SpringConfig
    collapseSplitSpread: {
      left: number
      right: number
      at: number
      rightPeel: { at: number; to: number } & SpringConfig
      rightSettle: { at: number } & SpringConfig
      rightBack: { at: number } & SpringConfig
      neckGap: number
      neckPower: number
      /**
       * Optional, unset draws none. After the neck's first break each end keeps a short pointed nub
       * toward the other, `length` points past its round cap at the break and none `reach` points of
       * gap past `neckGap`; only until `until` seconds into the return, so the final break is round.
       */
      neckTip?: NeckTip
      bubbleFrom: number
      kick?: number
    } & SpringConfig
  }
  lag: Record<ShapeTransition, number>
  content: { enter: DelayedSpring; exit: DelayedSpring; carryResponseMin: number }
  contentTiming: Record<ShapeTransition, ContentMotion>
  press: {
    down: SpringConfig
    up: SpringConfig
    swell: SpringConfig
    swellTime: number
    decide: number
    release: SpringConfig
    idleRelease?: { spring: SpringConfig; carry: number }
    /** Optional, defaults to none. Width an idle swell leaves behind as it turns back (round 31). */
    idleWiden?: IdleWiden
    tapReturn: number
    releaseReturn?: number
    idleTapReturn?: number
    holdReturn: number
    bubbleSwell?: SpringConfig
  }
  longPress: number
  longPressBubble?: number
  alertContentDelay: number
  group: { handoff: number; window: number }
  keyline: { dip: number; dipAt: number; backAt: number }
  shadowRamp: SpringConfig
  shadowRampPress: SpringConfig
  alertHold: number
  alertHoldIdle?: number
  /** Optional, unset draws one Gaussian. The second, wide part of a content blur (`BlurSkirt`). */
  blurSkirt?: BlurSkirt
  reduced: { duration: number }
}

/**
 * The faint wide part of iOS's content blur. A slot drawn at a blur of σ points on screen also
 * draws a copy of itself blurred `width` points, at weight w = min(`max`, `gain` σ ^ `power` -
 * `floor`), added to itself drawn at 1 - `dim` x w. Under no weight (sharp content) no copy is drawn.
 */
interface BlurSkirt {
  /** The wide part's standard deviation in points (13.3). */
  width: number
  /** Its weight per point of the slot's own blur, raised to `power` (0.036). */
  gain: number
  /** The most weight it takes (0.045). */
  max: number
  /** Weight taken off, so the copy comes and goes at no weight rather than with a step (0.004). */
  floor: number
  /** Optional, defaults to `gain`. The gain for a layer on its way out. */
  exitGain?: number
  /** Optional, defaults to 2. The power of σ the weight follows (0.5). */
  power?: number
  /**
   * Optional, defaults to 1. How much of the weight the slot itself gives up: 1 draws
   * `(1 - w) G(σ) + w G(width)`, a kernel that sums to one; 0 adds the wide part on top, so the
   * core keeps the brightness it was fitted at before the wide part existed.
   */
  dim?: number
  /**
   * Optional, defaults to 0 (none). Under this blur (points on screen) the weight falls in
   * proportion to the blur, so the wide part has ended by the time the core is sharp.
   */
  tail?: number
}

type IslandMotion = IslandMotionShape

type ShapeTransition = (typeof shapeTransitions)[number]

// path

/** Corner shape: semi-axes along the horizontal and vertical edges, and the superellipse exponent. */
interface CornerShape {
  rx: number
  ry: number
  exponent: number
  /**
   * Continuous-corner smoothing, 0 to 1. Above 0 the corner is an arc of radius `rx` with eased
   * transitions (and `ry` and `exponent` are ignored). Default 0.
   */
  smoothing?: number
}

// skirt

/** One element's copy: `node` is what was added to the page, `parts` each copied descendant by its source. */
interface Echo {
  source: HTMLElement
  node: HTMLElement
  parts: Map<HTMLElement, HTMLElement>
  observer: MutationObserver | null
  stale: boolean
  used: boolean
}

// spring

/**
 * A damped spring with SwiftUI's parameters, solved in closed form.
 *
 * `response` is the period of the undamped spring in seconds and `dampingFraction` is the damping
 * ratio (1 is critically damped, below 1 overshoots). Mass is 1, so stiffness = (2π / response)²
 * and damping = 4π · dampingFraction / response, the same mapping SwiftUI documents.
 *
 * Closed form rather than numeric integration: a value at any time is exact, so a paused clock
 * can step or seek to any frame and get the same pixels every run.
 */
interface SpringConfig {
  /** Seconds for one undamped oscillation. Smaller is faster. */
  response: number
  /** Damping ratio. 1 settles without overshoot; 0.7 overshoots a little. */
  dampingFraction: number
  /**
   * Seconds over which a retarget blends from the motion already in flight into the new spring.
   * SwiftUI uses this to soften interruptions. Defaults to 0.
   */
  blendDuration?: number
}

/** How a value moves to a new target. */
type Transition =
  | { kind: 'spring'; spring: SpringConfig; delay?: number }
  /** Eased, no overshoot. Used for reduced motion. A duration of 0 is a step after `delay`. */
  | { kind: 'tween'; duration: number; delay?: number }
  | { kind: 'instant' }

// store

interface IslandSnapshot {
  /** Running activities, primary first. */
  activities: readonly Activity[]
  expanded: { id: string; reason: ExpandReason } | null
  /** Counts changes to what the island shows, so two changes at the same clock time stay distinct. */
  changeId: number
  /** Clock time (ms) of the last change to what the island shows. Springs start from here. */
  changedAt: number
  /** The last change snaps into place instead of animating (devtools resets use this). */
  instant: boolean
  /** Which part is swelling under a press (from touch-down until it expands or springs back). */
  pressed: PressTarget | null
  /**
   * Clock time (ms) a long-pressed bubble will join the pill (its expansion), known from the moment
   * the press is decided; null otherwise. The renderer cuts the bubble's content a little before.
   */
  joining: number | null
  /** Per group, the activity brought forward by an alert or `expand()`; else the first started shows. */
  front: Readonly<Record<string, string>>
  /** A group handing over to a hidden activity: none of its activities shows until the expansion. */
  handoff: string | null
}

/** The pill (primary activity) or the detached bubble (second activity). */
type PressTarget = 'pill' | 'bubble'

/** What the island draws for a snapshot, plus the identity that decides when content crossfades. */
interface IslandScene {
  presentation: IslandPresentation
  /** Same key means the content updates in place; a new key crossfades. */
  contentKey: string
  /** Spoken summary of what is showing. */
  label: string
  /** Activity under the pill (the attached one when split). */
  primary: Activity | null
  /** Activity in the detached bubble. */
  detached: Activity | null
}

interface IslandStore {
  getSnapshot(): IslandSnapshot
  subscribe(listener: () => void): () => void
  api: IslandApi
  /**
   * Starts a press: the pill swells from touch-down. Still held at `press.decide`, it expands that
   * activity at `longPress`; an island with nothing to expand swells and springs back.
   */
  press(target: PressTarget): void
  /** Ends a press. A release before `press.decide` is a tap: it calls `onPress` and the swell springs back. */
  release(options?: { cancel?: boolean }): void
}

// types

/**
 * What the island shows, following ActivityKit's presentations.
 *
 * - `idle`: the resting pill, no activity.
 * - `compact`: one activity, content on either side of the sensor area.
 * - `minimal`: two activities. One sits attached to the pill, the other in a detached bubble.
 *   With `split`, both pills show their activity's compact leading and trailing content, as on
 *   iOS 27; `attached` and `detached` are the fallback when that content is too wide.
 * - `expanded`: one activity, full width, with four regions.
 */
type IslandPresentation =
  | { kind: 'idle' }
  | { kind: 'compact'; leading?: ReactNode; trailing?: ReactNode }
  | {
      kind: 'minimal'
      attached: ReactNode
      detached?: ReactNode
      split?: { attached: CompactContent; detached: CompactContent }
    }
  | { kind: 'expanded'; leading?: ReactNode; trailing?: ReactNode; center?: ReactNode; bottom?: ReactNode }

type PresentationKind = IslandPresentation['kind']

/** Content for the compact presentation. */
interface CompactContent {
  /** Left of the sensor. Defaults to nothing. */
  leading?: ReactNode
  /** Right of the sensor. Defaults to nothing. */
  trailing?: ReactNode
}

/** Content for the expanded presentation. */
interface ExpandedContent {
  /** Top left, beside the sensor. Defaults to nothing. */
  leading?: ReactNode
  /** Top right, beside the sensor. Defaults to nothing. */
  trailing?: ReactNode
  /** Between leading and trailing, below the sensor. Defaults to nothing. */
  center?: ReactNode
  /** Full width under the top row. Defaults to nothing. */
  bottom?: ReactNode
}

/** Everything an activity can show. Each presentation falls back to empty slots. */
interface ActivityContent {
  /** Shown when this is the only activity. Defaults to empty slots. */
  compact?: CompactContent
  /**
   * Shown when two activities run and their compact content doesn't fit side by side (attached or
   * in the detached bubble). Defaults to the compact leading content.
   */
  minimal?: ReactNode
  /** Shown on long-press, `expand()`, or an alerting update. Defaults to empty regions. */
  expanded?: ExpandedContent
}

interface ActivityOptions extends ActivityContent {
  /** Unique id. Starting an id that already runs updates it instead. */
  id: string
  /** Spoken by screen readers when the activity starts or changes. Defaults to the id. */
  label?: string
  /** Higher priority takes the primary slot. Ties go to the activity that started first. Defaults to 0. */
  priority?: number
  /** Called on a tap (a press shorter than the long-press). Defaults to none. */
  onPress?: () => void
  /** Start with an alert: expand briefly, then settle to compact. Defaults to false. */
  alert?: boolean
  /**
   * Activities that share a group show one at a time, as one app's Live Activities do on iOS: the
   * first started shows and the others wait hidden. An alert on a hidden one hands over: the shown
   * one leaves to idle, the island waits `motion.group.handoff`, expands the alerting one, and comes
   * back to it compact; the one that left stays hidden. Defaults to none (always shown).
   */
  group?: string
}

/** A partial update. Nested content merges, so `{ compact: { trailing } }` keeps the leading slot. */
interface ActivityUpdate {
  /** Replaces the compact slots given. Defaults to keeping them. */
  compact?: CompactContent
  /** Replaces the minimal content. Defaults to keeping it. */
  minimal?: ReactNode
  /** Replaces the expanded regions given. Defaults to keeping them. */
  expanded?: ExpandedContent
  /** Replaces the screen reader label. Defaults to keeping it. */
  label?: string
  /** Replaces the priority. Defaults to keeping it. */
  priority?: number
  /** Replaces the tap handler. Defaults to keeping it. */
  onPress?: () => void
  /**
   * Expand briefly to draw attention, like an alerting ActivityKit update. The island expands with
   * the content it had and applies this update in place `motion.alertContentDelay` later, as iOS
   * does. Defaults to false.
   */
  alert?: boolean
  /**
   * "update" changes content in place (a number ticking, a bar moving); "crossfade" replaces the
   * layer with a blur-and-fade, for content that is different, not just newer. Defaults to "update".
   */
  transition?: 'update' | 'crossfade'
}

interface ActivityHandle {
  readonly id: string
  update(update: ActivityUpdate): void
  /** Removes the activity with the system dismiss motion. */
  end(): void
}

/** An activity as the island holds it. */
interface Activity {
  id: string
  label: string
  priority: number
  /** Start order, used to break priority ties. */
  order: number
  content: ActivityContent
  onPress: (() => void) | null
  /** Bumped by crossfade updates: a new revision replaces the content layer instead of updating it. */
  revision: number
  /** The group it shows in turn with (`ActivityOptions.group`), or null. */
  group: string | null
}

/** Why the island is expanded. Alerts collapse by themselves; user expansions wait for a press outside. */
type ExpandReason = 'user' | 'alert'

interface IslandApi {
  /** Starts an activity, or updates it if the id already runs. */
  start(options: ActivityOptions): ActivityHandle
  update(id: string, update: ActivityUpdate): void
  end(id: string): void
  /** Expands an activity (what a long-press does). Defaults to the primary activity. */
  expand(id?: string): void
  collapse(): void
}

/** Whether the system's reduced-motion setting applies. */
type ReducedMotionSetting = 'user' | 'always' | 'never'

// surface

/** Wiring for the pressable pill. Left out for display-only islands. */
interface SurfaceInteraction {
  /** Accessible name of the pill button. Null on an idle island: it swells under a press but isn't a control. */
  pillLabel: string | null
  /** Accessible name of the detached bubble button, when there is one. */
  bubbleLabel: string | null
  expanded: boolean
  onPressStart(target: PressTarget, event: ReactPointerEvent<HTMLButtonElement>): void
  onPressEnd(event: ReactPointerEvent<HTMLButtonElement>): void
  onPressCancel(): void
  /** Keyboard activation (Enter or Space). */
  onActivate(target: PressTarget): void
}

interface IslandSurfaceProps {
  presentation: IslandPresentation
  /** Same key updates content in place; a new key crossfades. */
  contentKey: string
  /**
   * The latest change to what is shown: a counter, the clock time (ms) it happened, and whether it
   * snaps. Springs start at `at`, so replays are exact. Null starts springs at commit time.
   */
  change: SurfaceChange | null
  pressed: PressTarget | null
  /**
   * Clock time (ms) a long-pressed bubble will join the pill, once the press is decided. Its
   * content is cut ahead of it by the join's `bubbleExit.delay` when that is negative. Defaults to null.
   */
  joining?: number | null
  /** "swell" for the stack's long-press (grows, then expands), "squish" for a controlled hold. */
  pressStyle: 'swell' | 'squish'
  /** The activity on show, so a change of activity can pass through the idle shape. Null for controlled views. */
  activityId: string | null
  /** Whether the expanded view on show is an alert (it returns on its own, with a slightly different motion). */
  alerting: boolean
  /**
   * Whether a group's handoff is under way: the shown activity has gone to idle and another of its
   * group expands next. The expansion that ends it may bring its content in on `afterHandoff`.
   * Defaults to false.
   */
  handingOff?: boolean
  placement: 'container' | 'viewport'
  regionLabel: string
  liveLabel: string
  clock: IslandClock
  metrics: IslandMetrics
  motion: IslandMotion
  reduced: boolean
  /** Keyline strength (white alpha) for the page behind the island; 0 draws none. */
  keyline: number
  interaction: SurfaceInteraction | null
  /** Receives the root element (the region), for outside-press checks. */
  rootRef?: (element: HTMLDivElement | null) => void
}

interface SurfaceChange {
  id: number
  at: number
  instant: boolean
}

// layer

/** Named DOM nodes inside a layer that the frame loop positions or the renderer measures. */
type SlotName =
  | 'root'
  | 'leading'
  | 'trailing'
  | 'attached'
  | 'detached'
  | 'splitAttachedLeading'
  | 'splitAttachedTrailing'
  | 'splitDetachedLeading'
  | 'splitDetachedTrailing'
  | 'expanded'
  | 'expandedClip'
  | 'expandedInner'
  | 'expandedLeading'
  | 'expandedCenter'
  | 'expandedTrailing'
  | 'expandedBottom'

type RegisterSlot = (slot: SlotName, element: HTMLElement | null) => void

interface IslandLayerProps {
  /** The layer's content key: its slots register under it. */
  layerKey: string
  /** What this layer shows. */
  presentation: IslandPresentation
  /** Collects slot nodes for the frame loop, per layer. */
  register: (key: string, slot: SlotName, element: HTMLElement | null) => void
  metrics: IslandMetrics
  /** Width the expanded regions lay out at. */
  expandedWidth: number
  /** Leaving layers are hidden from assistive tech and can't take focus. */
  leaving: boolean
}

interface IslandExpandedGridProps {
  presentation: Extract<IslandPresentation, { kind: 'expanded' }>
  register: RegisterSlot
  metrics: IslandMetrics
  expandedWidth: number
}

export type {
  SurfaceInteraction,
  IslandSurfaceProps,
  SurfaceChange,
  SlotName,
  RegisterSlot,
  IslandLayerProps,
  IslandExpandedGridProps,
  MotionMode,
  ShapeChange,
  IslandClock,
  DeepPartial,
  IslandMetricsOverrides,
  IslandMotionOverrides,
  ShapeAnimation,
  FrameGeometry,
  ShapeTarget,
  ContentMeasure,
  SlotPair,
  KeylineFadePoint,
  IslandMetricsShape,
  IslandMetrics,
  CornerLead,
  DelayedSpring,
  BubbleSettle,
  ContentMotion,
  ExpandedRegion,
  NeckTip,
  IdleWiden,
  RegionLag,
  TailLegs,
  ShapeTail,
  IslandMotionShape,
  BlurSkirt,
  IslandMotion,
  ShapeTransition,
  CornerShape,
  Echo,
  SpringConfig,
  Transition,
  IslandSnapshot,
  PressTarget,
  IslandScene,
  IslandStore,
  IslandPresentation,
  PresentationKind,
  CompactContent,
  ExpandedContent,
  ActivityContent,
  ActivityOptions,
  ActivityUpdate,
  ActivityHandle,
  Activity,
  ExpandReason,
  IslandApi,
  ReducedMotionSetting,
}
