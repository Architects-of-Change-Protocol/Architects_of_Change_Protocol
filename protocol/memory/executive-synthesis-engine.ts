import { createHash } from 'crypto';
import type { MemoryNutrient, NutrientType } from './nutrient-engine';

/**
 * Executive synthesis is the deterministic layer that converts promoted nutrients
 * into auditable, governance-ready organizational signals.
 *
 * It is protocol-native:
 * - no model calls
 * - no storage assumptions
 * - no framework assumptions
 * - full lineage + audit propagation
 */
export const EXECUTIVE_SYNTHESIS_CATEGORIES = [
  'ORGANIZATIONAL_TRUTH',
  'STRATEGIC_RISK',
  'STAKEHOLDER_GRAVITY',
  'GOVERNANCE_SIGNAL',
  'EXECUTION_PATTERN',
  'POLICY_IMPACT',
  'RECURRING_FAILURE_MODE',
  'STRATEGIC_OPPORTUNITY',
  'CONTRADICTION_REQUIRES_REVIEW',
  'EXECUTIVE_BRIEFING_CANDIDATE'
] as const;

export type ExecutiveSynthesisCategory = (typeof EXECUTIVE_SYNTHESIS_CATEGORIES)[number];

export type ExecutiveSynthesisPolicy = {
  recurringBlockerHighWeightThreshold: number;
  stakeholderHighConfidenceThreshold: number;
  operationalPatternHighEvidenceThreshold: number;
  governanceHeavyWeightThreshold: number;
  organizationalTruthMinEvidence: number;
  organizationalTruthMinConfidence: number;
  strategicOpportunityMinConfidence: number;
  governancePromotionConfidenceThreshold: number;
  governancePromotionMinEvidenceCount: number;
};

export type ExecutiveSynthesisInputNutrient = MemoryNutrient & {
  memoryWeightAverage?: number;
  crossDomainCount?: number;
};

export type ExecutiveSynthesisInput = {
  nutrients: ReadonlyArray<ExecutiveSynthesisInputNutrient>;
  now: string;
  policy: ExecutiveSynthesisPolicy;
};

export type ExecutiveSynthesisRecord = {
  synthesisId: string;
  category: ExecutiveSynthesisCategory;
  sourceNutrientIds: string[];
  sourceMemoryIds: string[];
  createdAt: string;
  updatedAt: string;
  confidenceScore: number;
  evidenceCount: number;
  averageNutrientConfidence: number;
  averageMemoryWeight: number;
  executiveSummary: string;
  recommendedAction: string;
  auditRequired: boolean;
  lineagePreserved: true;
  reviewRequired: boolean;
  promotedToGovernanceMemory: boolean;
};

export type ExecutiveSynthesisResult = {
  syntheses: ExecutiveSynthesisRecord[];
  promotedToGovernanceMemory: ExecutiveSynthesisRecord[];
};

const round2 = (value: number): number => Math.round(value * 100) / 100;
const unique = (items: string[]): string[] => [...new Set(items)].sort();

export const buildExecutiveSynthesisLineage = (nutrients: ReadonlyArray<ExecutiveSynthesisInputNutrient>) => ({
  sourceNutrientIds: unique(nutrients.map((n) => n.nutrientId)),
  sourceMemoryIds: unique(nutrients.flatMap((n) => n.sourceMemoryIds))
});

const buildSynthesisId = (category: ExecutiveSynthesisCategory, sourceNutrientIds: string[]): string => {
  const digest = createHash('sha256').update(`${category}::${unique(sourceNutrientIds).join('|')}`).digest('hex').slice(0, 16);
  return `synthesis-${category.toLowerCase()}-${digest}`;
};

