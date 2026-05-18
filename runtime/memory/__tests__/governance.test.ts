import { classifyMemoryConflict, declareMemory, type MemoryAssertion, validateCognitiveContinuity } from '../governance';

const baseAssertion = (): MemoryAssertion => ({
  declaration: {
    memoryId: 'mem-1', category: 'episodic', state: 'declared', actorId: 'actor-1', runtimeId: 'runtime-a',
    executionId: 'exec-1', intentId: 'intent-1', continuityRef: 'cont-1', contextWindowRef: 'ctx-1', immutable: false
  },
  lineage: { ancestry: [], immutableHash: 'hash-1' },
  provenance: {
    originatingRuntimeId: 'runtime-a',
    originatingActorId: 'actor-1',
    originatingExecutionId: 'exec-1',
    originatingIntentId: 'intent-1',
    replayAncestry: [],
    federationAncestry: [],
    delegatedAncestry: [],
    coordinationAncestry: []
  },
  mutationConstraints: [{ key: 'scope', operator: 'eq', value: 'tenant:a' }],
  visibility: 'internal',
  trustPosture: 'trusted',
  lifecycle: { retention: 'replay-bound' },
  replayConstraint: { preserveAncestry: true, constrainMutation: true },
  continuity: { continuityRef: 'cont-1', replayLocked: false }
});

test('declareMemory normalizes and validates', () => {
  const result = declareMemory(baseAssertion());
  expect(result.declaration.memoryId).toBe('mem-1');
});

test('immutable memory rejects mutable mutation', () => {
  const left = { ...baseAssertion(), declaration: { ...baseAssertion().declaration, immutable: true } };
  const right = { ...baseAssertion(), mutation: { mode: 'mutable', actorId: 'actor-1', reason: 'edit' } as const };
  expect(classifyMemoryConflict(left, right)?.code).toBe('mutation_conflict');
});

test('replay continuity remains deterministic', () => {
  const left = baseAssertion();
  const right = { ...baseAssertion(), continuity: { continuityRef: 'cont-2', previousContinuityRef: 'cont-1', replayLocked: true } };
  expect(() => validateCognitiveContinuity(left, right)).not.toThrow();
});

test('cross-runtime lineage requires federation reference', () => {
  const left = baseAssertion();
  const right = {
    ...baseAssertion(),
    provenance: { ...baseAssertion().provenance, originatingRuntimeId: 'runtime-b' }
  };
  expect(classifyMemoryConflict(left, right)?.code).toBe('lineage_conflict');
});
