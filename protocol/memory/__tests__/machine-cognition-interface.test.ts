import {
  buildAuditTracePacket,
  buildMachineCognitionEnvelope,
  buildMachineCognitionInterfaces,
  buildMachineActionBoundary,
  consolidateDuplicateEnvelopes,
  type MachineCognitionPolicy
} from '../machine-cognition-interface';
import type { CognitiveRuntimeSignal } from '../cognitive-runtime';

const policy: MachineCognitionPolicy = {
  defaultTtlMinutes: 30,
  minimumSignalConfidence: 0.5,
  allowAuditRequiredContext: true,
  allowHumanReviewContext: true,
  allowMachineSuggestedActions: true,
  allowMachineContextExpansion: false,
  requireHumanApprovalForAuditRequired: true,
  maxVisibleMemoryIds: 2,
  redactionMode: 'none',
  allowedTaskTypes: [
    'SUMMARIZE_GOVERNED_CONTEXT','ANALYZE_RISK_CONVERGENCE','REVIEW_CONTRADICTION','SUGGEST_NEXT_ACTION','GENERATE_EXECUTIVE_BRIEF','DETECT_PATTERN_DRIFT','PREPARE_HUMAN_REVIEW','VALIDATE_GOVERNANCE_CANDIDATE'
  ],
  deniedTaskTypes: []
};

const mkSignal = (overrides: Partial<CognitiveRuntimeSignal>): CognitiveRuntimeSignal => ({
  signalId: 'sig-1',
  signalType: 'AI_CONTEXT_READY',
  sourceSynthesisIds: ['syn-1'],
  sourceNutrientIds: ['nut-1'],
  sourceMemoryIds: ['m3','m1','m2'],
  createdAt: '2026-05-11T00:00:00Z',
  confidenceScore: 0.8,
  severity: 0.3,
  explanation: 'reason',
  recommendedAction: 'next',
  auditRequired: false,
  lineagePreserved: true,
  humanReviewRequired: false,
  aiContextEligible: true,
  ...overrides
});

test('AI_CONTEXT_READY -> CONTEXT_ENVELOPE', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({ signalType: 'AI_CONTEXT_READY' }), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  expect(env?.interfaceType).toBe('CONTEXT_ENVELOPE');
});

test('HUMAN_REVIEW_REQUIRED -> HUMAN_ESCALATION_PACKET', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({ signalType: 'HUMAN_REVIEW_REQUIRED', humanReviewRequired: true }), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  expect(env?.interfaceType).toBe('HUMAN_ESCALATION_PACKET');
});

test('GOVERNANCE_CONTRADICTION -> GOVERNANCE_REVIEW_PACKET', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({ signalType: 'GOVERNANCE_CONTRADICTION', humanReviewRequired: true }), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  expect(env?.interfaceType).toBe('GOVERNANCE_REVIEW_PACKET');
});

test('audit-required context gating', () => {
  const deny = buildMachineCognitionEnvelope(mkSignal({ auditRequired: true }), { signals: [], now: '2026-05-11T00:00:00Z', policy: { ...policy, allowAuditRequiredContext: false } });
  expect(deny).toBeNull();
});

test('human-review context gating', () => {
  const deny = buildMachineCognitionEnvelope(mkSignal({ signalType: 'HUMAN_REVIEW_REQUIRED', humanReviewRequired: true }), { signals: [], now: '2026-05-11T00:00:00Z', policy: { ...policy, allowHumanReviewContext: false } });
  expect(deny).toBeNull();
});

test('maxVisibleMemoryIds redaction', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({}), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  expect(env?.visibleMemoryIds.length).toBe(2);
  expect(env?.redactedMemoryIds.length).toBe(1);
});

test('machine action boundary denies modify/delete/promote', () => {
  const boundary = buildMachineActionBoundary(mkSignal({}), policy, 'SUMMARIZE_GOVERNED_CONTEXT');
  expect(boundary.mayModifyMemory).toBe(false);
  expect(boundary.mayDeleteMemory).toBe(false);
  expect(boundary.mayPromoteGovernanceMemory).toBe(false);
});

test('governance candidate validation can suggest but not execute promotion', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({ signalType: 'GOVERNANCE_MEMORY_CANDIDATE' }), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  expect(env?.taskType).toBe('VALIDATE_GOVERNANCE_CANDIDATE');
  expect(env?.machineActionBoundary.mayPromoteGovernanceMemory).toBe(false);
  expect(env?.machineActionBoundary.maySuggestActions).toBe(true);
});

test('audit trace packet creation', () => {
  const env = buildMachineCognitionEnvelope(mkSignal({ auditRequired: true }), { signals: [], now: '2026-05-11T00:00:00Z', policy });
  const packet = buildAuditTracePacket(env!);
  expect(packet.envelopeId).toBe(env?.envelopeId);
});

test('duplicate envelope consolidation', () => {
  const e1 = buildMachineCognitionEnvelope(mkSignal({ signalId: 'sig-1' }), { signals: [], now: '2026-05-11T00:00:00Z', policy })!;
  const e2 = buildMachineCognitionEnvelope(mkSignal({ signalId: 'sig-1' }), { signals: [], now: '2026-05-11T00:00:00Z', policy })!;
  expect(consolidateDuplicateEnvelopes([e1, e2]).length).toBe(1);
});

test('lineage preservation', () => {
  const result = buildMachineCognitionInterfaces({ signals: [mkSignal({})], now: '2026-05-11T00:00:00Z', policy });
  expect(result.envelopes[0].lineagePreserved).toBe(true);
});
