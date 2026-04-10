import { computeCapabilityDeterministicHash, parseCapability } from './capability-object';
import type { CapabilityVerificationResult, ProtocolCapability } from './capability-types';

function verifyTemporal(capability: ProtocolCapability): string[] {
  const errors: string[] = [];

  if (capability.expires_at <= capability.issued_at) {
    errors.push('Capability expires_at must be strictly greater than issued_at.');
  }

  if (capability.not_before !== undefined && capability.not_before < capability.issued_at) {
    errors.push('Capability not_before cannot be earlier than issued_at.');
  }

  if (capability.not_before !== undefined && capability.not_before >= capability.expires_at) {
    errors.push('Capability not_before must be earlier than expires_at.');
  }

  return errors;
}

export function verifyCapability(input: unknown): CapabilityVerificationResult {
  let capability: ProtocolCapability;

  try {
    capability = parseCapability(input);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Capability parse failed.'],
    };
  }

  const errors = verifyTemporal(capability);
  const expectedHash = computeCapabilityDeterministicHash({
    parent_consent_hash: capability.parent_consent_hash,
    subject: capability.subject,
    grantee: capability.grantee,
    scope: capability.scope,
    permissions: capability.permissions,
    issued_at: capability.issued_at,
    expires_at: capability.expires_at,
    ...(capability.not_before !== undefined ? { not_before: capability.not_before } : {}),
    ...(capability.marketMakerId !== undefined ? { marketMakerId: capability.marketMakerId } : {}),
  });

  if (expectedHash !== capability.capability_hash) {
    errors.push('Capability hash integrity mismatch.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    normalized: capability,
  };
}
