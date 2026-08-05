// Copy/data for the Assurance product page (enterprise/AssurancePage.tsx).
// Assurance is AOC Enterprise's SAF-based continuous governance-posture
// validation service — distinct from AOC Intelligence Risk
// (landing/IntelligenceRiskPage.tsx), a separate commercial offering that
// used to share the "Assurance" name. See
// docs/audits/w007a-assurance-commercial-audit.md for why they were split.

export const ENGAGEMENT_STEPS = [
  { label: 'Assessment' },
  { label: 'Recommendations' },
  { label: 'Implementation' },
  { label: 'Validation' },
  { label: 'Continuous Assurance' },
];

export const ENGAGEMENT_DETAIL: { title: string; body: string }[] = [
  {
    title: 'Assessment',
    body: 'We review your architecture — access model, evidence trail, revocation paths, provider boundaries — against the SAF-001 control catalog.',
  },
  {
    title: 'Recommendations',
    body: 'Findings are mapped to specific controls and prioritized: what blocks Enterprise-readiness now, and what can wait.',
  },
  {
    title: 'Implementation',
    body: 'You (or your team, with our support) close the gaps the assessment surfaced, in priority order.',
  },
  {
    title: 'Validation',
    body: 'We re-verify the closed gaps against the same controls. Validation is evidence-based, not a self-attestation.',
  },
  {
    title: 'Continuous Assurance',
    body: 'Once validated, your posture is monitored on an ongoing basis as your architecture evolves — not a one-time snapshot.',
  },
];

export const NOT_THIS: { title: string; body: string }[] = [
  {
    title: 'Not a compliance audit',
    body: 'We assess architecture against AOC’s own control catalog (SAF-001), not a regulatory framework like SOC 2 or ISO 27001.',
  },
  {
    title: 'Not a certification',
    body: 'Assurance produces findings and a validated posture at a point in time — not a certificate, seal, or permanent guarantee.',
  },
  {
    title: 'Not a security audit',
    body: 'We evaluate governance and sovereignty posture — who can act, what’s revocable, what’s evidenced — not penetration testing or code security review.',
  },
];

export const DELIVERABLES: { title: string; body: string }[] = [
  {
    title: 'Architecture Findings',
    body: 'A concrete map of where your access model, evidence trail, and provider boundaries do and don’t satisfy the control catalog.',
  },
  {
    title: 'Prioritized Recommendations',
    body: 'Gaps ranked by what blocks Enterprise-readiness versus what can be sequenced later — not an undifferentiated checklist.',
  },
  {
    title: 'Implementation Roadmap',
    body: 'A sequenced plan from current state to validated posture, scoped to your architecture rather than a generic template.',
  },
];

export const EVIDENCE_STATS = [
  { num: '4', label: 'control domains' },
  { num: '10', label: 'controls' },
  { num: '3', label: 'eligibility tiers' },
];

export const ASSESSMENT_EMAIL = 'hello@aocprotocol.xyz';
export const ASSESSMENT_MAILTO = `mailto:${ASSESSMENT_EMAIL}?subject=${encodeURIComponent('AOC Assurance — Technical Assessment Request')}`;
