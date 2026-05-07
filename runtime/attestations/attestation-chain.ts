import { resolveGovernanceAttestation, validateGovernanceAttestation } from './governance-attestation';
import { GovernanceAttestation, ValidationResult } from './types';

const chains = new Map<string, GovernanceAttestation[]>();

export function appendAttestationChain(chainId: string, attestation: GovernanceAttestation): GovernanceAttestation[] {
  const chain = chains.get(chainId) ?? [];
  chains.set(chainId, [...chain, attestation]);
  return chains.get(chainId)!;
}

export function validateAttestationChain(chainId: string): ValidationResult {
  const chain = chains.get(chainId) ?? [];
  const reasons: string[] = [];
  for (let i = 0; i < chain.length; i += 1) {
    const current = chain[i];
    const result = validateGovernanceAttestation(current);
    if (!result.valid) reasons.push(...result.reasons.map((r) => `${current.attestationId}:${r}`));

    if (i > 0) {
      const previous = chain[i - 1];
      if (current.previousAttestationRef !== previous.attestationId) reasons.push(`${current.attestationId}:chain_continuity_broken`);
      if (Date.parse(current.issuedAt) < Date.parse(previous.issuedAt)) reasons.push(`${current.attestationId}:chain_timestamp_regression`);
    }
  }

  return { valid: reasons.length === 0, reasons };
}

export function resolveAttestationChain(chainId: string): GovernanceAttestation[] {
  return chains.get(chainId) ?? [];
}

export function reconstructAttestationChainFromTail(tailAttestationId: string): GovernanceAttestation[] {
  const reconstructed: GovernanceAttestation[] = [];
  let cursor = resolveGovernanceAttestation(tailAttestationId);
  while (cursor) {
    reconstructed.unshift(cursor);
    cursor = cursor.previousAttestationRef ? resolveGovernanceAttestation(cursor.previousAttestationRef) : undefined;
  }
  return reconstructed;
}

export function clearAttestationChains(): void {
  chains.clear();
}
