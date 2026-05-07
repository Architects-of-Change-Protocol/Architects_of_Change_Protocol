import { RemoteGovernanceDecision } from './types';

const decisions = new Map<string, RemoteGovernanceDecision>();

export function createRemoteGovernanceDecision(input: RemoteGovernanceDecision): RemoteGovernanceDecision {
  decisions.set(input.decisionId, input);
  return input;
}

export function validateRemoteGovernanceDecision(input: RemoteGovernanceDecision): boolean {
  if (input.sourceRuntimeId === input.targetRuntimeId) return false;
  if (!input.policyTraceRef || !input.evaluatedAt) return false;
  if (input.decision === 'conditional' && input.obligations.length === 0) return false;
  return true;
}

export function resolveRemoteGovernanceDecision(decisionId: string): RemoteGovernanceDecision | undefined {
  return decisions.get(decisionId);
}

export function clearRemoteGovernanceDecisions(): void {
  decisions.clear();
}
