/**
 * Canonical principal vocabulary for runtime-facing contracts.
 *
 * IMPORTANT:
 * - Keep legacy field names (subject_hash, consumer_id, requester_id, subject_id)
 *   for wire compatibility.
 * - Normalize to these canonical terms inside runtime internals.
 */
export function normalizePrincipalContext(input) {
    return {
        subject_principal_id: input.subject_id ?? input.subject_hash ?? '',
        requester_principal_id: input.requester_id,
        consumer_principal_id: input.consumer_id,
        tenant_id: input.tenant_id,
    };
}
