// Copy/data for the Assurance page (enterprise/AssurancePage.tsx).
//
// Canonical definition (W007 — supersedes the W007A split's framing of
// Intelligence Risk as a co-equal product; see
// docs/audits/w007-assurance-canonical-refactor.md):
//
//   Assurance is the capability that evaluates and continuously monitors
//   every Sovereignty Capability defined by AOC Protocol and every
//   Governance Capability operated by AOC Enterprise.
//
// It is not a compliance audit, a certification, an IAM product, or a
// consulting page. Intelligence Risk (landing/IntelligenceRiskPage.tsx) is
// ONE specialized assessment module within Assurance, not Assurance itself.

export const NOT_THIS: { title: string; body: string }[] = [
  {
    title: 'Not a compliance audit',
    body: 'We evaluate architecture against AOC’s own capability model, not a regulatory framework like SOC 2 or ISO 27001.',
  },
  {
    title: 'Not a certification',
    body: 'Assurance produces a measured, evidenced posture at a point in time — not a certificate, seal, or permanent guarantee.',
  },
  {
    title: 'Not a security audit',
    body: 'We evaluate sovereignty and governance capability coverage — not penetration testing or source-level security review.',
  },
];

export const UNANSWERED_QUESTIONS = [
  'Which governance capabilities actually exist in your architecture today?',
  'Which sovereignty capabilities are implemented, and which are only assumed?',
  'Where are the capability gaps?',
  'Where is operational risk increasing as the architecture changes?',
];

// Section 4 — Assessment Methodology. Extends the 5-step engagement model
// summarized on the Enterprise homepage (../AssuranceSection.tsx, deck slide
// 7) into the full 8-stage methodology this page owns.
export const METHODOLOGY_STEPS = [
  { label: 'Capability Inventory' },
  { label: 'Evidence Collection' },
  { label: 'Capability Evaluation' },
  { label: 'Gap Analysis' },
  { label: 'Recommendations' },
  { label: 'Roadmap' },
  { label: 'Implementation Validation' },
  { label: 'Continuous Monitoring' },
];

export const METHODOLOGY_DETAIL: { title: string; body: string }[] = [
  { title: 'Capability Inventory', body: 'We enumerate which Protocol sovereignty and Enterprise governance capabilities your architecture declares.' },
  { title: 'Evidence Collection', body: 'We gather the artifacts that support or refute each declared capability — configuration, logs, contracts, runtime behavior.' },
  { title: 'Capability Evaluation', body: 'Each capability is scored against its evidence, not against a claim.' },
  { title: 'Gap Analysis', body: 'Capabilities that are absent, partial, or unevidenced are identified and mapped to operational consequence.' },
  { title: 'Recommendations', body: 'Gaps are translated into specific, ranked changes — not a generic checklist.' },
  { title: 'Roadmap', body: 'Recommendations are sequenced into a plan scoped to your architecture and priorities.' },
  { title: 'Implementation Validation', body: 'Once changes are made, we re-evaluate the same capabilities against the same evidence standard.' },
  { title: 'Continuous Monitoring', body: 'Validated capabilities are monitored on an ongoing basis as the architecture evolves.' },
];

// Section 5 — Capability Maturity. Every capability Assurance evaluates is
// classified on this scale, not a binary "have it / don't."
export const MATURITY_LEVELS: { label: string; body: string }[] = [
  { label: 'Not Present', body: 'No evidence the capability is implemented.' },
  { label: 'Partially Implemented', body: 'Some evidence exists, but coverage is incomplete or inconsistent.' },
  { label: 'Implemented', body: 'The capability is in place and evidenced, but not yet operational at scale.' },
  { label: 'Operational', body: 'The capability is active in production and evidenced in normal operation.' },
  { label: 'Continuously Validated', body: 'The capability is under ongoing monitoring, with drift and regression detected automatically.' },
];

// Section 6 — Assessment Outputs. What a completed assessment produces.
export const ASSESSMENT_OUTPUTS: { title: string; body: string }[] = [
  { title: 'Capability Coverage', body: 'Which Protocol and Enterprise capabilities are present versus absent.' },
  { title: 'Governance Score', body: 'A measured score across the Enterprise governance capability set.' },
  { title: 'Sovereignty Score', body: 'A measured score across the Protocol sovereignty capability set.' },
  { title: 'Capability Maturity', body: 'Each capability placed on the five-level maturity scale.' },
  { title: 'Evidence Confidence', body: 'How strongly the available evidence supports each finding.' },
  { title: 'Critical Risks', body: 'Gaps with the highest operational consequence, surfaced first.' },
  { title: 'Recommendations', body: 'Specific, ranked changes tied to each identified gap.' },
  { title: 'Implementation Roadmap', body: 'A sequenced plan from current state to validated posture.' },
  { title: 'Validation Status', body: 'Whether previously recommended changes have been implemented and re-verified.' },
  { title: 'Continuous Monitoring', body: 'Ongoing visibility into capability posture as the architecture changes.' },
];

export const EVIDENCE_STATS = [
  { num: '4', label: 'control domains' },
  { num: '10', label: 'controls' },
  { num: '3', label: 'eligibility tiers' },
];

// Section 7 — Intelligence Risk, repositioned as one specialized assessment
// module within Assurance (not Assurance itself). The full module — the six
// risk cards, the Constitutional Index, and the benchmark explorer — lives
// at landing/IntelligenceRiskPage.tsx (?view=intelligence-risk); this is a
// summary that frames it correctly inside the Assurance narrative.
export const INTELLIGENCE_RISK_DOMAINS = [
  'Knowledge Loss',
  'Key Person Dependency',
  'Institutional Memory',
  'Constitutional Index',
  'Benchmark',
];

// Section 8 — Continuous Assurance. Explicitly forward-looking; none of
// these are claimed as shipped today (matches the honesty bar
// ../PlatformStatus.tsx sets elsewhere on the site — Available today /
// Design Partner stage / Roadmap).
export const CONTINUOUS_CAPABILITIES = [
  'Periodic reassessment',
  'Capability drift detection',
  'Evidence validation',
  'Operational monitoring',
  'Trend analysis',
  'Architecture evolution',
];

// Section 9 — closing CTA flow.
export const CLOSING_FLOW = [
  'Assessment',
  'Findings',
  'Roadmap',
  'Implementation',
  'Validation',
  'Continuous Monitoring',
];

export const ASSESSMENT_EMAIL = 'hello@aocprotocol.xyz';
export const ASSESSMENT_MAILTO = `mailto:${ASSESSMENT_EMAIL}?subject=${encodeURIComponent('AOC Assurance — Technical Assessment Request')}`;
