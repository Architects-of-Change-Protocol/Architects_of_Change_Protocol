import type { GovernanceSession } from '../governance/types';

export type RuntimeCapabilityStatus = 'issued' | 'active' | 'suspended' | 'revoked' | 'expired';

export type AiCapabilityBoundary = {
  aiActorId?: string;
  allowedPurposes?: string[];
  blockedScopes?: string[];
  requiresHumanReview?: boolean;
  maxAutonomousUses?: number;
  autonomousUseCount?: number;
};

export type RuntimeCapability = {
  capabilityId: string;
  subjectActorId: string;
  granteeActorId: string;
  relationshipId: string;
  policyTraceId: string;
  governanceSessionId: string;
  scope: string[];
  allowedActions: string[];
  issuedAt: string;
  notBefore?: string;
  expiresAt?: string;
  revokedAt?: string;
  status: RuntimeCapabilityStatus;
  aiBoundary?: AiCapabilityBoundary;
};

export type CapabilitySessionDecision = 'allow' | 'deny';

export type CapabilitySession = {
  sessionId: string;
  capabilityId: string;
  actorId: string;
  action: string;
  resourceId: string;
  startedAt: string;
  completedAt?: string;
  decision?: CapabilitySessionDecision;
  auditRefs: string[];
  purpose?: string;
  requiresHumanReview?: boolean;
};

export type CapabilityRevocation = {
  revocationId: string;
  capabilityId: string;
  revokedByActorId: string;
  reasonCodes: string[];
  revokedAt: string;
};

export type PdpCapabilityAdapter = (input: {
  capability: RuntimeCapability;
  actorId: string;
  action: string;
  resourceId: string;
  purpose?: string;
}) => { allow: boolean; reasonCodes?: string[] };

export type CapabilityUseDecision = {
  decision: CapabilitySessionDecision;
  reasonCodes: string[];
  capabilityStatus: RuntimeCapabilityStatus;
  policyTraceId?: string;
  requiresHumanReview?: boolean;
};

export type CapabilityAuditEventType =
  | 'capability_issued'
  | 'capability_activated'
  | 'capability_suspended'
  | 'capability_revoked'
  | 'capability_expired'
  | 'capability_use_evaluated'
  | 'capability_denied';

export type CapabilityAuditHook = (eventType: CapabilityAuditEventType, payload: Record<string, unknown>) => void;

export type GovernanceIssuanceInput = {
  capabilityId: string;
  subjectActorId: string;
  granteeActorId: string;
  allowedActions: string[];
  scope: string[];
  governanceSession: GovernanceSession;
  notBefore?: string;
  expiresAt?: string;
  aiBoundary?: AiCapabilityBoundary;
};
