export const MEMORY_DECAY_STATES = [
  'ACTIVE',
  'COOLING',
  'COMPRESSED',
  'ARCHIVED',
  'FOSSILIZED',
  'PURGED'
] as const;

export type MemoryDecayState = (typeof MEMORY_DECAY_STATES)[number];

export type MemoryDecayClass = 'transient' | 'operational_noise' | 'policy_governance' | 'audit_required';

export type MemoryRetentionWindows = {
  coolingAfterDays: number;
  compressAfterDays: number;
  archiveAfterDays: number;
  fossilizeAfterDays: number;
  purgeAfterDays: number;
};

export type MemoryDecayPolicy = {
  retention: MemoryRetentionWindows;
  legalHold: boolean;
  auditPreservationMode: boolean;
};

export type MemoryDecayRecord = {
  memoryId: string;
  decayClass: MemoryDecayClass;
  state: MemoryDecayState;
  createdAt: string;
  lastAccessedAt: string;
  lastStateChangedAt: string;
  legalHold?: boolean;
  auditRequired?: boolean;
  governanceTags?: string[];
};

export type GovernanceDecayOverride = {
  holdState?: MemoryDecayState;
  forceState?: MemoryDecayState;
  disablePurge?: boolean;
};

export type GovernanceDecayOverrideHook = (
  memory: MemoryDecayRecord,
  policy: MemoryDecayPolicy
) => GovernanceDecayOverride | undefined;

const DAY_MS = 1000 * 60 * 60 * 24;

const clampDays = (value: number): number => Math.max(0, Math.floor(value));

const elapsedDaysSince = (sourceIso: string, nowIso: string): number => {
  const source = new Date(sourceIso).getTime();
  const now = new Date(nowIso).getTime();
  if (!Number.isFinite(source) || !Number.isFinite(now) || now <= source) return 0;
  return Math.floor((now - source) / DAY_MS);
};

const resolveRetentionWindows = (memory: MemoryDecayRecord, policy: MemoryDecayPolicy): MemoryRetentionWindows => {
  const { retention } = policy;

  if (memory.decayClass === 'transient') {
    return {
      coolingAfterDays: clampDays(retention.coolingAfterDays),
      compressAfterDays: clampDays(retention.compressAfterDays),
      archiveAfterDays: clampDays(retention.archiveAfterDays),
      fossilizeAfterDays: clampDays(retention.fossilizeAfterDays),
      purgeAfterDays: clampDays(retention.purgeAfterDays)
    };
  }

  if (memory.decayClass === 'operational_noise') {
    return {
      coolingAfterDays: clampDays(retention.coolingAfterDays + 3),
      compressAfterDays: clampDays(retention.compressAfterDays + 7),
      archiveAfterDays: clampDays(retention.archiveAfterDays + 14),
      fossilizeAfterDays: clampDays(retention.fossilizeAfterDays + 30),
      purgeAfterDays: clampDays(retention.purgeAfterDays + 60)
    };
  }

  if (memory.decayClass === 'policy_governance') {
    return {
      coolingAfterDays: clampDays(retention.coolingAfterDays + 30),
      compressAfterDays: clampDays(retention.compressAfterDays + 90),
      archiveAfterDays: clampDays(retention.archiveAfterDays + 180),
      fossilizeAfterDays: clampDays(retention.fossilizeAfterDays + 365),
      purgeAfterDays: clampDays(retention.purgeAfterDays + 3650)
    };
  }

  return {
    coolingAfterDays: clampDays(retention.coolingAfterDays + 60),
    compressAfterDays: clampDays(retention.compressAfterDays + 180),
    archiveAfterDays: clampDays(retention.archiveAfterDays + 365),
    fossilizeAfterDays: clampDays(retention.fossilizeAfterDays + 730),
    purgeAfterDays: Number.MAX_SAFE_INTEGER
  };
};

export const shouldCompressMemory = (memory: MemoryDecayRecord, policy: MemoryDecayPolicy, now: string): boolean => {
  const windows = resolveRetentionWindows(memory, policy);
  const idleDays = elapsedDaysSince(memory.lastAccessedAt, now);
  return idleDays >= windows.compressAfterDays;
};

export const shouldArchiveMemory = (memory: MemoryDecayRecord, policy: MemoryDecayPolicy, now: string): boolean => {
  const windows = resolveRetentionWindows(memory, policy);
  const ageDays = elapsedDaysSince(memory.createdAt, now);
  return ageDays >= windows.archiveAfterDays;
};

export const shouldFossilizeMemory = (memory: MemoryDecayRecord, policy: MemoryDecayPolicy, now: string): boolean => {
  const windows = resolveRetentionWindows(memory, policy);
  const ageDays = elapsedDaysSince(memory.createdAt, now);
  return ageDays >= windows.fossilizeAfterDays;
};

export const shouldPurgeMemory = (
  memory: MemoryDecayRecord,
  policy: MemoryDecayPolicy,
  now: string,
  override?: GovernanceDecayOverride
): boolean => {
  if (policy.legalHold || memory.legalHold) return false;
  if (policy.auditPreservationMode || memory.auditRequired || memory.decayClass === 'audit_required') return false;
  if (override?.disablePurge) return false;
  const windows = resolveRetentionWindows(memory, policy);
  const ageDays = elapsedDaysSince(memory.createdAt, now);
  return ageDays >= windows.purgeAfterDays;
};

export const evaluateMemoryDecay = (
  memory: MemoryDecayRecord,
  policy: MemoryDecayPolicy,
  now: string,
  governanceOverrideHook?: GovernanceDecayOverrideHook
): MemoryDecayState => {
  const override = governanceOverrideHook?.(memory, policy);
  if (override?.forceState) return override.forceState;
  if (override?.holdState) return override.holdState;

  const windows = resolveRetentionWindows(memory, policy);
  const idleDays = elapsedDaysSince(memory.lastAccessedAt, now);

  if (shouldPurgeMemory(memory, policy, now, override)) return 'PURGED';
  if (shouldFossilizeMemory(memory, policy, now)) return 'FOSSILIZED';
  if (shouldArchiveMemory(memory, policy, now)) return 'ARCHIVED';
  if (shouldCompressMemory(memory, policy, now)) return 'COMPRESSED';
  if (idleDays >= windows.coolingAfterDays) return 'COOLING';
  return 'ACTIVE';
};

/**
 * Architecture notes:
 * - Sovereign forgetting: decay is deterministic and host-independent, allowing every
 *   participant to independently verify lifecycle transitions.
 * - Governed retention: policy/governance and audit-required memory classes resist decay
 *   through expanded windows and anti-purge guarantees.
 * - Audit-preserving deletion: PURGED state is only reachable when legal hold, governance
 *   override, and audit-preservation controls all permit destructive deletion.
 */
export const transitionMemoryState = (
  memory: MemoryDecayRecord,
  policy: MemoryDecayPolicy,
  now: string,
  governanceOverrideHook?: GovernanceDecayOverrideHook
): MemoryDecayRecord => {
  const nextState = evaluateMemoryDecay(memory, policy, now, governanceOverrideHook);
  if (nextState === memory.state) return memory;
  return {
    ...memory,
    state: nextState,
    lastStateChangedAt: now
  };
};
