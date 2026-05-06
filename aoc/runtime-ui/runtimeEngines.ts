import { LifecycleEvent, RuntimeEvent, TrustState } from './types';

export const trustStateRank: Record<TrustState, number> = {
  unverified: 0,
  degraded: 1,
  attested: 2,
  verified: 3,
};

export function deriveTrustPropagation(events: RuntimeEvent[]): TrustState {
  return events.reduce<TrustState>((state, event) => {
    return trustStateRank[event.trustState] < trustStateRank[state] ? event.trustState : state;
  }, 'verified');
}

export function replayLifecycle(
  events: LifecycleEvent[],
  progress: number,
): { visibleEvents: LifecycleEvent[]; currentTrust: TrustState } {
  const bounded = Math.max(0, Math.min(progress, 1));
  const count = Math.max(1, Math.ceil(events.length * bounded));
  const visibleEvents = events.slice(0, count);
  const currentTrust = visibleEvents[visibleEvents.length - 1]?.trustSnapshot ?? 'unverified';
  return { visibleEvents, currentTrust };
}

export function formatCountdown(expiresAtIso: string, nowMs = Date.now()): string {
  const remainingMs = new Date(expiresAtIso).getTime() - nowMs;
  if (remainingMs <= 0) return 'expired';
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
