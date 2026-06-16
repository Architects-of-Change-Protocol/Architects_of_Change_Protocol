import { replayLifecycleEvent, LifecycleEvent, LifecycleStatus } from '../../src/lifecycle/persistentLifecycle';

describe('17 persistent lifecycle', () => {
  const cases: Array<[LifecycleEvent, LifecycleStatus]> = [
    ['approval_granted', 'approved'],
    ['approval_revoked', 'revoked'],
    ['created', 'created'],
    ['suspended', 'suspended'],
    ['terminated', 'terminated'],
  ];

  it.each(cases)('maps %s to %s', (event, expected) => {
    expect(replayLifecycleEvent(event)).toBe(expected);
  });

  it('approval_granted maps to approved, not created', () => {
    const result = replayLifecycleEvent('approval_granted');
    expect(result).toBe('approved');
    expect(result).not.toBe('created');
  });

  it('approval_revoked maps to revoked, not suspended', () => {
    const result = replayLifecycleEvent('approval_revoked');
    expect(result).toBe('revoked');
    expect(result).not.toBe('suspended');
  });

  it('created maps to created', () => {
    expect(replayLifecycleEvent('created')).toBe('created');
  });

  it('suspended maps to suspended', () => {
    expect(replayLifecycleEvent('suspended')).toBe('suspended');
  });

  it('terminated maps to terminated', () => {
    expect(replayLifecycleEvent('terminated')).toBe('terminated');
  });

  it('approval_granted replay does not produce revoked', () => {
    expect(replayLifecycleEvent('approval_granted')).not.toBe('revoked');
  });

  it('approval_granted replay does not produce suspended', () => {
    expect(replayLifecycleEvent('approval_granted')).not.toBe('suspended');
  });

  it('approval_granted replay does not produce terminated', () => {
    expect(replayLifecycleEvent('approval_granted')).not.toBe('terminated');
  });

  it('all events produce a defined status', () => {
    const events: LifecycleEvent[] = ['approval_granted', 'approval_revoked', 'created', 'suspended', 'terminated'];
    for (const ev of events) {
      expect(replayLifecycleEvent(ev)).toBeDefined();
    }
  });

  it('status values are non-empty strings', () => {
    const events: LifecycleEvent[] = ['approval_granted', 'approval_revoked', 'created', 'suspended', 'terminated'];
    for (const ev of events) {
      expect(replayLifecycleEvent(ev).length).toBeGreaterThan(0);
    }
  });
});
