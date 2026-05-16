import { evaluatePolicySet } from '../evaluation';
import type { PolicySet } from '../types';

const baseContext = {
  subject: { id: 'subj-1' },
  requester: { id: 'req-1' },
  resource: { id: 'res-1', kind: 'dataset' },
  action: { verb: 'read', protectedOperation: true },
  now: new Date('2026-01-01T00:00:00.000Z'),
};

describe('policy evaluation semantics', () => {
  test('deny overrides allow', () => {
    const set: PolicySet = {
      id: 'p1', version: '1.0.0', scope: 'operation', categories: ['capability'],
      rules: [
        { id: 'allow', category: 'capability', effect: 'allow', reasonCode: 'ALLOW' },
        { id: 'deny', category: 'capability', effect: 'deny', reasonCode: 'DENY' },
      ],
    };
    const result = evaluatePolicySet(set, baseContext);
    expect(result.decision.outcome).toBe('denied');
  });

  test('abstain alone does not allow protected operations', () => {
    const set: PolicySet = {
      id: 'p2', version: '1.0.0', scope: 'operation', categories: ['consent'],
      rules: [{ id: 'abstain', category: 'consent', effect: 'abstain', reasonCode: 'NO_MATCH' }],
    };
    const result = evaluatePolicySet(set, baseContext);
    expect(result.decision.outcome).toBe('indeterminate');
  });

  test('indeterminate fails closed for protected operation', () => {
    const set: PolicySet = {
      id: 'p3', version: '1.0.0', scope: 'operation', categories: ['trust'],
      rules: [{ id: 'trust', category: 'trust', effect: 'allow', reasonCode: 'TRUST_OK', conditions: [{ id: 'boom', evaluate: () => { throw new Error('x'); } }] }],
    };
    const result = evaluatePolicySet(set, baseContext);
    expect(result.decision.outcome).toBe('denied');
    expect(result.decision.reasonCode).toBe('POLICY_INDETERMINATE_FAIL_CLOSED');
  });

  test('obligations aggregate deterministically and conflicts recorded', () => {
    const set: PolicySet = {
      id: 'p4', version: '1.0.0', scope: 'operation', categories: ['capability'],
      rules: [
        { id: 'a', category: 'capability', effect: 'allow', reasonCode: 'A', obligations: [{ id: 'log', category: 'governance' }] },
        { id: 'b', category: 'capability', effect: 'deny', reasonCode: 'B', obligations: [{ id: 'notify', category: 'governance' }] },
      ],
    };
    const result = evaluatePolicySet(set, baseContext);
    expect(result.decision.obligations.map((o) => o.id)).toEqual(['log', 'notify']);
    expect(result.decision.conflicts[0]?.conflictType).toBe('allow_vs_deny');
    expect(result.trace.evaluatedRules).toEqual(['a', 'b']);
  });
});
