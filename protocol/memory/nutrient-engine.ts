import { createHash } from 'crypto';

export const NUTRIENT_TYPES = [
  'OPERATIONAL_PATTERN',
  'RECURRING_BLOCKER',
  'DECISION_TRAIL',
  'STAKEHOLDER_SIGNAL',
  'GOVERNANCE_LESSON',
  'RISK_EVOLUTION',
  'EXECUTION_INSIGHT',
  'POLICY_DEPENDENCY',
  'CONTRADICTION_CLUSTER',
  'STRATEGIC_SUMMARY_CANDIDATE'
] as const;

export type NutrientType = (typeof NUTRIENT_TYPES)[number];

export type NutrientExtractionMemory = {
  memoryId: string;
  createdAt: string;
  updatedAt?: string;
  text?: string;
  tags?: string[];
  type?: string;
  linkedMemoryIds?: string[];
  stakeholderIds?: string[];
  policyIds?: string[];
  decisionId?: string;
  riskTopic?: string;
  contradictionCount?: number;
  blockerKey?: string;
  executionKey?: string;
  memoryWeight: number;
  auditRequired?: boolean;
  governanceImpact?: number;
  domain?: string;
};

export type NutrientExtractionPolicy = {
  minEvidenceCount: number;
  promoteConfidenceThreshold: number;
  recurringBlockerMinCount: number;
  stakeholderSignalMinCount: number;
  decisionTrailMinCount: number;
  contradictionClusterMinContradictions: number;
  operationalPatternMinCount: number;
  operationalPatternMinWeightAverage: number;
  riskEvolutionMinCount: number;
  strategicCrossDomainMinCount: number;
  strategicCrossDomainMinDomains: number;
};

export type NutrientExtractionInput = {
  memories: ReadonlyArray<NutrientExtractionMemory>;
  now: string;
  policy: NutrientExtractionPolicy;
};

export type MemoryNutrient = {
  nutrientId: string;
  nutrientType: NutrientType;
  sourceMemoryIds: string[];
  createdAt: string;
  updatedAt: string;
  confidenceScore: number;
  evidenceCount: number;
  memoryWeightAverage: number;
  extractionReason: string;
  auditRequired: boolean;
  lineagePreserved: true;
  promoted: boolean;
};

export type NutrientExtractionResult = {
  nutrients: MemoryNutrient[];
  promotedNutrients: MemoryNutrient[];
};

const round2 = (value: number): number => Math.round(value * 100) / 100;
const unique = (items: string[]): string[] => [...new Set(items)];

const buildNutrientId = (type: NutrientType, sourceMemoryIds: string[]): string => {
  const digest = createHash('sha256').update(`${type}::${unique(sourceMemoryIds).sort().join('|')}`).digest('hex').slice(0, 16);
  return `nutrient-${type.toLowerCase()}-${digest}`;
};

export const buildNutrientLineage = (sourceMemoryIds: string[]): string[] => unique([...sourceMemoryIds]).sort();

export const classifyNutrientType = (memory: NutrientExtractionMemory): NutrientType => {
  if ((memory.blockerKey || memory.tags?.includes('blocker')) && (memory.contradictionCount ?? 0) > 1) return 'RECURRING_BLOCKER';
  if ((memory.policyIds?.length ?? 0) > 0) return 'POLICY_DEPENDENCY';
  if (memory.decisionId || memory.tags?.includes('decision')) return 'DECISION_TRAIL';
  if ((memory.stakeholderIds?.length ?? 0) > 0) return 'STAKEHOLDER_SIGNAL';
  if ((memory.contradictionCount ?? 0) > 0) return 'CONTRADICTION_CLUSTER';
  if (memory.riskTopic || memory.tags?.includes('risk')) return 'RISK_EVOLUTION';
  if (memory.executionKey || memory.tags?.includes('execution')) return 'EXECUTION_INSIGHT';
  if (memory.tags?.includes('governance')) return 'GOVERNANCE_LESSON';
  return 'OPERATIONAL_PATTERN';
};

