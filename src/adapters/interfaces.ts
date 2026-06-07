import type {
  Agent,
  AgentScope,
  AuditTimelineItem,
  CapabilityGrant,
  CapabilityRequest,
  DecisionContext,
  Delegation,
  PolicyDecision,
} from '@aoc/protocol/contracts';

// Protocol boundary: implementations of these interfaces belong in Enterprise/runtime repos.
export interface PolicyDecisionAdapter {
  evaluate(request: CapabilityRequest): Promise<{ decision: PolicyDecision; context: DecisionContext }>;
}

export interface CapabilityRegistryAdapter {
  getGrant(grantId: string): Promise<CapabilityGrant | null>;
  listGrantsByWorkspace(workspaceId: string): Promise<CapabilityGrant[]>;
}

export interface DelegationStoreAdapter {
  saveDelegation(delegation: Delegation): Promise<void>;
  getDelegation(delegationId: string): Promise<Delegation | null>;
}

export interface AuditSinkAdapter {
  emit(event: AuditTimelineItem): Promise<void>;
}

export interface IdentityResolverAdapter {
  resolveUser(userId: string): Promise<{ id: string; workspaceId: string } | null>;
  resolveAgent(agentId: string): Promise<Agent | null>;
}

export interface AgentAccessEvaluatorAdapter {
  evaluateAgentScope(agent: Agent, scope: AgentScope, request: CapabilityRequest): Promise<PolicyDecision>;
}
