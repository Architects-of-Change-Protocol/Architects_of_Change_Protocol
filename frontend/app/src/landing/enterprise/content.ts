// Content model for the AOC Enterprise control-plane homepage.
// Everything here is illustrative sample data for a representative deployment,
// not a live tenant — the page states this explicitly wherever numbers appear.

export type Maturity = 'Stable' | 'Beta' | 'Preview';
export type CapabilitySetMaturity = 'Core' | 'Developing' | 'Early';

export const HIERARCHY = [
  'Center of Gravity',
  'Architecture',
  'Capabilities',
  'Governance',
  'Evidence',
  'Assurance',
  'Operations',
] as const;

export type HierarchyStage = (typeof HIERARCHY)[number];

export type NavItem = {
  label: string;
  href: string;
  status: 'available' | 'soon';
  external?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '#overview', status: 'available' },
  { label: 'Architectures', href: '#architecture', status: 'available' },
  { label: 'Capabilities', href: '#capabilities', status: 'available' },
  { label: 'Governance', href: '#governance', status: 'available' },
  { label: 'Registry', href: '#registry', status: 'soon' },
  { label: 'Integrations', href: '#integrations', status: 'soon' },
  { label: 'Assurance', href: '#assurance', status: 'available' },
  { label: 'Audit', href: '#audit', status: 'available' },
  { label: 'Economy', href: '#economy', status: 'available' },
  { label: 'Developer', href: '/?view=docs', status: 'available' },
  { label: 'Organization', href: '#organization', status: 'soon' },
];

// The capability catalog — a flat set of governed powers an architecture can be
// composed from. An architecture pattern only surfaces the subset relevant to it.
export type CapabilityId =
  | 'identity'
  | 'authority'
  | 'accountability'
  | 'delegation'
  | 'evidence'
  | 'audit'
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

export const CAPABILITY_CATALOG: Record<CapabilityId, { name: string; summary: string }> = {
  identity: { name: 'Identity', summary: 'Establish who, or what, is acting inside the architecture.' },
  authority: { name: 'Authority', summary: 'Define and constrain who can act, delegate, and on whose behalf.' },
  accountability: { name: 'Accountability', summary: 'Attribute outcomes to identities, policies, and decisions.' },
  delegation: { name: 'Delegation', summary: 'Scoped, auditable transfer of authority between principals.' },
  evidence: { name: 'Evidence', summary: 'Verifiable, replayable proof for every governed action.' },
  audit: { name: 'Audit', summary: 'Immutable operational history of the architecture.' },
  execution: { name: 'Execution', summary: 'Bounded, attested runtime behavior for processes and agents.' },
  consent: { name: 'Consent', summary: 'Explicit, revocable authorization over how data is used.' },
  ownership: { name: 'Ownership', summary: 'Clear custodial rights over a data entity.' },
  portability: { name: 'Portability', summary: 'The right and mechanism to move data between systems.' },
  passport: { name: 'Passport', summary: 'A portable, verifiable identity credential for agents.' },
  decisions: { name: 'Decisions', summary: 'Structured, attributable decision points within a process.' },
  'policy-enforcement': { name: 'Policy Enforcement', summary: 'Real-time enforcement of codified rules.' },
  approvals: { name: 'Approvals', summary: 'Human or policy checkpoints required before execution.' },
  'authority-chains': { name: 'Authority Chains', summary: 'Traceable lineage of delegated authority.' },
  'agent-identity': { name: 'Agent Identity', summary: 'Identity primitives scoped to autonomous agents.' },
  payments: { name: 'Payments', summary: 'Governed movement of value between principals.' },
  'economic-governance': { name: 'Economic Governance', summary: 'Rules governing consumption, settlement, and exchange.' },
  custody: { name: 'Custody', summary: 'Safekeeping and custodial control of an asset.' },
  provenance: { name: 'Provenance', summary: 'Verifiable origin and history of an asset or record.' },
};

export type ArchitectureShape = 'square' | 'circle' | 'diamond' | 'hex' | 'triangle' | 'pentagon';

export type ArchitectureCapabilitySet = {
  enabled: CapabilityId[];
  available: CapabilityId[];
  coverage: number;
  maturity: CapabilitySetMaturity;
  dependencies: string[];
  recommendedNext: CapabilityId;
};

export type ArchitecturePattern = {
  id: string;
  name: string;
  shape: ArchitectureShape;
  tagline: string;
  summary: string;
  maturity: Maturity;
  template: 'Available' | 'Coming soon';
  implementations?: string[];
  capabilitySet: ArchitectureCapabilitySet;
};

