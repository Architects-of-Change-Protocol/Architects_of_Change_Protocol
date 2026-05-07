import { RuntimePolicyEnvelope } from './types';

const envelopes = new Map<string, RuntimePolicyEnvelope>();
const now = () => new Date().toISOString();

export function validateRuntimePolicyEnvelope(envelope: RuntimePolicyEnvelope): boolean {
  if (envelope.allowedPolicyRefs.some((r) => !r) || envelope.blockedPolicyRefs.some((r) => !r)) return false;
  if (envelope.blockedPolicyRefs.some((r) => envelope.allowedPolicyRefs.includes(r))) return false;
  if (envelope.requiredAttestationTypes.some((t) => !t.trim())) return false;
  return Object.values(envelope.delegationLimits).every((v) => v >= 0);
}
export function createRuntimePolicyEnvelope(input: Omit<RuntimePolicyEnvelope, 'createdAt' | 'updatedAt'>): RuntimePolicyEnvelope {
  const next = { ...input, createdAt: now(), updatedAt: now() };
  if (!validateRuntimePolicyEnvelope(next)) throw new Error('Invalid runtime policy envelope');
  envelopes.set(next.policyEnvelopeId, next); return next;
}
export function updateRuntimePolicyEnvelope(policyEnvelopeId: string, patch: Partial<RuntimePolicyEnvelope>): RuntimePolicyEnvelope {
  const current = envelopes.get(policyEnvelopeId); if (!current) throw new Error('Runtime policy envelope not found');
  const next = { ...current, ...patch, updatedAt: now() };
  if (!validateRuntimePolicyEnvelope(next)) throw new Error('Invalid runtime policy envelope');
  envelopes.set(policyEnvelopeId, next); return next;
}
