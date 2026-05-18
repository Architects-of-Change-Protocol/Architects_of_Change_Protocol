export type TemporalCategory =
  | 'execution'
  | 'replay'
  | 'federation'
  | 'cognition'
  | 'coordination'
  | 'sequencing'
  | 'continuity'
  | 'policy'
  | 'capability'
  | 'audit'
  | 'telemetry'
  | 'explainability'
  | 'sdk'
  | 'governance'
  | 'tenant';

export type TemporalState =
  | 'ordered'
  | 'replayable'
  | 'constrained'
  | 'attested'
  | 'federated'
  | 'deterministic'
  | 'degraded'
  | 'conflicted'
  | 'resolved'
  | 'suspended'
  | 'revoked'
  | 'immutable'
  | 'mutable'
  | 'archived';

export type TemporalVisibility =
  | 'internal'
  | 'audit-safe'
  | 'sdk-safe'
  | 'operator'
  | 'federation-partner'
  | 'governance-only'
  | 'user-facing';

export type TemporalTrustPosture =
  | 'sovereign_chronology'
  | 'trusted_chronology'
  | 'replay_derived_chronology'
  | 'delegated_chronology'
  | 'federated_chronology'
  | 'degraded_chronology'
  | 'revoked_chronology';

export type TemporalClockPosture = 'runtime_monotonic' | 'runtime_wall_clock' | 'federated_received' | 'replay_derived';

export interface TemporalExecutionReference { executionPlanId: string; stepId?: string; sequence: number; }
export interface TemporalLineage { lineageId: string; parentLineageId?: string; ancestry: string[]; }
export interface TemporalContinuityReference { continuityId: string; lineageId: string; continuitySequence: number; }
export interface TemporalReplayReference { replayId: string; replayedFromPlanId: string; checkpointId?: string; replaySequence: number; }
export interface TemporalMutationWindow { openedAt: string; closedAt?: string; mutationType: 'append-only' | 'replay-derived' | 'delegated' | 'federated'; }
export interface TemporalCoordinationWindow { coordinationId: string; openedAt: string; closedAt?: string; orderedSteps: string[]; }
export interface TemporalFederationReference { localRuntimeId: string; remoteRuntimeId: string; federationSessionId: string; receivedSequence: number; provenanceRef: string; }
export interface TemporalOrderingConstraint { mustHappenAfter: string[]; mustHappenBefore: string[]; }
export interface TemporalReplayConstraint { replayMustPreserveSequence: boolean; replayMustPreserveCausality: boolean; replayMutationsMustBeAppendOnly: boolean; }
export interface TemporalContextWindow { startedAt: string; endedAt?: string; category: TemporalCategory; }

export interface TemporalSequenceEnvelope {
  envelopeId: string;
  category: TemporalCategory;
  sequence: number;
  eventRef: string;
  executionRef: TemporalExecutionReference;
  lineage: TemporalLineage;
  continuityRef?: TemporalContinuityReference;
  replayRef?: TemporalReplayReference;
  federationRef?: TemporalFederationReference;
  orderingConstraint: TemporalOrderingConstraint;
  replayConstraint: TemporalReplayConstraint;
  trustPosture: TemporalTrustPosture;
  clockPosture: TemporalClockPosture;
  state: TemporalState;
  visibility: TemporalVisibility;
  timestamp: string;
}

export interface TemporalDeterminismAssertion { deterministic: boolean; rationale: string; }
export interface TemporalConsistencyAssertion extends TemporalDeterminismAssertion { replaySafe: boolean; causallyOrdered: boolean; continuitySafe: boolean; federationSafe: boolean; }

export interface TemporalAttestation { attestationId: string; envelopeId: string; chronologyHash: string; assertedAt: string; assertedBy: string; }

export type TemporalConflict =
  | 'sequence_gap'
  | 'sequence_regression'
  | 'causality_violation'
  | 'replay_mutation_violation'
  | 'federation_provenance_violation'
  | 'continuity_ancestry_violation';

export type TemporalResolution = 'reject' | 'suspend' | 'append_correction' | 'require_attestation' | 'manual_governance_review';

export interface TemporalChronology { chronologyId: string; envelopes: TemporalSequenceEnvelope[]; immutable: boolean; }

