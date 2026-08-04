// Content model for the Governed Access product page.
//
// Governed Access is AOC Enterprise's first Solution (see
// ../SolutionsAndServices.tsx / ../../routes.ts). Where the Enterprise
// homepage introduces the concept in three sections (Problem, Missing
// Layer, Architecture Stack), this page is the dedicated product landing:
// it sells the capability on its own, in under two minutes, without
// re-explaining the rest of AOC Enterprise. See docs/w006-governed-access-
// product-landing.md for the full design rationale.
//
// Claims here are held to the same honesty bar as ../PlatformStatus.tsx —
// Pinata is the only conformance-tested provider adapter today; every
// other provider below is roadmap, not shipped.

export const MECHANISMS = [
  'Temporary URLs',
  'API keys',
  'Storage tokens',
  'Manual permissions',
  'Shared credentials',
] as const;

export const GAPS = [
  {
    title: 'Invisible access',
    body: 'A link or key works for anyone who has it. Nothing records who actually used it, or when.',
  },
  {
    title: 'Missing audit',
    body: 'When access is questioned, there is no record to answer with — only what someone remembers.',
  },
] as const;

export type LifecycleStage = {
  label: string;
  detail: string;
};

// The canonical 8-stage lifecycle. This is the superset the Enterprise
// homepage's Pipeline.tsx and ArchitectureStack.tsx summarize — this page
// is where it is stated in full, with Policy and Revocation named as their
// own stages rather than folded into "Obligations" / left implicit.
export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { label: 'Request', detail: 'A principal asks for access to a specific resource, for a specific purpose.' },
  { label: 'Decision', detail: 'The request is checked against policy in real time — approve, deny, or escalate.' },
  { label: 'Policy', detail: 'The applicable rules are resolved: who may approve, what conditions attach, how long a grant may last.' },
  { label: 'Grant', detail: 'A time-bound, scoped capability is issued — never a standing credential.' },
  { label: 'Provider Translation', detail: 'The grant is translated into the exact call the provider adapter understands.' },
  { label: 'Usage', detail: 'Every read, view, or action is recorded as it happens — not reconstructed later.' },
  { label: 'Evidence', detail: 'The full record becomes a provable, replayable audit trail correlated back to the original decision.' },
  { label: 'Revocation', detail: 'The grant can be withdrawn at any point — on expiry, on policy change, or on demand — and the revocation is itself evidenced.' },
];

export type Provider = {
  name: string;
  status: 'live' | 'roadmap' | 'future';
};

export const PROVIDERS: Provider[] = [
  { name: 'Pinata', status: 'live' },
  { name: 'Amazon S3', status: 'roadmap' },
  { name: 'Azure Blob', status: 'roadmap' },
  { name: 'Cloudflare R2', status: 'roadmap' },
  { name: 'Google Drive', status: 'roadmap' },
  { name: 'SharePoint', status: 'roadmap' },
];

export type Capability = {
  title: string;
  body: string;
  icon: string;
};

