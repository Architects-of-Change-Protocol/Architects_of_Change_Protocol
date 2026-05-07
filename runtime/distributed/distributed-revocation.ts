import { resolveDistributedCapabilityReference } from './distributed-capabilities';
import { DistributedRevocationReference } from './types';

const revocations = new Map<string, DistributedRevocationReference>();

export function createDistributedRevocationReference(input: DistributedRevocationReference): DistributedRevocationReference {
  revocations.set(input.revocationId, input);
  return input;
}

export function applyDistributedRevocation(revocationId: string): DistributedRevocationReference {
  const existing = revocations.get(revocationId);
  if (!existing) throw new Error(`Unknown revocation: ${revocationId}`);
  if (!resolveDistributedCapabilityReference(existing.capabilityId)) {
    throw new Error(`Cannot propagate revocation for unknown capability: ${existing.capabilityId}`);
  }
  const next = { ...existing, propagationState: 'propagated' as const, propagatedAt: new Date().toISOString() };
  revocations.set(revocationId, next);
  return next;
}

export function resolveDistributedRevocation(revocationId: string): DistributedRevocationReference | undefined {
  return revocations.get(revocationId);
}

export function clearDistributedRevocations(): void {
  revocations.clear();
}
