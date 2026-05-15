/**
 * Canonical runtime contract vocabulary shared by runtime and SDK packages.
 * Public contracts only: no provider internals.
 */

export const AUTHORIZATION_FAILED_STAGES = ["policy", "governance", "capability", "consent"] as const;
export type AuthorizationFailedStage = (typeof AUTHORIZATION_FAILED_STAGES)[number];

export const CAPABILITY_DECISION_REASONS = ["allowed", "denied", "missing_capability", "expired_capability"] as const;
export type CapabilityDecisionReason = (typeof CAPABILITY_DECISION_REASONS)[number];

export const CONSENT_DECISION_REASONS = ["allowed", "denied", "no_grant", "expired", "revoked"] as const;
export type ConsentDecisionReason = (typeof CONSENT_DECISION_REASONS)[number];

export interface ContractEvaluationEnvelope<TReason extends string = string> {
  allowed: boolean;
  reason: TReason;
  reasons: string[];
}

export interface AuthorizationDecisionEnvelope {
  decision: "allow" | "deny";
  allowed: boolean;
  failedStage?: AuthorizationFailedStage;
  reasoningChain: string[];
  obligations: Array<{ code: string; reason?: string; metadata?: Record<string, unknown> }>;
  provenance: Record<string, unknown>;
  explainability: Record<string, unknown>;
}

export const RUNTIME_CONTRACTS_VERSION = "2026-05-runtime-contracts-v1" as const;
