/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import {
  CONSTITUTIONAL_INDEX_ORGANIZATIONS,
  GOVERNANCE_RANKED,
  SOVEREIGNTY_RANKED,
} from './assuranceIndexData';
import './assurance.css';

const MOBILE_NAVIGATION_ITEMS = [
  { label: 'Map', href: '#map' },
  { label: 'Index', href: '#index' },
  { label: 'Leaders', href: '#leaders' },
  { label: 'Methodology', href: '#methodology' },
  { label: 'AOC Protocol', href: '/' },
];

const FOUNDATION_CHECKOUT_URL = 'https://buy.stripe.com/aFa5kD1Kfgcp67N11gejK01';
const FOUNDER_PROGRAM_CHECKOUT_URL = 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00';
const ENTERPRISE_INTAKE_FORM_URL = 'https://tally.so/r/2ER1M9';
const FOUNDER_ESSAY_URL = 'https://www.linkedin.com/pulse/i-started-looking-sovereignty-found-constitutional-valverde-checa-hnpye/';


const FOOTER_LINK_GROUPS = [
  {
    title: 'Assessments',
    links: [
      { label: 'Public Constitutional Assessment', href: '#assessments' },
      { label: 'Founder Constitutional Assessment', href: '#assessments' },
      { label: 'Enterprise Constitutional Assessment', href: '#assessments' },
      { label: 'Constitutional Index', href: '#index' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Constitutional Matrix', href: '#map' },
      { label: 'Constitutional Index Methodology', href: '/assurance/methodology' },
      { label: 'Founder Essay', href: FOUNDER_ESSAY_URL, external: true },
      { label: 'Public Research Initiative', href: '/assurance/research' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About AOC Assurance', href: '/assurance/about' },
      { label: 'About AOC Protocol', href: '/' },
      { label: 'Privacy Policy', href: '/assurance/privacy' },
      { label: 'Terms of Service', href: '/assurance/terms' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/architects-of-change-protocol/', external: true },
      { label: 'X (@archofchange)', href: 'https://x.com/archofchange', external: true },
      { label: 'GitHub', href: 'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol', external: true },
      { label: 'Contact Us', href: 'mailto:vicvalch@onchainfest.xyz' },
    ],
  },
];

function PublicResearchBridge() {
  return (
    <section className="assurance-research-bridge px-6 py-16" aria-labelledby="research-bridge-heading">
      <div className="max-w-7xl mx-auto assurance-research-bridge-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">PUBLIC RESEARCH INITIATIVE</p>
          <h2 id="research-bridge-heading">Mapping the constitutional posture of the AI industry.</h2>
          <p>AOC Assurance continuously evaluates AI organizations using publicly observable evidence to better understand the evolving relationship between Governance and Sovereignty across the industry.</p>
        </div>
        <a href="/assurance/research" className="assurance-research-bridge-link">Explore the Research Initiative</a>
      </div>
    </section>
  );
}

function AssuranceFooter() {
  return (
    <footer className="assurance-footer px-6" aria-labelledby="assurance-footer-title">
      <div className="max-w-7xl mx-auto assurance-footer-inner">
        <div className="assurance-footer-brand">
          <h2 id="assurance-footer-title">AOC Assurance</h2>
          <p>A constitutional assessment framework developed by AOC Protocol.</p>
          <p className="assurance-footer-tagline">Measure Governance.<br />Measure Sovereignty.<br />Understand the Balance.</p>
          <p className="assurance-footer-institutional">AOC Assurance and AOC Protocol are initiatives of OnchainFest LLC.</p>
        </div>
        <nav className="assurance-footer-links" aria-label="AOC Assurance footer navigation">
          {FOOTER_LINK_GROUPS.map((group) => (
            <section key={group.title} aria-labelledby={`footer-${group.title.toLowerCase()}`}>
              <h3 id={`footer-${group.title.toLowerCase()}`}>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noopener noreferrer' : undefined}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="assurance-footer-legal">
          <p>© 2026 OnchainFest LLC. All rights reserved.</p>
          <p>AOC Assurance does not certify organizations as safe, secure, compliant, trustworthy, or risk-free.</p>
          <p>The Constitutional Index is an evidence-based assessment framework designed to evaluate governance and sovereignty characteristics using publicly observable and/or supplied evidence. Constitutional scores represent analytical assessments and should not be interpreted as guarantees, certifications, or endorsements.</p>
        </div>
      </div>
    </footer>
  );
}

const ASSESSMENT_OFFERINGS = [
  {
    key: 'foundation',
    label: 'PUBLIC CONSTITUTIONAL ASSESSMENT',
    price: '$49',
    priceNote: null,
    popular: false,
    comingSoon: false,
    headline: 'Public Constitutional Assessment',
    description:
      'A rapid constitutional assessment that establishes your organization\'s Governance Score, Sovereignty Score, and Constitutional Position using exclusively publicly observable evidence, documentation, repositories, websites, policies, and disclosures.',
    items: [
      'Governance Score',
      'Sovereignty Score',
      'Constitutional Position',
      'Executive Summary Report',
      'Public Constitutional Index Listing',
      'Delivered within 72 hours',
    ],
    cta: 'Start Assessment — $49',
    ctaHref: FOUNDATION_CHECKOUT_URL,
    featured: false,
  },
  {
    key: 'advanced',
    label: 'FOUNDER PROGRAM',
    price: '$149',
    priceNote: 'Future public price: $499',
    popular: true,
    comingSoon: false,
    headline: 'Founder Program',
    description:
      'A collaborative constitutional review designed to explain your results, validate assumptions, identify governance and sovereignty constraints, and build a prioritized improvement roadmap.',
    items: [
      'Everything in Foundation',
      'Constitutional Findings Review',
      'Governance Constraint Analysis',
      'Sovereignty Constraint Analysis',
      'Evidence Validation',
      'Prioritized Improvement Roadmap',
      'Recommended AOC Protocol Integrations',
      'Executive Constitutional Report',
      'Delivered within 5 business days',
    ],
    cta: 'Join Founder Program — $149',
    ctaHref: FOUNDER_PROGRAM_CHECKOUT_URL,
    featured: true,
  },
  {
    key: 'sovereign',
    label: 'DEEP CONSTITUTIONAL AUDIT',
    price: 'Contact Sales',
    priceNote: null,
    popular: false,
    comingSoon: false,
    headline: 'Deep Constitutional Audit',
    description:
      'A hands-on constitutional engagement for organizations actively seeking measurable improvement — validating controls, implementing governance changes, increasing sovereignty, and preparing for reassessment.',
    items: [
      'Private Repository Review',
      'Governance Validation',
      'Authority Mapping',
      'Runtime Control Assessment',
      'Evidence Chain Review',
      'Remediation Planning',
      'Executive Workshops',
    ],
    cta: 'Start Enterprise Intake',
    ctaHref: ENTERPRISE_INTAKE_FORM_URL,
    featured: false,
  },
];

function ConstitutionalMap() {
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

  const divX = toX(55);
  const divY = toY(55);

  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="ci-map-shell">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="ci-map-svg"
        role="img"
        aria-label="Constitutional Index Map — Governance vs Sovereignty"
      >
        {/* Quadrant fills */}
        <rect x={PAD_L} y={PAD_T} width={divX - PAD_L} height={divY - PAD_T} className="ci-map-q2" />
        <rect x={divX} y={PAD_T} width={PAD_L + plotW - divX} height={divY - PAD_T} className="ci-map-q1" />
        <rect x={PAD_L} y={divY} width={divX - PAD_L} height={PAD_T + plotH - divY} className="ci-map-q3" />
        <rect x={divX} y={divY} width={PAD_L + plotW - divX} height={PAD_T + plotH - divY} className="ci-map-q4" />

        {/* Grid lines */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={PAD_T} x2={toX(t)} y2={PAD_T + plotH} className="ci-map-grid" />
            <line x1={PAD_L} y1={toY(t)} x2={PAD_L + plotW} y2={toY(t)} className="ci-map-grid" />
          </g>
        ))}

        {/* Quadrant dividers */}
        <line x1={divX} y1={PAD_T} x2={divX} y2={PAD_T + plotH} className="ci-map-divider" />
        <line x1={PAD_L} y1={divY} x2={PAD_L + plotW} y2={divY} className="ci-map-divider" />

        {/* Axis tick labels */}
        {ticks.map((t) => (
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
          Sovereignty First
        </text>

        {/* Organization dots */}
        {CONSTITUTIONAL_INDEX_ORGANIZATIONS.map((org) => {
          const cx = toX(org.sovereigntyScore);
          const cy = toY(org.governanceScore);

          // Per-company label offsets to avoid overlap and clipping
          const labelOffsets: Record<string, { dx: number; dy: number; anchor: 'middle' | 'start' | 'end' }> = {
            anthropic:   { dx:   0, dy: -16, anchor: 'middle' },
            writer:      { dx: -12, dy: -16, anchor: 'end'    },
            harvey:      { dx:  12, dy: -16, anchor: 'start'  },
            ollama:      { dx:   0, dy: -16, anchor: 'middle' },
            anythingllm: { dx: -12, dy: -16, anchor: 'end'    },
          };
          const off = labelOffsets[org.id] ?? { dx: 0, dy: -16, anchor: 'middle' };

          return (
            <g key={org.id}>
              <a href={`/assurance/index/${org.slug}`}>
                <circle cx={cx} cy={cy} r={9} className={`ci-map-dot ci-map-dot--${org.quadrant}`} />
                <text
                  x={cx + off.dx}
                  y={cy + off.dy}
                  className="ci-map-org-label"
                  textAnchor={off.anchor}
                  style={{
                    fontWeight: 700,
                    filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.9))',
                  }}
                >
                  {org.name}
                </text>
              </a>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const AssurancePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const emergingCandidates = CONSTITUTIONAL_INDEX_ORGANIZATIONS.filter(
    (o) => o.quadrant === 'sovereignty-first',
  ).sort((a, b) => b.governanceScore + b.sovereigntyScore - (a.governanceScore + a.sovereigntyScore));

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-30 backdrop-blur bg-[#070d0b]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <LogoRotating size={28} inverted />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tighter">AOC</span>
              <span className="text-xs text-emerald-400 uppercase tracking-[0.2em]">Constitutional Index</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-white/70">
            <a href="#map" className="hover:text-white transition-colors">Map</a>
            <a href="#index" className="hover:text-white transition-colors">Index</a>
            <a href="#leaders" className="hover:text-white transition-colors">Leaders</a>
            <a href="#methodology" className="hover:text-white transition-colors">Methodology</a>
            <a href="/" className="hover:text-white transition-colors">Protocol</a>
          </div>

          <a
            href="#assessments"
            className="hidden md:inline-block px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            Request Assessment
          </a>

          <button
            type="button"
            className="relative flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="ci-mobile-nav"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>

        <div
          id="ci-mobile-nav"
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
          className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-[#070d0b]/95 backdrop-blur-lg transition-[max-height,opacity] duration-300 ease-out md:hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-1">
            {MOBILE_NAVIGATION_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="assurance-hero-glow relative pt-28 pb-32 text-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-6">
          AOC Constitutional Index
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-[-2.5px] leading-[1.05] max-w-4xl mx-auto mb-8">
          Constitutional positioning for AI organizations.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/65 leading-relaxed mb-12">
          Independent evaluation of AI organizations across Governance and Sovereignty dimensions.
          Understanding constitutional position before your regulator asks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#map"
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
          >
            Explore the Map
          </a>
          <a
            href="#assessments"
            className="px-10 py-4 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-colors"
          >
            Request Assessment
          </a>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Constitutional Map ── */}
      <section id="map" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Constitutional Map
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Where organizations stand.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Each organization is plotted by its Governance score (Y axis) and Sovereignty score
              (X axis). Position reflects constitutional reality, not aspiration.
            </p>
          </header>

          <ConstitutionalMap />

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { q: 'Constitutional Leaders', desc: 'High Governance · High Sovereignty', cls: 'ci-legend--q1' },
              { q: 'Trusted Custodians', desc: 'High Governance · Lower Sovereignty', cls: 'ci-legend--q2' },
              { q: 'Sovereignty First', desc: 'High Sovereignty · Lower Governance', cls: 'ci-legend--q4' },
              { q: 'Dependency Platforms', desc: 'Moderate Governance · Low Sovereignty', cls: 'ci-legend--q3' },
            ].map(({ q, desc, cls }) => (
              <div key={q} className={`ci-legend-card ${cls}`}>
                <strong>{q}</strong>
                <span>{desc}</span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-white/30 text-center">
            Positions derived from public materials. Governance threshold: 55. Sovereignty threshold: 55.
          </p>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Constitutional Index Table ── */}
      <section id="index" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Constitutional Index
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5">
              The Public Index for AI Governance and Sovereignty
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              AOC evaluates AI organizations across Governance and Sovereignty dimensions, helping
              founders, enterprises, investors, and buyers understand accountability, control,
              dependency, and constitutional position.
            </p>
          </header>

          <dl className="assurance-index-metrics">
            <div>
              <dt>Organizations Assessed</dt>
              <dd>{CONSTITUTIONAL_INDEX_ORGANIZATIONS.length}</dd>
            </div>
            <div>
              <dt>Constitutional Leaders</dt>
              <dd>{CONSTITUTIONAL_INDEX_ORGANIZATIONS.filter((o) => o.quadrant === 'constitutional-leaders').length}</dd>
            </div>
            <div>
              <dt>Trusted Custodians</dt>
              <dd>{CONSTITUTIONAL_INDEX_ORGANIZATIONS.filter((o) => o.quadrant === 'trusted-custodians').length}</dd>
            </div>
            <div>
              <dt>Sovereignty First</dt>
              <dd>{CONSTITUTIONAL_INDEX_ORGANIZATIONS.filter((o) => o.quadrant === 'sovereignty-first').length}</dd>
            </div>
          </dl>

          <div className="assurance-index-shell">
            <div className="ci-index-table" role="table" aria-label="AOC Constitutional Index">
              <div className="ci-index-header" role="row">
                <span role="columnheader">Organization</span>
                <span role="columnheader">Governance</span>
                <span role="columnheader">Sovereignty</span>
                <span role="columnheader">Constitutional Position</span>
                <span className="sr-only" role="columnheader">Profile</span>
              </div>

              {CONSTITUTIONAL_INDEX_ORGANIZATIONS.map((org) => (
                <div className="ci-index-row" role="row" key={org.id}>
                  <div className="assurance-index-organization" role="cell">
                    <span className="assurance-index-monogram" aria-hidden="true">
                      {org.name.charAt(0)}
                    </span>
                    <div>
                      <strong className="block">{org.name}</strong>
                      <span className="text-xs text-white/40 font-normal">{org.constitutionalSummary}</span>
                    </div>
                  </div>
                  <div className="ci-index-score-cell" role="cell">
                    <strong className="ci-score-number">{org.governanceScore}</strong>
                    <div className="assurance-index-score-track" aria-hidden="true">
                      <span style={{ width: `${org.governanceScore}%` }} className="ci-score-track--governance" />
                    </div>
                  </div>
                  <div className="ci-index-score-cell" role="cell">
                    <strong className="ci-score-number ci-score-number--sovereignty">{org.sovereigntyScore}</strong>
                    <div className="assurance-index-score-track" aria-hidden="true">
                      <span style={{ width: `${org.sovereigntyScore}%` }} className="ci-score-track--sovereignty" />
                    </div>
                  </div>
                  <div role="cell">
                    <span className={`ci-position-badge ci-position-badge--${org.quadrant}`}>
                      {org.quadrantLabel}
                    </span>
                  </div>
                  <div className="assurance-index-action" role="cell">
                    <a
                      href={`/assurance/index/${org.slug}`}
                      className="assurance-index-profile-button"
                      aria-label={`View ${org.name} constitutional profile`}
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="assurance-index-footer">
              <div>
                <p className="text-sm font-semibold text-white">Go beyond the public signals.</p>
                <p className="mt-1 text-sm text-white/45">
                  Request an evidence-backed assessment for a complete constitutional view.
                </p>
              </div>
              <a
                href={ENTERPRISE_INTAKE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="assurance-index-unlock-button"
              >
                Unlock Full Assessment
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/30">
            Rankings reflect publicly available information and are subject to revision as new evidence is assessed.
          </p>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Leadership Panels ── */}
      <section id="leaders" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Index Leaders
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Who leads in each dimension.
            </h2>
          </header>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Governance Leaders */}
            <div className="ci-leader-panel">
              <p className="ci-leader-panel-title">Governance Leaders</p>
              <ol className="ci-leader-list">
                {GOVERNANCE_RANKED.map((org, i) => (
                  <li key={org.id} className="ci-leader-item">
                    <span className="ci-leader-rank">{i + 1}</span>
                    <div className="ci-leader-meta">
                      <strong>{org.name}</strong>
                      <span>{org.quadrantLabel}</span>
                    </div>
                    <strong className="ci-leader-score">{org.governanceScore}</strong>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sovereignty Leaders */}
            <div className="ci-leader-panel">
              <p className="ci-leader-panel-title">Sovereignty Leaders</p>
              <ol className="ci-leader-list">
                {SOVEREIGNTY_RANKED.map((org, i) => (
                  <li key={org.id} className="ci-leader-item">
                    <span className="ci-leader-rank">{i + 1}</span>
                    <div className="ci-leader-meta">
                      <strong>{org.name}</strong>
                      <span>{org.quadrantLabel}</span>
                    </div>
                    <strong className="ci-leader-score ci-leader-score--sovereignty">{org.sovereigntyScore}</strong>
                  </li>
                ))}
              </ol>
            </div>

            {/* Emerging Constitutional Leaders */}
            <div className="ci-leader-panel ci-leader-panel--emerging">
              <p className="ci-leader-panel-title">Emerging Constitutional Leaders</p>
              <p className="ci-leader-emerging-note">
                No organization currently qualifies as a Constitutional Leader.
                Closest candidates by combined constitutional score:
              </p>
              <ol className="ci-leader-list mt-4">
                {emergingCandidates.map((org, i) => (
                  <li key={org.id} className="ci-leader-item">
                    <span className="ci-leader-rank">{i + 1}</span>
                    <div className="ci-leader-meta">
                      <strong>{org.name}</strong>
                      <span>Gov {org.governanceScore} · Sov {org.sovereigntyScore}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="ci-leader-threshold-note mt-4">
                Constitutional Leaders require Governance ≥ 70 and Sovereignty ≥ 70.
              </p>
            </div>

          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Methodology ── */}
      <section id="methodology" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Methodology
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              How Organizations Are Evaluated
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              The AOC Constitutional Index evaluates organizations across two independent dimensions.
              Neither dimension substitutes for the other.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="ci-method-card">
              <p className="ci-method-card-eyebrow">Governance Dimensions</p>
              <ul className="ci-method-list">
                {['Accountability', 'Auditability', 'Human Oversight', 'Risk Controls'].map((d) => (
                  <li key={d}><span aria-hidden="true">—</span>{d}</li>
                ))}
              </ul>
            </div>
            <div className="ci-method-card">
              <p className="ci-method-card-eyebrow">Sovereignty Dimensions</p>
              <ul className="ci-method-list">
                {['Ownership', 'Portability', 'Runtime Control', 'Exit Feasibility', 'Authority'].map((d) => (
                  <li key={d}><span aria-hidden="true">—</span>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="ci-method-highlight">
            <p>
              <strong>Strong Governance does not guarantee Sovereignty.</strong>
            </p>
            <p>
              <strong>Strong Sovereignty does not guarantee Governance.</strong>
            </p>
            <p className="mt-3 text-white/55 text-sm leading-relaxed">
              Constitutional position is defined by the intersection of both dimensions.
              An organization may excel in one area while remaining constitutionally incomplete.
            </p>
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Founder Essay ── */}
      <section id="founder-essay" className="assurance-editorial-section scroll-mt-20 py-28 px-6" aria-labelledby="founder-essay-heading">
        <div className="max-w-7xl mx-auto">
          <div className="assurance-editorial-grid">
            <div className="assurance-editorial-copy">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
                Why Governance Alone Is Not Enough
              </p>
              <h2 id="founder-essay-heading" className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
                AI trust cannot be understood through governance alone.
              </h2>
              <div className="assurance-editorial-body">
                <p>
                  The AOC Constitutional Index was born from a simple realization: AI trust cannot be
                  fully understood through governance alone.
                </p>
                <p>
                  Governance shows how an AI system is supervised, controlled, and made accountable.
                </p>
                <p>
                  Sovereignty shows who truly controls the capability, who can move it, replace it,
                  operate it, and preserve independence over time.
                </p>
                <p>When one exists without the other, organizations become exposed.</p>
              </div>
              <div className="assurance-editorial-emphasis" aria-label="Governance and sovereignty balance principles">
                <p>Governance without sovereignty creates dependency.</p>
                <p>Sovereignty without governance creates chaos.</p>
                <p>Trust emerges when both exist in balance.</p>
              </div>
            </div>

            <aside className="assurance-founder-essay-card" aria-labelledby="founder-essay-card-title">
              <p className="assurance-founder-essay-card-kicker">Founder Essay</p>
              <h3 id="founder-essay-card-title">
                I Started Looking for Sovereignty. I Found a Constitutional Problem.
              </h3>
              <p>
                A founder essay on the origin of the AOC Constitutional Index and why the AI industry
                may be measuring only half of the constitutional equation.
              </p>
              <a
                href={FOUNDER_ESSAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="assurance-founder-essay-link"
                aria-label="Read the founder essay on LinkedIn in a new tab"
              >
                Read the Founder Essay
                <span aria-hidden="true">↗</span>
              </a>
            </aside>
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Assessments ── */}
      <section id="assessments" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Assessments
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Measure. Understand. Improve.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              A transparent progression from rapid public measurement to hands-on constitutional improvement.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-6">
            {ASSESSMENT_OFFERINGS.map((offering) => (
              <article
                key={offering.key}
                className={`rounded-2xl border p-7 flex flex-col relative ${
                  offering.featured
                    ? 'border-emerald-500/50 bg-emerald-950/35 shadow-[0_0_40px_rgba(52,211,153,0.08)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {offering.featured && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-emerald-500/20" />
                )}

                <div className="mb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                      {offering.label}
                    </span>
                    {offering.popular && (
                      <span className="inline-flex items-center text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                    {offering.comingSoon && (
                      <span className="inline-flex items-center text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className={`text-3xl font-semibold ${offering.featured ? 'text-emerald-300' : 'text-white'}`}>
                      {offering.price}
                    </span>
                    {offering.priceNote && (
                      <span className="text-xs text-white/35 line-through">{offering.priceNote}</span>
                    )}
                  </div>

                  {offering.popular && (
                    <p className="mt-1 text-xs text-amber-300/70 font-medium">
                      Founder Pricing — Limited to the first 25 organizations
                    </p>
                  )}

                  <h3 className="mt-3 text-xl font-semibold">{offering.headline}</h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">{offering.description}</p>
                </div>

                <ul className="flex-1 space-y-2 mb-8">
                  {offering.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={offering.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    offering.featured
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'border border-white/15 hover:border-white/30 text-white'
                  }`}
                >
                  {offering.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── CTA ── */}
      <section className="py-28 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-6">
          Get started
        </p>
        <h2 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 max-w-3xl mx-auto">
          Know your constitutional position.
        </h2>
        <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Reach out to begin your constitutional assessment. First response within one business day.
        </p>
        <a
          href="#assessments"
          className="inline-flex items-center px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
        >
          Request Assessment
        </a>
      </section>

      <PublicResearchBridge />
      <AssuranceFooter />

    </main>
  );
};

export const renderAssurancePage = () => <AssurancePage />;
