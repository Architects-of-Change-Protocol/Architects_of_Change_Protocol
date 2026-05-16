import {
  FederationCompatibilityResult,
  RuntimeFederationBoundary,
  RuntimeFederationCapability,
  RuntimeFederationCompatibilityMatrix,
  RuntimeFederationConstraint,
  RuntimeFederationDecision,
  RuntimeFederationHandshakeEnvelope,
  RuntimeFederationReplay,
  RuntimeFederationState,
  RuntimeFederationTrace,
  RuntimeFederationTrustLevel,
  RuntimeFederationVersionAssertion,
  RuntimeTrustAssertion,
} from './types';

const INCOMPATIBLE_STATES: RuntimeFederationState[] = ['revoked', 'incompatible', 'untrusted'];

export function validateRuntimeTrust(assertion: RuntimeTrustAssertion): FederationCompatibilityResult {
  const reasons: string[] = [];
  if (INCOMPATIBLE_STATES.includes(assertion.state)) reasons.push('Runtime trust state is not eligible for federation operations.');
  if (assertion.maxDelegationDepth < 0) reasons.push('maxDelegationDepth cannot be negative.');
  if (assertion.state === 'degraded' && assertion.maxDelegationDepth > 1) reasons.push('Degraded trust posture requires maxDelegationDepth <= 1.');
  if (assertion.trustLevel === 'capability-limited' && assertion.allowedCapabilities.length === 0) reasons.push('Capability-limited trust posture must declare at least one allowed capability.');
  if (!assertion.replayAuthorized && assertion.state === 'replay-authorized') reasons.push('replay-authorized state requires replayAuthorized=true.');
  return { compatible: reasons.length === 0, reasons };
}

export function validateRuntimeCompatibility(
  version: RuntimeFederationVersionAssertion,
  matrix: RuntimeFederationCompatibilityMatrix,
): FederationCompatibilityResult {
  const reasons: string[] = [];
  if (!matrix.supportedFederationVersions.includes(version.federationVersion)) reasons.push('Unsupported federation version.');
  if (!matrix.supportedTransportProfiles.includes(version.transportProfile)) reasons.push('Unsupported transport profile.');
  if (version.runtimeProtocolVersion !== matrix.runtimeProtocolVersion) reasons.push('Runtime protocol version mismatch.');
  return { compatible: reasons.length === 0, reasons };
}

export function classifyRuntimeFederationBoundary(boundary: RuntimeFederationBoundary): 'strict' | 'attenuated' | 'open' {
  if (boundary.policyIsolation === 'strict' || boundary.visibility === 'internal') return 'strict';
  if (boundary.delegation === 'attenuated' || boundary.replay === 'deny-by-default') return 'attenuated';
  return 'open';
}

export function buildRuntimeFederationAssertion(
  handshake: RuntimeFederationHandshakeEnvelope,
  trust: RuntimeTrustAssertion,
  constraints: RuntimeFederationConstraint[],
): RuntimeFederationDecision {
  const trustResult = validateRuntimeTrust(trust);
  const compatibilityResult = validateRuntimeCompatibility(handshake.version, handshake.compatibilityMatrix);
  const denyReasons = [
    ...trustResult.reasons,
    ...compatibilityResult.reasons,
    ...constraints.filter((c) => c.enforcement === 'deny').map((c) => c.reasonCode),
  ];
  const warnReasons = constraints.filter((c) => c.enforcement === 'warn').map((c) => c.reasonCode);

  return normalizeRuntimeFederationDecision({
    decisionId: handshake.handshakeId,
    state: denyReasons.length === 0 ? (warnReasons.length > 0 ? 'degraded' : 'trusted') : 'incompatible',
    decision: denyReasons.length === 0 ? (warnReasons.length > 0 ? 'conditional' : 'allow') : 'deny',
    reasons: [...denyReasons, ...warnReasons],
    category: 'governance',
  });
}

export function normalizeRuntimeFederationDecision(decision: RuntimeFederationDecision): RuntimeFederationDecision {
  const uniqueReasons = [...new Set(decision.reasons)].sort();
  const trustLevel: RuntimeFederationTrustLevel = decision.decision === 'allow'
    ? 'trusted'
    : decision.decision === 'conditional'
      ? 'partially-trusted'
      : 'untrusted';
  return {
    ...decision,
    reasons: uniqueReasons,
    trustLevel,
    explainabilityRef: decision.explainabilityRef ?? `federation:${decision.decisionId}`,
  };
}

export function constrainFederatedCapability(
  capability: RuntimeFederationCapability,
  trust: RuntimeTrustAssertion,
): RuntimeFederationCapability {
  const allowed = new Set(trust.allowedCapabilities);
  return {
    ...capability,
    allowedScopes: capability.allowedScopes.filter((scope) => allowed.has(scope)),
    delegationDepth: Math.max(0, Math.min(capability.delegationDepth, trust.maxDelegationDepth)),
  };
}

export function validateFederatedReplay(replay: RuntimeFederationReplay, trust: RuntimeTrustAssertion): FederationCompatibilityResult {
  const reasons: string[] = [];
  if (!trust.replayAuthorized) reasons.push('Trust posture does not authorize replay.');
  if (replay.authorized && replay.attestationRefs.length === 0) reasons.push('Authorized replay requires attestation references.');
  if (!replay.authorized && trust.replayAuthorized) reasons.push('Replay denied despite replay-authorized trust posture.');
  return { compatible: reasons.length === 0, reasons };
}

export function redactFederationTrace(trace: RuntimeFederationTrace): RuntimeFederationTrace {
  const redactedFields = [...new Set(trace.redactedFields)].sort();
  return { ...trace, redactedFields };
}
