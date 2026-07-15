export const GOVERNANCE_THRESHOLD = 55;
export const SOVEREIGNTY_THRESHOLD = 55;

export type ConstitutionalQuadrant =
  | 'constitutional-leaders'
  | 'trusted-custodians'
  | 'dependency-platforms'
  | 'sovereignty-pioneers';

export type ConstitutionalOrganization = {
  id: string;
  name: string;
  slug: string;
  governanceScore: number;
  sovereigntyScore: number;
  quadrant: ConstitutionalQuadrant;
  industries: string[];
  organizationType?: string;
  website?: string;
  shortSummary: string;
  publicAssessmentUrl?: string;
  assessmentStatus?: 'available' | 'coming-soon' | 'private-only';
};

export type QuadrantDefinition = {
  id: ConstitutionalQuadrant;
  label: string;
  description: string;
};

export const QUADRANT_DEFINITIONS: QuadrantDefinition[] = [
  {
    id: 'constitutional-leaders',
    label: 'Constitutional Leaders',
    description:
      'Organizations with both strong governance posture and strong user or institutional sovereignty.',
  },
  {
    id: 'trusted-custodians',
    label: 'Trusted Custodians',
    description:
      'Organizations with stronger governance posture but centralized control, platform dependency, or limited user sovereignty.',
  },
  {
    id: 'dependency-platforms',
    label: 'Dependency Platforms',
    description:
      'Organizations where users remain dependent on the vendor, platform, or opaque operating layer.',
  },
  {
    id: 'sovereignty-pioneers',
    label: 'Sovereignty Pioneers',
    description:
      'Organizations that improve user control, local operation, or self-hosting, but where formal governance maturity may be weaker or context-dependent.',
  },
];

export const CONSTITUTIONAL_ORGANIZATIONS: ConstitutionalOrganization[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    slug: 'anthropic',
    governanceScore: 72,
    sovereigntyScore: 34,
    quadrant: 'trusted-custodians',
    industries: ['Foundation Models', 'Enterprise AI'],
    organizationType: 'AI Lab',
    website: 'https://www.anthropic.com',
    shortSummary:
      'High-governance AI lab with strong safety positioning, but limited user sovereignty due to centralized model access and platform dependency.',
    publicAssessmentUrl: '/assurance/index/anthropic',
    assessmentStatus: 'available',
  },
  {
    id: 'writer',
    name: 'Writer',
    slug: 'writer',
    governanceScore: 52,
    sovereigntyScore: 36,
    quadrant: 'dependency-platforms',
    industries: ['Enterprise AI', 'Agent Platforms'],
    organizationType: 'Enterprise AI Platform',
    website: 'https://writer.com',
    shortSummary:
      'Enterprise AI platform with useful operational controls, but still structurally dependent on centralized platform capabilities and vendor-managed governance.',
    publicAssessmentUrl: '/assurance/index/writer',
    assessmentStatus: 'available',
  },
  {
    id: 'harvey',
    name: 'Harvey',
    slug: 'harvey',
    governanceScore: 48,
    sovereigntyScore: 38,
    quadrant: 'dependency-platforms',
    industries: ['Legal AI', 'Enterprise AI'],
    organizationType: 'Legal AI Platform',
    website: 'https://www.harvey.ai',
    shortSummary:
      'Legal AI platform designed for professional workflows, with meaningful enterprise value but limited public evidence of constitutional sovereignty.',
    publicAssessmentUrl: '/assurance/index/harvey',
    assessmentStatus: 'available',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    slug: 'ollama',
    governanceScore: 46,
    sovereigntyScore: 86,
    quadrant: 'sovereignty-pioneers',
    industries: ['Open Source AI', 'Developer Tools'],
    organizationType: 'Local AI Infrastructure',
    website: 'https://ollama.com',
    shortSummary:
      'Local-first AI infrastructure that materially increases user sovereignty, while governance depends heavily on implementation context.',
    publicAssessmentUrl: '/assurance/index/ollama',
    assessmentStatus: 'available',
  },
  {
    id: 'anythingllm',
    name: 'AnythingLLM',
    slug: 'anythingllm',
    governanceScore: 44,
    sovereigntyScore: 83,
    quadrant: 'sovereignty-pioneers',
    industries: ['Open Source AI', 'Agent Platforms', 'Developer Tools'],
    organizationType: 'AI Workspace',
    website: 'https://anythingllm.com',
    shortSummary:
      'Sovereignty-oriented AI workspace with local and self-hosted deployment options, while formal governance guarantees depend on deployment configuration.',
    publicAssessmentUrl: '/assurance/index/anythingllm',
    assessmentStatus: 'available',
  },
];

export const ALL_INDUSTRIES: string[] = [
  ...new Set(CONSTITUTIONAL_ORGANIZATIONS.flatMap((o) => o.industries)),
].sort();

export const COMBINED_RANKED: ConstitutionalOrganization[] = [
  ...CONSTITUTIONAL_ORGANIZATIONS,
].sort(
  (a, b) =>
    (b.governanceScore + b.sovereigntyScore) / 2 -
    (a.governanceScore + a.sovereigntyScore) / 2,
);