export function normalizeTemporalAssertion(assertion: TemporalConsistencyAssertion): TemporalConsistencyAssertion {
  return {
    deterministic: Boolean(assertion.deterministic),
    replaySafe: Boolean(assertion.replaySafe),
    causallyOrdered: Boolean(assertion.causallyOrdered),
    continuitySafe: Boolean(assertion.continuitySafe),
    federationSafe: Boolean(assertion.federationSafe),
    rationale: assertion.rationale.trim(),
  };
}

export function classifyTemporalConflict(previous: TemporalSequenceEnvelope | undefined, next: TemporalSequenceEnvelope): TemporalConflict | null {
  if (next.orderingConstraint.mustHappenAfter.includes(next.eventRef) || next.orderingConstraint.mustHappenBefore.includes(next.eventRef)) {
    return 'causality_violation';
  }
  if (!next.replayConstraint.replayMutationsMustBeAppendOnly) return 'replay_mutation_violation';
  if (next.federationRef && next.federationRef.provenanceRef.trim().length === 0) return 'federation_provenance_violation';
  if (next.continuityRef && !next.lineage.ancestry.includes(next.continuityRef.lineageId) && next.lineage.lineageId !== next.continuityRef.lineageId) {
    return 'continuity_ancestry_violation';
  }
  if (!previous) return null;
  if (next.sequence < previous.sequence) return 'sequence_regression';
  if (next.sequence > previous.sequence + 1) return 'sequence_gap';
  return null;
}

export function validateReplayChronology(replayEnvelopes: TemporalSequenceEnvelope[]): boolean {
  for (let i = 0; i < replayEnvelopes.length; i += 1) {
    const current = replayEnvelopes[i];
    if (!current.replayConstraint.replayMustPreserveSequence || !current.replayConstraint.replayMustPreserveCausality || !current.replayConstraint.replayMutationsMustBeAppendOnly) return false;
    if (i > 0 && current.sequence <= replayEnvelopes[i - 1].sequence) return false;
    if (classifyTemporalConflict(i > 0 ? replayEnvelopes[i - 1] : undefined, current)) return false;
  }
  return true;
}

export function validateCausalOrdering(envelopes: TemporalSequenceEnvelope[]): boolean {
  const seen = new Set<string>();
  for (const envelope of envelopes) {
    if (envelope.orderingConstraint.mustHappenBefore.includes(envelope.eventRef)) return false;
    for (const prerequisite of envelope.orderingConstraint.mustHappenAfter) {
      if (!seen.has(prerequisite)) return false;
    }
    seen.add(envelope.eventRef);
  }
  return true;
}

export function buildTemporalAssertion(envelope: TemporalSequenceEnvelope): TemporalConsistencyAssertion {
  const selfConsistent = !envelope.orderingConstraint.mustHappenAfter.includes(envelope.eventRef) && !envelope.orderingConstraint.mustHappenBefore.includes(envelope.eventRef);
  return {
    deterministic: envelope.state !== 'conflicted' && envelope.state !== 'degraded',
    replaySafe: envelope.replayConstraint.replayMustPreserveSequence && envelope.replayConstraint.replayMustPreserveCausality && envelope.replayConstraint.replayMutationsMustBeAppendOnly,
    causallyOrdered: selfConsistent,
    continuitySafe: envelope.continuityRef !== undefined && (envelope.continuityRef.lineageId === envelope.lineage.lineageId || envelope.lineage.ancestry.includes(envelope.continuityRef.lineageId)),
    federationSafe: envelope.federationRef === undefined || (envelope.trustPosture !== 'revoked_chronology' && envelope.federationRef.provenanceRef.trim().length > 0),
    rationale: `Temporal envelope ${envelope.envelopeId} evaluated in deterministic posture`,
  };
}

export function validateTemporalConsistency(envelope: TemporalSequenceEnvelope, assertion: TemporalConsistencyAssertion): boolean {
  const normalized = normalizeTemporalAssertion(assertion);
  return normalized.deterministic && normalized.replaySafe && normalized.causallyOrdered && normalized.continuitySafe && normalized.federationSafe && envelope.sequence >= 0 && classifyTemporalConflict(undefined, envelope) === null;
}

export function validateDeterministicReplay(envelopes: TemporalSequenceEnvelope[]): boolean {
  return validateReplayChronology(envelopes) && validateCausalOrdering(envelopes);
}

export function normalizeTemporalDecision(resolution: TemporalResolution): TemporalResolution {
  return resolution;
}

export const classifyChronologyConflict = classifyTemporalConflict;
