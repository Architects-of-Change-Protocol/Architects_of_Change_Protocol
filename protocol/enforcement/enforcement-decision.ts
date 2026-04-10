import type { EnforcementDecision } from './enforcement-types';

export function buildDecisionTimestamp(date: Date): string {
  return date.toISOString();
}

export type { EnforcementDecision };
