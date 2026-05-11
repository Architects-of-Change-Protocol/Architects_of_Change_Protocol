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
  | 'consent_reaffirmation'
  | 'machine_audit'
  | 'machine_escalation'
  | 'machine_approval'
  | 'machine_reconciliation'
  | 'machine_expiration';

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


export type MachineCapabilityEnvelope = {
  envelopeId: string;
  capabilityIds: string[];
  namespaceAllowList: string[];
  operationalCeilings: { executionCeiling: number; actionQuota: number; escalationThreshold: number };
};

export type MachineAuthorityProfile = {
  authorityId: string;
  machineActorId: string;
  issuedByActorId: string;
  capabilityAllowList: string[];
  namespaceAllowList: string[];
  trustPath: string[];
  delegationChain: string[];
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  revocationReason?: string;
};

export type AutonomousExecutionGrant = {
  grantId: string;
  authorityId: string;
  grantedToMachineActorId: string;
  grantedByActorId: string;
  scope: { capabilityIds: string[]; namespacePaths: string[] };
  issuedAt: string;
  expiresAt?: string;
  revokedAt?: string;
};

export type RuntimeMachineActor = {
  machineActorId: string;
  actorLabel: string;
  status: 'active' | 'frozen' | 'revoked';
  delegatedFromMachineActorId?: string;
  machineAncestry: string[];
  capabilityEnvelope: MachineCapabilityEnvelope;
  frozenAt?: string;
};

export type BehaviorConstraintPolicy = {
  policyId: string;
  executionCeiling: number;
  actionQuota: number;
  escalationThreshold: number;
  restrictedDomains: string[];
  approvalGateRequired: boolean;
  humanRequiredBoundary: string;
};

export type AutonomousGovernanceInput = {
  nowIso: string;
  actor: RuntimeMachineActor;
  authority: MachineAuthorityProfile;
  grant: AutonomousExecutionGrant;
  constraintPolicy: BehaviorConstraintPolicy;
  request: {
    requestId: string;
    capabilityId: string;
    namespacePath: string;
    usage: {
      executionCount: number;
      actionCount: number;
      escalationCount: number;
      hasHumanApproval: boolean;
    };
  };
  humanOverride: { active: boolean; overrideActorId?: string };
};

export type AutonomousGovernanceDecision = {
  permitted: boolean;
  deniedReasonCodes: string[];
  obligations: GovernanceObligation[];
  lineage: {
    machineActorId: string;
    authorityId: string;
    grantId: string;
    delegatedFromMachineActorId?: string;
    delegationChain: string[];
    trustPath: string[];
    capabilityProvenance: string;
    constraintPolicyId: string;
  };
  escalations: EscalationPath[];
  explainability: {
    decisionAt: string;
    appliedConstraints: Record<string, unknown>;
    authoritySource: string;
  };
};