export const calculateNutrientConfidence = (
  nutrientType: NutrientType,
  evidenceCount: number,
  memoryWeightAverage: number,
  crossDomainCount = 1
): number => {
  const typeBoost: Record<NutrientType, number> = {
    OPERATIONAL_PATTERN: 0.02,
    RECURRING_BLOCKER: 0.06,
    DECISION_TRAIL: 0.05,
    STAKEHOLDER_SIGNAL: 0.04,
    GOVERNANCE_LESSON: 0.04,
    RISK_EVOLUTION: 0.05,
    EXECUTION_INSIGHT: 0.03,
    POLICY_DEPENDENCY: 0.05,
    CONTRADICTION_CLUSTER: 0.02,
    STRATEGIC_SUMMARY_CANDIDATE: 0.08
  };

  const evidenceScore = Math.min(1, evidenceCount / 10) * 0.5;
  const weightScore = Math.min(1, memoryWeightAverage / 100) * 0.35;
  const domainScore = Math.min(1, crossDomainCount / 5) * 0.15;
  return round2(Math.min(1, evidenceScore + weightScore + domainScore + typeBoost[nutrientType]));
};

export const shouldPromoteNutrient = (nutrient: MemoryNutrient, policy: NutrientExtractionPolicy): boolean => {
  return nutrient.evidenceCount >= policy.minEvidenceCount && nutrient.confidenceScore >= policy.promoteConfidenceThreshold;
};

const composeNutrient = (
  nutrientType: NutrientType,
  sourceMemories: NutrientExtractionMemory[],
  now: string,
  extractionReason: string,
  crossDomainCount = 1
): MemoryNutrient => {
  const sourceMemoryIds = buildNutrientLineage(sourceMemories.map((memory) => memory.memoryId));
  const evidenceCount = sourceMemoryIds.length;
  const memoryWeightAverage = round2(sourceMemories.reduce((acc, memory) => acc + memory.memoryWeight, 0) / Math.max(1, sourceMemories.length));
  const auditRequired = sourceMemories.some((memory) => Boolean(memory.auditRequired));

  return {
    nutrientId: buildNutrientId(nutrientType, sourceMemoryIds),
    nutrientType,
    sourceMemoryIds,
    createdAt: now,
    updatedAt: now,
    confidenceScore: calculateNutrientConfidence(nutrientType, evidenceCount, memoryWeightAverage, crossDomainCount),
    evidenceCount,
    memoryWeightAverage,
    extractionReason,
    auditRequired,
    lineagePreserved: true,
    promoted: false
  };
};

