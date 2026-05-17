export type IntentCategory =
  | "access" | "governance" | "replay" | "delegation" | "orchestration" | "automation"
  | "coordination" | "planning" | "negotiation" | "federation" | "execution" | "policy"
  | "capability" | "sdk" | "tenant" | "audit";

export type IntentState =
  | "declared" | "negotiated" | "authorized" | "constrained" | "delegated" | "executing"
  | "replayed" | "suspended" | "revoked" | "conflicted" | "resolved" | "denied"
  | "attested" | "completed";

export type IntentVisibility = "internal" | "audit-safe" | "sdk-safe" | "operator" | "federation-partner" | "user-facing";
export type IntentId = string;

export type IntentDeclaration = {
  intentId: IntentId;
  category: IntentCategory;
  actorId: string;
  machineId: string;
  runtimeId: string;
  objective: string;
  scope: readonly string[];
  delegationPosture: "none" | "bounded" | "federated";
  replayPosture: "disallow" | "allow-identical" | "allow-attested";
  trustPosture: "strict" | "partner" | "sovereign";
  executionBoundaries: Record<string, unknown>;
};

export type IntentLineage = {
  parentIntentId?: IntentId;
  delegatedFromIntentId?: IntentId;
  replayOfIntentId?: IntentId;
  federatedFromRuntimeId?: string;
  ancestry: readonly IntentId[];
  immutableHash: string;
};

export type IntentConstraint = { key: string; operator: "eq" | "in" | "lte"; value: unknown };
export type IntentConflict = { code: "scope_conflict" | "replay_conflict" | "trust_conflict" | "delegation_conflict" | "objective_conflict" | "federation_conflict"; detail: string };

export type IntentAssertion = {
  declaration: IntentDeclaration;
  lineage: IntentLineage;
  constraints: readonly IntentConstraint[];
  state: IntentState;
  visibility: IntentVisibility;
};

export function declareIntent(assertion: IntentAssertion): IntentAssertion {
  validateIntentDeclaration(assertion.declaration);
  validateIntentLineage(assertion.lineage, assertion.declaration.intentId);
  return normalizeIntentAssertion(assertion);
}

export function validateIntentDeclaration(declaration: IntentDeclaration): void {
  if (!declaration.intentId || declaration.scope.length === 0 || !declaration.objective.trim()) {
    throw new Error("Invalid intent declaration: missing id, objective, or scope");
  }
}

export function validateIntentLineage(lineage: IntentLineage, intentId: IntentId): void {
  if (lineage.ancestry.includes(intentId)) {
    throw new Error("Invalid intent lineage: ancestry must not include current intent id");
  }
}

export function normalizeIntentAssertion(assertion: IntentAssertion): IntentAssertion {
  return {
    ...assertion,
    declaration: {
      ...assertion.declaration,
      objective: assertion.declaration.objective.trim()
    },
    constraints: [...assertion.constraints].sort((a, b) => a.key.localeCompare(b.key))
  };
}

export function classifyIntentConflict(left: IntentAssertion, right: IntentAssertion): IntentConflict | null {
  if (left.declaration.objective !== right.declaration.objective) {
    return { code: "objective_conflict", detail: "Execution objectives diverged" };
  }
  if (left.declaration.trustPosture !== right.declaration.trustPosture) {
    return { code: "trust_conflict", detail: "Trust posture mismatch" };
  }
  const missingScope = right.declaration.scope.find((scope) => !left.declaration.scope.includes(scope));
  if (missingScope) {
    return { code: "scope_conflict", detail: `Scope ${missingScope} exceeds negotiated envelope` };
  }
  if (left.declaration.replayPosture === "disallow" && right.declaration.replayPosture !== "disallow") {
    return { code: "replay_conflict", detail: "Replay disallowed by upstream declaration" };
  }
  return null;
}

export function buildCoordinationIntent(assertion: IntentAssertion, participants: readonly string[]): IntentAssertion {
  return normalizeIntentAssertion({
    ...assertion,
    declaration: {
      ...assertion.declaration,
      category: "coordination",
      executionBoundaries: { ...assertion.declaration.executionBoundaries, participants }
    }
  });
}

export function validateCoordinationIntent(assertion: IntentAssertion): void {
  if (assertion.declaration.category !== "coordination") throw new Error("Coordination intent required");
  if (!Array.isArray(assertion.declaration.executionBoundaries.participants)) {
    throw new Error("Coordination participants required");
  }
}

export function classifyCoordinationConflict(left: IntentAssertion, right: IntentAssertion): IntentConflict | null {
  return classifyIntentConflict(left, right);
}

export function normalizeCoordinationDecision(assertion: IntentAssertion): IntentAssertion {
  return normalizeIntentAssertion(assertion);
}