// The six centers of gravity a digital system can be designed around. Choosing one
// is the first decision AOC Enterprise asks of an organization — everything else
// (capabilities, governance, evidence) composes on top of it.
export const ARCHITECTURE_PATTERNS: ArchitecturePattern[] = [
  {
    id: 'organization',
    name: 'Organization',
    shape: 'square',
    tagline: 'The enterprise itself is the sovereign entity.',
    summary: 'Business units, roles, and delegated authority compose the architecture. The organization is what everything else operates on behalf of.',
    maturity: 'Stable',
    template: 'Available',
    capabilitySet: {
      enabled: ['identity', 'authority', 'accountability', 'delegation', 'approvals', 'audit'],
      available: ['economic-governance', 'agent-identity'],
      coverage: 88,
      maturity: 'Core',
      dependencies: ['Authority is scoped by Identity', 'Approvals attach to Authority Chains'],
      recommendedNext: 'economic-governance',
    },
  },
  {
    id: 'data',
    name: 'Data',
    shape: 'circle',
    tagline: 'Data is the sovereign entity — not the application that touches it.',
    summary: 'Data assets carry their own custody, lineage, and consent boundaries independent of any single application that reads or writes them.',
    maturity: 'Stable',
    template: 'Available',
    capabilitySet: {
      enabled: ['identity', 'consent', 'ownership', 'portability', 'evidence', 'delegation'],
      available: ['authority', 'audit'],
      coverage: 81,
      maturity: 'Core',
      dependencies: ['Consent is scoped by Identity', 'Portability requires Evidence of custody'],
      recommendedNext: 'audit',
    },
  },
  {
    id: 'governed-framework',
    name: 'Governed Framework',
    shape: 'diamond',
    tagline: 'A process operating inside a regulated framework is the sovereign entity.',
    summary: 'Any system that must operate inside a regulated or accountable framework — decisions, evidence, and enforcement compose the architecture, independent of what the process is actually about.',
    maturity: 'Beta',
    template: 'Available',
    implementations: ['Project management', 'Compliance', 'Construction', 'Healthcare', 'Manufacturing', 'Legal', 'Quality systems', 'IT governance', 'Risk management'],
    capabilitySet: {
      enabled: ['execution', 'decisions', 'accountability', 'evidence', 'policy-enforcement', 'audit', 'approvals', 'authority-chains'],
      available: ['economic-governance', 'agent-identity'],
      coverage: 92,
      maturity: 'Core',
      dependencies: ['Approvals attach to Authority Chains', 'Policy Enforcement acts on Decisions'],
      recommendedNext: 'agent-identity',
    },
  },
  {
    id: 'agent',
    name: 'Agent',
    shape: 'hex',
    tagline: 'An autonomous or AI agent is the sovereign, delegated actor.',
    summary: 'Agents act as delegated sovereign actors operating inside explicitly bounded authority, carrying their own portable identity and accountability trail.',
    maturity: 'Beta',
    template: 'Available',
    capabilitySet: {
      enabled: ['identity', 'authority', 'accountability', 'passport', 'delegation', 'audit'],
      available: ['execution', 'evidence'],
      coverage: 76,
      maturity: 'Developing',
      dependencies: ['Passport extends Identity', 'Delegation is bounded by Authority'],
      recommendedNext: 'execution',
    },
  },
  {
    id: 'asset',
    name: 'Asset',
    shape: 'triangle',
    tagline: 'A digital or physical asset is the sovereign entity.',
    summary: 'Assets carry sovereign custody, provenance, and transfer governance across their lifecycle, independent of whichever system currently holds them.',
    maturity: 'Preview',
    template: 'Coming soon',
    capabilitySet: {
      enabled: ['identity', 'custody', 'provenance', 'evidence', 'delegation'],
      available: ['economic-governance', 'payments'],
      coverage: 64,
      maturity: 'Early',
      dependencies: ['Custody requires Identity', 'Provenance is proven by Evidence'],
      recommendedNext: 'economic-governance',
    },
  },
  {
    id: 'transaction',
    name: 'Transaction',
    shape: 'pentagon',
    tagline: 'The economic exchange itself is the sovereign, auditable event.',
    summary: 'Exchanges of value are modeled as sovereign, auditable events with explicit authority, bounded execution, and settlement evidence.',
    maturity: 'Preview',
    template: 'Coming soon',
    capabilitySet: {
      enabled: ['identity', 'authority', 'execution', 'evidence', 'economic-governance'],
      available: ['payments', 'audit'],
      coverage: 58,
      maturity: 'Early',
      dependencies: ['Execution is bounded by Authority', 'Economic Governance requires Evidence'],
      recommendedNext: 'payments',
    },
  },
];

export type GovernanceConcept = {
  name: string;
  summary: string;
};

