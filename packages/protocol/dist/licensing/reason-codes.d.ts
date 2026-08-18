/**
 * The stable, machine-readable reason codes SM-09 owns.
 *
 * ## Why one set rather than two
 *
 * Licensing has two readers — the standalone contract validators in
 * `@aoc/protocol/licensing`, and the production AOC.LICENSING_TERMS capsule in
 * `@aoc/protocol/sovereignty-capabilities` — and they answer the *same*
 * questions about the same structures. The other minerals define their reason
 * codes inside their capsule because the capsule is the only place those
 * questions are asked; here the terms model is deliberately reusable outside
 * the capsule, so the codes live with the contract and the capsule imports
 * them. One vocabulary, one spelling, no drift.
 *
 * ## Two layers that must not be confused
 *
 * - **Execution-failure codes** explain why the capability could not answer at
 *   all: no subject, an unreadable request, an unknown operation, a claim about
 *   a different subject. They appear in
 *   `SovereigntyCapabilityFailureResult.reasonCodes`.
 * - **Validation-result codes** explain why a document that *was* examined came
 *   back invalid. They appear inside `validate-license-terms`'s
 *   `validation.reasons`, never as an execution failure — asking "is this
 *   valid?" and being told "no" is a successful execution.
 *
 * Several codes legitimately appear in both layers: a malformed `declare`
 * request fails execution with the same code that a malformed candidate
 * document reports as a validation reason, because it is the same defect.
 */
export declare const LICENSING_TERMS_REASON_CODES: Readonly<{
    /**
     * No sovereign subject was named. Terms are declared *over* something that
     * already exists, and minting an identity to have something to declare over
     * would make this capsule quietly become AOC.IDENTITY.
     */
    readonly subjectRequired: "LICENSING_TERMS_SUBJECT_REQUIRED";
    readonly invalidInput: "LICENSING_TERMS_INVALID_INPUT";
    readonly unsupportedOperation: "LICENSING_TERMS_UNSUPPORTED_OPERATION";
    readonly invalidClaimId: "LICENSING_TERMS_INVALID_CLAIM_ID";
    readonly invalidStandingId: "LICENSING_TERMS_INVALID_STANDING_ID";
    readonly invalidIssuer: "LICENSING_TERMS_INVALID_ISSUER";
    readonly invalidStatement: "LICENSING_TERMS_INVALID_STATEMENT";
    readonly invalidAudience: "LICENSING_TERMS_INVALID_AUDIENCE";
    readonly rulesRequired: "LICENSING_TERMS_RULES_REQUIRED";
    readonly invalidRule: "LICENSING_TERMS_INVALID_RULE";
    readonly duplicateRuleId: "LICENSING_TERMS_DUPLICATE_RULE_ID";
    readonly invalidRuleEffect: "LICENSING_TERMS_INVALID_RULE_EFFECT";
    readonly invalidActionRef: "LICENSING_TERMS_INVALID_ACTION_REF";
    /** A term inside the Protocol-owned `aoc.licensing` namespace that this version does not define. */
    readonly unknownAocAction: "LICENSING_TERMS_UNKNOWN_AOC_ACTION";
    readonly invalidTimestamp: "LICENSING_TERMS_INVALID_TIMESTAMP";
    readonly invalidEvidenceRefs: "LICENSING_TERMS_INVALID_EVIDENCE_REFS";
    /** The candidate is not a structurally valid claim of the required shape and kind. */
    readonly invalidClaim: "LICENSING_TERMS_INVALID_CLAIM";
    /**
     * The claim's `semanticRefs` are malformed, or do not surface the
     * `aoc.licensing:license-terms-declaration` concept. Carrying the licensing
     * concepts is what lets the unchanged SM-07 machinery discover that a claim
     * has licensing semantics, so it is part of the contract rather than a
     * builder convenience.
     */
    readonly invalidSemanticRefs: "LICENSING_TERMS_INVALID_SEMANTIC_REFS";
    /** A terms document declaring a schema version this Protocol version does not implement. */
    readonly unsupportedSchema: "LICENSING_TERMS_UNSUPPORTED_SCHEMA";
    readonly claimSubjectMismatch: "LICENSING_TERMS_CLAIM_SUBJECT_MISMATCH";
    readonly invalidContestationReason: "LICENSING_TERMS_INVALID_CONTESTATION_REASON";
}>;
export type LicensingTermsReasonCode = (typeof LICENSING_TERMS_REASON_CODES)[keyof typeof LICENSING_TERMS_REASON_CODES];
export interface LicensingTermsValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly LicensingTermsReasonCode[];
}
//# sourceMappingURL=reason-codes.d.ts.map