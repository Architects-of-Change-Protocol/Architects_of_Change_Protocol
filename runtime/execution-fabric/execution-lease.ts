import { ExecutionLease } from './types';

export function isLeaseActive(lease: ExecutionLease, nowIso: string): boolean {
  return lease.status === 'active' && lease.expiresAt > nowIso;
}
