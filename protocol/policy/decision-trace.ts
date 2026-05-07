export type PolicyDecisionTrace = {
  traceId: string;
  evaluatedAt: string;
  evaluatedPolicies: string[];
  decisionReason: string;
  actorId: string;
  resourceId: string;
};

const traceStore = new Map<string, PolicyDecisionTrace>();

export function recordDecisionTrace(trace: PolicyDecisionTrace): void {
  traceStore.set(trace.traceId, trace);
}

export function getDecisionTrace(traceId: string): PolicyDecisionTrace | undefined {
  return traceStore.get(traceId);
}
