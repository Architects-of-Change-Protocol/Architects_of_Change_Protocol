import { RuntimeFederation, TrustDomain } from './types';

export function isIsolatedGovernanceDomain(domain: TrustDomain): boolean {
  return domain.allowedFederationModes.length === 1 && domain.allowedFederationModes[0] === 'isolated';
}

export function enforceDelegationBoundary(federation: RuntimeFederation): boolean {
  if (federation.federationMode === 'isolated') return federation.delegationPolicies.length === 0;
  if (federation.federationMode === 'audit_only') return federation.delegationPolicies.length === 0;
  return true;
}

export function isRestrictedFederationMode(mode: RuntimeFederation['federationMode']): boolean {
  return mode === 'isolated' || mode === 'audit_only' || mode === 'limited';
}

export function supportsAiRuntimeIsolation(source: TrustDomain, target: TrustDomain): boolean {
  if (source.domainType !== 'ai_runtime' && target.domainType !== 'ai_runtime') return true;
  return source.allowedFederationModes.includes('limited') && target.allowedFederationModes.includes('limited');
}
