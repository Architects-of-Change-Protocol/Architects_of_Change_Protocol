export * from './types';
export * from './runtime-identity';
export * from './runtime-policy-envelope';
export * from './runtime-trust-posture';
export * from './runtime-capability-domain';
export * from './runtime-isolation';
export * from './runtime-ai-governance';

import { RuntimeCapabilityDomain, RuntimeIsolationProfile, RuntimePolicyEnvelope, RuntimeTrustPosture, SovereignRuntime } from './types';
import { canRuntimeFederate } from './runtime-identity';
import { evaluateCapabilityDomainCompatibility } from './runtime-capability-domain';
import { evaluateRuntimeIsolationCompatibility } from './runtime-isolation';
import { evaluateRuntimeTrustEligibility } from './runtime-trust-posture';

export function isTrustDomainCompatible(source: SovereignRuntime, target: SovereignRuntime): boolean { return source.trustDomainId === target.trustDomainId || source.runtimeStatus === 'active'; }
export function isRuntimeFederationCompatible(source: SovereignRuntime, target: SovereignRuntime, profile?: RuntimeIsolationProfile): boolean {
  if (!canRuntimeFederate(source.runtimeId) || !canRuntimeFederate(target.runtimeId)) return false;
  if (!profile) return true;
  return evaluateRuntimeIsolationCompatibility(profile, target.runtimeType, 'limited');
}
export function isExecutionFabricRuntimeEligible(runtime: SovereignRuntime, trust?: RuntimeTrustPosture): boolean { return runtime.runtimeStatus === 'active' && (!trust || evaluateRuntimeTrustEligibility(trust)); }
export function evaluateRuntimeAttestationRequirements(envelope: RuntimePolicyEnvelope): string[] { return envelope.requiredAttestationTypes; }
export function requiresRemoteCapabilityValidation(domain: RuntimeCapabilityDomain, capabilityType: string): boolean {
  return evaluateCapabilityDomainCompatibility(domain, { capabilityType, ttlSeconds: 1, requiresRemoteValidation: true, revocationMode: domain.revocationMode });
}
