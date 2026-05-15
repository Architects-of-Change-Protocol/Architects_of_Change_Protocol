/**
 * Canonical runtime contract vocabulary shared by runtime and SDK packages.
 * Public contracts only: no provider internals.
 */
export declare const AUTHORIZATION_FAILED_STAGES: readonly ["policy", "governance", "capability", "consent"];
export type AuthorizationFailedStage = (typeof AUTHORIZATION_FAILED_STAGES)[number];
export declare const CAPABILITY_DECISION_REASONS: readonly ["allowed", "denied", "missing_capability", "expired_capability"];
export type CapabilityDecisionReason = (typeof CAPABILITY_DECISION_REASONS)[number];
export declare const CONSENT_DECISION_REASONS: readonly ["allowed", "denied", "no_grant", "expired", "revoked"];
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
    obligations: Array<{
        code: string;
        reason?: string;
        metadata?: Record<string, unknown>;
    }>;
    provenance: Record<string, unknown>;
    explainability: Record<string, unknown>;
}
export declare const RUNTIME_CONTRACTS_VERSION: "2026-05-runtime-contracts-v1";
//# sourceMappingURL=contracts.d.ts.map