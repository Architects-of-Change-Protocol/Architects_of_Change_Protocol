import { RuntimeIsolationProfile, RuntimeType } from './types';

const isolationProfiles = new Map<string, RuntimeIsolationProfile>();
export function validateRuntimeIsolationProfile(p: RuntimeIsolationProfile): boolean {
  if (p.dataEgressRestrictions.length === 0) return false;
  if (p.isolationLevel === 'air_gapped' && p.allowedFederationModes.length > 0) return false;
  if (p.isolationLevel === 'strict' && p.allowedFederationModes.some((m) => m === 'delegated' || m === 'reciprocal')) return false;
  return true;
}
export function createRuntimeIsolationProfile(input: RuntimeIsolationProfile): RuntimeIsolationProfile { if (!validateRuntimeIsolationProfile(input)) throw new Error('Invalid runtime isolation profile'); isolationProfiles.set(input.isolationProfileId,input); return input; }
export function evaluateRuntimeIsolationCompatibility(profile: RuntimeIsolationProfile, targetRuntimeType: RuntimeType, federationMode?: string): boolean {
  if (profile.blockedRuntimeTypes.includes(targetRuntimeType)) return false;
  if (profile.isolationLevel === 'air_gapped') return false;
  if (federationMode && !profile.allowedFederationModes.includes(federationMode as any)) return false;
  return true;
}
