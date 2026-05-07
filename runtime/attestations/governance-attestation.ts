import { resolveIntegrityProof } from './integrity-proof';
import { GovernanceAttestation, ValidationResult } from './types';

const governanceAttestations = new Map<string, GovernanceAttestation>();

type IntegrationHook = (attestation: GovernanceAttestation) => void;
const hooks: Record<string, IntegrationHook[]> = {
  governance_session_completion: [],
  capability_issuance: [],
  capability_use: [],
  delegation_validation: [],
  ai_execution: [],
  remote_governance_decision: []
};

export function registerAttestationIntegrationHook(event: keyof typeof hooks, hook: IntegrationHook): void {
  hooks[event].push(hook);
}

export function emitAttestationIntegrationEvent(event: keyof typeof hooks, attestation: GovernanceAttestation): void {
  hooks[event].forEach((hook) => hook(attestation));
}

export function createGovernanceAttestation(input: GovernanceAttestation): GovernanceAttestation {
  governanceAttestations.set(input.attestationId, input);
  return input;
}

export function validateGovernanceAttestation(input: GovernanceAttestation): ValidationResult {
  const reasons: string[] = [];
  if (!input.attestationId || !input.actorId || !input.integrityProofRef) reasons.push('missing_required_fields');
  if (!input.governanceSessionId || !input.policyTraceId || !input.relationshipId) reasons.push('missing_required_refs');
  if (input.capabilityRefs.some((ref) => !ref)) reasons.push('invalid_capability_ref');
  if (Number.isNaN(Date.parse(input.issuedAt))) reasons.push('invalid_issued_at');
  if (!resolveIntegrityProof(input.integrityProofRef)) reasons.push('integrity_proof_not_found');

  if (input.previousAttestationRef) {
    const previous = governanceAttestations.get(input.previousAttestationRef);
    if (!previous) {
      reasons.push('previous_attestation_not_found');
    } else if (Date.parse(previous.issuedAt) > Date.parse(input.issuedAt)) {
      reasons.push('previous_attestation_after_current');
    }
  }

  return { valid: reasons.length === 0, reasons };
}

export function resolveGovernanceAttestation(attestationId: string): GovernanceAttestation | undefined {
  return governanceAttestations.get(attestationId);
}

export function clearGovernanceAttestations(): void {
  governanceAttestations.clear();
}
