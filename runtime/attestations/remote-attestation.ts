import { RemoteGovernanceAttestation, RemoteGovernanceValidationOptions, ValidationResult } from './types';

const remoteAttestations = new Map<string, RemoteGovernanceAttestation>();

function attestationKey(input: RemoteGovernanceAttestation): string {
  return `${input.sourceRuntimeId}::${input.targetRuntimeId}::${input.remoteDecisionRef}`;
}

export function createRemoteGovernanceAttestation(input: RemoteGovernanceAttestation): RemoteGovernanceAttestation {
  remoteAttestations.set(attestationKey(input), input);
  return input;
}

export function validateRemoteGovernanceAttestation(
  input: RemoteGovernanceAttestation,
  options: RemoteGovernanceValidationOptions = {}
): ValidationResult {
  const reasons: string[] = [];
  if (!input.federationRef || !input.remoteDecisionRef) reasons.push('missing_required_fields');
  if (input.sourceRuntimeId === input.targetRuntimeId) reasons.push('trust_domain_boundary_violated');
  if (input.remoteAuditRefs.length === 0) reasons.push('missing_remote_audit_refs');

  if (options.allowedFederationRefs && !options.allowedFederationRefs.includes(input.federationRef)) {
    reasons.push('federation_incompatible');
  }

  if (options.allowedTrustDomainPairs) {
    const compatible = options.allowedTrustDomainPairs.some(
      (pair) => pair.sourceRuntimeId === input.sourceRuntimeId && pair.targetRuntimeId === input.targetRuntimeId
    );
    if (!compatible) reasons.push('trust_domain_pair_incompatible');
  }

  return { valid: reasons.length === 0, reasons };
}

export function resolveRemoteGovernanceAttestation(
  sourceRuntimeId: string,
  targetRuntimeId: string,
  remoteDecisionRef: string
): RemoteGovernanceAttestation | undefined {
  return remoteAttestations.get(`${sourceRuntimeId}::${targetRuntimeId}::${remoteDecisionRef}`);
}
