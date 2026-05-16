export type GovernanceExecutionPlanStatus =
  | 'planned'
  | 'authorized'
  | 'pending'
  | 'running'
  | 'executing'
  | 'checkpointed'
  | 'suspended'
  | 'resumed'
  | 'replayed'
  | 'paused'
  | 'waiting_remote_runtime'
  | 'waiting_human_review'
  | 'failed'
  | 'completed'
  | 'revoked'
  | 'cancelled'
  | 'invalid';

export type GovernanceExecutionStepType =
  | 'evaluate_policy'
  | 'validate_identity'
  | 'validate_relationship'
  | 'issue_capability'
  | 'evaluate_capability_use'
  | 'execute_obligation'
  | 'request_human_review'
  | 'await_remote_decision'
  | 'emit_attestation'
  | 'propagate_revocation';

export type GovernanceExecutionStepStatus = 'planned' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';

export type ExecutionLeaseStatus = 'active' | 'expired' | 'released' | 'revoked';

export type ExecutionContinuationType =
  | 'remote_governance'
  | 'remote_human_review'
  | 'remote_capability_validation'
  | 'remote_revocation_propagation'
  | 'remote_audit_resolution';

export type ExecutionContinuationStatus = 'pending' | 'resolved' | 'failed' | 'cancelled';

export type RetryRecommendation =
  | 'retry_same_runtime'
  | 'retry_remote_runtime'
  | 'require_human_review'
  | 'abort_execution'
  | 'wait_for_revocation_ack';

export interface GovernanceExecutionStep {
  stepId: string;
  stepType: GovernanceExecutionStepType;
  runtimeId: string;
  status: GovernanceExecutionStepStatus;
  dependsOn: string[];
  obligationRefs: string[];
  attestationRefs: string[];
  optional?: boolean;
  requiresAttestation?: boolean;
  startedAt?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface GovernanceExecutionPlan {
  executionPlanId: string;
  governanceSessionId: string;
  sourceRuntimeId: string;
  targetRuntimeIds: string[];
  relationshipId: string;
  capabilityRefs: string[];
  requiredObligations: string[];
  executionSteps: GovernanceExecutionStep[];
  status: GovernanceExecutionPlanStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ExecutionLease {
  leaseId: string;
  executionPlanId: string;
  runtimeId: string;
  holderActorId: string;
  issuedAt: string;
  expiresAt: string;
  status: ExecutionLeaseStatus;
}

export interface ExecutionContinuation {
  continuationId: string;
  executionPlanId: string;
  sourceRuntimeId: string;
  targetRuntimeId: string;
  continuationType: ExecutionContinuationType;
  statePayloadRef: string;
  requiredAttestationRefs: string[];
  createdAt: string;
  resolvedAt?: string;
  status: ExecutionContinuationStatus;
}

export interface ExecutionFailure {
  failureId: string;
  executionPlanId: string;
  stepId: string;
  runtimeId: string;
  reasonCode: string;
  retryable: boolean;
  occurredAt: string;
  resolvedAt?: string;
}

export interface ExecutionAttestationRef {
  executionPlanId: string;
  stepId: string;
  attestationRef: string;
  attachedAt: string;
}

export interface GovernanceRuntimeAdapter {
  beginGovernanceStep(step: GovernanceExecutionStep): void;
  completeGovernanceStep(step: GovernanceExecutionStep): void;
}

export interface CapabilityRuntimeAdapter {
  validateCapabilityRef(capabilityRef: string): boolean;
}

export interface DistributedGovernanceAdapter {
  notifyContinuation(continuation: ExecutionContinuation): void;
}

export interface AuditPlaneAdapter {
  recordExecutionEvent(eventType: string, payload: Record<string, unknown>): void;
}

export interface AttestationLayerAdapter {
  validateAttestationRef(attestationRef: string): boolean;
}

export interface HumanReviewAdapter {
  requestHumanReview(executionPlanId: string, stepId: string): string;
}

export interface AIGovernanceFlags {
  requiresEscalation?: boolean;
  requiresHumanReview?: boolean;
  reasonCodes?: string[];
}

export interface ExecutionFabricAdapters {
  governanceRuntime?: GovernanceRuntimeAdapter;
  capabilityRuntime?: CapabilityRuntimeAdapter;
  distributedGovernance?: DistributedGovernanceAdapter;
  auditPlane?: AuditPlaneAdapter;
  attestationLayer?: AttestationLayerAdapter;
  humanReview?: HumanReviewAdapter;
  aiGovernanceFlags?: AIGovernanceFlags;
}


export type ExecutionCategory =
  | 'authorization'
  | 'payout'
  | 'access'
  | 'governance'
  | 'runtime'
  | 'orchestration'
  | 'transport'
  | 'policy'
  | 'capability'
  | 'agent'
  | 'workflow'
  | 'sdk'
  | 'tenant';

export interface ExecutionCheckpointRecord {
  executionPlanId: string;
  checkpointId: string;
  stage: string;
  sequence: number;
  deterministicHash: string;
  createdAt: string;
}

export interface ExecutionReplayRecord {
  executionPlanId: string;
  replayId: string;
  replayedFromPlanId: string;
  checkpointId?: string;
  reasonCode: string;
  requestedBy: string;
  createdAt: string;
}

export interface ExecutionAttestationRecord {
  executionPlanId: string;
  attestationId: string;
  decision: 'execution_authorized' | 'execution_completed' | 'execution_failed' | 'execution_replayed' | 'execution_revoked' | 'execution_suspended' | 'execution_resumed';
  reasonCodes: string[];
  visibilityTier: 'internal' | 'audit-safe' | 'sdk-safe' | 'operator' | 'user-facing';
  createdAt: string;
}
