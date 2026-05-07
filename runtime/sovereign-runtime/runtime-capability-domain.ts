import { RuntimeCapabilityDomain } from './types';

const domains = new Map<string, RuntimeCapabilityDomain>();
export function validateRuntimeCapabilityDomain(d: RuntimeCapabilityDomain): boolean {
  if (d.maxCapabilityTTLSeconds <= 0) return false;
  if (d.blockedCapabilityTypes.some((c) => d.allowedCapabilityTypes.includes(c))) return false;
  if (d.revocationMode === 'remote_required' && !d.remoteValidationRequired) return false;
  return true;
}
export function createRuntimeCapabilityDomain(input: RuntimeCapabilityDomain): RuntimeCapabilityDomain { if (!validateRuntimeCapabilityDomain(input)) throw new Error('Invalid runtime capability domain'); domains.set(input.capabilityDomainId,input); return input; }
export function evaluateCapabilityDomainCompatibility(domain: RuntimeCapabilityDomain, request: { capabilityType: string; ttlSeconds: number; requiresRemoteValidation: boolean; revocationMode: RuntimeCapabilityDomain['revocationMode']; }): boolean {
  if (domain.blockedCapabilityTypes.includes(request.capabilityType)) return false;
  if (!domain.allowedCapabilityTypes.includes(request.capabilityType)) return false;
  if (request.ttlSeconds > domain.maxCapabilityTTLSeconds) return false;
  if (domain.remoteValidationRequired && !request.requiresRemoteValidation) return false;
  return domain.revocationMode === request.revocationMode || domain.revocationMode === 'federated';
}