// Simple stroke icons (24x24, currentColor) — same authoring convention as
// the risk-card icons on AssurancePage, chosen over freehand filled-path
// glyphs to keep new icon geometry easy to verify by hand.
export const CAPABILITIES: Capability[] = [
  {
    title: 'Policy Decisions',
    body: 'Every request is evaluated against codified policy in real time — not a manual approval queue.',
    icon: '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  {
    title: 'Scoped Grants',
    body: 'Access is issued as a time-bound, purpose-bound capability — never a standing, reusable credential.',
    icon: '<rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/>',
  },
  {
    title: 'Evidence Correlation',
    body: 'Usage events, decisions, and grants are linked into a single provable chain — not scattered logs.',
    icon: '<circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="18" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8.2 7.2L11 16M15.8 7.2L13 16M8.5 6h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Usage Events',
    body: 'Every read, view, or action against a grant is recorded as it happens, at the point of access.',
    icon: '<path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M7 15l3.5-4 3 2.5L18 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  {
    title: 'Grant Revocation',
    body: 'A grant can be withdrawn at any point — on expiry, on policy change, or on demand — and enforced immediately.',
    icon: '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 7l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Provider Translation',
    body: 'Grants are translated into the exact call each provider adapter understands — the same grant, any provider.',
    icon: '<rect x="3" y="4" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="14" y="13" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M10 7.5h3a2 2 0 0 1 2 2V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M13.5 5.5L17 7.5l-3.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  {
    title: 'Immutable Decisions',
    body: 'A decision, once made and recorded, is never overwritten — only superseded by a new, linked decision.',
    icon: '<rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="17.5" cy="17.5" r="3.5" fill="white" stroke="currentColor" stroke-width="1.5"/><path d="M16 17.5l1 1 2-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  },
  {
    title: 'Operational Audit',
    body: 'Access history is a chain you read, not logs you reconstruct — answering "prove it" with a record.',
    icon: '<path d="M6 3h9l5 5v13H6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M15 3v5h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
];

export type Audience = {
  title: string;
  body: string;
  icon: string;
};

export const AUDIENCES: Audience[] = [
  {
    title: 'Developer Platforms',
    body: 'Access governance stops being bespoke glue code written once per customer.',
    icon: '<polyline points="8 6 3 12 8 18" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="16 6 21 12 16 18" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    title: 'Storage Providers',
    body: 'Governance becomes a layer above the provider, not a feature every provider has to rebuild.',
    icon: '<path d="M4 7a8 3 0 0 0 16 0 8 3 0 0 0-16 0z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M4 7v10a8 3 0 0 0 16 0V7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M4 12a8 3 0 0 0 16 0" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  },
  {
    title: 'AI Platforms',
    body: 'Agents request access at machine speed and volume — every request still resolves to a governed decision.',
    icon: '<rect x="5" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 7V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="3" r="1" fill="currentColor"/><circle cx="9" cy="12.5" r="1.3" fill="currentColor"/><circle cx="15" cy="12.5" r="1.3" fill="currentColor"/>',
  },
  {
    title: 'Identity Providers',
    body: 'Authentication answers who. Governed Access answers whether this identity should reach this resource now.',
    icon: '<circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>',
  },
  {
    title: 'Enterprise SaaS',
    body: 'Every customer storage integration stops being its own, one-off access model.',
    icon: '<rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Healthcare',
    body: 'Conditions on sensitive records — read-only, time-boxed, purpose-limited — are enforced, not just stated in a policy doc.',
    icon: '<path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2.5 4.65-9.5 9-9.5 9z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M9 12h2v-2h2v2h2v2h-2v2h-2v-2H9z" fill="currentColor"/>',
  },
  {
    title: 'Finance',
    body: 'Access must be provable years after the fact, not just at the moment it was granted.',
    icon: '<path d="M3 10l9-6 9 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9M19 10v9M9 10v9M15 10v9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 19h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    title: 'Media',
    body: 'Licensed and embargoed assets can be shared on a schedule that is enforced, not just requested.',
    icon: '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="9" cy="10" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M4 17l5-4 3 2.5 4-3.5 4 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  },
];

export type ExampleScenario = {
  title: string;
  body: string;
};

// Illustrative only — no customer names, no deployment claims. Matches the
// "example scenario" framing already used for Pipeline.tsx's M&A reference
// scenario.
export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    title: 'Secure document sharing',
    body: 'A counterparty is granted a time-bound, read-only view of a confidential document — access ends automatically, and every view is recorded.',
  },
  {
    title: 'Medical image access',
    body: 'A referring clinician is granted scoped access to a single study for a defined review window, with every access evidenced.',
  },
  {
    title: 'AI model downloads',
    body: 'A licensed model artifact is released to an approved agent identity under a grant that expires after a single verified download.',
  },
  {
    title: 'Customer portals',
    body: 'A customer\'s access to their own exported records is granted, scoped, and revocable without a bespoke permissions system per tenant.',
  },
  {
    title: 'Enterprise file exchange',
    body: 'Two organizations exchange working files under a grant that both sides can audit, without either holding a standing credential to the other\'s storage.',
  },
  {
    title: 'Partner integrations',
    body: 'A partner system is granted narrow, purpose-bound access to specific resources instead of a broad, long-lived API key.',
  },
  {
    title: 'Temporary project access',
    body: 'A contractor is granted access scoped to a single project and a fixed window, revoked automatically when the engagement ends.',
  },
];

export const ASSESSMENT_STEPS = [
  { label: 'Assessment', sub: 'Scoped review of your environment' },
  { label: 'Architecture Review', sub: 'How Governed Access fits your systems' },
  { label: 'Pilot', sub: 'A working integration, narrowly scoped' },
  { label: 'Implementation', sub: 'Validated, production-bound rollout' },
];
