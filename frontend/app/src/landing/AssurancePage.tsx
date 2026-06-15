/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import './assurance.css';

const MOBILE_NAVIGATION_ITEMS = [
  { label: 'Matrix', href: '#matrix' },
  { label: 'Domains', href: '#domains' },
  { label: 'Assessments', href: '#assessments' },
  { label: 'Index', href: '#index' },
  { label: 'AOC Protocol', href: '/' },
];
const FOUNDATION_CHECKOUT_URL = 'https://buy.stripe.com/aFa5kD1Kfgcp67N11gejK01';
const FOUNDER_PROGRAM_CHECKOUT_URL = 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00';
const ENTERPRISE_INTAKE_FORM_URL = 'https://tally.so/r/2ER1M9';
const CONTINUOUS_ASSURANCE_WAITLIST_URL = 'https://tally.so/r/yP7oN4';

const CONSTITUTIONAL_INDEX = [
  { rank: 1, organization: 'AnythingLLM', score: 82, tier: 'Gold', tierClass: 'gold' },
  { rank: 2, organization: 'Ollama', score: 81, tier: 'Gold', tierClass: 'gold' },
  { rank: 3, organization: 'Writer', score: 64, tier: 'Silver', tierClass: 'silver' },
  {
    rank: 4,
    organization: 'Harvey AI',
    score: 58,
    tier: 'Silver Conditional',
    tierClass: 'silver-conditional',
  },
  { rank: 5, organization: 'Anthropic', score: 48, tier: 'Bronze', tierClass: 'bronze' },
];

const MATRIX_DIMENSIONS = [
  {
    id: 'governance',
    label: 'Governance',
    description: 'Policy frameworks, decision authority, and constitutional accountability structures.',
    score: 0.82,
  },
  {
    id: 'sovereignty',
    label: 'Sovereignty',
    description: 'Data ownership, jurisdictional compliance, and user autonomy guarantees.',
    score: 0.75,
  },
  {
    id: 'auditability',
    label: 'Auditability',
    description: 'Traceable decision logs, immutable audit trails, and inspection rights.',
    score: 0.91,
  },
  {
    id: 'certification',
    label: 'Certification',
    description: 'Third-party attestation, standard adherence, and ongoing compliance posture.',
    score: 0.68,
  },
  {
    id: 'transparency',
    label: 'Transparency',
    description: 'Explainability of automated decisions, model cards, and disclosure obligations.',
    score: 0.79,
  },
  {
    id: 'accountability',
    label: 'Accountability',
    description: 'Human-in-the-loop guarantees, escalation paths, and redress mechanisms.',
    score: 0.85,
  },
];

const ASSESSMENT_TIERS = [
  {
    tier: 'Foundation',
    label: 'PUBLIC CONSTITUTIONAL ASSESSMENT',
    badgeClass: 'tier-foundation',
    price: '$49',
    priceNote: null,
    founderBadge: false,
    comingSoon: false,
    headline: 'Public Constitutional Assessment',
    description:
      'A rapid constitutional review of your AI product using public documentation, public repositories, websites, policies, and disclosures.',
    items: [
      'Governance Score',
      'Sovereignty Score',
      'Constitutional Matrix Classification',
      'Executive PDF Report',
      'Public Constitutional Index Listing',
      'Delivered within 72 hours',
    ],
    cta: 'Start Assessment — $49',
    ctaHref: FOUNDATION_CHECKOUT_URL,
    featured: false,
  },
  {
    tier: 'Advanced',
    label: 'FOUNDER PROGRAM',
    badgeClass: 'tier-advanced',
    price: '$149',
    priceNote: 'Future public price: $499',
    founderBadge: true,
    comingSoon: false,
    headline: 'Founder Program',
    description:
      'A collaborative constitutional assessment that includes interviews, architecture reviews, governance analysis, operational controls, and detailed constitutional recommendations.',
    items: [
      'Everything in Foundation',
      'Architecture Review',
      'Governance Gap Analysis',
      'Sovereignty Assessment',
      'Constitutional Risk Analysis',
      'Prioritized Findings',
      'Remediation Roadmap',
      'Recommended AOC Protocol Integrations',
      'Detailed Constitutional Assessment Report',
      'Delivered within 5 business days',
    ],
    cta: 'Join Founder Program — $149',
    ctaHref: FOUNDER_PROGRAM_CHECKOUT_URL,
    featured: true,
  },
  {
    tier: 'Sovereign',
    label: 'DEEP CONSTITUTIONAL AUDIT',
    badgeClass: 'tier-sovereign',
    price: 'Contact Sales',
    priceNote: null,
    founderBadge: false,
    comingSoon: false,
    headline: 'Deep Constitutional Audit',
    description:
      'A comprehensive constitutional audit for organizations seeking deep validation of governance, sovereignty, traceability, evidence systems, and AI operational controls.',
    items: [
      'Private Repository Review',
      'Governance Validation',
      'Authority Mapping',
      'Evidence Chain Review',
      'Agent Architecture Analysis',
      'Runtime Control Assessment',
      'Executive Workshops',
      'Enterprise Remediation Planning',
    ],
    cta: 'Start Enterprise Intake',
    ctaHref: ENTERPRISE_INTAKE_FORM_URL,
    featured: false,
  },
  {
    tier: 'Continuous',
    label: 'CONTINUOUS CONSTITUTIONAL ASSURANCE',
    badgeClass: 'tier-continuous',
    price: 'Contact Sales',
    priceNote: null,
    founderBadge: false,
    comingSoon: true,
    headline: 'Continuous Constitutional Assurance',
    description:
      'Continuous constitutional monitoring for AI systems with governance drift detection, sovereignty monitoring, constitutional health scoring, and ongoing assurance.',
    items: [
      'Continuous Monitoring',
      'Governance Drift Detection',
      'Sovereignty Erosion Detection',
      'Quarterly Reassessments',
      'Constitutional Dashboard',
      'Certification Maintenance',
      'Continuous Assurance Reporting',
    ],
    cta: 'Join Continuous Assurance Waitlist',
    ctaHref: CONTINUOUS_ASSURANCE_WAITLIST_URL,
    featured: false,
  },
];

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="assurance-score-bar mt-3">
      <div className="assurance-score-fill" style={{ width: `${score * 100}%` }} />
    </div>
  );
}

const AssurancePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-30 backdrop-blur bg-[#070d0b]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <LogoRotating size={28} inverted />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tighter">AOC</span>
              <span className="text-xs text-emerald-400 uppercase tracking-[0.2em]">Assurance</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-white/70">
            <a href="#matrix" className="hover:text-white transition-colors">Matrix</a>
            <a href="#index" className="hover:text-white transition-colors">Index</a>
            <a href="#assessments" className="hover:text-white transition-colors">Assessments</a>
            <a href="#why" className="hover:text-white transition-colors">Why it matters</a>
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
            className="relative flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="assurance-mobile-navigation"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            </span>
            <span
              className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${
                isMobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${
                isMobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1.5'
              }`}
            />
          </button>
        </div>

        <div
          id="assurance-mobile-navigation"
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
          className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-[#070d0b]/95 backdrop-blur-lg transition-[max-height,opacity] duration-300 ease-out md:hidden ${
            isMobileMenuOpen
              ? 'max-h-96 opacity-100'
              : 'pointer-events-none max-h-0 opacity-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col gap-1">
              {MOBILE_NAVIGATION_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/app"
                className="mt-3 rounded-xl bg-emerald-500 px-6 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launch App
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="assurance-hero-glow relative pt-28 pb-32 text-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-6">
          Constitutional Assurance for AI
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-[-2.5px] leading-[1.05] max-w-4xl mx-auto mb-8">
          Measure. Govern. Certify.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/65 leading-relaxed mb-12">
          Independent constitutional assessments for AI products, agents, and platforms.
          Measure governance and sovereignty before your regulator does.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#assessments"
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
          >
            Request Assessment
          </a>
          <a
            href="#matrix"
            className="px-10 py-4 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-colors"
          >
            Explore the Matrix
          </a>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Constitutional Matrix ── */}
      <section id="matrix" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Constitutional Matrix
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Six dimensions of constitutional AI.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              The AOC Constitutional Matrix evaluates AI systems across six sovereign dimensions.
              Each dimension maps to measurable outcomes and enforceable obligations.
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MATRIX_DIMENSIONS.map((dim) => (
              <article
                key={dim.id}
                className="assurance-matrix-card rounded-2xl border border-white/10 bg-white/[0.025] p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{dim.label}</h3>
                  <span className="text-sm font-medium text-emerald-400">
                    {Math.round(dim.score * 100)}
                  </span>
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{dim.description}</p>
                <ScoreBar score={dim.score} />
              </article>
            ))}
          </div>

          <p className="mt-8 text-xs text-white/30 text-center">
            Scores shown are illustrative benchmarks from the AOC Constitutional Matrix v1.0.
          </p>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Constitutional Index ── */}
      <section id="index" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Public Benchmark
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              AOC Constitutional Index
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              A public ranking of AI organizations based on independently observed sovereignty
              signals, governance posture, and constitutional readiness.
            </p>
          </header>

          <div className="assurance-index-shell">
            <div className="assurance-index-table" role="table" aria-label="AOC Constitutional Index">
              <div className="assurance-index-header" role="row">
                <span role="columnheader">Rank</span>
                <span role="columnheader">Organization</span>
                <span role="columnheader">Sovereignty Score</span>
                <span role="columnheader">Classification</span>
                <span className="sr-only" role="columnheader">Public profile</span>
              </div>

              {CONSTITUTIONAL_INDEX.map((entry) => (
                <div className="assurance-index-row" role="row" key={entry.organization}>
                  <div className="assurance-index-rank" role="cell">
                    <span className="md:hidden">Rank</span>
                    <strong>{String(entry.rank).padStart(2, '0')}</strong>
                  </div>
                  <div className="assurance-index-organization" role="cell">
                    <span className="assurance-index-monogram" aria-hidden="true">
                      {entry.organization.charAt(0)}
                    </span>
                    <strong>{entry.organization}</strong>
                  </div>
                  <div className="assurance-index-score" role="cell">
                    <div className="assurance-index-score-copy">
                      <span className="md:hidden">Sovereignty Score</span>
                      <strong>{entry.score}</strong>
                    </div>
                    <div className="assurance-index-score-track" aria-hidden="true">
                      <span style={{ width: `${entry.score}%` }} />
                    </div>
                  </div>
                  <div role="cell">
                    <span className={`assurance-index-tier assurance-index-tier--${entry.tierClass}`}>
                      {entry.tier}
                    </span>
                  </div>
                  <div className="assurance-index-action" role="cell">
                    <button
                      type="button"
                      className="assurance-index-profile-button"
                      aria-label={`View ${entry.organization} public profile`}
                    >
                      View Public Profile
                    </button>
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
            Initial rankings reflect publicly available information and are subject to change as
            new evidence is assessed.
          </p>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Why it matters ── */}
      <section id="why" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Why it matters
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Governance is no longer optional.
            </h2>
            <div className="space-y-5 text-white/65 text-base leading-relaxed">
              <p>
                Regulators across the EU, UK, and US are mandating constitutional accountability
                for AI systems that touch personal data, make consequential decisions, or operate
                autonomously.
              </p>
              <p>
                AOC Assurance provides the independent constitutional layer your legal, compliance,
                and product teams need — before a regulator asks for it.
              </p>
              <p>
                Every assessment produces a machine-readable constitutional record aligned with
                the AOC Protocol's sovereign data infrastructure.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: 'EU AI Act', sub: 'High-risk system obligations now in force' },
              { stat: 'SOC 2 +', sub: 'Constitutional controls mapped to trust criteria' },
              { stat: 'ISO 42001', sub: 'AI management system alignment' },
              { stat: 'NIST AI RMF', sub: 'Govern, Map, Measure, Manage coverage' },
            ].map(({ stat, sub }) => (
              <div
                key={stat}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <p className="text-lg font-semibold text-emerald-400 mb-1">{stat}</p>
                <p className="text-xs text-white/50 leading-snug">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Assessment tiers ── */}
      <section id="assessments" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Assessments
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              From discovery to assurance.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              A clear progression path — from a rapid public assessment through to continuous
              constitutional monitoring for enterprise AI.
            </p>
          </header>

          {/* 2-col top row, 2-col bottom row */}
          <div className="grid md:grid-cols-2 gap-6">
            {ASSESSMENT_TIERS.map((tier) => (
              <article
                key={tier.tier}
                className={`rounded-2xl border p-7 flex flex-col relative ${
                  tier.featured
                    ? 'border-emerald-500/50 bg-emerald-950/35 shadow-[0_0_40px_rgba(52,211,153,0.08)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {/* Featured ring accent */}
                {tier.featured && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-emerald-500/20" />
                )}

                <div className="mb-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`assurance-tier-badge ${tier.badgeClass} text-emerald-300`}>
                      {tier.label}
                    </span>
                    {tier.founderBadge && (
                      <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                    {tier.comingSoon && (
                      <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className={`text-3xl font-semibold ${tier.featured ? 'text-emerald-300' : 'text-white'}`}>
                      {tier.price}
                    </span>
                    {tier.priceNote && (
                      <span className="text-xs text-white/35 line-through">{tier.priceNote}</span>
                    )}
                  </div>

                  {tier.founderBadge && (
                    <p className="mt-1 text-xs text-amber-300/70 font-medium">
                      Founder Pricing — Limited to the first 25 organizations
                    </p>
                  )}

                  <h3 className="mt-3 text-xl font-semibold">{tier.headline}</h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">{tier.description}</p>
                </div>

                <ul className="flex-1 space-y-2 mb-8">
                  {tier.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                    tier.featured
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'border border-white/15 hover:border-white/30 text-white'
                  }`}
                >
                  {tier.cta}
                </a>
              </article>
            ))}
          </div>

          {/* ── Delivery commitment banner ── */}
          <p className="mt-8 text-center text-xs text-white/35 tracking-wide">
            Assessments delivered within 72 hours to 5 business days depending on tier.
          </p>

          {/* ── Trust section ── */}
          <div className="mt-14 rounded-2xl border border-white/8 bg-white/[0.015] px-8 py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5 text-center">
              Every assessment includes
            </p>
            <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3">
              {[
                'Constitutional Matrix Evaluation',
                'Governance Analysis',
                'Sovereignty Analysis',
                'Independent Findings',
                'Actionable Recommendations',
                'Executive Report',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/55">
                  <span className="text-emerald-400 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
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
          Constitutional AI starts with an honest assessment.
        </h2>
        <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Reach out to begin your constitutional assurance programme.
          First response within one business day.
        </p>
        <a
          href="#assessments"
          className="inline-flex items-center px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
        >
          Request Assessment
        </a>
      </section>

    </main>
  );
};

export const renderAssurancePage = () => <AssurancePage />;
