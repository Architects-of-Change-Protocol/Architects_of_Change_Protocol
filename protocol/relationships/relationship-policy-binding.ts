import { Relationship, RelationshipPolicyBinding } from './types';

export function attachPolicy(
  relationship: Relationship,
  input: { policyId: string; version?: string; at?: string },
): Relationship {
  const attachedAt = input.at ?? new Date().toISOString();
  const currentBindings = relationship.policyBindings ?? [];

  const nextBindings: RelationshipPolicyBinding[] = currentBindings.map((binding) =>
    binding.policyId === input.policyId
      ? { ...binding, active: true, version: input.version ?? binding.version, attachedAt }
      : binding,
  );

  if (!nextBindings.some((binding) => binding.policyId === input.policyId)) {
    nextBindings.push({
      policyId: input.policyId,
      version: input.version,
      attachedAt,
      active: true,
    });
  }

  return {
    ...relationship,
    policyBindings: nextBindings,
    updatedAt: attachedAt,
  };
}

export function detachPolicy(
  relationship: Relationship,
  input: { policyId: string; at?: string },
): Relationship {
  const detachedAt = input.at ?? new Date().toISOString();
  const nextBindings = (relationship.policyBindings ?? []).map((binding) =>
    binding.policyId === input.policyId ? { ...binding, active: false } : binding,
  );

  return {
    ...relationship,
    policyBindings: nextBindings,
    updatedAt: detachedAt,
  };
}

export function listActivePolicies(relationship: Relationship): RelationshipPolicyBinding[] {
  return (relationship.policyBindings ?? []).filter((binding) => binding.active);
}
