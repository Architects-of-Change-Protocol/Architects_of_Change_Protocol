/**
 * Compatibility contracts promoted from legacy Protocol surfaces.
 *
 * These declarations intentionally preserve their existing structural shapes so
 * consumers can migrate by changing import paths only. They contain no runtime
 * implementation.
 */

export type WorkspaceId = string;
export type ProjectId = string;

export type CapabilityPermission =
  | 'resource:read'
  | 'resource:create'
  | 'resource:update'
  | 'resource:delete'
  | 'resource:execute'
  | 'governance:approve'
  | 'governance:manage'
  | 'identity:delegate'
  | 'workspace:manage'
  | 'project:manage'
  | 'membership:manage'
  | 'billing:manage'
  | 'agent:manage'
  | 'agent:execute'
  | 'document:upload'
  | 'memory:read'
  | 'memory:write'
  | 'memory:delete'
  | 'audit:read'
  | 'audit:export';

export type CapabilityResourceType =
  | 'workspace'
  | 'project'
  | 'document'
  | 'dataset'
  | 'policy'
  | 'consent'
  | 'delegation'
  | 'audit_log'
  | 'agent'
  | 'memory'
  | 'execution'
  | 'integration';

export type CapabilityRequestStatus = 'pending' | 'approved' | 'denied' | 'revoked' | 'expired' | 'consumed';
export type CapabilityGrantStatus = 'active' | 'revoked' | 'expired' | 'consumed';

export interface CapabilityRequest {
  id: string;
  workspaceId: WorkspaceId;
  resourceType: CapabilityResourceType;
  resourceId: string;
  permission: CapabilityPermission;
  status: CapabilityRequestStatus;
  requesterPrincipalId: string;
  justification: string | null;
  createdAt: string;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type PolicyEffect = 'allow' | 'deny' | 'require_approval' | 'conditional_allow';

export interface Policy {
  id: string;
  workspaceId: WorkspaceId;
  name: string;
  description: string | null;
  resourceType: CapabilityResourceType;
  permission: CapabilityPermission;
  effect: PolicyEffect;
  enabled: boolean;
  priority: number;
  conditions: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export type PrincipalType = 'human' | 'agent' | 'service';
export type DelegationStatus = 'active' | 'expired' | 'revoked' | 'consumed';

export interface DelegationPrincipal {
  principalType: PrincipalType;
  principalId: string;
}

export interface DelegationLineage {
  rootDelegationId: string;
  parentDelegationId: string | null;
  ancestorDelegationIds: string[];
  depth: number;
}

export interface DelegationRevocation {
  revokedAt: string;
  revokedByPrincipalId: string;
  reason?: string | null;
  propagationMode?: 'none' | 'downstream' | 'chain';
  propagatedFromDelegationId?: string | null;
}

export type AgentId = string;
export type AgentRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Agent {
  id: AgentId;
  workspaceId: WorkspaceId;
  name: string;
  status: 'active' | 'disabled' | 'revoked';
  agentType: 'autonomous' | 'assistive' | 'system' | 'external';
  riskLevel: AgentRiskLevel;
  parentAgentId?: AgentId | null;
  delegationAuthority?: 'none' | 'limited' | 'full';
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
}

export type ActorId = AgentId;
export type ActorType = Agent['agentType'] | 'human' | 'service';
export type ActorMetadata = Readonly<Record<string, unknown>>;

export interface ActorReference {
  readonly actorId: ActorId;
  readonly actorType: ActorType;
}

export interface ActorContext {
  readonly actor: ActorReference;
  readonly workspaceId?: WorkspaceId;
  readonly correlationId?: string;
  readonly metadata?: ActorMetadata;
}

export interface ActorCapability {
  readonly resourceType: CapabilityResourceType;
  readonly resourceId: string;
  readonly permission: CapabilityPermission;
}

export interface ActorScope extends ActorCapability {
  readonly constraints?: Readonly<Record<string, unknown>>;
}

export interface Actor extends ActorReference {
  readonly name?: string;
  readonly status?: 'active' | 'disabled' | 'revoked';
  readonly metadata?: ActorMetadata;
}

export type AuditEventCategory =
  | 'capability'
  | 'delegation'
  | 'policy'
  | 'consent'
  | 'agent'
  | 'authorization'
  | 'audit'
  | 'identity';
export type AuditSeverity = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical';
export type AuditEventType =
  | 'capability.requested'
  | 'capability.granted'
  | 'capability.revoked'
  | 'delegation.created'
  | 'delegation.revoked'
  | 'policy.evaluated'
  | 'consent.updated'
  | 'agent.action'
  | 'authorization.failed'
  | 'audit.exported'
  | 'scope.violation';

export interface AuditActor {
  principalId: string;
  principalType: 'human' | 'agent' | 'service' | 'system';
}

export interface AuditSubject {
  subjectType: string;
  subjectId: string;
}

export interface AuditTimelineItem {
  id?: string;
  createdAt: string;
  eventType: AuditEventType;
  category: AuditEventCategory;
  severity: AuditSeverity;
  workspaceId?: string | null;
  actor?: AuditActor | null;
  subject?: AuditSubject | null;
  details?: Record<string, unknown> | null;
  correlationId?: string | null;
  [key: string]: unknown;
}

export type ConsentStatus = 'active' | 'revoked' | 'expired' | 'superseded';

export interface PolicyReference {
  policyId: string;
  policyVersion?: string | null;
  ruleId?: string | null;
}

export interface EvaluationSource {
  sourceType: 'policy_engine' | 'delegation_engine' | 'consent_engine' | 'manual_review' | 'system';
  sourceId?: string | null;
  sourceVersion?: string | null;
}

export interface DecisionContext {
  requestId: string;
  evaluatedAt: string;
  rationale?: string;
  policyReferences?: PolicyReference[];
  sources?: EvaluationSource[];
  metadata?: Record<string, unknown>;
}
