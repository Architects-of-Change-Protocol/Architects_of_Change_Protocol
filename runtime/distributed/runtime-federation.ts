import { resolveTrustDomain } from './trust-domain';
import { FederationCompatibilityResult, RuntimeFederation } from './types';

const federations = new Map<string, RuntimeFederation>();

export function validateFederationCompatibility(input: Omit<RuntimeFederation, 'establishedAt'>): FederationCompatibilityResult {
  const reasons: string[] = [];
  const source = resolveTrustDomain(input.sourceDomainId);
  const target = resolveTrustDomain(input.targetDomainId);

  if (!source || !target) reasons.push('Both source and target trust domains must exist.');
  if (source?.suspendedAt || target?.suspendedAt) reasons.push('Suspended trust domains cannot federate.');
  if (source && !source.allowedFederationModes.includes(input.federationMode)) reasons.push('Source domain does not allow this federation mode.');
  if (target && !target.allowedFederationModes.includes(input.federationMode)) reasons.push('Target domain does not allow this federation mode.');
  if (source?.trustLevel === 'strict' && input.federationMode === 'reciprocal') reasons.push('Strict trust domains cannot use reciprocal federation.');
  if (input.federationMode === 'audit_only' && input.allowedCapabilities.length > 0) reasons.push('Audit-only federation cannot transfer capabilities.');
  if (input.federationMode === 'isolated' && input.delegationPolicies.length > 0) reasons.push('Isolated federation cannot allow delegation.');

  return { compatible: reasons.length === 0, reasons };
}

export function establishRuntimeFederation(
  federation: Omit<RuntimeFederation, 'establishedAt' | 'suspendedAt' | 'revokedAt'>,
  establishedAt = new Date().toISOString(),
): RuntimeFederation {
  const candidate: RuntimeFederation = { ...federation, establishedAt };
  const result = validateFederationCompatibility(candidate);
  if (!result.compatible) throw new Error(`Federation incompatible: ${result.reasons.join(' ')}`);
  federations.set(candidate.federationId, candidate);
  return candidate;
}

export function suspendRuntimeFederation(federationId: string, suspendedAt = new Date().toISOString()): RuntimeFederation {
  const existing = federations.get(federationId);
  if (!existing) throw new Error(`Unknown federation: ${federationId}`);
  const next = { ...existing, suspendedAt };
  federations.set(federationId, next);
  return next;
}

export function revokeRuntimeFederation(federationId: string, revokedAt = new Date().toISOString()): RuntimeFederation {
  const existing = federations.get(federationId);
  if (!existing) throw new Error(`Unknown federation: ${federationId}`);
  const next = { ...existing, revokedAt };
  federations.set(federationId, next);
  return next;
}

export function resolveRuntimeFederation(federationId: string): RuntimeFederation | undefined {
  return federations.get(federationId);
}

export function clearRuntimeFederations(): void {
  federations.clear();
}
