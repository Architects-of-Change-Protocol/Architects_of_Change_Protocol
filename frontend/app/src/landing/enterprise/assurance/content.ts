// Content model for the canonical AOC Assurance landing page (W007).
//
// Canonical definition: AOC Assurance evaluates, validates and continuously
// monitors every Sovereignty Capability defined by AOC Protocol and every
// Governance Capability operated by AOC Enterprise. It is the assessment
// and monitoring layer for the complete AOC ecosystem — not a peer
// platform, and not merely another Enterprise capability.
//
// Capability domains below are intentionally NOT hand-duplicated lists —
// Domain A imports CAPABILITY_FAMILIES from ../../protocol/content.ts and
// Domain B imports CAPABILITY_CATALOG from ../content.ts, both canonical
// sources maintained by W004 and W005 respectively. See
// docs/w007-assurance-canonical-assessment-layer.md for the full mapping.

export type MaturityClassification =
  | 'available'
  | 'current-service'
  | 'reference-model'
  | 'in-development'
  | 'future-direction';

export const MATURITY_CLASSIFICATION_LABEL: Record<MaturityClassification, string> = {
  available: 'Available Today',
  'current-service': 'Current Service',
  'reference-model': 'Reference Model',
  'in-development': 'In Development',
  'future-direction': 'Future Direction',
};

// ── Section 2 — Why Assurance exists ────────────────────────────────────────

export const IMPLEMENTATION_ITEMS = ['Identity', 'Policies', 'Grants', 'Revocation', 'Provider Integrations', 'Evidence Systems'] as const;

export const PROOF_GAPS = [
  'Complete coverage',
  'Correct configuration',
  'Operational effectiveness',
  'Reliable evidence',
  'Provider neutrality',
  'Sustained maturity',
  'Readiness for larger Enterprise requirements',
] as const;

export const WHY_QUESTIONS = [
  'Which capabilities actually exist?',
  'Which are only partially implemented?',
  'Which are operational?',
  'Which are continuously validated?',
  'Where is evidence missing?',
  'Where is risk increasing?',
  'Where does the architecture depend too heavily on one provider?',
] as const;

// ── Section 4 — Assessment methodology ──────────────────────────────────────

export type MethodologyStage = {
  label: string;
  purpose: string;
  customerInput: string;
  aocActivity: string;
  output: string;
};

export const METHODOLOGY_STAGES: MethodologyStage[] = [
  {
    label: 'Capability Inventory',
    purpose: 'Establish which Protocol sovereignty and Enterprise governance capabilities are in scope.',
    customerInput: 'Access to relevant systems, architecture documentation, and stakeholder context.',
    aocActivity: 'Map the organization\'s architecture against the canonical Protocol and Enterprise capability domains.',
    output: 'A scoped capability inventory — present, absent, and partially present.',
  },
  {
    label: 'Evidence Collection',
    purpose: 'Gather the evidence needed to evaluate each in-scope capability, not just its claimed existence.',
    customerInput: 'Configuration exports, logs, policy documents, and access to relevant evidence sources.',
    aocActivity: 'Collect and organize evidence against each capability in the inventory.',
    output: 'An evidence set mapped to each capability under review.',
  },
  {
    label: 'Capability Evaluation',
    purpose: 'Determine how well each capability is actually implemented, not merely whether it exists.',
    customerInput: 'Clarification and context where evidence is ambiguous or incomplete.',
    aocActivity: 'Score each capability against the AOC Capability Maturity Model (see below).',
    output: 'A maturity rating per capability, grounded in evidence.',
  },
  {
    label: 'Gap Analysis',
    purpose: 'Identify where the architecture falls short of complete, operational, evidenced coverage.',
    customerInput: 'None required beyond prior stages.',
    aocActivity: 'Compare the capability inventory and evaluation against the full canonical capability surface.',
    output: 'A structured list of architectural gaps and evidence gaps.',
  },
  {
    label: 'Recommendations',
    purpose: 'Translate gaps into concrete, prioritized next steps.',
    customerInput: 'Business context needed to prioritize correctly — what matters most, and why.',
    aocActivity: 'Draft recommendations scoped to the organization\'s architecture and priorities.',
    output: 'A prioritized set of recommendations tied to specific gaps.',
  },
  {
    label: 'Roadmap',
    purpose: 'Sequence recommendations into a realistic implementation plan.',
    customerInput: 'Constraints — timeline, team capacity, dependencies.',
    aocActivity: 'Sequence recommendations into phases with dependencies made explicit.',
    output: 'An implementation roadmap the organization can execute against.',
  },
  {
    label: 'Implementation Validation',
    purpose: 'Confirm that remediation work actually closed the gaps it targeted.',
    customerInput: 'Updated evidence once remediation work is complete.',
    aocActivity: 'Re-evaluate the specific capabilities that were remediated.',
    output: 'An updated maturity rating and validation status per remediated capability.',
  },
  {
    label: 'Continuous Monitoring',
    purpose: 'Detect capability drift and evidence staleness after the initial assessment closes.',
    customerInput: 'Ongoing access proportional to the monitoring arrangement in place.',
    aocActivity: 'Track capability posture and evidence freshness over time — see Continuous Assurance below for current maturity.',
    output: 'Posture updates as capabilities, evidence, or the architecture change.',
  },
];

