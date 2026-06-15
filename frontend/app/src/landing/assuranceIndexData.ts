export type AssuranceIndexOrganization = {
  id: string;
  name: string;
  slug: string;
  website: string;
  assessmentNumber: string;
  assessmentDate: string;
  sovereigntyScore: number;
  governanceScore: number | null;
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
    governanceScore: null,
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
    governanceScore: null,
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
    governanceScore: null,
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
    governanceScore: null,
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
    governanceScore: null,
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
