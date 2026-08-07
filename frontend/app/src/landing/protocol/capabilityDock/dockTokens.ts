// Motion + geometry tokens for the AOC Capability Dock.
//
// Two independent systems live here, kept separate on purpose:
//
// 1. Motion tokens — the physical "feel" of the dock (spring, easing,
//    scale/lift ranges). Shared by every card so the whole row reads as one
//    organism rather than eight independently-tuned widgets.
//
// 2. Crystal geometry — a hand-authored but *systematic* faceted-mineral
//    silhouette per capability. There is no existing per-capability mineral
//    asset in the repo (../enterprise/minerals.ts is a color-token system,
//    not illustration; ../protocol/CapabilityIcons.tsx are generic line
//    icons — a shield for integrity, a document for provenance, a tag for
//    licensing — exactly the kind of arbitrary symbol this section is meant
//    to move away from). Every capability below is built from the same
//    construction (a bipyramidal, faceted silhouette: top apex, a belt of
//    shoulder vertices, bottom apex, plus internal facet lines and a single
//    highlight/glint point) so the set reads as one consistent mineral
//    language, distinguished only by silhouette, facet count and orientation
//    — never by unrelated iconography.

export const DOCK_EASE = [0.22, 1, 0.36, 1] as const;

/** Spring used for every continuous, pointer-driven motion value (scale,
 * lift, shadow). Layout geometry is never driven by influence — only
 * compositor properties. Stiffness medium-high / damping high / mass low
 * so the response is immediate and settles without cartoonish overshoot. */
export const DOCK_SPRING = { type: 'spring', stiffness: 420, damping: 42, mass: 0.7 } as const;

/** Used instead of DOCK_SPRING when the user has prefers-reduced-motion set:
 * no oscillation, just a short, cheap tween. */
export const DOCK_REDUCED_SPRING = { type: 'tween', duration: 0.12, ease: DOCK_EASE } as const;

/** Content reveal (description opacity/translate/grid-rows) — 160-280ms band. */
export const DOCK_CONTENT_TRANSITION = { duration: 0.22, ease: DOCK_EASE } as const;
export const DOCK_CONTENT_TRANSITION_REDUCED = { duration: 0.08, ease: 'linear' } as const;

/** Gaussian falloff radius (px) for desktop pointer-proximity influence. */
export const INFLUENCE_RADIUS_PX = 260;

/** influence(distance) in [0, 1], continuous — a Gaussian rather than a
 * linear ramp, so the dock has a soft "core" around the pointer and a long,
 * gentle tail rather than a hard-edged falloff. */
export function gaussianInfluence(distancePx: number, radiusPx: number = INFLUENCE_RADIUS_PX): number {
  const sigma = radiusPx / 2.1;
  return Math.exp(-(distancePx * distancePx) / (2 * sigma * sigma));
}

// Continuous ranges the influence value [0,1] is mapped onto compositor
// properties only. Layout geometry (width/height/flex) is intentionally
// NOT driven by influence — see CapabilityCard's compact surface + dominant
// overlay split.
export const MINERAL_SCALE_RANGE: [number, number] = [1, 1.85];

/** Modest continuous magnification of the COMPACT surface (native typography
 * and mineral size preserved — never derived by scaling a 300px card down). */
export const CARD_COMPACT_SCALE_RANGE: [number, number] = [1, 1.12];
export const CARD_LIFT_RANGE: [number, number] = [0, -12];
export const SHADOW_OPACITY_RANGE: [number, number] = [0.05, 0.22];
export const BORDER_OPACITY_RANGE: [number, number] = [0, 1];

/**
 * Fixed visual width of the dominant absolute overlay.
 * Approximates the previous dominant footprint under flexGrow ≈ 5.2 on a
 * ~1148px useful row (observed ~280–320px). Text inside this overlay has a
 * stable content width, so paragraph wrapping never changes while the
 * pointer moves.
 */
export const CARD_EXPANDED_WIDTH_PX = 300;

/** Overlay enter scale — crossfades in from slightly under full size so the
 * transition reads as one card expanding rather than a second card appearing. */
export const OVERLAY_ENTER_SCALE = 0.96;

/**
 * Dock-stage vertical reservation (NOT per-card).
 * Expanded overlay ≈ mineral 44 + name ~20 + desc ~88 (4 lines @ 13.5/relaxed)
 * + py-5*2 + mt gaps ≈ 218px; + lift 12 + top safety for compact scale ≈ 40.
 * Constant regardless of which capability is dominant.
 */
