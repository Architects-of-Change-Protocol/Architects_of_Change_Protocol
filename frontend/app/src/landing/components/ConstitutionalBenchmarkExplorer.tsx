import { useState, useMemo, useRef } from 'react';
import {
  CONSTITUTIONAL_ORGANIZATIONS,
  QUADRANT_DEFINITIONS,
  ALL_INDUSTRIES,
  GOVERNANCE_THRESHOLD,
  SOVEREIGNTY_THRESHOLD,
  type ConstitutionalOrganization,
  type ConstitutionalQuadrant,
} from '../../data/constitutional-index';

// ── SVG constants ─────────────────────────────────────────────────────────────

const W = 600;
const H = 440;
const PAD_L = 52;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 44;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;
const toX = (sov: number) => PAD_L + (sov / 100) * plotW;
const toY = (gov: number) => PAD_T + ((100 - gov) / 100) * plotH;
const divX = toX(SOVEREIGNTY_THRESHOLD);
const divY = toY(GOVERNANCE_THRESHOLD);
const TICKS = [0, 20, 40, 60, 80, 100];

type ViewMode = 'matrix' | 'ranking' | 'comparison';
type SortKey = 'combined' | 'governance' | 'sovereignty' | 'name';

const QUADRANT_LABELS: Record<ConstitutionalQuadrant, string> = {
  'constitutional-leaders': 'Constitutional Leaders',
  'trusted-custodians': 'Trusted Custodians',
  'dependency-platforms': 'Dependency Platforms',
  'sovereignty-pioneers': 'Sovereignty Pioneers',
};

// ── Benchmark Summary ─────────────────────────────────────────────────────────

function BenchmarkSummary({ orgs }: { orgs: ConstitutionalOrganization[] }) {
  const stats = useMemo(() => {
    if (orgs.length === 0) return null;
    const avgGov = Math.round(
      orgs.reduce((s, o) => s + o.governanceScore, 0) / orgs.length,
    );
    const avgSov = Math.round(
      orgs.reduce((s, o) => s + o.sovereigntyScore, 0) / orgs.length,
    );
    const counts = orgs.reduce<Record<string, number>>((acc, o) => {
      acc[o.quadrant] = (acc[o.quadrant] ?? 0) + 1;
      return acc;
    }, {});
    const dominant = Object.entries(counts).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] as ConstitutionalQuadrant | undefined;
    return { avgGov, avgSov, dominant };
  }, [orgs]);

  return (
    <div className="cbe-summary-bar" aria-label="Benchmark statistics">
      <div className="cbe-summary-stat">
        <span className="cbe-summary-label">Organizations</span>
        <span className="cbe-summary-value">{orgs.length}</span>
      </div>
      <div className="cbe-summary-stat">
        <span className="cbe-summary-label">Avg Governance</span>
        <span className="cbe-summary-value cbe-summary-value--gov">
          {stats ? stats.avgGov : '—'}
        </span>
      </div>
      <div className="cbe-summary-stat">
        <span className="cbe-summary-label">Avg Sovereignty</span>
        <span className="cbe-summary-value cbe-summary-value--sov">
          {stats ? stats.avgSov : '—'}
        </span>
      </div>
      <div className="cbe-summary-stat">
        <span className="cbe-summary-label">Dominant Quadrant</span>
        <span className="cbe-summary-value cbe-summary-value--quadrant">
          {stats?.dominant ? QUADRANT_LABELS[stats.dominant] : '—'}
        </span>
      </div>
    </div>
  );
}

// ── Explorer Controls ─────────────────────────────────────────────────────────

type ControlsProps = {
  search: string;
  setSearch: (v: string) => void;
  industryFilter: string;
  setIndustryFilter: (v: string) => void;
  quadrantFilter: string;
  setQuadrantFilter: (v: string) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
};

