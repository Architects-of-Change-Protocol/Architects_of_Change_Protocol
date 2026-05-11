export const MEMORY_CATEGORIES = [
  'RAW_INTERACTION',
  'OPERATIONAL_SIGNAL',
  'DECISION',
  'APPROVAL',
  'POLICY',
  'IDENTITY',
  'PERMISSION',
  'EXECUTIVE_SYNTHESIS',
  'RELATIONSHIP_SIGNAL',
  'RISK_SIGNAL',
  'TRANSIENT_CONTEXT',
  'EMOTIONAL_CONTEXT',
  'AI_GENERATED_ARTIFACT',
  'COMPLIANCE_RECORD',
  'AUDIT_EVENT'
] as const;

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

export const RETENTION_CLASSES = [
  'EPHEMERAL',
  'STANDARD',
  'GOVERNED',
  'PERMANENT'
] as const;

export type RetentionClass = (typeof RETENTION_CLASSES)[number];

export const GOVERNANCE_CRITICALITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type GovernanceCriticality = (typeof GOVERNANCE_CRITICALITY_LEVELS)[number];

export type MemoryMetadata = {
  createdAt: string;
  lastReferencedAt: string;
  confidenceScore: number;
  relevanceScore: number;
  governanceCriticality: GovernanceCriticality;
  retentionClass: RetentionClass;
  memoryWeight: number;
  decayEligible: boolean;
  compressible: boolean;
  auditRequired: boolean;
};

export type ClassifyMemoryInput = {
  kind?: string;
  source?: string;
  tags?: readonly string[];
  actorType?: 'human' | 'ai' | 'system' | string;
  approved?: boolean;
  decisionRecorded?: boolean;
  policyRelated?: boolean;
  identityRelated?: boolean;
  permissionRelated?: boolean;
  riskRelated?: boolean;
  complianceRelated?: boolean;
  auditRelated?: boolean;
  emotionalSignal?: boolean;
  relationshipRelated?: boolean;
  transient?: boolean;
};

const KEYWORD_CATEGORY_MAP: ReadonlyArray<{ keyword: string; category: MemoryCategory }> = [
  { keyword: 'policy', category: 'POLICY' },
  { keyword: 'approval', category: 'APPROVAL' },
  { keyword: 'decision', category: 'DECISION' },
  { keyword: 'identity', category: 'IDENTITY' },
  { keyword: 'permission', category: 'PERMISSION' },
  { keyword: 'risk', category: 'RISK_SIGNAL' },
  { keyword: 'compliance', category: 'COMPLIANCE_RECORD' },
  { keyword: 'audit', category: 'AUDIT_EVENT' },
  { keyword: 'relationship', category: 'RELATIONSHIP_SIGNAL' },
  { keyword: 'emotion', category: 'EMOTIONAL_CONTEXT' },
  { keyword: 'synthesis', category: 'EXECUTIVE_SYNTHESIS' },
  { keyword: 'operational', category: 'OPERATIONAL_SIGNAL' }
];

function normalizeSignals(input: ClassifyMemoryInput): string[] {
  const sourceSignals = [input.kind, input.source, ...(input.tags ?? [])]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return sourceSignals;
}

export function classifyMemory(input: ClassifyMemoryInput): MemoryCategory[] {
  const categories = new Set<MemoryCategory>();
  const signals = normalizeSignals(input);

  categories.add('RAW_INTERACTION');

  if (input.actorType === 'ai' || signals.some((s) => s.includes('ai-generated') || s.includes('generated'))) {
    categories.add('AI_GENERATED_ARTIFACT');
  }
  if (input.approved || signals.some((s) => s.includes('approval') || s.includes('approved'))) {
    categories.add('APPROVAL');
  }
  if (input.decisionRecorded || signals.some((s) => s.includes('decision'))) {
    categories.add('DECISION');
  }
  if (input.policyRelated) {
    categories.add('POLICY');
  }
  if (input.identityRelated) {
    categories.add('IDENTITY');
  }
  if (input.permissionRelated) {
    categories.add('PERMISSION');
  }
  if (input.riskRelated) {
    categories.add('RISK_SIGNAL');
  }
  if (input.complianceRelated) {
    categories.add('COMPLIANCE_RECORD');
  }
  if (input.auditRelated) {
    categories.add('AUDIT_EVENT');
  }
  if (input.relationshipRelated) {
    categories.add('RELATIONSHIP_SIGNAL');
  }
  if (input.emotionalSignal) {
    categories.add('EMOTIONAL_CONTEXT');
  }
  if (input.transient) {
    categories.add('TRANSIENT_CONTEXT');
  }

  for (const signal of signals) {
    for (const { keyword, category } of KEYWORD_CATEGORY_MAP) {
      if (signal.includes(keyword)) {
        categories.add(category);
      }
    }

    if (signal.includes('executive') || signal.includes('summary')) {
      categories.add('EXECUTIVE_SYNTHESIS');
    }
    if (signal.includes('runtime') || signal.includes('telemetry')) {
      categories.add('OPERATIONAL_SIGNAL');
    }
    if (signal.includes('transient') || signal.includes('session')) {
      categories.add('TRANSIENT_CONTEXT');
    }
  }

  return Array.from(categories);
}

export function inferRetentionClass(categories: readonly MemoryCategory[]): RetentionClass {
  if (categories.includes('AUDIT_EVENT') || categories.includes('COMPLIANCE_RECORD')) {
    return 'PERMANENT';
  }
  if (
    categories.includes('POLICY') ||
    categories.includes('DECISION') ||
    categories.includes('APPROVAL') ||
    categories.includes('PERMISSION')
  ) {
    return 'GOVERNED';
  }
  if (categories.includes('TRANSIENT_CONTEXT')) {
    return 'EPHEMERAL';
  }
  return 'STANDARD';
}

export function inferDecayEligibility(categories: readonly MemoryCategory[]): boolean {
  return !categories.some((category) =>
    ['AUDIT_EVENT', 'COMPLIANCE_RECORD', 'POLICY', 'DECISION', 'APPROVAL'].includes(category)
  );
}

export function inferCompressionEligibility(categories: readonly MemoryCategory[]): boolean {
  return !categories.some((category) =>
    ['AUDIT_EVENT', 'COMPLIANCE_RECORD', 'IDENTITY', 'PERMISSION'].includes(category)
  );
}

export function createMemoryMetadata(
  categories: readonly MemoryCategory[],
  now: Date = new Date()
): MemoryMetadata {
  const retentionClass = inferRetentionClass(categories);
  const governanceCriticality: GovernanceCriticality =
    retentionClass === 'PERMANENT' ? 'CRITICAL' : retentionClass === 'GOVERNED' ? 'HIGH' : 'MEDIUM';

  return {
    createdAt: now.toISOString(),
    lastReferencedAt: now.toISOString(),
    confidenceScore: 0.8,
    relevanceScore: 0.7,
    governanceCriticality,
    retentionClass,
    memoryWeight: governanceCriticality === 'CRITICAL' ? 1 : governanceCriticality === 'HIGH' ? 0.9 : 0.6,
    decayEligible: inferDecayEligibility(categories),
    compressible: inferCompressionEligibility(categories),
    auditRequired: categories.includes('AUDIT_EVENT') || categories.includes('COMPLIANCE_RECORD')
  };
}