export const DOCK_STAGE_MIN_HEIGHT_PX = 280;
export const DOCK_STAGE_PAD_TOP_PX = 36;

/** A card only reveals its full description once it is the single nearest
 * card to the pointer/focus/touch-centered position — not merely "close". */
export const DOMINANT_INFLUENCE_THRESHOLD = 0.55;

export type CapabilityId =
  | 'identity'
  | 'integrity'
  | 'provenance'
  | 'portability'
  | 'interoperability'
  | 'verifiability'
  | 'licensing'
  | 'governance-compatibility';

export type CrystalSpec = {
  /** Closed outline polygon, in a shared 64x80 viewBox. */
  outline: [number, number][];
  /** A second, smaller outline drawn behind/beside the primary one — used
   * only by Interoperability, to read as two crystals meeting. */
  twinOutline?: [number, number][];
  /** Internal facet line segments, revealed progressively with influence. */
  facets: [[number, number], [number, number]][];
  /** Highlight/glint origin for the refraction gradient. */
  glint: [number, number];
};

export const CRYSTAL_VIEWBOX = '0 0 64 80';

export const CAPABILITY_CRYSTALS: Record<CapabilityId, CrystalSpec> = {
  identity: {
    // Upright, singular, sharp-pointed axis — one persistent form.
    outline: [
      [32, 5], [44, 26], [44, 54], [32, 75], [20, 54], [20, 26],
    ],
    facets: [
      [[32, 5], [32, 75]],
      [[44, 26], [20, 54]],
      [[20, 26], [44, 54]],
    ],
    glint: [32, 20],
  },
  integrity: {
    // Symmetric solitaire silhouette — nothing hidden, every facet answers another.
    outline: [
      [32, 6], [49, 34], [32, 74], [15, 34],
    ],
    facets: [
      [[15, 34], [49, 34]],
      [[32, 6], [24, 34]],
      [[32, 6], [40, 34]],
      [[32, 74], [24, 34]],
      [[32, 74], [40, 34]],
    ],
    glint: [32, 20],
  },
  provenance: {
    // Taller, banded body — a record laid down in visible layers.
    outline: [
      [32, 5], [43, 16], [43, 60], [32, 75], [21, 60], [21, 16],
    ],
    facets: [
      [[21, 26], [43, 26]],
      [[21, 38], [43, 38]],
      [[21, 50], [43, 50]],
    ],
    glint: [32, 13],
  },
  portability: {
    // Leaning, asymmetric silhouette — the same crystal, mid-motion.
    outline: [
      [26, 6], [42, 20], [46, 50], [34, 75], [18, 58], [16, 28],
    ],
    facets: [
      [[26, 6], [34, 75]],
      [[42, 20], [18, 58]],
    ],
    glint: [29, 18],
  },
  interoperability: {
    // Two crystals, offset and overlapping — distinct systems reading each other.
    outline: [
      [26, 10], [38, 26], [38, 52], [26, 70], [14, 52], [14, 26],
    ],
    twinOutline: [
      [44, 26], [52, 38], [52, 56], [44, 70], [36, 56], [36, 38],
    ],
    facets: [
      [[26, 10], [26, 70]],
      [[44, 26], [44, 70]],
    ],
    glint: [26, 22],
  },
  verifiability: {
    // High, narrow belt and a long lower point — built for scrutiny.
    outline: [
      [32, 8], [42, 20], [42, 30], [32, 75], [22, 30], [22, 20],
    ],
    facets: [
      [[22, 20], [42, 20]],
      [[22, 30], [42, 30]],
      [[32, 8], [32, 75]],
    ],
    glint: [32, 15],
  },
  licensing: {
    // Flat table cut — the ordered, administrative crystal in the set.
    outline: [
      [22, 10], [42, 10], [48, 30], [32, 75], [16, 30],
    ],
    facets: [
      [[16, 30], [48, 30]],
      [[24, 30], [40, 30]],
      [[32, 30], [32, 75]],
    ],
    glint: [32, 17],
  },
  'governance-compatibility': {
    // The most complex, most symmetric silhouette — many facets in balance.
    outline: [
      [32, 6], [44, 14], [48, 34], [44, 54], [32, 75], [20, 54], [16, 34], [20, 14],
    ],
    facets: [
      [[16, 34], [48, 34]],
      [[32, 6], [32, 75]],
      [[20, 14], [44, 54]],
      [[44, 14], [20, 54]],
    ],
    glint: [32, 20],
  },
};
