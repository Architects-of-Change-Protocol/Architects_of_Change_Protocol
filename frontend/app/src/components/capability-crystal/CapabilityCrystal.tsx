import './capability-crystal.css';

/**
 * Capability Crystals — the small faceted glyphs that stand in for a governed
 * AOC Protocol capability wherever its name appears. Each capability owns a
 * distinct silhouette (its shape) and a distinct signature color (its
 * mineral), drawn from a shared visual language: faceted, translucent,
 * mineral-like, engineered. Not icons — specimens.
 */
export type CapabilityCrystalId =
  | 'identity'
  | 'authority'
  | 'delegation'
  | 'evidence'
  | 'policy'
  | 'federation'
  | 'audit'
  | 'economy'
  | 'accountability'
  | 'execution'
  | 'consent'
  | 'ownership'
  | 'portability'
  | 'passport'
  | 'decisions'
  | 'policy-enforcement'
  | 'approvals'
  | 'authority-chains'
  | 'agent-identity'
  | 'payments'
  | 'economic-governance'
  | 'custody'
  | 'provenance';

type Pt = readonly [number, number];
type Edge = readonly [Pt, Pt];

type CrystalSpec = {
  /** Signature mineral color for this capability. */
  color: string;
  /** Gem name, used only for the accessible label. */
  mineral: string;
  /** One or more simple polygons forming the crystal body. */
  facets: readonly (readonly Pt[])[];
  /** A brighter sub-facet layered over the body for faceted shading. */
  overlay?: readonly Pt[];
  /** Internal facet-edge lines. */
  ridges?: readonly Edge[];
  /** The short light-catching stroke near one edge. */
  highlight: Edge;
};