export const GOVERNANCE_CONCEPTS: GovernanceConcept[] = [
  { name: 'Policies', summary: 'Codified rules that constrain how a capability may be exercised.' },
  { name: 'Delegations', summary: 'Explicit, scoped transfer of authority from one principal to another.' },
  { name: 'Approvals', summary: 'Human or policy checkpoints required before a governed action executes.' },
  { name: 'Authority Chains', summary: 'The traceable lineage of who granted power to whom, and under what limit.' },
  { name: 'Revocations', summary: 'The immediate, cascading withdrawal of previously granted authority.' },
  { name: 'Limits', summary: 'Quantitative and temporal bounds placed on a delegated capability.' },
  { name: 'Escalations', summary: 'Structured hand-off of a decision to a higher authority when limits are reached.' },
];

export type AssuranceWidget = {
  label: string;
  value: string;
  detail: string;
};

export const ASSURANCE_WIDGETS: AssuranceWidget[] = [
  { label: 'Capability Coverage', value: '84%', detail: 'Capabilities operating under governance' },
  { label: 'Architecture Readiness', value: 'B+ · 78/100', detail: 'Composite readiness of the chosen architecture' },
  { label: 'Evidence Quality', value: '96%', detail: 'Actions with complete, replayable evidence' },
  { label: 'Open Findings', value: '3', detail: '2 medium · 1 low severity' },
  { label: 'Governance Score', value: '78 / 100', detail: 'How well powers are governed, not just enabled' },
  { label: 'Recommended Improvements', value: '5', detail: 'Prioritized by risk reduction' },
  { label: 'Continuous Assessment', value: 'Every 24h', detail: 'Last run 2 hours ago' },
];

export type AuditRecordType = {
  name: string;
  summary: string;
};

export const AUDIT_RECORD_TYPES: AuditRecordType[] = [
  { name: 'Decision Timeline', summary: 'What was decided, by which principal, under which policy — in order.' },
  { name: 'Execution Evidence', summary: 'Attested, replayable proof of how a governed process actually ran.' },
  { name: 'Policy Events', summary: 'Every policy creation, change, evaluation, and enforcement outcome.' },
  { name: 'Access History', summary: 'Who accessed which capability or data domain, and when.' },
  { name: 'Audit Records', summary: 'Immutable, exportable evidence for internal and external review.' },
  { name: 'Activity Stream', summary: 'The live, chronological record of everything happening right now.' },
];

export type EconomyItem = {
  name: string;
  summary: string;
};

export const ECONOMY_ITEMS: EconomyItem[] = [
  { name: 'Capability Consumption', summary: 'Meter how each capability is used across the architecture.' },
  { name: 'Protocol Usage', summary: 'Attribution of usage back to AOC Protocol primitives and versions.' },
  { name: 'Wallet', summary: 'Hold and allocate balances for capability and protocol consumption.' },
  { name: 'Billing', summary: 'Usage-based billing tied directly to governed capability consumption.' },
  { name: 'Marketplace', summary: 'Acquire certified capabilities and architecture templates.' },
  { name: 'Revenue Sharing', summary: 'Distribute value across capability providers in the ecosystem.' },
  { name: 'Budgets', summary: 'Set and enforce spend limits per architecture, team, or capability.' },
];

export type EcosystemItem = {
  name: string;
  summary: string;
};

export const ECOSYSTEM_ITEMS: EcosystemItem[] = [
  { name: 'Marketplace', summary: 'Discover certified capabilities published by the AOC ecosystem.' },
  { name: 'Certified Builders', summary: 'Partners and integrators vetted to build on AOC Protocol.' },
  { name: 'Compatible Products', summary: 'Third-party products that interoperate with AOC-governed architectures.' },
  { name: 'Protocol Updates', summary: 'New primitives and governance concepts as AOC Protocol evolves.' },
  { name: 'Architecture Library', summary: 'A growing catalog of reusable, community-contributed architecture patterns.' },
  { name: 'Capability Catalog', summary: 'The full, versioned catalog of capabilities available to compose into an architecture.' },
  { name: 'Community', summary: 'The open community researching and extending the protocol.' },
];

export const PROTOCOL_VS_ENTERPRISE = {
  protocol: {
    title: 'AOC Protocol',
    kicker: 'Public · Open',
    summary: 'Defines the sovereignty primitives, governance concepts, and architectural language that digital systems are designed from.',
    points: [
      'Defines sovereignty primitives',
      'Defines governance concepts',
      'Researches new capabilities',
      'Creates an open ecosystem',
      'Educates the market',
    ],
  },
  enterprise: {
    title: 'AOC Enterprise',
    kicker: 'Commercial · Operated',
    summary: 'The commercial operating layer built on AOC Protocol — where organizations design, compose, and run governed architectures in production.',
    points: [
      'Composes architectures',
      'Packages governance capabilities',
      'Operates production systems',
      'Evaluates governance maturity',
      'Produces evidence',
      'Connects organizations to the AOC ecosystem',
    ],
  },
};
