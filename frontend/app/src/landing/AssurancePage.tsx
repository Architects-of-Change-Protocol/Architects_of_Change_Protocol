import { LogoRotating } from '../components/logo/LogoRotating';
import './assurance.css';

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
    badgeClass: 'tier-foundation',
    headline: 'Baseline Constitutional Review',
    description:
      'A structured review of your AI product against the AOC Constitutional Matrix. Covers governance posture, data sovereignty, and disclosure obligations.',
    items: [
      'Constitutional Matrix baseline scan',
      'Governance gap analysis',
      'Written findings report',
      'Remediation roadmap',
    ],
    cta: 'Request Foundation Assessment',
  },
  {
    tier: 'Advanced',
    badgeClass: 'tier-advanced',
    headline: 'Deep Constitutional Audit',
    description:
      'An in-depth constitutional audit with runtime tracing, policy enforcement review, and sovereign data flow mapping.',
    items: [
      'Everything in Foundation',
      'Runtime governance trace',
      'Data sovereignty mapping',
      'Policy enforcement verification',
      'Audit trail integrity check',
    ],
    cta: 'Request Advanced Audit',
    featured: true,
  },
  {
    tier: 'Sovereign',
    badgeClass: 'tier-sovereign',
    headline: 'Continuous Constitutional Assurance',
    description:
      'Ongoing constitutional oversight with live monitoring, quarterly reassessments, and a public certification mark.',
    items: [
      'Everything in Advanced',
      'Continuous monitoring integration',
      'Quarterly reassessments',
      'AOC Constitutional Certification mark',
      'Incident response constitutional review',
    ],
    cta: 'Request Sovereign Programme',
  },
];

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="assurance-score-bar mt-3">
      <div className="assurance-score-fill" style={{ width: `${score * 100}%` }} />
    </div>
  );
}

export const renderAssurancePage = () => {
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
            <a href="#assessments" className="hover:text-white transition-colors">Assessments</a>
            <a href="#why" className="hover:text-white transition-colors">Why it matters</a>
            <a href="/" className="hover:text-white transition-colors">Protocol</a>
          </div>

          <a
            href="mailto:hello@aocprotocol.xyz?subject=AOC%20Constitutional%20Assurance"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            Request assessment
          </a>
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
            View assessments →
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
              Three tiers. One constitutional standard.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Choose the depth of constitutional oversight that matches your regulatory exposure
              and product maturity.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-6">
            {ASSESSMENT_TIERS.map((tier) => (
              <article
                key={tier.tier}
                className={`rounded-2xl border p-7 flex flex-col ${
                  tier.featured
                    ? 'border-emerald-500/40 bg-emerald-950/30'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="mb-5">
                  <span className={`assurance-tier-badge ${tier.badgeClass} text-emerald-300`}>
                    {tier.tier}
                  </span>
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
                  href={`mailto:hello@aocprotocol.xyz?subject=${encodeURIComponent(tier.cta)}`}
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
          href="mailto:hello@aocprotocol.xyz?subject=AOC%20Constitutional%20Assurance%20Enquiry"
          className="inline-flex items-center px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
        >
          Start your assessment →
        </a>
      </section>

    </main>
  );
};
