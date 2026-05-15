/**
 * Compatibility facade.
 * Canonical semantic ownership lives in:
 * @aoc/protocol/contracts
 */
export type { CanonicalId, UtcDateTime, ContextCondition, ConsentGrant, PolicyDecision as PolicyDecisionOutcome, } from '@aoc/protocol/contracts';
export interface DecisionObligation {
    readonly type: string;
    readonly parameters?: Readonly<Record<string, string | number | boolean>>;
}
export interface PolicyDecisionContract {
    readonly schemaVersion: '1.0.0';
    readonly decisionId: string;
    readonly outcome: 'allow' | 'deny' | 'conditional';
    readonly obligations?: readonly DecisionObligation[];
    readonly reasoningMetadata: Readonly<Record<string, string | number | boolean>>;
    readonly policyRevisionIds: readonly string[];
    readonly evaluationTraceRefs?: readonly string[];
    readonly riskScore?: {
        readonly value: number;
        readonly band: 'low' | 'medium' | 'high' | 'critical';
        readonly modelVersion?: string;
    };
    readonly evaluatedAt: string;
}
export declare const consentGrantSchemaExample: {
    readonly $id: "https://aoc.protocol/schemas/consent-grant/1-0-0";
    readonly type: "object";
    readonly required: readonly ["schemaVersion", "grantId", "grantor", "grantee", "purpose", "allowedOperations", "legalBasis", "issuedAt"];
};
export declare const policyDecisionSchemaExample: {
    readonly $id: "https://aoc.protocol/schemas/policy-decision/1-0-0";
    readonly type: "object";
    readonly required: readonly ["schemaVersion", "decisionId", "outcome", "reasoningMetadata", "policyRevisionIds", "evaluatedAt"];
};
//# sourceMappingURL=contracts.d.ts.map