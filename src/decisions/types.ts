export type PolicyDecision =
  | "allow"
  | "deny"
  | "conditional_allow"
  | "require_approval"
  | "expired"
  | "delegated"
  | "inherited"
  | "unresolved";

export type PolicyReference = {
  policyId: string;
  policyVersion?: string | null;
  ruleId?: string | null;
};

export type EvaluationSource = {
  sourceType: "policy_engine" | "delegation_engine" | "consent_engine" | "manual_review" | "system";
  sourceId?: string | null;
  sourceVersion?: string | null;
};

export type DecisionContext = {
  requestId: string;
  evaluatedAt: string;
  rationale?: string;
  conditions?: string[];
  policyReferences?: PolicyReference[];
  evaluationSources?: EvaluationSource[];
  evaluationMetadata?: Record<string, unknown>;
};
