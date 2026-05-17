import {
  classifyIntentConflict,
  declareIntent,
  type IntentAssertion
} from "../../runtime/intent/governance";

const base: IntentAssertion = {
  declaration: {
    intentId: "intent-1",
    category: "execution",
    actorId: "actor-a",
    machineId: "machine-a",
    runtimeId: "runtime-a",
    objective: " run report ",
    scope: ["execution:start", "capability:read"],
    delegationPosture: "bounded",
    replayPosture: "allow-attested",
    trustPosture: "strict",
    executionBoundaries: { region: "us-east" }
  },
  lineage: { ancestry: [], immutableHash: "hash-a" },
  constraints: [{ key: "delegationDepth", operator: "lte", value: 2 }],
  state: "declared",
  visibility: "audit-safe"
};

describe("intent governance", () => {
  test("normalizes declarations deterministically", () => {
    const declared = declareIntent(base);
    expect(declared.declaration.objective).toBe("run report");
  });

  test("fails closed on incompatible trust posture", () => {
    const result = classifyIntentConflict(base, {
      ...base,
      declaration: { ...base.declaration, intentId: "intent-2", trustPosture: "partner" }
    });
    expect(result?.code).toBe("trust_conflict");
  });
});
