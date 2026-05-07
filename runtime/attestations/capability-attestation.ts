import { resolveGovernanceAttestation } from './governance-attestation';
import { CapabilityAttestation, ValidationResult } from './types';

const capabilityAttestations = new Map<string, CapabilityAttestation>();

export function createCapabilityAttestation(input: CapabilityAttestation): CapabilityAttestation {
  capabilityAttestations.set(input.capabilityId, input);
  return input;
}

export function validateCapabilityAttestation(input: CapabilityAttestation): ValidationResult {
  const reasons: string[] = [];
  if (!input.capabilityId || !input.issuingRuntimeId || !input.governanceAttestationRef) reasons.push('missing_required_fields');
  if (!resolveGovernanceAttestation(input.governanceAttestationRef)) reasons.push('governance_attestation_not_found');

  const { notBefore, notAfter } = input.validityWindow;
  if (Number.isNaN(Date.parse(notBefore)) || Number.isNaN(Date.parse(notAfter))) reasons.push('invalid_validity_window');
  if (Date.parse(notBefore) > Date.parse(notAfter)) reasons.push('validity_window_inverted');

  return { valid: reasons.length === 0, reasons };
}

export function resolveCapabilityAttestation(capabilityId: string): CapabilityAttestation | undefined {
  return capabilityAttestations.get(capabilityId);
}
