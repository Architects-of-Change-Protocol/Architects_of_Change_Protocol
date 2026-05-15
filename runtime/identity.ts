/**
 * Canonical principal vocabulary for runtime-facing contracts.
 *
 * IMPORTANT:
 * - Keep legacy field names (subject_hash, consumer_id, requester_id, subject_id)
 *   for wire compatibility.
 * - Normalize to these canonical terms inside runtime internals.
 */

export type PrincipalId = string;
export type TenantId = string;

export type ActorKind = 'human' | 'service' | 'agent' | 'runtime';

export type RuntimeIdentity = {
  principal_id: PrincipalId;
  actor_kind: ActorKind;
  tenant_id?: TenantId;
};

export type CanonicalPrincipalContext = {
  subject_principal_id: PrincipalId;
  requester_principal_id?: PrincipalId;
  consumer_principal_id?: PrincipalId;
  tenant_id?: TenantId;
};

export type LegacyPrincipalAliases = {
  subject_id?: string;
  subject_hash?: string;
  requester_id?: string;
  consumer_id?: string;
};

export function normalizePrincipalContext(input: LegacyPrincipalAliases & { tenant_id?: string }): CanonicalPrincipalContext {
  return {
    subject_principal_id: input.subject_id ?? input.subject_hash ?? '',
    requester_principal_id: input.requester_id,
    consumer_principal_id: input.consumer_id,
    tenant_id: input.tenant_id,
  };
}
