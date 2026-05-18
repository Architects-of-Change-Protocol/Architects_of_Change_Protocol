import {
  buildTemporalAssertion,
  classifyTemporalConflict,
  validateCausalOrdering,
  validateDeterministicReplay,
  validateReplayChronology,
  validateTemporalConsistency,
  type TemporalSequenceEnvelope,
} from '../temporal';

const base = (sequence: number, eventRef: string): TemporalSequenceEnvelope => ({
  envelopeId: `env-${sequence}`,
  category: 'execution',
  sequence,
  eventRef,
  executionRef: { executionPlanId: 'plan-1', sequence },
  lineage: { lineageId: 'lin-1', ancestry: ['lin-root', 'lin-1'] },
  continuityRef: { continuityId: 'cont-1', lineageId: 'lin-1', continuitySequence: sequence },
  orderingConstraint: { mustHappenAfter: sequence === 0 ? [] : [`event-${sequence - 1}`], mustHappenBefore: [] },
  replayConstraint: { replayMustPreserveSequence: true, replayMustPreserveCausality: true, replayMutationsMustBeAppendOnly: true },
  trustPosture: 'trusted_chronology',
  clockPosture: 'runtime_monotonic',
  state: 'deterministic',
  visibility: 'audit-safe',
  timestamp: new Date().toISOString(),
});

describe('temporal governance helpers', () => {
  it('validates deterministic replay chronology', () => {
    const envelopes = [base(0, 'event-0'), base(1, 'event-1')];
    expect(validateReplayChronology(envelopes)).toBe(true);
    expect(validateDeterministicReplay(envelopes)).toBe(true);
    expect(validateCausalOrdering(envelopes)).toBe(true);
  });

  it('fails on sequence regression conflict', () => {
    const first = base(2, 'event-2');
    const second = base(1, 'event-1');
    expect(classifyTemporalConflict(first, second)).toBe('sequence_regression');
  });

  it('fails on federation provenance violation', () => {
    const envelope = {
      ...base(0, 'event-0'),
      federationRef: {
        localRuntimeId: 'r1',
        remoteRuntimeId: 'r2',
        federationSessionId: 'fed-1',
        receivedSequence: 1,
        provenanceRef: '',
      },
    };
    expect(classifyTemporalConflict(undefined, envelope)).toBe('federation_provenance_violation');
  });

  it('builds and validates temporal consistency assertions', () => {
    const envelope = base(0, 'event-0');
    const assertion = buildTemporalAssertion(envelope);
    expect(validateTemporalConsistency(envelope, assertion)).toBe(true);
  });

  it('rejects causal self dependency in assertions', () => {
    const envelope = {
      ...base(1, 'event-1'),
      orderingConstraint: { mustHappenAfter: ['event-1'], mustHappenBefore: [] },
    };
    const assertion = buildTemporalAssertion(envelope);
    expect(assertion.causallyOrdered).toBe(false);
  });
});
