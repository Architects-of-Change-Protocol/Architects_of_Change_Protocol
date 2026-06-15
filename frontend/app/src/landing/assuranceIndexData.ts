export type GovernanceAuditSection = {
  title: string;
  status: 'Strong' | 'Partial' | 'Weak' | 'Missing';
  finding: string;
  risk: string;
  recommendation: string;
  evidence?: string;
};

export type AssuranceIndexOrganization = {
  id: string;
  name: string;
  slug: string;
  website: string;
  assessmentNumber: string;
  assessmentDate: string;
  sovereigntyScore: number;
  governanceScore: number;
  governanceAudit: GovernanceAuditSection[];
  certification: string;
  certificationClass: string;
  status: string;
  summary: string;
  strengths: string[];
  constraints: string[];
  fullAssessmentPrice: string;
  fullAssessmentCtaLabel: string;
  fullAssessmentCheckoutUrl: string;
};

export const ASSURANCE_INDEX_ORGANIZATIONS: AssuranceIndexOrganization[] = [
  {
    id: 'anythingllm',
    name: 'AnythingLLM',
    slug: 'anythingllm',
    website: 'https://anythingllm.com',
    assessmentNumber: 'AOC-001',
    assessmentDate: '2026-06-15',
    sovereigntyScore: 82,
    governanceScore: 61,
    governanceAudit: [
      {
        title: 'Human Oversight',
        status: 'Partial',
        finding: 'A privacy-focused deployment model supports user control, but public governance evidence remains incomplete.',
        risk: 'Local deployment can reduce data exposure while leaving oversight duties to implementers.',
        evidence: 'Observed from public product, policy, security, and documentation materials.',
        recommendation: 'Publish role-specific oversight responsibilities, escalation paths, and review cadences for high-impact AI workflows.',
      },
      {
        title: 'Accountability Evidence',
        status: 'Partial',
        finding: 'Public-facing materials provide directional governance signals but do not expose a complete independent audit evidence package.',
        risk: 'External reviewers may be unable to distinguish implemented controls from policy or marketing claims.',
        recommendation: 'Maintain an evidence-backed governance control summary with ownership, auditability, and exception-handling details.',
      },
    ],
    certification: 'Gold',
    certificationClass: 'gold',
    status: 'Assessed',
    summary: 'A privacy-focused AI application with strong local deployment and data-control options.',
    strengths: ['Local deployment support', 'Open-source availability', 'Flexible model selection'],
    constraints: ['Governance evidence is based on publicly available materials'],
    fullAssessmentPrice: '$149',
    fullAssessmentCtaLabel: 'Request Full Assessment',
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    slug: 'ollama',
    website: 'https://ollama.com',
    assessmentNumber: 'AOC-002',
    assessmentDate: '2026-06-15',
    sovereigntyScore: 81,
    governanceScore: 56,
    governanceAudit: [
      {
        title: 'Human Oversight',
        status: 'Partial',
        finding: 'Local runtime design gives operators direct execution control, but public materials emphasize tooling more than organizational governance.',
        risk: 'Implementers may assume runtime control is equivalent to governance oversight.',
        evidence: 'Observed from public product, policy, security, and documentation materials.',
        recommendation: 'Publish role-specific oversight responsibilities, escalation paths, and review cadences for high-impact AI workflows.',
      },
      {
        title: 'Accountability Evidence',
        status: 'Partial',
        finding: 'Public-facing materials provide directional governance signals but do not expose a complete independent audit evidence package.',
        risk: 'External reviewers may be unable to distinguish implemented controls from policy or marketing claims.',
        recommendation: 'Maintain an evidence-backed governance control summary with ownership, auditability, and exception-handling details.',
      },
    ],
    certification: 'Gold',
    certificationClass: 'gold',
    status: 'Assessed',
    summary: 'A local model runtime that gives users direct control over model execution and data.',
    strengths: ['Local-first execution', 'Broad model support', 'Open-source tooling'],
    constraints: ['Enterprise governance controls vary by implementation'],
    fullAssessmentPrice: '$149',
    fullAssessmentCtaLabel: 'Request Full Assessment',
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'writer',
    name: 'Writer',
    slug: 'writer',
    website: 'https://writer.com',
    assessmentNumber: 'AOC-003',
    assessmentDate: '2026-06-15',
    sovereigntyScore: 64,
    governanceScore: 74,
    governanceAudit: [
      {
        title: 'Human Oversight',
        status: 'Partial',
        finding: 'Public enterprise materials describe security, administrative controls, and governed workflows for business users.',
        risk: 'Hosted platform dependency requires customers to validate governance enforcement through contractual and audit evidence.',
        evidence: 'Observed from public product, policy, security, and documentation materials.',
        recommendation: 'Publish role-specific oversight responsibilities, escalation paths, and review cadences for high-impact AI workflows.',
      },
      {
        title: 'Accountability Evidence',
        status: 'Partial',
        finding: 'Public-facing materials provide directional governance signals but do not expose a complete independent audit evidence package.',
        risk: 'External reviewers may be unable to distinguish implemented controls from policy or marketing claims.',
        recommendation: 'Maintain an evidence-backed governance control summary with ownership, auditability, and exception-handling details.',
      },
    ],
    certification: 'Silver',
    certificationClass: 'silver',
    status: 'Assessed',
    summary: 'An enterprise generative AI platform with documented security and governance controls.',
    strengths: ['Enterprise control plane', 'Documented security posture', 'Configurable AI workflows'],
    constraints: ['Hosted-service dependencies limit direct infrastructure control'],
    fullAssessmentPrice: '$149',
    fullAssessmentCtaLabel: 'Request Full Assessment',
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'harvey-ai',
    name: 'Harvey AI',
    slug: 'harvey-ai',
    website: 'https://www.harvey.ai',
    assessmentNumber: 'AOC-004',
    assessmentDate: '2026-06-15',
    sovereigntyScore: 58,
    governanceScore: 69,
    governanceAudit: [
      {
        title: 'Human Oversight',
        status: 'Partial',
        finding: 'Public positioning indicates high-trust professional workflows, with limited public detail on internal oversight mechanics.',
        risk: 'Sensitive professional use cases may outpace independently observable governance evidence.',
        evidence: 'Observed from public product, policy, security, and documentation materials.',
        recommendation: 'Publish role-specific oversight responsibilities, escalation paths, and review cadences for high-impact AI workflows.',
      },
      {
        title: 'Accountability Evidence',
        status: 'Partial',
        finding: 'Public-facing materials provide directional governance signals but do not expose a complete independent audit evidence package.',
        risk: 'External reviewers may be unable to distinguish implemented controls from policy or marketing claims.',
        recommendation: 'Maintain an evidence-backed governance control summary with ownership, auditability, and exception-handling details.',
      },
    ],
    certification: 'Silver Conditional',
    certificationClass: 'silver-conditional',
    status: 'Assessed',
    summary: 'A professional AI platform designed for legal and other high-trust knowledge work.',
    strengths: ['Domain-specific workflows', 'Enterprise focus', 'Professional-services use cases'],
    constraints: ['Limited public technical detail constrains independent verification'],
    fullAssessmentPrice: '$149',
    fullAssessmentCtaLabel: 'Request Full Assessment',
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    slug: 'anthropic',
    website: 'https://www.anthropic.com',
    assessmentNumber: 'AOC-005',
    assessmentDate: '2026-06-15',
    sovereigntyScore: 48,
    governanceScore: 82,
    governanceAudit: [
      {
        title: 'Human Oversight',
        status: 'Partial',
        finding: 'Public safety, responsible scaling, and policy materials indicate a mature governance posture at the provider level.',
        risk: 'Strong provider governance does not automatically give customers direct control over model operation or infrastructure dependency.',
        evidence: 'Observed from public product, policy, security, and documentation materials.',
        recommendation: 'Publish role-specific oversight responsibilities, escalation paths, and review cadences for high-impact AI workflows.',
      },
      {
        title: 'Accountability Evidence',
        status: 'Partial',
        finding: 'Public-facing materials provide directional governance signals but do not expose a complete independent audit evidence package.',
        risk: 'External reviewers may be unable to distinguish implemented controls from policy or marketing claims.',
        recommendation: 'Maintain an evidence-backed governance control summary with ownership, auditability, and exception-handling details.',
      },
    ],
    certification: 'Bronze',
    certificationClass: 'bronze',
    status: 'Assessed',
    summary: 'A frontier AI provider with a public emphasis on model safety and responsible scaling.',
    strengths: ['Published safety research', 'Documented responsible scaling policy', 'Enterprise offerings'],
    constraints: ['Cloud-hosted models provide limited user control over core infrastructure'],
    fullAssessmentPrice: '$149',
    fullAssessmentCtaLabel: 'Request Full Assessment',
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
];