function ExplorerControls({
  search, setSearch,
  industryFilter, setIndustryFilter,
  quadrantFilter, setQuadrantFilter,
  viewMode, setViewMode,
}: ControlsProps) {
  return (
    <div className="cbe-controls">
      <label className="sr-only" htmlFor="cbe-search">Search organizations</label>
      <input
        id="cbe-search"
        type="search"
        className="cbe-search-input"
        placeholder="Search organizations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="cbe-select-wrap">
        <label className="sr-only" htmlFor="cbe-industry">Filter by industry</label>
        <select
          id="cbe-industry"
          className="cbe-filter-select"
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
        >
          <option value="all">All Industries</option>
          {ALL_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <div className="cbe-select-wrap">
        <label className="sr-only" htmlFor="cbe-quadrant">Filter by quadrant</label>
        <select
          id="cbe-quadrant"
          className="cbe-filter-select"
          value={quadrantFilter}
          onChange={(e) => setQuadrantFilter(e.target.value)}
        >
          <option value="all">All Quadrants</option>
          {QUADRANT_DEFINITIONS.map((q) => (
            <option key={q.id} value={q.id}>{q.label}</option>
          ))}
        </select>
      </div>

      <div className="cbe-view-toggle" role="group" aria-label="View mode">
        {(['matrix', 'ranking', 'comparison'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`cbe-view-btn${viewMode === mode ? ' cbe-view-btn--active' : ''}`}
            onClick={() => setViewMode(mode)}
            aria-pressed={viewMode === mode}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Org Tooltip ───────────────────────────────────────────────────────────────

function OrgTooltip({ org }: { org: ConstitutionalOrganization }) {
  return (
    <div className="cbe-tooltip">
      <div className="cbe-tooltip-name">{org.name}</div>
      {org.organizationType && (
        <div className="cbe-tooltip-type">{org.organizationType}</div>
      )}
      <div className="cbe-tooltip-scores">
        <div className="cbe-tooltip-score">
          <span className="cbe-tooltip-score-label">Governance</span>
          <span className="cbe-tooltip-score-value cbe-tooltip-score-value--gov">
            {org.governanceScore}
          </span>
        </div>
        <div className="cbe-tooltip-score">
          <span className="cbe-tooltip-score-label">Sovereignty</span>
          <span className="cbe-tooltip-score-value cbe-tooltip-score-value--sov">
            {org.sovereigntyScore}
          </span>
        </div>
      </div>
      <span className={`ci-position-badge ci-position-badge--${org.quadrant} cbe-tooltip-badge`}>
        {QUADRANT_LABELS[org.quadrant]}
      </span>
      <div className="cbe-tooltip-industries">
        {org.industries.map((ind) => (
          <span key={ind} className="cbe-tooltip-industry-tag">{ind}</span>
        ))}
      </div>
      <p className="cbe-tooltip-summary">{org.shortSummary}</p>
      {org.publicAssessmentUrl && org.assessmentStatus === 'available' ? (
        <span className="cbe-tooltip-link">View Profile →</span>
      ) : org.assessmentStatus === 'coming-soon' ? (
        <span className="cbe-tooltip-coming-soon">Assessment Coming Soon</span>
      ) : null}
    </div>
  );
}

// ── Matrix View ───────────────────────────────────────────────────────────────

const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: 'middle' | 'start' | 'end' }> = {
  anthropic:   { dx:   0, dy: -16, anchor: 'middle' },
  writer:      { dx: -12, dy: -16, anchor: 'end'    },
  harvey:      { dx:  12, dy: -16, anchor: 'start'  },
  ollama:      { dx:   0, dy: -16, anchor: 'middle' },
  anythingllm: { dx: -12, dy: -16, anchor: 'end'    },
};

type TooltipState = {
  org: ConstitutionalOrganization;
  x: number;
  y: number;
};

function MatrixView({
  orgs,
}: {
  orgs: ConstitutionalOrganization[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  function handleMouseMove(org: ConstitutionalOrganization, e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ org, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function getTooltipTransform(x: number, y: number, containerW: number): string {
    const tooltipW = 240;
    const flipX = x + tooltipW + 16 > containerW;
    return `translate(${flipX ? 'calc(-100% - 12px)' : '12px'}, calc(-50%))`;
  }

  const containerW = containerRef.current?.clientWidth ?? 600;

  return (
    <>
      <div className="ci-map-shell" style={{ padding: '1rem' }}>
        <div ref={containerRef} style={{ position: 'relative' }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="ci-map-svg"
            role="img"
            aria-label="Constitutional Index Matrix — Governance vs Sovereignty scores"
          >
            {/* Quadrant fills */}
            <rect x={PAD_L} y={PAD_T} width={divX - PAD_L} height={divY - PAD_T} className="ci-map-q2" />
            <rect x={divX} y={PAD_T} width={PAD_L + plotW - divX} height={divY - PAD_T} className="ci-map-q1" />
            <rect x={PAD_L} y={divY} width={divX - PAD_L} height={PAD_T + plotH - divY} className="ci-map-q3" />
            <rect x={divX} y={divY} width={PAD_L + plotW - divX} height={PAD_T + plotH - divY} className="ci-map-q4" />

            {/* Grid lines */}
            {TICKS.map((t) => (
              <g key={t}>
                <line x1={toX(t)} y1={PAD_T} x2={toX(t)} y2={PAD_T + plotH} className="ci-map-grid" />
                <line x1={PAD_L} y1={toY(t)} x2={PAD_L + plotW} y2={toY(t)} className="ci-map-grid" />
              </g>
            ))}

            {/* Quadrant dividers */}
            <line x1={divX} y1={PAD_T} x2={divX} y2={PAD_T + plotH} className="ci-map-divider" />
            <line x1={PAD_L} y1={divY} x2={PAD_L + plotW} y2={divY} className="ci-map-divider" />

            {/* Tick labels */}
            {TICKS.map((t) => (
              <g key={`tick-${t}`}>
                <text x={toX(t)} y={PAD_T + plotH + 18} className="ci-map-tick" textAnchor="middle">
                  {t}
                </text>
                {t > 0 && (
                  <text x={PAD_L - 8} y={toY(t) + 4} className="ci-map-tick" textAnchor="end">
                    {t}
                  </text>
                )}
              </g>
            ))}

            {/* Axis labels */}
            <text x={PAD_L + plotW / 2} y={H - 2} className="ci-map-axis-label" textAnchor="middle">
              Sovereignty
            </text>
            <text
              x={14}
              y={PAD_T + plotH / 2}
              className="ci-map-axis-label"
              textAnchor="middle"
              transform={`rotate(-90, 14, ${PAD_T + plotH / 2})`}
            >
              Governance
            </text>

            {/* Quadrant labels */}
            <text x={PAD_L + (divX - PAD_L) / 2} y={PAD_T + 18} className="ci-map-q-label" textAnchor="middle">
              Trusted Custodians
            </text>
            <text x={divX + (PAD_L + plotW - divX) / 2} y={PAD_T + 18} className="ci-map-q-label" textAnchor="middle">
              Constitutional Leaders
            </text>
            <text x={PAD_L + (divX - PAD_L) / 2} y={divY + 18} className="ci-map-q-label" textAnchor="middle">
              Dependency Platforms
            </text>
            <text x={divX + (PAD_L + plotW - divX) / 2} y={divY + 18} className="ci-map-q-label" textAnchor="middle">
              Sovereignty Pioneers
            </text>

            {/* Organization dots */}
            {orgs.map((org) => {
              const cx = toX(org.sovereigntyScore);
              const cy = toY(org.governanceScore);
              const off = LABEL_OFFSETS[org.id] ?? { dx: 0, dy: -16, anchor: 'middle' };
              const isHovered = tooltip?.org.id === org.id;

              const dotGroup = (
                <g
                  key={org.id}
                  onMouseMove={(e) => handleMouseMove(org, e)}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: org.publicAssessmentUrl ? 'pointer' : 'default' }}
                  aria-label={`${org.name}: Governance ${org.governanceScore}, Sovereignty ${org.sovereigntyScore}, ${QUADRANT_LABELS[org.quadrant]}`}
                  role="img"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 12 : 9}
                    className={`ci-map-dot ci-map-dot--${org.quadrant}`}
                    style={{ transition: 'r 0.15s ease' }}
                  />
                  <text
                    x={cx + off.dx}
                    y={cy + off.dy}
                    className="ci-map-org-label"
                    textAnchor={off.anchor}
                    style={{ fontWeight: 700, filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))' }}
                    aria-hidden="true"
                  >
                    {org.name}
                  </text>
                </g>
              );

              return org.publicAssessmentUrl ? (
                <a key={`link-${org.id}`} href={org.publicAssessmentUrl}>
                  {dotGroup}
                </a>
              ) : dotGroup;
            })}
          </svg>

          {/* Tooltip overlay */}
          {tooltip && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: tooltip.x,
                top: tooltip.y,
                transform: getTooltipTransform(tooltip.x, tooltip.y, containerW),
                zIndex: 20,
                pointerEvents: 'none',
              }}
            >
              <OrgTooltip org={tooltip.org} />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { q: 'Constitutional Leaders', desc: 'High Governance · High Sovereignty', cls: 'ci-legend--q1' },
          { q: 'Trusted Custodians', desc: 'High Governance · Lower Sovereignty', cls: 'ci-legend--q2' },
          { q: 'Sovereignty Pioneers', desc: 'High Sovereignty · Lower Governance', cls: 'ci-legend--q4' },
          { q: 'Dependency Platforms', desc: 'Lower Governance · Lower Sovereignty', cls: 'ci-legend--q3' },
        ].map(({ q, desc, cls }) => (
          <div key={q} className={`ci-legend-card ${cls}`}>
            <strong>{q}</strong>
            <span>{desc}</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-white/30 text-center">
        Positions derived from public materials. Governance threshold: {GOVERNANCE_THRESHOLD}. Sovereignty threshold: {SOVEREIGNTY_THRESHOLD}.
      </p>
    </>
  );
}

// ── Ranking View ──────────────────────────────────────────────────────────────

type RankingViewProps = {
  orgs: ConstitutionalOrganization[];
  sortKey: SortKey;
  setSortKey: (v: SortKey) => void;
};

function SortBtn({
  label,
  skey,
  active,
  onClick,
}: {
  label: string;
  skey: SortKey;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`cbe-sort-btn${active ? ' cbe-sort-btn--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
      {active && <span aria-hidden="true"> ↓</span>}
    </button>
  );
}

function AssessmentAction({ org }: { org: ConstitutionalOrganization }) {
  if (org.publicAssessmentUrl && org.assessmentStatus === 'available') {
    return (
      <a
        href={org.publicAssessmentUrl}
        className="assurance-index-profile-button"
        aria-label={`View ${org.name} constitutional profile`}
      >
        View Profile
      </a>
    );
  }
  if (org.assessmentStatus === 'coming-soon') {
    return <span className="cbe-assessment-label cbe-assessment-label--soon">Coming Soon</span>;
  }
  return <span className="cbe-assessment-label">Not Published</span>;
}

function RankingView({ orgs, sortKey, setSortKey }: RankingViewProps) {
  return (
    <div className="cbe-ranking-shell" role="table" aria-label="Organization rankings">
      {/* Desktop header */}
      <div className="cbe-ranking-header cbe-ranking-row-cols" role="row">
        <SortBtn label="Organization" skey="name" active={sortKey === 'name'} onClick={() => setSortKey('name')} />
        <span className="cbe-col-label">Industries</span>
        <SortBtn label="Governance" skey="governance" active={sortKey === 'governance'} onClick={() => setSortKey('governance')} />
        <SortBtn label="Sovereignty" skey="sovereignty" active={sortKey === 'sovereignty'} onClick={() => setSortKey('sovereignty')} />
        <SortBtn label="Combined" skey="combined" active={sortKey === 'combined'} onClick={() => setSortKey('combined')} />
        <span className="sr-only" role="columnheader">Assessment</span>
      </div>

      {orgs.map((org) => (
        <div key={org.id} className="cbe-ranking-row cbe-ranking-row-cols" role="row">
          {/* Organization */}
          <div className="assurance-index-organization" role="cell">
            <span className="assurance-index-monogram" aria-hidden="true">
              {org.name.charAt(0)}
            </span>
            <div>
              <strong className="block">{org.name}</strong>
              {org.organizationType && (
                <span className="text-xs text-white/40">{org.organizationType}</span>
              )}
            </div>
          </div>

          {/* Industries */}
          <div role="cell" className="cbe-industry-tags">
            {org.industries.map((ind) => (
              <span key={ind} className="cbe-industry-tag">{ind}</span>
            ))}
          </div>

          {/* Governance */}
          <div className="ci-index-score-cell" role="cell">
            <strong className="ci-score-number">{org.governanceScore}</strong>
            <div className="assurance-index-score-track" aria-hidden="true">
              <span style={{ width: `${org.governanceScore}%` }} className="ci-score-track--governance" />
            </div>
          </div>

          {/* Sovereignty */}
          <div className="ci-index-score-cell" role="cell">
            <strong className="ci-score-number ci-score-number--sovereignty">{org.sovereigntyScore}</strong>
            <div className="assurance-index-score-track" aria-hidden="true">
              <span style={{ width: `${org.sovereigntyScore}%` }} className="ci-score-track--sovereignty" />
            </div>
          </div>

          {/* Quadrant */}
          <div role="cell">
            <span className={`ci-position-badge ci-position-badge--${org.quadrant}`}>
              {QUADRANT_LABELS[org.quadrant]}
            </span>
          </div>

          {/* Assessment */}
          <div className="assurance-index-action" role="cell">
            <AssessmentAction org={org} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Comparison View ───────────────────────────────────────────────────────────

type ComparisonViewProps = {
  orgs: ConstitutionalOrganization[];
  allOrgs: ConstitutionalOrganization[];
  comparisonIds: string[];
  setComparisonIds: React.Dispatch<React.SetStateAction<string[]>>;
};

function ComparisonView({ orgs, allOrgs, comparisonIds, setComparisonIds }: ComparisonViewProps) {
  function toggleOrg(id: string) {
    setComparisonIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div>
      <p className="cbe-comparison-insight">
        Comparing selected organizations across governance, sovereignty, and constitutional posture.
      </p>

      {allOrgs.length > 1 && (
        <div className="cbe-comparison-selector" role="group" aria-label="Select up to 3 organizations to compare">
          {allOrgs.map((org) => {
            const isSelected = comparisonIds.includes(org.id);
            const isDisabled = comparisonIds.length >= 3 && !isSelected;
            return (
              <button
                key={org.id}
                type="button"
                className={[
                  'cbe-comparison-chip',
                  isSelected ? 'cbe-comparison-chip--selected' : '',
                  isDisabled ? 'cbe-comparison-chip--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => { if (!isDisabled) toggleOrg(org.id); }}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
              >
                {org.name}
                {isSelected && <span aria-hidden="true"> ✓</span>}
              </button>
            );
          })}
          {comparisonIds.length > 0 && (
            <button
              type="button"
              className="cbe-comparison-chip cbe-comparison-chip--clear"
              onClick={() => setComparisonIds([])}
            >
              Reset
            </button>
          )}
        </div>
      )}

      {orgs.length === 0 ? (
        <p className="text-sm text-white/40 text-center py-12">
          Select organizations above to compare them.
        </p>
      ) : (
        <div className="cbe-comparison-grid">
          {orgs.map((org) => (
            <article key={org.id} className="cbe-comparison-card">
              <div>
                <span className={`ci-position-badge ci-position-badge--${org.quadrant}`}>
                  {QUADRANT_LABELS[org.quadrant]}
                </span>
                <h3 className="cbe-comparison-card-name">{org.name}</h3>
                {org.organizationType && (
                  <p className="cbe-comparison-org-type">{org.organizationType}</p>
                )}
              </div>

              <div className="cbe-comparison-scores">
                <div className="cbe-comparison-score">
                  <span className="cbe-comparison-score-label">Governance</span>
                  <span className="cbe-comparison-score-value cbe-comparison-score-value--gov">
                    {org.governanceScore}
                  </span>
                </div>
                <div className="cbe-comparison-score">
                  <span className="cbe-comparison-score-label">Sovereignty</span>
                  <span className="cbe-comparison-score-value cbe-comparison-score-value--sov">
                    {org.sovereigntyScore}
                  </span>
                </div>
              </div>

              <div className="cbe-comparison-industries">
                {org.industries.map((ind) => (
                  <span key={ind} className="cbe-industry-tag">{ind}</span>
                ))}
              </div>

              <p className="cbe-comparison-summary">{org.shortSummary}</p>

              {org.publicAssessmentUrl && org.assessmentStatus === 'available' ? (
                <a href={org.publicAssessmentUrl} className="cbe-comparison-link">
                  View Assessment →
                </a>
              ) : org.assessmentStatus === 'coming-soon' ? (
                <span className="cbe-assessment-label cbe-assessment-label--soon">Coming Soon</span>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="cbe-empty-state" role="status" aria-live="polite">
      No organizations match the current filters.
    </div>
  );
}

// ── Main Explorer ─────────────────────────────────────────────────────────────

export function ConstitutionalBenchmarkExplorer() {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [quadrantFilter, setQuadrantFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [sortKey, setSortKey] = useState<SortKey>('combined');
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CONSTITUTIONAL_ORGANIZATIONS.filter((org) => {
      if (q && !org.name.toLowerCase().includes(q)) return false;
      if (industryFilter !== 'all' && !org.industries.includes(industryFilter)) return false;
      if (quadrantFilter !== 'all' && org.quadrant !== quadrantFilter) return false;
      return true;
    });
  }, [search, industryFilter, quadrantFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'combined':
          return (
            (b.governanceScore + b.sovereigntyScore) / 2 -
            (a.governanceScore + a.sovereigntyScore) / 2
          );
        case 'governance':
          return b.governanceScore - a.governanceScore;
        case 'sovereignty':
          return b.sovereigntyScore - a.sovereigntyScore;
        case 'name':
          return a.name.localeCompare(b.name);
      }
    });
  }, [filtered, sortKey]);

  const comparisonOrgs = useMemo(() => {
    if (comparisonIds.length === 0) return filtered.slice(0, 3);
    return comparisonIds
      .map((id) => filtered.find((o) => o.id === id))
      .filter((o): o is ConstitutionalOrganization => o !== undefined);
  }, [comparisonIds, filtered]);

  return (
    <div>
      {/* Section header */}
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
          Constitutional Benchmark Explorer
        </p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
          Compare organizations by constitutional posture.
        </h2>
        <p className="text-white/60 text-lg leading-relaxed">
          The Constitutional Index maps how AI organizations balance institutional governance with user and ecosystem sovereignty.
        </p>
      </header>

      <BenchmarkSummary orgs={filtered} />

      <ExplorerControls
        search={search}
        setSearch={setSearch}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        quadrantFilter={quadrantFilter}
        setQuadrantFilter={setQuadrantFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {viewMode === 'matrix' && <MatrixView orgs={filtered} />}
          {viewMode === 'ranking' && (
            <RankingView orgs={sorted} sortKey={sortKey} setSortKey={setSortKey} />
          )}
          {viewMode === 'comparison' && (
            <ComparisonView
              orgs={comparisonOrgs}
              allOrgs={filtered}
              comparisonIds={comparisonIds}
              setComparisonIds={setComparisonIds}
            />
          )}
        </>
      )}
    </div>
  );
}
