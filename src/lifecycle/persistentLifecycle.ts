export type LifecycleEvent =
  | 'approval_granted'
  | 'approval_revoked'
  | 'created'
  | 'suspended'
  | 'terminated';

export type LifecycleStatus = 'approved' | 'revoked' | 'created' | 'suspended' | 'terminated';

const lifecycleMap: Record<LifecycleEvent, LifecycleStatus> = {
  approval_granted: 'approved',
  approval_revoked: 'revoked',
  created: 'created',
  suspended: 'suspended',
  terminated: 'terminated',
};

export function replayLifecycleEvent(event: LifecycleEvent): LifecycleStatus {
  return lifecycleMap[event];
}
