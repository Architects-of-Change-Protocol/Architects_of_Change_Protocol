export type MemoryId = string;

export type MemoryCategory =
  | "episodic" | "semantic" | "operational" | "audit" | "replay" | "coordination"
  | "federation" | "policy" | "capability" | "execution" | "intent" | "telemetry"
  | "sdk" | "tenant" | "governance";

export type MemoryState =
  | "declared" | "persisted" | "replayable" | "constrained" | "delegated" | "federated"
  | "immutable" | "mutable" | "attested" | "suspended" | "revoked" | "conflicted"
  | "resolved" | "expired" | "archived";

export type MemoryVisibility =
  | "internal" | "audit-safe" | "sdk-safe" | "operator" | "federation-partner"
  | "user-facing" | "tenant-private" | "governance-only";

export type MemoryTrustPosture =
  | "sovereign" | "trusted" | "partner" | "delegated" | "replay-derived"
  | "federated" | "degraded" | "revoked";

export type MemoryRetentionClass =
  | "ephemeral" | "replay-bound" | "audit-retained" | "governance-retained"
  | "tenant-retained" | "sdk-safe-retained" | "federation-retained";

export type MemoryDeclaration = {
  memoryId: MemoryId;
  category: MemoryCategory;
  state: MemoryState;
  actorId: string;
  runtimeId: string;
  executionId: string;
  intentId: string;
  continuityRef: string;
  contextWindowRef: string;
  immutable: boolean;
};

export type MemoryLineage = {
  ancestry: readonly MemoryId[];
  parentMemoryId?: MemoryId;
  replayOfMemoryId?: MemoryId;
  delegatedFromMemoryId?: MemoryId;
  federatedFromRuntimeId?: string;
  immutableHash: string;
};

export type MemoryMutationConstraint = { key: string; operator: "eq" | "in" | "lte"; value: unknown };

export type MemoryMutation = {
  mode: "append-only" | "mutable" | "replay-derived" | "federated" | "delegated" | "coordination-derived";
  actorId: string;
  reason: string;
};

export type MemoryAttestation = { attestedBy: string; attestedAt: string; reasonCode: string };
export type MemoryReplayConstraint = { preserveAncestry: true; constrainMutation: true };
export type MemoryReplay = { replayId: string; replayExecutionId: string; replayedAt: string; sourceMemoryId: MemoryId };
export type MemoryContextWindow = { continuityRef: string; executionIds: readonly string[]; intentIds: readonly string[] };
export type MemoryContinuityReference = { continuityRef: string; previousContinuityRef?: string; replayLocked: boolean };
export type MemoryFederationReference = { partnerRuntimeId: string; federationEpoch: string; trustPosture: MemoryTrustPosture };
export type MemoryDelegation = { delegatedByActorId: string; delegatedScope: readonly string[]; delegatedVisibility: MemoryVisibility };
export type MemoryConflict = { code: "lineage_conflict" | "mutation_conflict" | "trust_conflict" | "continuity_conflict" | "visibility_conflict"; detail: string };
export type MemoryResolution = { strategy: "fail-closed" | "append-reconciliation" | "suspend"; resolvedBy: string; detail: string };
export type MemoryTrace = { declarationHistory: readonly string[]; mutationHistory: readonly string[]; replayHistory: readonly string[]; trustHistory: readonly string[] };
export type MemoryConsistencyAssertion = { deterministic: true; explainable: true; replaySafe: true; federationCompatible: true; capabilityCompatible: true; policyCompatible: true };
export type MemoryLifecycle = { retention: MemoryRetentionClass; expiresAt?: string; archivedAt?: string };

export type MemoryAssertion = {
  declaration: MemoryDeclaration;
  lineage: MemoryLineage;
  provenance: {
    originatingRuntimeId: string;
    originatingActorId: string;
    originatingExecutionId: string;
    originatingIntentId: string;
    replayAncestry: readonly string[];
    federationAncestry: readonly string[];
    delegatedAncestry: readonly string[];
    coordinationAncestry: readonly string[];
  };
  mutation?: MemoryMutation;
  mutationConstraints: readonly MemoryMutationConstraint[];
  visibility: MemoryVisibility;
  trustPosture: MemoryTrustPosture;
  lifecycle: MemoryLifecycle;
  attestation?: MemoryAttestation;
  replay?: MemoryReplay;
  delegation?: MemoryDelegation;
  federation?: MemoryFederationReference;
  replayConstraint: MemoryReplayConstraint;
  continuity: MemoryContinuityReference;
};

