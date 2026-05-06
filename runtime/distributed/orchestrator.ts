import {
  PolicyDecisionRecord,
  RelationshipRuntimeState,
  RelationshipStateSnapshot,
  RuntimeEvent,
  RuntimeTelemetryWindow,
  TenantId,
} from './types';

const DEFAULT_STATE = (tenantId: TenantId, relationshipId: string): RelationshipRuntimeState => ({
  tenantId,
  relationshipId,
  trustScore: 50,
  lifecycleState: 'proposed',
  delegatedCapabilities: [],
  continuityHealth: 'stable',
  revocationReadiness: 0,
  aiRuntimeExposure: 'none',
  resilienceScore: 50,
  lastEventSequence: 0,
});

export class DistributedRuntimeOrchestrator {
  private readonly eventLog: RuntimeEvent[] = [];
  private readonly snapshots = new Map<string, RelationshipStateSnapshot>();

  append(event: RuntimeEvent): void {
    this.eventLog.push(event);
    const key = this.key(event.tenantId, event.relationshipId);
    const current = this.snapshots.get(key)?.state ?? DEFAULT_STATE(event.tenantId, event.relationshipId);
    const next = this.reduce(current, event);
    this.snapshots.set(key, {
      tenantId: event.tenantId,
      relationshipId: event.relationshipId,
      asOfSequence: event.sequence,
      capturedAt: event.ts,
      state: next,
    });
  }

  reconstruct(tenantId: TenantId, relationshipId: string, toSequence?: number): RelationshipRuntimeState {
    const events = this.eventLog
      .filter((e) => e.tenantId === tenantId && e.relationshipId === relationshipId)
      .filter((e) => (typeof toSequence === 'number' ? e.sequence <= toSequence : true))
      .sort((a, b) => a.sequence - b.sequence);

    return events.reduce((state, event) => this.reduce(state, event), DEFAULT_STATE(tenantId, relationshipId));
  }

  replayWindow(tenantId: TenantId, fromSequence: number, toSequence: number): RuntimeTelemetryWindow {
    const events = this.eventLog.filter(
      (e) => e.tenantId === tenantId && e.sequence >= fromSequence && e.sequence <= toSequence,
    );
    return {
      tenantId,
      fromSequence,
      toSequence,
      events,
      checkpoint: `${tenantId}:${toSequence}`,
    };
  }

  evaluatePolicy(tenantId: TenantId, decision: PolicyDecisionRecord, relationshipId: string, sequence: number): RuntimeEvent {
    return {
      eventId: `${tenantId}-${relationshipId}-${sequence}-policy`,
      tenantId,
      relationshipId,
      type: decision.decision === 'deny' ? 'policy.enforcement.denied' : 'policy.decision.recorded',
      ts: new Date().toISOString(),
      sequence,
      replaySafe: true,
      payload: decision,
    };
  }

  private reduce(state: RelationshipRuntimeState, event: RuntimeEvent): RelationshipRuntimeState {
    switch (event.type) {
      case 'relationship.created':
        return { ...state, lifecycleState: 'active', lastEventSequence: event.sequence };
      case 'relationship.lifecycle.changed':
        return { ...state, lifecycleState: (event.payload as { state: RelationshipRuntimeState['lifecycleState'] }).state, lastEventSequence: event.sequence };
      case 'relationship.trust.changed': {
        const delta = (event.payload as { delta: number }).delta;
        const trustScore = Math.max(0, Math.min(100, state.trustScore + delta));
        return {
          ...state,
          trustScore,
          continuityHealth: trustScore < 30 ? 'critical' : trustScore < 60 ? 'degraded' : 'stable',
          resilienceScore: Math.max(0, Math.min(100, state.resilienceScore + Math.floor(delta / 2))),
          lastEventSequence: event.sequence,
        };
      }
      case 'relationship.capability.delegated': {
        const capability = (event.payload as { capability: string }).capability;
        return {
          ...state,
          delegatedCapabilities: [...new Set([...state.delegatedCapabilities, capability])],
          aiRuntimeExposure: 'limited',
          lastEventSequence: event.sequence,
        };
      }
      case 'relationship.capability.revoked': {
        const capability = (event.payload as { capability: string }).capability;
        return {
          ...state,
          delegatedCapabilities: state.delegatedCapabilities.filter((c) => c !== capability),
          revocationReadiness: Math.min(100, state.revocationReadiness + 20),
          lastEventSequence: event.sequence,
        };
      }
      case 'ai.execution.attested':
        return { ...state, aiRuntimeExposure: 'extended', lastEventSequence: event.sequence };
      default:
        return { ...state, lastEventSequence: event.sequence };
    }
  }

  private key(tenantId: TenantId, relationshipId: string): string {
    return `${tenantId}::${relationshipId}`;
  }
}
