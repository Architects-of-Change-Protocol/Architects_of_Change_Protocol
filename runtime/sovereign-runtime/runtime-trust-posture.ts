import { RuntimeTrustPosture } from './types';

const trustPostures = new Map<string, RuntimeTrustPosture>();
export function createRuntimeTrustPosture(input: RuntimeTrustPosture): RuntimeTrustPosture { trustPostures.set(input.trustPostureId, input); return input; }
export function updateRuntimeTrustPosture(trustPostureId: string, patch: Partial<RuntimeTrustPosture>): RuntimeTrustPosture { const c = trustPostures.get(trustPostureId); if (!c) throw new Error('Runtime trust posture not found'); const n={...c,...patch}; trustPostures.set(trustPostureId,n); return n; }
export function degradeRuntimeTrust(trustPostureId: string, signal: string): RuntimeTrustPosture { const c = updateRuntimeTrustPosture(trustPostureId, {}); const n={...c, degradationSignals:[...c.degradationSignals, signal]}; trustPostures.set(trustPostureId,n); return n; }
export function recoverRuntimeTrust(trustPostureId: string, signal: string): RuntimeTrustPosture { const c = updateRuntimeTrustPosture(trustPostureId, {}); const n={...c, recoverySignals:[...c.recoverySignals, signal]}; trustPostures.set(trustPostureId,n); return n; }
export function evaluateRuntimeTrustEligibility(p: RuntimeTrustPosture): boolean {
  const reviewedWithin30d = Date.now() - Date.parse(p.lastReviewedAt) <= 30 * 24 * 3600 * 1000;
  if (!reviewedWithin30d || p.riskFlags.length > 2 || p.degradationSignals.length > p.recoverySignals.length + 1) return false;
  return p.trustLevel === 'high' || p.trustLevel === 'strict';
}
