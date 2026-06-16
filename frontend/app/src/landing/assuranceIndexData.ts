export type ConstitutionalQuadrant =
  | 'constitutional-leaders'
  | 'trusted-custodians'
  | 'dependency-platforms'
  | 'sovereignty-first';

export type ConstitutionalIndexOrganization = {
  id: string;
  name: string;
  slug: string;
  website: string;
  assessmentNumber: string;
  assessmentDate: string;
  governanceScore: number;
  sovereigntyScore: number;
  quadrant: ConstitutionalQuadrant;
  quadrantLabel: string;
  constitutionalSummary: string;
  summary: string;
  strengths: string[];
  constraints: string[];
  fullAssessmentCheckoutUrl: string;
};

export const CONSTITUTIONAL_INDEX_ORGANIZATIONS: ConstitutionalIndexOrganization[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    slug: 'anthropic',
    website: 'https://www.anthropic.com',
    assessmentNumber: 'AOC-CI-001',
    assessmentDate: '2026-06-15',
    governanceScore: 72,
    sovereigntyScore: 34,
    quadrant: 'trusted-custodians',
    quadrantLabel: 'Trusted Custodian',
    constitutionalSummary: 'Strong governance structures with limited customer sovereignty.',
    summary:
      'A frontier AI provider with a public emphasis on model safety and responsible scaling. Anthropic maintains strong governance infrastructure at the provider level, with documented safety commitments and responsible scaling policies. Customer sovereignty over core model infrastructure remains limited by the hosted-service model.',
    strengths: [
      'Published responsible scaling policy',
      'Documented safety research and model governance',
      'Enterprise API offerings with access controls',
    ],
    constraints: [
      'Cloud-hosted models provide limited customer control over core infrastructure',
      'Sovereignty is bounded by provider-defined operational parameters',
    ],
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'harvey',
    name: 'Harvey',
    slug: 'harvey',
    website: 'https://www.harvey.ai',
    assessmentNumber: 'AOC-CI-002',
    assessmentDate: '2026-06-15',
    governanceScore: 48,
    sovereigntyScore: 38,
    quadrant: 'dependency-platforms',
    quadrantLabel: 'Dependency Platform',
    constitutionalSummary: 'Structured professional governance with limited operational independence.',
    summary:
      'A professional AI platform designed for legal and high-trust knowledge work. Harvey demonstrates structured governance appropriate for regulated professional environments, while operational independence remains constrained by the hosted-platform model and limited public technical disclosure.',
    strengths: [
      'Domain-specific professional workflows',
      'Enterprise focus with structured access controls',
      'High-trust professional-services orientation',
    ],
    constraints: [
      'Limited public technical disclosure constrains independent verification',
      'Hosted-platform dependency limits operational sovereignty',
    ],
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'writer',
    name: 'Writer',
    slug: 'writer',
    website: 'https://writer.com',
    assessmentNumber: 'AOC-CI-003',
    assessmentDate: '2026-06-15',
    governanceScore: 52,
    sovereigntyScore: 36,
    quadrant: 'dependency-platforms',
    quadrantLabel: 'Dependency Platform',
    constitutionalSummary: 'Mature enterprise governance with substantial hosted-platform dependency.',
    summary:
      'An enterprise generative AI platform with documented security and governance controls. Writer presents mature enterprise governance appropriate for business deployments. Substantial hosted-service dependency means operational sovereignty is constrained, requiring customers to rely on contractual assurances for governance enforcement.',
    strengths: [
      'Enterprise control plane with administrative governance',
      'Documented security posture and compliance positioning',
      'Configurable AI workflows for enterprise deployment',
    ],
    constraints: [
      'Hosted-service dependencies limit direct infrastructure control',
      'Customer sovereignty relies on contractual and audit evidence',
    ],
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'anythingllm',
    name: 'AnythingLLM',
    slug: 'anythingllm',
    website: 'https://anythingllm.com',
    assessmentNumber: 'AOC-CI-004',
    assessmentDate: '2026-06-15',
    governanceScore: 44,
    sovereigntyScore: 83,
    quadrant: 'sovereignty-first',
    quadrantLabel: 'Sovereignty First',
    constitutionalSummary: 'Maximum user control with limited governance infrastructure.',
    summary:
      'A privacy-focused AI application with strong local deployment and data-control options. AnythingLLM delivers exceptional user sovereignty through local deployment, open-source availability, and flexible model selection. Formal governance infrastructure remains the primary area for constitutional maturation.',
    strengths: [
      'Local deployment enabling maximum data control',
      'Open-source codebase enabling full auditability',
      'Flexible model selection supporting operational independence',
    ],
    constraints: [
      'Governance evidence is based on publicly available materials',
      'Formal governance infrastructure is less developed relative to sovereignty posture',
    ],
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    slug: 'ollama',
    website: 'https://ollama.com',
    assessmentNumber: 'AOC-CI-005',
    assessmentDate: '2026-06-15',
    governanceScore: 46,
    sovereigntyScore: 86,
    quadrant: 'sovereignty-first',
    quadrantLabel: 'Sovereignty First',
    constitutionalSummary:
      'Exceptional runtime sovereignty with governance maturity as the primary limiting factor.',
    summary:
      'A local model runtime that gives users direct control over model execution and data. Ollama achieves the highest sovereignty score in the current index through its local-first execution model, broad model support, and open-source tooling. Governance maturity is the primary dimension for constitutional improvement.',
    strengths: [
      'Local-first execution delivering exceptional runtime sovereignty',
      'Broad model support enabling operational independence',
      'Open-source tooling supporting full transparency',
    ],
    constraints: [
      'Enterprise governance controls depend on implementer configuration',
      'Formal governance infrastructure is less developed relative to sovereignty posture',
    ],
    fullAssessmentCheckoutUrl: 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00',
  },
];

export const GOVERNANCE_RANKED = [...CONSTITUTIONAL_INDEX_ORGANIZATIONS].sort(
  (a, b) => b.governanceScore - a.governanceScore,
);

export const SOVEREIGNTY_RANKED = [...CONSTITUTIONAL_INDEX_ORGANIZATIONS].sort(
  (a, b) => b.sovereigntyScore - a.sovereigntyScore,
);
