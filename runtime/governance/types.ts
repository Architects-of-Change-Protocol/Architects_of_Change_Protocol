export type GovernanceRuntimeState =
  | 'pending'
  | 'evaluating'
  | 'approved'
  | 'denied'
  | 'escalated'
  | 'awaiting_human_review'
  | 'completed'
  | 'failed';

export type GovernanceObligationType =
  | 'purpose_assertion'
  | 'frequency_enforcement'
  | 'ai_escalation'
  | 'human_review'
  | 'relationship_validation'
  | 'consent_reaffirmation';

export type GovernanceObligationStatus = 'pending' | 'completed' | 'failed';

export type GovernanceObligation = {
  obligationId: string;
  obligationType: GovernanceObligationType;
  status: GovernanceObligationStatus;
  issuedAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EscalationType =
  | 'ai_governance_restriction'
  | 'blocked_scope'
  | 'sensitive_action'
  | 'delegation_depth_violation'
  | 'human_review_required';

export type EscalationStatus = 'active' | 'resolved';

export type EscalationPath = {
  escalationId: string;
  escalationType: EscalationType;
  triggeredBy: string;
  targetActorId: string;
  reasonCodes: string[];
  status: EscalationStatus;
  createdAt: string;
  resolvedAt?: string;
};

export type HumanReviewStatus = 'pending' | 'approved' | 'denied';

export type HumanReviewRequest = {
  reviewId: string;
  actorId: string;
  requestedAction: string;
  requestedScopes: string[];
  reasonCodes: string[];
  escalationRef?: string;
  reviewStatus: HumanReviewStatus;
};

export type GovernanceSession = {
  sessionId: string;
  actorId: string;
  relationshipId: string;
  policyTraceId: string;
  startedAt: string;
  completedAt?: string;
  runtimeState: GovernanceRuntimeState;
  obligations: GovernanceObligation[];
  escalationRefs: string[];
  auditRefs: string[];
};

export type AuditHook = (eventType: string, payload: Record<string, unknown>) => void;

export type RelationshipValidationHook = (actorId: string, relationshipId: string) => { valid: boolean; reasonCodes?: string[] };

export type AiGovernanceFlags = {
  requiresEscalation?: boolean;
  requiresHumanReview?: boolean;
  reasonCodes?: string[];
};
