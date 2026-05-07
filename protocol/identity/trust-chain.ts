import { DelegationGrant, TrustChain } from './types';

export function buildTrustChain(rootActorId: string, targetActorId: string, grants: DelegationGrant[], now: Date = new Date()): TrustChain {
  const adjacency = new Map<string, DelegationGrant[]>();
  for (const grant of grants) {
    const existing = adjacency.get(grant.delegatorActorId) ?? [];
    existing.push(grant);
    adjacency.set(grant.delegatorActorId, existing);
  }

  const queue: Array<{ actorId: string; path: TrustChain['trustPath']; actors: string[] }> = [
    { actorId: rootActorId, path: [], actors: [rootActorId] }
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.actorId === targetActorId) {
      return {
        rootActorId,
        delegatedActors: current.actors.slice(1),
        trustPath: current.path,
        chainValidity: 'valid',
        evaluatedAt: now.toISOString(),
        reasons: []
      };
    }

    if (visited.has(current.actorId)) continue;
    visited.add(current.actorId);

    const outgoing = adjacency.get(current.actorId) ?? [];
    for (const grant of outgoing) {
      queue.push({
        actorId: grant.delegateActorId,
        path: [...current.path, { fromActorId: grant.delegatorActorId, toActorId: grant.delegateActorId, grantId: grant.grantId }],
        actors: [...current.actors, grant.delegateActorId]
      });
    }
  }

  return {
    rootActorId,
    delegatedActors: [],
    trustPath: [],
    chainValidity: 'invalid',
    evaluatedAt: now.toISOString(),
    reasons: ['NO_TRUST_PATH']
  };
}

export function validateTrustChain(chain: TrustChain, maxDepth: number): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (chain.chainValidity !== 'valid') reasons.push('CHAIN_MARKED_INVALID');
  if (chain.trustPath.length === 0) reasons.push('EMPTY_TRUST_PATH');
  if (chain.trustPath.length > maxDepth) reasons.push('MAX_DELEGATION_DEPTH_EXCEEDED');

  for (let i = 1; i < chain.trustPath.length; i++) {
    if (chain.trustPath[i - 1].toActorId !== chain.trustPath[i].fromActorId) {
      reasons.push('BROKEN_TRUST_LINK');
      break;
    }
  }

  return { valid: reasons.length === 0, reasons };
}