const toPoints = (pts: readonly Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

const CRYSTALS: Record<CapabilityCrystalId, CrystalSpec> = {
  // ── Identity — tall vertical prism, emerald ──────────────────────────────
  identity: {
    color: '#3DAE86',
    mineral: 'emerald',
    facets: [[[12, 2.5], [14.8, 6.2], [13.6, 17.8], [11.6, 21.5], [9.6, 17.5], [8.7, 6.4]]],
    overlay: [[12, 2.5], [8.7, 6.4], [9.6, 17.5], [11.6, 21.5]],
    ridges: [[[12, 2.5], [11.6, 21.5]]],
    highlight: [[9.3, 7.5], [9.9, 11]],
  },
  // ── Authority — compact hexagonal crystal, jade ──────────────────────────
  authority: {
    color: '#6E9E8E',
    mineral: 'jade',
    facets: [[[8.5, 7.2], [15.7, 7.6], [19, 12.3], [15.4, 17.2], [8.2, 17.6], [5.2, 12.1]]],
    overlay: [[8.5, 7.2], [15.7, 7.6], [12, 12.4]],
    ridges: [[[8.5, 7.2], [15.4, 17.2]], [[15.7, 7.6], [8.2, 17.6]]],
    highlight: [[9.5, 8.4], [10.6, 9.6]],
  },
  // ── Delegation — lean diagonal shard, lime ───────────────────────────────
  delegation: {
    color: '#A8B85A',
    mineral: 'lime',
    facets: [[[12.2, 3], [14.6, 10.8], [10.6, 21], [8.6, 9.4]]],
    overlay: [[12.2, 3], [14.6, 10.8], [10.6, 21]],
    ridges: [[[12.2, 3], [10.6, 21]]],
    highlight: [[9.2, 10.2], [10, 13.6]],
  },
  // ── Evidence — octahedral crystal, teal ──────────────────────────────────
  evidence: {
    color: '#2E93A0',
    mineral: 'teal',
    facets: [[[12, 3.2], [19, 11.6], [12, 20.4], [5, 12.6]]],
    overlay: [[12, 3.2], [19, 11.6], [12, 12]],
    ridges: [[[12, 3.2], [12, 20.4]], [[5, 12.6], [19, 11.6]]],
    highlight: [[7, 10.6], [9, 9]],
  },
  // ── Policy — wide faceted block, sapphire ────────────────────────────────
  policy: {
    color: '#3D6BA5',
    mineral: 'sapphire',
    facets: [[[7, 7.4], [17.2, 6.8], [20, 11.8], [17.6, 17.4], [7.4, 17.8], [4.4, 11.4]]],
    overlay: [[7, 7.4], [17.2, 6.8], [15.8, 8.7], [8.6, 9.2]],
    ridges: [[[8.6, 9.2], [15.8, 8.7]]],
    highlight: [[9, 7.6], [13, 7.2]],
  },
  // ── Federation — multi-point crystal cluster, amethyst ───────────────────
  federation: {
    color: '#8A6FB0',
    mineral: 'amethyst',
    facets: [
      [[7, 18.6], [8.7, 18.6], [7.7, 9.6]],
      [[10.2, 19], [13.4, 19], [11.7, 3.6]],
      [[14.4, 18.4], [17.2, 18.4], [15.7, 9.8]],
    ],
    overlay: [[11.7, 3.6], [13.4, 19], [11.8, 19]],
    ridges: [[[7.7, 9.6], [7.85, 18.6]], [[11.7, 3.6], [11.8, 19]], [[15.7, 9.8], [15.8, 18.4]]],
    highlight: [[11.9, 5], [12.4, 8.5]],
  },
  // ── Audit — long ice-like prism, ice blue ────────────────────────────────
  audit: {
    color: '#92C7DA',
    mineral: 'ice blue',
    facets: [[[12, 1.4], [13.3, 5.6], [12.9, 18.6], [11.7, 22.6], [10.5, 18.3], [10.3, 5.8]]],
    overlay: [[12, 1.4], [10.3, 5.8], [10.5, 18.3], [11.7, 22.6]],
    ridges: [[[12, 1.4], [11.7, 22.6]], [[10.3, 8.6], [13.2, 8.9]], [[10.4, 15.2], [13, 15.4]]],
    highlight: [[10.6, 7], [11, 11]],
  },
  // ── Economy — pyramid crystal, olive green ───────────────────────────────
  economy: {
    color: '#7C7A4A',
    mineral: 'olive',
    facets: [[[12.6, 3.6], [18.4, 19.4], [6.2, 19.8]]],
    overlay: [[12.6, 3.6], [18.4, 19.4], [12.4, 19.6]],
    ridges: [[[12.6, 3.6], [12.4, 19.6]], [[8, 18.6], [17, 19.2]]],
    highlight: [[11, 7], [11.6, 10.4]],
  },
  // ── Accountability — flat-top pentagon keystone, garnet ──────────────────
  accountability: {
    color: '#9C4B4B',
    mineral: 'garnet',
    facets: [[[8.4, 6.4], [15.8, 6.4], [18.4, 13.6], [12.1, 20.4], [5.6, 13.6]]],
    overlay: [[8.4, 6.4], [5.6, 13.6], [12.1, 20.4]],
    ridges: [[[8.4, 6.4], [12.1, 20.4]], [[15.8, 6.4], [12.1, 20.4]]],
    highlight: [[9, 7.6], [10.2, 9]],
  },
  // ── Execution — steep blade shard, citrine ───────────────────────────────
  execution: {
    color: '#C9A227',
    mineral: 'citrine',
    facets: [[[13.4, 2.8], [16, 8.4], [8.8, 21.2], [9.6, 13.4]]],
    overlay: [[13.4, 2.8], [16, 8.4], [8.8, 21.2]],
    ridges: [[[13.4, 2.8], [8.8, 21.2]]],
    highlight: [[10, 14], [9.4, 17.4]],
  },
  // ── Consent — soft rounded crystal, rose quartz ──────────────────────────
  consent: {
    color: '#C48A93',
    mineral: 'rose quartz',
    facets: [[[9.4, 7.4], [14.6, 7.4], [17.6, 10.6], [17.6, 14.6], [14.6, 17.8], [9.4, 17.8], [6.4, 14.6], [6.4, 10.6]]],
    overlay: [[9.4, 7.4], [14.6, 7.4], [17.6, 10.6], [12, 12.6]],
    ridges: [[[9.4, 7.4], [14.6, 17.8]]],
    highlight: [[8, 9], [9, 11.4]],
  },
  // ── Ownership — squat sealed block, topaz ────────────────────────────────
  ownership: {
    color: '#A97C50',
    mineral: 'topaz',
    facets: [[[7.6, 9], [16.4, 8.6], [19, 12.6], [16.6, 17.4], [7.4, 17.8], [5, 13]]],
    overlay: [[7.6, 9], [16.4, 8.6], [15.4, 10.1], [8.8, 10.4]],
    ridges: [[[8.8, 10.4], [15.4, 10.1]]],
    highlight: [[9, 9.4], [13, 9.1]],
  },
  // ── Portability — shard leaning opposite delegation, aquamarine ─────────
  portability: {
    color: '#6FC2BE',
    mineral: 'aquamarine',
    facets: [[[11.8, 3], [15.4, 9.4], [13.4, 21], [9.4, 10.8]]],
    overlay: [[11.8, 3], [15.4, 9.4], [13.4, 21]],
    ridges: [[[11.8, 3], [13.4, 21]]],
    highlight: [[14.4, 10.6], [13.8, 14]],
  },
  // ── Passport — short notched prism, moonstone ────────────────────────────
  passport: {
    color: '#AAB8C6',
    mineral: 'moonstone',
    facets: [[[11.3, 4.4], [12, 5.6], [12.7, 4.4], [14.4, 7.6], [13.6, 16.6], [12, 19.4], [10.4, 16.4], [9.6, 7.4]]],
    overlay: [[11.3, 4.4], [9.6, 7.4], [10.4, 16.4], [12, 19.4], [12, 5.6]],
    ridges: [[[12, 5.6], [12, 19.4]]],
    highlight: [[10, 9], [10.4, 12.4]],
  },
  // ── Decisions — asymmetric branch-point crystal, onyx ────────────────────
  decisions: {
    color: '#4A4A52',
    mineral: 'onyx',
    facets: [[[12, 3.4], [18.6, 9.8], [10.4, 20.6], [5.4, 14.4]]],
    overlay: [[12, 3.4], [18.6, 9.8], [11, 11]],
    ridges: [[[12, 3.4], [10.4, 20.6]], [[5.4, 14.4], [18.6, 9.8]]],
    highlight: [[7, 13], [9, 12]],
  },
  // ── Policy Enforcement — narrow reinforced block, cobalt ─────────────────
  'policy-enforcement': {
    color: '#2C4F82',
    mineral: 'cobalt',
    facets: [[[9, 6], [15.4, 5.8], [17.6, 11.4], [15.2, 18.6], [9.2, 18.8], [6.6, 11.2]]],
    overlay: [[9, 6], [15.4, 5.8], [14.6, 7.4], [9.8, 7.6]],
    ridges: [[[9.8, 7.6], [14.6, 7.4]], [[10.2, 9], [14.2, 8.8]]],
    highlight: [[9.6, 6.6], [12.6, 6.4]],
  },
  // ── Approvals — small checkpoint crystal, peridot ────────────────────────
  approvals: {
    color: '#BCC96C',
    mineral: 'peridot',
    facets: [[[9.4, 8], [14.6, 8], [16.6, 13], [12, 18.6], [7.4, 13]]],
    overlay: [[9.4, 8], [7.4, 13], [12, 18.6]],
    ridges: [[[9.4, 8], [12, 18.6]], [[14.6, 8], [12, 18.6]]],
    highlight: [[9.6, 9.2], [10.4, 10.6]],
  },
  // ── Authority Chains — two linked crystal links, malachite ───────────────
  'authority-chains': {
    color: '#2E8A63',
    mineral: 'malachite',
    facets: [
      [[9.6, 5.4], [13.2, 8.4], [9.8, 11.4], [6.2, 8.4]],
      [[13.8, 11.6], [17.6, 14.8], [14, 18], [10.2, 14.8]],
    ],
    overlay: [[13.8, 11.6], [17.6, 14.8], [14, 18]],
    ridges: [[[9.6, 5.4], [9.8, 11.4]], [[13.8, 11.6], [14, 18]]],
    highlight: [[7, 7], [8, 8.6]],
  },
  // ── Agent Identity — twin thin prisms, chrysoprase ───────────────────────
  'agent-identity': {
    color: '#6FC0A0',
    mineral: 'chrysoprase',
    facets: [
      [[9, 4], [10.6, 12], [8.6, 20], [7, 12]],
      [[15, 6], [16.4, 13], [14.8, 19.4], [13.4, 13]],
    ],
    overlay: [[9, 4], [10.6, 12], [8.6, 20]],
    ridges: [[[9, 4], [8.6, 20]], [[15, 6], [14.8, 19.4]]],
    highlight: [[7.4, 9], [7.7, 12.4]],
  },
  // ── Payments — steep coin-edge shard, gold ───────────────────────────────
  payments: {
    color: '#B8863B',
    mineral: 'gold',
    facets: [[[14.6, 4], [17, 10.4], [9.4, 20], [10.4, 12.4]]],
    overlay: [[14.6, 4], [17, 10.4], [9.4, 20]],
    ridges: [[[14.6, 4], [9.4, 20]]],
    highlight: [[11, 15.4], [10.4, 18.4]],
  },
  // ── Economic Governance — wide matte block, smoky quartz ────────────────
  'economic-governance': {
    color: '#8B7D6B',
    mineral: 'smoky quartz',
    facets: [[[6.6, 9.4], [17.6, 9], [20, 12.6], [17.8, 16.6], [6.4, 17], [4, 12.8]]],
    overlay: [[6.6, 9.4], [17.6, 9], [16.2, 10.3], [8, 10.6]],
    ridges: [[[8, 10.6], [16.2, 10.3]]],
    highlight: [[8.4, 9.8], [12, 9.6]],
  },
  // ── Custody — vault-cut block, obsidian ──────────────────────────────────
  custody: {
    color: '#35363B',
    mineral: 'obsidian',
    facets: [[[8, 6.6], [16.4, 6.4], [19, 11.6], [16.6, 18], [10.4, 18.4], [6.6, 15.4], [5.2, 10.6]]],
    overlay: [[8, 6.6], [16.4, 6.4], [15, 7.8], [9, 8]],
    ridges: [[[9, 8], [15, 7.8]]],
    highlight: [[9.4, 7], [13, 6.8]],
  },
  // ── Provenance — elongated octahedron, amber ─────────────────────────────
  provenance: {
    color: '#CC7722',
    mineral: 'amber',
    facets: [[[12, 2.8], [17.4, 12], [12, 21.2], [6.8, 12]]],
    overlay: [[12, 2.8], [17.4, 12], [12, 12]],
    ridges: [[[12, 2.8], [12, 21.2]], [[6.8, 12], [17.4, 12]]],
    highlight: [[8.4, 10], [10, 8.6]],
  },
};

export function CapabilityCrystal({
  capability,
  size = 16,
  className = '',
}: {
  capability: CapabilityCrystalId;
  size?: number;
  className?: string;
}) {
  const spec = CRYSTALS[capability];
  if (!spec) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`aoc-crystal ${className}`}
      style={{ ['--crystal-color' as string]: spec.color }}
      role="img"
      aria-label={`${capability} capability crystal (${spec.mineral})`}
    >
      {spec.facets.map((facet, i) => (
        <polygon key={`facet-${i}`} points={toPoints(facet)} className="aoc-crystal-facet" />
      ))}
      {spec.overlay ? <polygon points={toPoints(spec.overlay)} className="aoc-crystal-overlay" /> : null}
      {spec.ridges?.map((edge, i) => (
        <line
          key={`ridge-${i}`}
          x1={edge[0][0]}
          y1={edge[0][1]}
          x2={edge[1][0]}
          y2={edge[1][1]}
          className="aoc-crystal-ridge"
        />
      ))}
      <line
        x1={spec.highlight[0][0]}
        y1={spec.highlight[0][1]}
        x2={spec.highlight[1][0]}
        y2={spec.highlight[1][1]}
        className="aoc-crystal-highlight"
      />
    </svg>
  );
}
