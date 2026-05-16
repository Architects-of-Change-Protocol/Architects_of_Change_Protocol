import type { RuntimeCapability } from './types';

export type CapabilityCategory =
  | 'execution'
  | 'data-access'
  | 'payout'
  | 'consent'
  | 'governance'
  | 'runtime'
  | 'agent'
  | 'delegation'
  | 'transport'
  | 'tenant'
  | 'sdk';

export type CapabilityLifecycleState =
  | 'active'
  | 'expired'
  | 'revoked'
  | 'suspended'
  | 'delegated'
  | 'attenuated'
  | 'derived'
  | 'invalid';

export type CapabilityConstraint = {
  temporal?: { notBefore?: string; expiresAt?: string };
  identity?: { subjectActorId?: string; granteeActorId?: string };
  trustLevel?: string;
  tenant?: string;
  resources?: string[];
  actions?: string[];
  executionCountLimit?: number;
  concurrencyLimit?: number;
  transportOrigin?: string[];
  compatibility?: { sdk?: string; runtime?: string };
  environmentPosture?: string[];
};

export type CapabilityObligation = { code: string; required: boolean; details?: string };

export type CapabilityDelegation = {
  parentCapabilityId: string;
  delegationDepth: number;
  delegationPath: string[];
  delegatedAt: string;
  delegatedBy: string;
  delegationReason: string;
  inheritedConstraints: CapabilityConstraint;
  attenuationRules: string[];
};

export type CapabilityLineage = {
  originCapabilityId: string;
  parentCapabilityId?: string;
  derivationChain: string[];
  delegationChain: string[];
  attenuationHistory: string[];
  revocationAncestry: string[];
  executionAncestry: string[];
};

export type CapabilityRevocationReason =
  | 'direct_revocation'
  | 'inherited_revocation'
  | 'transitive_revocation'
  | 'partial_revocation'
  | 'temporary_suspension'
  | 'expired'
  | 'invalid_lineage';

export type CapabilityRevocationRecord = {
  capabilityId: string;
  reason: CapabilityRevocationReason;
  revokedAt: string;
  revokedBy: string;
  sourceCapabilityId?: string;
  propagation: 'none' | 'lineage-descendants' | 'partial';
};

export type CapabilityEvaluationTrace = {
  issuedBy?: string;
  delegatedBy?: string;
  attenuationApplied: string[];
  constraintsEvaluated: string[];
  obligationsInherited: string[];
  revocationSource?: string;
  executionBoundaryChecks: string[];
  finalCapabilityDecision: 'allow' | 'deny';
  visibilityTier: 'internal' | 'audit-safe' | 'sdk-safe' | 'operator' | 'user-facing';
};

export function mergeCapabilityObligations(
  parent: CapabilityObligation[],
  child: CapabilityObligation[]
): CapabilityObligation[] {
  const byCode = new Map(parent.map((item) => [item.code, item]));
  for (const obligation of child) {
    const existing = byCode.get(obligation.code);
    if (!existing) {
      byCode.set(obligation.code, obligation);
      continue;
    }
    byCode.set(obligation.code, {
      ...existing,
      required: existing.required || obligation.required,
      details: obligation.details ?? existing.details
    });
  }
  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function validateDelegation(parent: RuntimeCapability, child: RuntimeCapability): string[] {
  const issues: string[] = [];
  if (parent.subjectActorId !== child.subjectActorId) issues.push('subject_mismatch');
  if (parent.granteeActorId !== child.granteeActorId) issues.push('grantee_mismatch');
  if (parent.expiresAt && child.expiresAt && child.expiresAt > parent.expiresAt) issues.push('lifetime_escalation');
  const actions = new Set(parent.allowedActions);
  if (child.allowedActions.some((action) => !actions.has(action))) issues.push('action_escalation');
  if (child.scope.some((scope) => !parent.scope.some((p) => scope.startsWith(p)))) issues.push('scope_escalation');
  return issues;
}

export function attenuateCapability(
  parent: RuntimeCapability,
  patch: Partial<Pick<RuntimeCapability, 'allowedActions' | 'scope' | 'expiresAt' | 'notBefore'>>
): RuntimeCapability {
  const next: RuntimeCapability = {
    ...parent,
    allowedActions: patch.allowedActions ?? parent.allowedActions,
    scope: patch.scope ?? parent.scope,
    expiresAt: patch.expiresAt ?? parent.expiresAt,
    notBefore: patch.notBefore ?? parent.notBefore
  };
  const issues = validateDelegation(parent, next);
  if (issues.length > 0) {
    throw new Error(`Attenuation must be fail-closed. Violations: ${issues.join(',')}`);
  }
  return next;
}

export function evaluateCapabilityLineage(
  capabilityId: string,
  lineageRecords: Map<string, CapabilityLineage>,
  revoked: Set<string>
): { valid: boolean; revokedAncestor?: string } {
  const lineage = lineageRecords.get(capabilityId);
  if (!lineage) return { valid: false };
  for (const ancestor of lineage.derivationChain) {
    if (revoked.has(ancestor)) return { valid: false, revokedAncestor: ancestor };
  }
  return { valid: true };
}
