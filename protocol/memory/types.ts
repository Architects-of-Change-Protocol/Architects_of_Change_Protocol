/**
 * Deterministic sovereign memory weighting inputs.
 *
 * Every field is intentionally bounded to numeric or boolean primitives so
 * protocol participants can independently recompute the same score.
 */
export type MemoryWeightDimensions = {
  governanceImpact: number;
  operationalRecurrence: number;
  stakeholderAuthority: number;
  legalSignificance: number;
  referenceFrequency: number;
  temporalFreshness: number;
  crossDomainLinkage: number;
  policyDependency: number;
  contradictionPresence: number;
  executionOutcomeImpact: number;
};

export type MemoryWeightPolicyThresholds = {
  archivalThreshold: number;
  compressionThreshold: number;
  purgeThreshold: number;
};

export type MemoryWeightState = {
  score: number;
  dimensions: MemoryWeightDimensions;
  referenceCount: number;
  linkedExecutiveSummaryCount: number;
  approvedDecisionCount: number;
  isTransient: boolean;
  lastAccessedAt: string;
  createdAt: string;
};

export type MemoryWeightUpdateInput = {
  dimensions?: Partial<MemoryWeightDimensions>;
  referenced?: boolean;
  linkedExecutiveSummary?: boolean;
  approvedDecision?: boolean;
  lastAccessedAt?: string;
};

export type MemoryWeightReinforcementInput = {
  additionalReferences?: number;
  additionalExecutiveSummaryLinks?: number;
  additionalApprovedDecisions?: number;
};
