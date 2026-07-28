// Content model for the AOC Enterprise control-plane homepage.
// Everything here is illustrative sample data for a representative deployment,
// not a live tenant — the page states this explicitly wherever numbers appear.

export type Maturity = 'Stable' | 'Beta' | 'Preview';
export type CapabilityStatus = 'Active' | 'Partial' | 'Planned';
export type Health = 'Healthy' | 'Attention' | 'Planned';

export const HIERARCHY = [
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
  { label: 'Architectures', href: '#architectures', status: 'available' },
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

export type OverviewMetric = {
  label: string;
  value: string;
  detail: string;
  stage: HierarchyStage;
};

export const OVERVIEW_METRICS: OverviewMetric[] = [
  { label: 'Architecture', value: 'Organization-Centered', detail: 'Current center of gravity', stage: 'Architecture' },
  { label: 'Enabled Capabilities', value: '18 / 34', detail: 'Capability families active', stage: 'Capabilities' },
  { label: 'Governance Coverage', value: '82%', detail: 'Powers under active policy', stage: 'Governance' },
  { label: 'Evidence Health', value: '96%', detail: 'Actions with complete evidence', stage: 'Evidence' },
  { label: 'Assurance Score', value: 'B+ · 78', detail: 'Last evaluated 2 days ago', stage: 'Assurance' },
  { label: 'Integrations', value: '6 connected', detail: 'Runtime + registry endpoints', stage: 'Operations' },
  { label: 'Active Policies', value: '24', detail: 'Enforced across the architecture', stage: 'Governance' },
];

export type ArchitectureShape = 'square' | 'circle' | 'diamond' | 'hex' | 'triangle' | 'pentagon';

export type ArchitecturePattern = {
  id: string;
  name: string;
  shape: ArchitectureShape;
  summary: string;
  maturity: Maturity;
  template: 'Available' | 'Coming soon';
  capabilities: string[];
};

export const ARCHITECTURE_PATTERNS: ArchitecturePattern[] = [
  {
    id: 'organization',
    name: 'Organization-Centered',
    shape: 'square',
    summary: 'The enterprise is the primary sovereign entity. Business units, roles, and delegated authority compose the architecture.',
    maturity: 'Stable',
    template: 'Available',
    capabilities: ['Identity', 'Authority', 'Accountability'],
  },
  {
    id: 'data',
    name: 'Data-Centered',
    shape: 'circle',
    summary: 'Data assets are sovereign entities with their own custody, lineage, and consent boundaries independent of any application.',
    maturity: 'Stable',
    template: 'Available',
    capabilities: ['Identity', 'Data', 'Evidence'],
  },
  {
    id: 'project',
    name: 'Project-Centered',
    shape: 'diamond',
    summary: 'Initiatives are bounded, time-scoped sovereign contexts with their own governance lifecycle and closure conditions.',
    maturity: 'Beta',
    template: 'Available',
    capabilities: ['Authority', 'Execution', 'Accountability'],
  },
  {
    id: 'agent',
    name: 'Agent-Centered',
    shape: 'hex',
    summary: 'Autonomous and AI agents act as delegated sovereign actors operating inside explicitly bounded authority.',
    maturity: 'Beta',
    template: 'Available',
    capabilities: ['Identity', 'Authority', 'Execution', 'Evidence'],
  },
  {
    id: 'asset',
    name: 'Asset-Centered',
    shape: 'triangle',
    summary: 'Digital or physical assets carry sovereign custody, provenance, and transfer governance across their lifecycle.',
    maturity: 'Preview',
    template: 'Coming soon',
    capabilities: ['Data', 'Evidence', 'Economic Governance'],
  },
  {
    id: 'transaction',
    name: 'Transaction-Centered',
    shape: 'pentagon',
    summary: 'Economic exchanges are modeled as sovereign, auditable events with explicit authority and settlement evidence.',
    maturity: 'Preview',
    template: 'Coming soon',
    capabilities: ['Authority', 'Execution', 'Economic Governance'],
  },
];

export type CapabilityFamily = {
  id: string;
  name: string;
  summary: string;
  coverage: number;
  status: CapabilityStatus;
  health: Health;
  configuration: string;
  dependencies: string[];
};

export const CAPABILITY_FAMILIES: CapabilityFamily[] = [
  {
    id: 'identity',
    name: 'Identity',
    summary: 'Establish who, or what, is acting inside the architecture.',
    coverage: 92,
    status: 'Active',
    health: 'Healthy',
    configuration: '3 identity providers connected',
    dependencies: [],
  },
  {
    id: 'authority',
    name: 'Authority',
    summary: 'Define and constrain who can act, delegate, and on whose behalf.',
    coverage: 87,
    status: 'Active',
    health: 'Healthy',
    configuration: '12 authority chains configured',
    dependencies: ['Identity'],
  },
  {
    id: 'data',
    name: 'Data',
    summary: 'Govern custody, lineage, and consent boundaries for sovereign data.',
    coverage: 78,
    status: 'Active',
    health: 'Attention',
    configuration: '6 data domains under governance',
    dependencies: ['Identity'],
  },
  {
    id: 'execution',
    name: 'Execution',
    summary: 'Bound and attest runtime behavior for processes and agents.',
    coverage: 74,
    status: 'Active',
    health: 'Healthy',
    configuration: 'Runtime attestation enabled',
    dependencies: ['Authority'],
  },
  {
    id: 'evidence',
    name: 'Evidence',
    summary: 'Produce verifiable, replayable evidence for every governed action.',
    coverage: 96,
    status: 'Active',
    health: 'Healthy',
    configuration: 'Append-only evidence ledger',
    dependencies: ['Execution'],
  },
  {
    id: 'accountability',
    name: 'Accountability',
    summary: 'Attribute outcomes to identities, policies, and decisions.',
    coverage: 81,
    status: 'Active',
    health: 'Healthy',
    configuration: 'Decision attribution enabled',
    dependencies: ['Identity', 'Evidence'],
  },
  {
    id: 'economic-governance',
    name: 'Economic Governance',
    summary: 'Govern consumption, settlement, and value exchange between parties.',
    coverage: 0,
    status: 'Planned',
    health: 'Planned',
    configuration: 'Not yet enabled',
    dependencies: ['Authority', 'Evidence'],
  },
];

export type GovernanceConcept = {
  name: string;
  summary: string;
};

export const GOVERNANCE_CONCEPTS: GovernanceConcept[] = [
  { name: 'Policies', summary: 'Codified rules that constrain how a capability may be used.' },
  { name: 'Delegations', summary: 'Explicit, scoped transfer of authority from one principal to another.' },
  { name: 'Authority Chains', summary: 'The traceable lineage of who granted power to whom, and under what limit.' },
  { name: 'Approvals', summary: 'Human or policy checkpoints required before a governed action executes.' },
  { name: 'Limits', summary: 'Quantitative and temporal bounds placed on a delegated capability.' },
  { name: 'Revocations', summary: 'The immediate, cascading withdrawal of previously granted authority.' },
  { name: 'Escalations', summary: 'Structured hand-off of a decision to a higher authority when limits are reached.' },
];

export type AssuranceWidget = {
  label: string;
  value: string;
  detail: string;
};

export const ASSURANCE_WIDGETS: AssuranceWidget[] = [
  { label: 'Capability Coverage', value: '84%', detail: 'Capabilities operating under governance' },
  { label: 'Architecture Score', value: 'B+ · 78/100', detail: 'Composite governance maturity score' },
  { label: 'Open Findings', value: '3', detail: '2 medium · 1 low severity' },
  { label: 'Evidence Quality', value: '96%', detail: 'Actions with complete, replayable evidence' },
  { label: 'Recommended Improvements', value: '5', detail: 'Prioritized by risk reduction' },
  { label: 'Latest Assessment', value: '2 days ago', detail: 'Next scheduled assessment in 28 days' },
];

export type AuditRecordType = {
  name: string;
  summary: string;
};

export const AUDIT_RECORD_TYPES: AuditRecordType[] = [
  { name: 'Activity Timeline', summary: 'Chronological record of every action taken across the architecture.' },
  { name: 'Decision History', summary: 'What was decided, by which principal, under which policy.' },
  { name: 'Execution Evidence', summary: 'Attested, replayable proof of how a governed process actually ran.' },
  { name: 'Access History', summary: 'Who accessed which capability or data domain, and when.' },
  { name: 'Policy Events', summary: 'Every policy creation, change, evaluation, and enforcement outcome.' },
  { name: 'Audit Records', summary: 'Immutable, exportable evidence for internal and external review.' },
];

export type EconomyItem = {
  name: string;
  summary: string;
};

export const ECONOMY_ITEMS: EconomyItem[] = [
  { name: 'Capability Consumption', summary: 'Meter how each capability family is used across the architecture.' },
  { name: 'Billing', summary: 'Usage-based billing tied directly to governed capability consumption.' },
  { name: 'Protocol Usage', summary: 'Attribution of usage back to AOC Protocol primitives and versions.' },
  { name: 'Revenue Sharing', summary: 'Distribute value across capability providers in the ecosystem.' },
  { name: 'Marketplace', summary: 'Acquire certified capabilities and architecture templates.' },
  { name: 'Wallet', summary: 'Hold and allocate balances for capability and protocol consumption.' },
  { name: 'Budget', summary: 'Set and enforce spend limits per architecture, team, or capability.' },
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
  { name: 'Community', summary: 'The open community researching and extending the protocol.' },
  { name: 'Architecture Library', summary: 'A growing catalog of reusable, community-contributed architecture patterns.' },
];

export const PROTOCOL_VS_ENTERPRISE = {
  protocol: {
    title: 'AOC Protocol',
    kicker: 'Public · Open',
    summary: 'Defines the primitives, architectural language, and governance concepts that sovereign architectures are built from.',
    points: [
      'Defines sovereignty primitives',
      'Defines architectural language',
      'Defines governance concepts',
      'Researches new capabilities',
      'Promotes an open ecosystem',
    ],
  },
  enterprise: {
    title: 'AOC Enterprise',
    kicker: 'Commercial · Operated',
    summary: 'Operationalizes AOC Protocol as a governed platform: compose architectures, enable capabilities, evaluate maturity, and run production systems.',
    points: [
      'Operationalizes governance',
      'Packages capabilities',
      'Composes architectures',
      'Evaluates governance maturity',
      'Operates production systems',
      'Connects to the AOC ecosystem',
    ],
  },
};