export const consolidateDuplicateNutrients = (nutrients: MemoryNutrient[]): MemoryNutrient[] => {
  const map = new Map<string, MemoryNutrient>();

  for (const nutrient of nutrients) {
    const key = `${nutrient.nutrientType}::${nutrient.sourceMemoryIds.join('|')}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, nutrient);
      continue;
    }

    map.set(key, {
      ...existing,
      updatedAt: nutrient.updatedAt > existing.updatedAt ? nutrient.updatedAt : existing.updatedAt,
      confidenceScore: Math.max(existing.confidenceScore, nutrient.confidenceScore),
      extractionReason: `${existing.extractionReason}; ${nutrient.extractionReason}`,
      auditRequired: existing.auditRequired || nutrient.auditRequired,
      promoted: existing.promoted || nutrient.promoted
    });
  }

  return [...map.values()];
};

export const extractMemoryNutrients = (input: NutrientExtractionInput): NutrientExtractionResult => {
  const { memories, now, policy } = input;
  const nutrients: MemoryNutrient[] = [];

  const byBlocker = new Map<string, NutrientExtractionMemory[]>();
  const byStakeholder = new Map<string, NutrientExtractionMemory[]>();
  const byDecision = new Map<string, NutrientExtractionMemory[]>();
  const byPolicy = new Map<string, NutrientExtractionMemory[]>();
  const byRiskTopic = new Map<string, NutrientExtractionMemory[]>();
  const byOperation = new Map<string, NutrientExtractionMemory[]>();

  for (const memory of memories) {
    if (memory.blockerKey) byBlocker.set(memory.blockerKey, [...(byBlocker.get(memory.blockerKey) ?? []), memory]);
    for (const stakeholder of memory.stakeholderIds ?? []) {
      byStakeholder.set(stakeholder, [...(byStakeholder.get(stakeholder) ?? []), memory]);
    }
    if (memory.decisionId) byDecision.set(memory.decisionId, [...(byDecision.get(memory.decisionId) ?? []), memory]);
    for (const policyId of memory.policyIds ?? []) {
      byPolicy.set(policyId, [...(byPolicy.get(policyId) ?? []), memory]);
    }
    if (memory.riskTopic) byRiskTopic.set(memory.riskTopic, [...(byRiskTopic.get(memory.riskTopic) ?? []), memory]);
    const opKey = memory.executionKey ?? memory.type;
    if (opKey) byOperation.set(opKey, [...(byOperation.get(opKey) ?? []), memory]);
  }

  for (const [blockerKey, source] of byBlocker) {
    if (source.length >= policy.recurringBlockerMinCount) {
      nutrients.push(composeNutrient('RECURRING_BLOCKER', source, now, `Repeated blocker detected: ${blockerKey}`));
    }
  }
  for (const [stakeholder, source] of byStakeholder) {
    if (source.length >= policy.stakeholderSignalMinCount) {
      nutrients.push(composeNutrient('STAKEHOLDER_SIGNAL', source, now, `Recurring stakeholder reference: ${stakeholder}`));
    }
  }
  for (const [decisionId, source] of byDecision) {
    if (source.length >= policy.decisionTrailMinCount || source.some((m) => (m.linkedMemoryIds?.length ?? 0) > 0)) {
      nutrients.push(composeNutrient('DECISION_TRAIL', source, now, `Linked decision trail: ${decisionId}`));
    }
  }
  for (const [policyId, source] of byPolicy) {
    nutrients.push(composeNutrient('POLICY_DEPENDENCY', source, now, `Policy-linked evidence: ${policyId}`));
  }

  const contradictionSource = memories.filter((memory) => (memory.contradictionCount ?? 0) >= policy.contradictionClusterMinContradictions);
  if (contradictionSource.length > 0) {
    nutrients.push(composeNutrient('CONTRADICTION_CLUSTER', contradictionSource, now, 'Contradiction-heavy memory cluster'));
  }

  for (const [operationKey, source] of byOperation) {
    const weightAverage = source.reduce((acc, memory) => acc + memory.memoryWeight, 0) / source.length;
    if (source.length >= policy.operationalPatternMinCount && weightAverage >= policy.operationalPatternMinWeightAverage) {
      nutrients.push(composeNutrient('OPERATIONAL_PATTERN', source, now, `Repeated high-weight operational signal: ${operationKey}`));
    }
  }

  for (const [riskTopic, source] of byRiskTopic) {
    if (source.length >= policy.riskEvolutionMinCount) {
      nutrients.push(composeNutrient('RISK_EVOLUTION', source, now, `Risk evolution over time: ${riskTopic}`));
    }
  }

  const crossDomainHighWeight = memories.filter((memory) => memory.memoryWeight >= 65);
  const crossDomainCount = new Set(crossDomainHighWeight.map((memory) => memory.domain ?? 'unknown')).size;
  if (
    crossDomainHighWeight.length >= policy.strategicCrossDomainMinCount &&
    crossDomainCount >= policy.strategicCrossDomainMinDomains
  ) {
    nutrients.push(
      composeNutrient(
        'STRATEGIC_SUMMARY_CANDIDATE',
        crossDomainHighWeight,
        now,
        'High-confidence cross-domain pattern ready for strategic summarization',
        crossDomainCount
      )
    );
  }

  const consolidated = consolidateDuplicateNutrients(nutrients).map((nutrient) => ({
    ...nutrient,
    promoted: shouldPromoteNutrient(nutrient, policy)
  }));

  return {
    nutrients: consolidated,
    promotedNutrients: consolidated.filter((nutrient) => nutrient.promoted)
  };
};
