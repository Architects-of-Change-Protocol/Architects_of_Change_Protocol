import { SovereignRuntime } from './types';

const runtimes = new Map<string, SovereignRuntime>();
const now = () => new Date().toISOString();

export function registerSovereignRuntime(input: Omit<SovereignRuntime, 'createdAt' | 'suspendedAt' | 'revokedAt'>): SovereignRuntime {
  if (input.runtimeStatus === 'isolated' && !input.isolationProfileRef) throw new Error('Isolated runtime requires isolation profile');
  const runtime: SovereignRuntime = { ...input, createdAt: now() };
  runtimes.set(runtime.runtimeId, runtime);
  return runtime;
}

export function updateSovereignRuntime(runtimeId: string, patch: Partial<SovereignRuntime>): SovereignRuntime {
  const existing = resolveSovereignRuntime(runtimeId);
  if (existing.runtimeStatus === 'revoked') throw new Error('Revoked runtimes cannot reactivate');
  const next = { ...existing, ...patch };
  if (next.runtimeStatus === 'isolated' && !next.isolationProfileRef) throw new Error('Isolated runtime requires isolation profile');
  runtimes.set(runtimeId, next);
  return next;
}

export function suspendSovereignRuntime(runtimeId: string): SovereignRuntime {
  const existing = resolveSovereignRuntime(runtimeId);
  if (existing.runtimeStatus === 'revoked') throw new Error('Cannot suspend revoked runtime');
  const next = { ...existing, runtimeStatus: 'suspended' as const, suspendedAt: now() };
  runtimes.set(runtimeId, next);
  return next;
}

export function revokeSovereignRuntime(runtimeId: string): SovereignRuntime {
  const existing = resolveSovereignRuntime(runtimeId);
  const next = { ...existing, runtimeStatus: 'revoked' as const, revokedAt: now() };
  runtimes.set(runtimeId, next);
  return next;
}

export function resolveSovereignRuntime(runtimeId: string): SovereignRuntime {
  const rt = runtimes.get(runtimeId);
  if (!rt) throw new Error(`Runtime not found: ${runtimeId}`);
  return rt;
}

export function clearSovereignRuntimes(): void { runtimes.clear(); }

export function canRuntimeFederate(runtimeId: string): boolean { return resolveSovereignRuntime(runtimeId).runtimeStatus !== 'suspended'; }
