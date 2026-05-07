import { createHash } from 'crypto';
import { IntegrityProof, ValidationResult } from './types';

const proofs = new Map<string, IntegrityProof>();

function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function createIntegrityProof(input: Omit<IntegrityProof, 'payloadHash' | 'generatedAt'> & { payload: unknown }): IntegrityProof {
  const proof: IntegrityProof = {
    proofId: input.proofId,
    proofType: input.proofType,
    payloadHash: hashPayload(input.payload),
    generatedAt: new Date().toISOString(),
    parentProofRef: input.parentProofRef
  };

  proofs.set(proof.proofId, proof);
  return proof;
}

export function createChainedIntegrityProof(input: Omit<IntegrityProof, 'payloadHash' | 'generatedAt' | 'proofType'> & { payload: unknown; parentProofRef: string }): IntegrityProof {
  return createIntegrityProof({ ...input, proofType: 'chained_hash' });
}

export function validateIntegrityProof(proof: IntegrityProof): ValidationResult {
  const reasons: string[] = [];
  if (!proof.proofId || !proof.payloadHash || !proof.generatedAt) reasons.push('missing_required_fields');
  if (Number.isNaN(Date.parse(proof.generatedAt))) reasons.push('invalid_generated_at');
  if (proof.proofType === 'chained_hash' && !proof.parentProofRef) reasons.push('missing_parent_proof_ref');
  if (proof.parentProofRef && !proofs.has(proof.parentProofRef)) reasons.push('parent_proof_not_found');
  return { valid: reasons.length === 0, reasons };
}

export function resolveIntegrityProof(proofId: string): IntegrityProof | undefined {
  return proofs.get(proofId);
}

export function clearIntegrityProofs(): void {
  proofs.clear();
}
