export type PolicyId = string;
export type PolicyVersion = string;

export type PolicyCategory =
  | 'consent'
  | 'capability'
  | 'trust'
  | 'identity'
  | 'tenant'
  | 'runtime'
  | 'metering'
  | 'payout'
  | 'data-access'
  | 'agent'
  | 'governance';

export type PolicyScope = 'global' | 'tenant' | 'subject' | 'resource' | 'session' | 'operation';
export type PolicyEffect = 'allow' | 'deny' | 'abstain';
export type PolicyOutcome = 'allowed' | 'denied' | 'conditional' | 'indeterminate';
export type PolicyTraceVisibility = 'internal' | 'audit-safe' | 'sdk-safe' | 'user-facing';

export type PolicySubject = { id: string; tenantId?: string; attributes?: Record<string, unknown> };
export type PolicyRequester = { id: string; kind?: string; tenantId?: string; attributes?: Record<string, unknown> };
export type PolicyResource = { id: string; kind: string; tenantId?: string; attributes?: Record<string, unknown> };
export type PolicyAction = { verb: string; protectedOperation?: boolean };

export type PolicyCondition = {
  id: string;
  description?: string;
  evaluate: (context: PolicyEvaluationContext) => boolean;
};

export type PolicyObligation = { id: string; category: PolicyCategory; description?: string; payload?: Record<string, unknown> };

export type PolicyRule = {
  id: string;
  category: PolicyCategory;
  effect: PolicyEffect;
  priority?: number;
  conditions?: PolicyCondition[];
  obligations?: PolicyObligation[];
  reasonCode: string;
  description?: string;
};

export type PolicySet = {
  id: PolicyId;
  version: PolicyVersion;
  scope: PolicyScope;
  categories: PolicyCategory[];
  rules: PolicyRule[];
};

export type PolicyConflict = {
  conflictType: 'allow_vs_deny' | 'indeterminate_condition' | 'required_category_unmet';
  category?: PolicyCategory;
  ruleIds: string[];
  reason: string;
};

export type PolicyEvaluationContext = {
  subject: PolicySubject;
  requester: PolicyRequester;
  resource: PolicyResource;
  action: PolicyAction;
  now: Date;
  requiresConsent?: boolean;
  requiresTrust?: boolean;
  requiredCategories?: PolicyCategory[];
  attributes?: Record<string, unknown>;
};

export type PolicyRuleEvaluation = {
  ruleId: string;
  category: PolicyCategory;
  effect: PolicyEffect;
  matched: boolean;
  reasonCode: string;
};

export type PolicyDecision = {
  outcome: PolicyOutcome;
  effect: PolicyEffect;
  reasonCode: string;
  obligations: PolicyObligation[];
  conflicts: PolicyConflict[];
  evaluatedCategories: PolicyCategory[];
};

export type PolicyEvaluationTrace = {
  traceId: string;
  evaluatedRules: string[];
  matchedRules: string[];
  skippedRules: string[];
  conditionsEvaluated: Array<{ ruleId: string; conditionId: string; passed: boolean }>;
  obligations: string[];
  conflicts: PolicyConflict[];
  finalDecision: PolicyOutcome;
  decisionReason: string;
  evaluatedAt: string;
  visibility: PolicyTraceVisibility;
};
