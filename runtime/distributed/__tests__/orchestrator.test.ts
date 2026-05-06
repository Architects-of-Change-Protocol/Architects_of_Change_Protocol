import { DistributedRuntimeOrchestrator } from '../orchestrator';

describe('DistributedRuntimeOrchestrator', () => {
  it('reconstructs deterministic state from append-only events', () => {
    const orchestrator = new DistributedRuntimeOrchestrator();

    orchestrator.append({
      eventId: 'e1', tenantId: 't1', relationshipId: 'r1', type: 'relationship.created', ts: '2026-05-06T00:00:00.000Z', sequence: 1, replaySafe: true, payload: {},
    });
    orchestrator.append({
      eventId: 'e2', tenantId: 't1', relationshipId: 'r1', type: 'relationship.trust.changed', ts: '2026-05-06T00:01:00.000Z', sequence: 2, replaySafe: true, payload: { delta: -30 },
    });
    orchestrator.append({
      eventId: 'e3', tenantId: 't1', relationshipId: 'r1', type: 'relationship.capability.delegated', ts: '2026-05-06T00:02:00.000Z', sequence: 3, replaySafe: true, payload: { capability: 'read:graph' },
    });

    const state = orchestrator.reconstruct('t1', 'r1');
    expect(state.lifecycleState).toBe('active');
    expect(state.trustScore).toBe(20);
    expect(state.continuityHealth).toBe('critical');
    expect(state.delegatedCapabilities).toEqual(['read:graph']);
  });

  it('isolates replay windows by tenant', () => {
    const orchestrator = new DistributedRuntimeOrchestrator();
    orchestrator.append({
      eventId: 'e1', tenantId: 't1', relationshipId: 'r1', type: 'relationship.created', ts: '2026-05-06T00:00:00.000Z', sequence: 1, replaySafe: true, payload: {},
    });
    orchestrator.append({
      eventId: 'e2', tenantId: 't2', relationshipId: 'r9', type: 'relationship.created', ts: '2026-05-06T00:00:01.000Z', sequence: 1, replaySafe: true, payload: {},
    });

    const window = orchestrator.replayWindow('t1', 1, 10);
    expect(window.events).toHaveLength(1);
    expect(window.events[0].tenantId).toBe('t1');
  });
});