export const classifyExecutiveSynthesisCategory = (
  nutrients: ReadonlyArray<ExecutiveSynthesisInputNutrient>,
  policy: ExecutiveSynthesisPolicy
): ExecutiveSynthesisCategory => {
  const types = new Set<NutrientType>(nutrients.map((n) => n.nutrientType));
  const avgWeight = nutrients.reduce((acc, n) => acc + (n.memoryWeightAverage ?? 0), 0) / Math.max(1, nutrients.length);
  const avgConfidence = nutrients.reduce((acc, n) => acc + n.confidenceScore, 0) / Math.max(1, nutrients.length);

  if (types.has('CONTRADICTION_CLUSTER')) return 'CONTRADICTION_REQUIRES_REVIEW';
  if (types.has('RECURRING_BLOCKER') && avgWeight >= policy.recurringBlockerHighWeightThreshold) return 'RECURRING_FAILURE_MODE';
  if (types.has('STAKEHOLDER_SIGNAL') && avgConfidence >= policy.stakeholderHighConfidenceThreshold) return 'STAKEHOLDER_GRAVITY';
  if (types.has('POLICY_DEPENDENCY')) return 'POLICY_IMPACT';
  if (types.has('RISK_EVOLUTION')) return 'STRATEGIC_RISK';
  if (types.has('OPERATIONAL_PATTERN') && nutrients.reduce((a, n) => a + n.evidenceCount, 0) >= policy.operationalPatternHighEvidenceThreshold) return 'EXECUTION_PATTERN';
  if (types.has('STRATEGIC_SUMMARY_CANDIDATE')) return 'EXECUTIVE_BRIEFING_CANDIDATE';
  if (nutrients.some((n) => (n.memoryWeightAverage ?? 0) >= policy.governanceHeavyWeightThreshold || n.nutrientType === 'GOVERNANCE_LESSON')) return 'GOVERNANCE_SIGNAL';
  if (types.has('OPERATIONAL_PATTERN') && types.has('RISK_EVOLUTION') && types.has('POLICY_DEPENDENCY') && avgConfidence >= policy.strategicOpportunityMinConfidence) return 'STRATEGIC_OPPORTUNITY';
  if (nutrients.length >= policy.organizationalTruthMinEvidence && avgConfidence >= policy.organizationalTruthMinConfidence) return 'ORGANIZATIONAL_TRUTH';
  return 'GOVERNANCE_SIGNAL';
};

export const calculateExecutiveSynthesisConfidence = (nutrients: ReadonlyArray<ExecutiveSynthesisInputNutrient>): number => {
  const evidence = nutrients.reduce((acc, nutrient) => acc + nutrient.evidenceCount, 0);
  const avgConfidence = nutrients.reduce((acc, nutrient) => acc + nutrient.confidenceScore, 0) / Math.max(1, nutrients.length);
  const avgWeight = nutrients.reduce((acc, nutrient) => acc + (nutrient.memoryWeightAverage ?? 0), 0) / Math.max(1, nutrients.length);
  const score = avgConfidence * 0.65 + Math.min(1, evidence / 20) * 0.2 + Math.min(1, avgWeight / 100) * 0.15;
  return round2(Math.min(1, score));
};

export const generateExecutiveSummary = (
  category: ExecutiveSynthesisCategory,
  nutrients: ReadonlyArray<ExecutiveSynthesisInputNutrient>,
  averageMemoryWeight: number
): string => {
  const evidenceCount = nutrients.reduce((acc, n) => acc + n.evidenceCount, 0);
  const nutrientTypes = unique(nutrients.map((n) => n.nutrientType)).join(', ');
  const reasons = unique(nutrients.map((n) => n.extractionReason)).join(' | ');
  return `${category}: ${evidenceCount} evidence points, avg memory weight ${round2(averageMemoryWeight)}, from [${nutrientTypes}]. Reasons: ${reasons}.`;
};

export const generateRecommendedAction = (category: ExecutiveSynthesisCategory): string => {
  const actions: Record<ExecutiveSynthesisCategory, string> = {
    RECURRING_FAILURE_MODE: 'Investigate root cause and assign an accountable owner.',
    CONTRADICTION_REQUIRES_REVIEW: 'Require human review to resolve contradiction cluster.',
    STAKEHOLDER_GRAVITY: 'Validate the stakeholder influence map and decision rights.',
    POLICY_IMPACT: 'Review governance dependency and policy controls.',
    STRATEGIC_RISK: 'Escalate risk owner and define mitigation timeline.',
    EXECUTION_PATTERN: 'Consider standardizing this workflow as an operating pattern.',
    STRATEGIC_OPPORTUNITY: 'Evaluate investment or productization path.',
    EXECUTIVE_BRIEFING_CANDIDATE: 'Include in next leadership synthesis briefing.',
    GOVERNANCE_SIGNAL: 'Route to governance review queue for deterministic tracking.',
    ORGANIZATIONAL_TRUTH: 'Preserve as durable organizational truth and monitor drift.'
  };
  return actions[category];
};

