export type PolicyDecision = "allow" | "deny" | "require_approval" | "expired" | "no_match";

export type DecisionContext = {
  request_id: string;
  evaluated_at: string;
  rationale?: string;
  metadata?: Record<string, unknown>;
};
