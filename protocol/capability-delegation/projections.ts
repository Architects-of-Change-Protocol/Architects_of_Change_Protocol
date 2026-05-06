import type { CapabilityToken } from './types';

export interface DelegationConsoleRow {
  actor: string;
  capabilityId: string;
  receiver: string;
  scopedAccess: string[];
  expiresAt: string;
  revocable: boolean;
  runtimeTrust: string;
}

export interface AgentGovernanceSignal {
  agentId: string;
  delegatedCapabilities: number;
  trustState: string;
  signedRuntimeVerification: boolean;
  autonomousRevocations: boolean;
  policyDriftDetected: boolean;
  runtimeAttestation: 'passed' | 'warning';
}

export const toDelegationConsoleRows = (tokens: CapabilityToken[]): DelegationConsoleRow[] =>
  tokens.map((token) => ({
    actor: token.delegatedBy,
    capabilityId: token.capabilityId,
    receiver: token.delegatedTo,
    scopedAccess: token.scopes.map((scope) => scope.key),
    expiresAt: token.window.expiresAt,
    revocable: token.runtimeStatus !== 'revoked',
    runtimeTrust: token.trustState
  }));

export const toAgentGovernanceSignals = (tokens: CapabilityToken[]): AgentGovernanceSignal[] => {
  const byAgent = new Map<string, CapabilityToken[]>();

  tokens.forEach((token) => {
    const next = byAgent.get(token.delegatedTo) ?? [];
    next.push(token);
    byAgent.set(token.delegatedTo, next);
  });

  return Array.from(byAgent.entries()).map(([agentId, delegated]) => ({
    agentId,
    delegatedCapabilities: delegated.length,
    trustState: delegated.some((capability) => capability.trustState === 'degraded') ? 'degraded' : 'trusted',
    signedRuntimeVerification: delegated.every((capability) => capability.signedRuntimeVerification),
    autonomousRevocations: delegated.some((capability) => capability.autonomousRevocationEnabled),
    policyDriftDetected: delegated.some((capability) => capability.runtimeStatus === 'suspended'),
    runtimeAttestation: delegated.every((capability) => capability.trustState === 'verified' || capability.trustState === 'attested') ? 'passed' : 'warning'
  }));
};