export const shouldPromoteToGovernanceMemory = (
  synthesis: Pick<ExecutiveSynthesisRecord, 'confidenceScore' | 'evidenceCount' | 'auditRequired' | 'category'>,
  policy: ExecutiveSynthesisPolicy
): boolean => synthesis.auditRequired || synthesis.confidenceScore >= policy.governancePromotionConfidenceThreshold || (synthesis.evidenceCount >= policy.governancePromotionMinEvidenceCount && synthesis.category === 'ORGANIZATIONAL_TRUTH');

export const consolidateDuplicateSyntheses = (syntheses: ReadonlyArray<ExecutiveSynthesisRecord>): ExecutiveSynthesisRecord[] => {
  const map = new Map<string, ExecutiveSynthesisRecord>();
  for (const synthesis of syntheses) {
    const key = `${synthesis.category}::${synthesis.sourceNutrientIds.join('|')}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, synthesis);
      continue;
    }
    map.set(key, {
      ...existing,
      updatedAt: synthesis.updatedAt > existing.updatedAt ? synthesis.updatedAt : existing.updatedAt,
      confidenceScore: Math.max(existing.confidenceScore, synthesis.confidenceScore),
      evidenceCount: existing.evidenceCount + synthesis.evidenceCount,
      executiveSummary: `${existing.executiveSummary} ${synthesis.executiveSummary}`.trim(),
      auditRequired: existing.auditRequired || synthesis.auditRequired,
      reviewRequired: existing.reviewRequired || synthesis.reviewRequired,
      promotedToGovernanceMemory: existing.promotedToGovernanceMemory || synthesis.promotedToGovernanceMemory
    });
  }
  return [...map.values()];
};

export const synthesizeExecutiveMemory = (input: ExecutiveSynthesisInput): ExecutiveSynthesisResult => {
  const promoted = input.nutrients.filter((n) => n.promoted);
  const syntheses = promoted.map((nutrient) => {
    const nutrients = [nutrient];
    const { sourceNutrientIds, sourceMemoryIds } = buildExecutiveSynthesisLineage(nutrients);
    if (sourceNutrientIds.length === 0 || sourceMemoryIds.length === 0) {
      throw new Error('No synthesis may exist without traceable evidence.');
    }
    const category = classifyExecutiveSynthesisCategory(nutrients, input.policy);
    const averageMemoryWeight = round2(nutrients.reduce((acc, n) => acc + (n.memoryWeightAverage ?? 0), 0) / nutrients.length);
    const confidenceScore = calculateExecutiveSynthesisConfidence(nutrients);
    const record: ExecutiveSynthesisRecord = {
      synthesisId: buildSynthesisId(category, sourceNutrientIds),
      category,
      sourceNutrientIds,
      sourceMemoryIds,
      createdAt: input.now,
      updatedAt: input.now,
      confidenceScore,
      evidenceCount: nutrients.reduce((acc, n) => acc + n.evidenceCount, 0),
      averageNutrientConfidence: round2(nutrients.reduce((acc, n) => acc + n.confidenceScore, 0) / nutrients.length),
      averageMemoryWeight,
      executiveSummary: generateExecutiveSummary(category, nutrients, averageMemoryWeight),
      recommendedAction: generateRecommendedAction(category),
      auditRequired: nutrients.some((n) => n.auditRequired),
      lineagePreserved: true,
      reviewRequired: category === 'CONTRADICTION_REQUIRES_REVIEW',
      promotedToGovernanceMemory: false
    };
    return { ...record, promotedToGovernanceMemory: shouldPromoteToGovernanceMemory(record, input.policy) };
  });

  const consolidated = consolidateDuplicateSyntheses(syntheses);
  return {
    syntheses: consolidated,
    promotedToGovernanceMemory: consolidated.filter((s) => s.promotedToGovernanceMemory)
  };
};