export function declareMemory(assertion: MemoryAssertion): MemoryAssertion {
  if (!assertion.declaration.memoryId || !assertion.declaration.executionId || !assertion.declaration.intentId) throw new Error("Invalid memory declaration");
  if (assertion.provenance.originatingExecutionId !== assertion.declaration.executionId) throw new Error("Provenance execution mismatch");
  if (assertion.provenance.originatingIntentId !== assertion.declaration.intentId) throw new Error("Provenance intent mismatch");
  validateMemoryLineage(assertion.lineage, assertion.declaration.memoryId);
  validateMemoryContinuity(assertion.continuity, assertion.lineage);
  validateMemoryTrust(assertion.trustPosture, assertion.visibility);
  return normalizeMemoryAssertion(assertion);
}

export function validateMemoryLineage(lineage: MemoryLineage, memoryId: MemoryId): void {
  if (lineage.ancestry.includes(memoryId)) throw new Error("Invalid memory lineage: ancestry contains current id");
  if (!lineage.immutableHash.trim()) throw new Error("Invalid memory lineage: immutable hash required");
}

export function normalizeMemoryAssertion(assertion: MemoryAssertion): MemoryAssertion {
  return {
    ...assertion,
    mutationConstraints: [...assertion.mutationConstraints].sort((a, b) => a.key.localeCompare(b.key)),
    lifecycle: { ...assertion.lifecycle, retention: normalizeMemoryRetention(assertion.lifecycle.retention) }
  };
}

export function classifyMemoryConflict(left: MemoryAssertion, right: MemoryAssertion): MemoryConflict | null {
  if (left.lineage.immutableHash !== right.lineage.immutableHash) return { code: "lineage_conflict", detail: "Lineage hash mismatch" };
  if (left.provenance.originatingRuntimeId !== right.provenance.originatingRuntimeId && !right.federation) {
    return { code: "lineage_conflict", detail: "Cross-runtime lineage requires federation reference" };
  }
  if (left.declaration.immutable && right.mutation?.mode && right.mutation.mode !== "append-only") return { code: "mutation_conflict", detail: "Immutable memory cannot mutate" };
  if (left.trustPosture === "revoked" || right.trustPosture === "revoked") return { code: "trust_conflict", detail: "Revoked memory cannot be reused" };
  if (right.delegation && right.delegation.delegatedVisibility !== right.visibility) return { code: "visibility_conflict", detail: "Delegated visibility mismatch" };
  if (left.continuity.replayLocked && right.mutation?.mode === "mutable") return { code: "continuity_conflict", detail: "Replay locked continuity cannot accept mutable mutations" };
  return null;
}

export function validateMemoryContinuity(continuity: MemoryContinuityReference, lineage: MemoryLineage): void {
  if (!continuity.continuityRef.trim()) throw new Error("Continuity reference required");
  if (continuity.replayLocked && lineage.replayOfMemoryId && continuity.previousContinuityRef === undefined) {
    throw new Error("Replay continuity must reference previous continuity");
  }
}

export function validateMemoryTrust(trust: MemoryTrustPosture, visibility: MemoryVisibility): void {
  if (trust === "revoked" && visibility === "federation-partner") throw new Error("Revoked memory cannot be federation-visible");
  if (trust === "delegated" && visibility === "governance-only") throw new Error("Delegated memory cannot escalate to governance-only visibility");
}

export function classifyMemoryVisibility(assertion: MemoryAssertion): MemoryVisibility {
  if (assertion.trustPosture === "revoked") return "governance-only";
  return assertion.visibility;
}

export function normalizeMemoryRetention(retention: MemoryRetentionClass): MemoryRetentionClass {
  if (retention === "ephemeral") return "ephemeral";
  return retention;
}

export function buildMemoryAttestation(assertion: MemoryAssertion, attestedBy: string, reasonCode: string): MemoryAssertion {
  return {
    ...assertion,
    attestation: { attestedBy, reasonCode, attestedAt: new Date().toISOString() },
    declaration: { ...assertion.declaration, state: "attested" }
  };
}

export function buildCognitiveMemoryAssertion(assertion: MemoryAssertion): MemoryAssertion {
  return normalizeMemoryAssertion(assertion);
}

export function validateCognitiveContinuity(left: MemoryAssertion, right: MemoryAssertion): void {
  if (left.continuity.continuityRef !== right.continuity.previousContinuityRef) {
    throw new Error("Cognitive continuity chain broken");
  }
}

export function normalizeCognitionDecision(assertion: MemoryAssertion): MemoryAssertion {
  return normalizeMemoryAssertion(assertion);
}

export function classifyCognitionConflict(left: MemoryAssertion, right: MemoryAssertion): MemoryConflict | null {
  return classifyMemoryConflict(left, right);
}