// ── Section 5 — Capability Maturity Model ───────────────────────────────────

export type MaturityLevel = {
  level: number;
  name: string;
  definition: string;
};

export const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: 1,
    name: 'Not Present',
    definition: 'No meaningful implementation or evidence exists.',
  },
  {
    level: 2,
    name: 'Partially Implemented',
    definition: 'Some elements exist but are incomplete, inconsistent or provider-specific.',
  },
  {
    level: 3,
    name: 'Implemented',
    definition: 'The capability is technically present.',
  },
  {
    level: 4,
    name: 'Operational',
    definition: 'The capability is used reliably in real workflows with ownership and evidence.',
  },
  {
    level: 5,
    name: 'Continuously Validated',
    definition: 'The capability is monitored, reassessed and supported by current evidence.',
  },
];

// ── Section 6 — Assessment outputs ──────────────────────────────────────────

export const ASSESSMENT_OUTPUTS = [
  'Capability Inventory',
  'Sovereignty Posture',
  'Governance Posture',
  'Capability Coverage',
  'Capability Maturity',
  'Evidence Confidence',
  'Critical Gaps',
  'Risk Prioritization',
  'Recommended Remediation',
  'Implementation Roadmap',
  'Validation Status',
  'Continuous Monitoring Readiness',
] as const;

// ── Section 7 — Intelligence Risk module ────────────────────────────────────

export const INTELLIGENCE_RISK_FOCUS_AREAS = [
  'Knowledge Loss',
  'Key Person Dependency',
  'Institutional Memory',
  'Undocumented decision logic',
  'Concentration of operational knowledge',
  'Constitutional Index',
  'Benchmark analysis',
] as const;

// ── Section 8 — Continuous Assurance ────────────────────────────────────────

export type ContinuousAssuranceItem = {
  title: string;
  body: string;
  classification: MaturityClassification;
};

export const CONTINUOUS_ASSURANCE_ITEMS: ContinuousAssuranceItem[] = [
  {
    title: 'Point-in-time Technical Assessment',
    body: 'A scoped assessment of the current capability surface, delivered as a report.',
    classification: 'current-service',
  },
  {
    title: 'Implementation Validation',
    body: 'Re-evaluation of specific capabilities after remediation work closes a prior gap.',
    classification: 'current-service',
  },
  {
    title: 'Periodic Reassessment',
    body: 'A follow-on assessment cycle scoped and scheduled with the customer.',
    classification: 'available',
  },
  {
    title: 'Capability Drift Detection',
    body: 'Automated detection of capability posture changing between assessments.',
    classification: 'in-development',
  },
  {
    title: 'Evidence Freshness Checks',
    body: 'Automated flagging of evidence that has aged past a defined validity window.',
    classification: 'in-development',
  },
  {
    title: 'Operational Signal Monitoring',
    body: 'Ingesting live operational signals (usage events, audit records) as ongoing evidence.',
    classification: 'reference-model',
  },
  {
    title: 'Trend Analysis',
    body: 'Comparing capability maturity across assessment cycles to show direction, not just a snapshot.',
    classification: 'reference-model',
  },
  {
    title: 'Remediation Tracking',
    body: 'Tracking recommended remediation items to closure across roadmap phases.',
    classification: 'available',
  },
  {
    title: 'Architecture Evolution Tracking',
    body: 'Re-scoping the capability inventory as the underlying architecture changes.',
    classification: 'reference-model',
  },
  {
    title: 'Provider-Readiness Tracking',
    body: 'Assessing new provider adapters against the same capability and evidence bar as existing ones.',
    classification: 'future-direction',
  },
  {
    title: 'Continuous Governance Posture',
    body: 'A live, always-current view of governance and sovereignty posture across the ecosystem.',
    classification: 'future-direction',
  },
];

// ── Section 9 — Commercial journey ──────────────────────────────────────────

export const ENGAGEMENT_JOURNEY = [
  { label: 'Technical Assessment', detail: 'A scoped capability inventory and evaluation of your architecture.' },
  { label: 'Findings', detail: 'Capability maturity, evidence confidence, and critical gaps, documented.' },
  { label: 'Prioritized Roadmap', detail: 'Recommendations sequenced against your constraints and priorities.' },
  { label: 'Implementation', detail: 'Remediation work, scoped and owned by your team or ours.' },
  { label: 'Validation', detail: 'Re-evaluation confirming remediated capabilities actually closed their gaps.' },
  { label: 'Continuous Assurance', detail: 'Ongoing posture tracking as capabilities, evidence, and the architecture evolve.' },
] as const;
