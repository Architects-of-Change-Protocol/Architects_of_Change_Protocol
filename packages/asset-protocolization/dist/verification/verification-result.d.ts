import type { CanonicalVerificationId } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationProfileRef, ProtocolizationTenantId } from '../case/case-identifiers';
import type { VerificationCheckOutcome } from './verification-outcome';
import type { VerificationExecutionId, VerificationReasonCode } from './verification-identifiers';
/**
 * `ProtocolizationVerificationResult` — the immutable record that one
 * profile-declared check **was executed** against one case at one revision and
 * returned one outcome.
 *
 * ### What a result means
 *
 * Exactly this, and it is worth spelling out because reading more into it is
 * the central risk of this slice:
 *
 * ```text
 * this check, declared by this exact profile version for this requirement,
 * was executed by a caller acting as this tenant,
 * against this case as it stood at this revision,
 * over the inputs named below,
 * at this instant,
 * and returned this outcome for this reason.
 * ```
 *
 * ### What a result does not mean
 *
 * ```text
 * Pass          != universal truth        != legal ownership
 * Pass          != professional approval  != case READY
 * Fail          != case rejected          != case cancelled
 * Warning       != Pass                   != ignorable
 * ManualReview  != attestation            != reviewer assigned
 * Unavailable   != Fail                   != dependency is wrong
 * all Pass      != READY                  != protocolized
 * ```
 *
 * There is deliberately no `passed` boolean, no score, no confidence number and
 * no case-level verdict field anywhere on this type. Each would be a lossy
 * re-spelling of `outcome`, and the loss always falls in the same direction —
 * toward reporting certainty the check did not have.
 *
 * ### The result is a historical fact, not a live view
 *
 * `evaluatedCaseRevision` is what makes that true. A result produced at revision
 * `4` remains a statement about revision `4` forever: adding evidence at
 * revision `5` neither updates it nor invalidates it, and nothing in this
 * package rewrites one. Whether a prior result still describes the case's
 * current state is a question a *reader* answers by comparing revisions
 * (`verification-projections.ts`), never something the record silently changes
 * its mind about.
 *
 * ### Immutability and re-execution
 *
 * Every field is fixed at construction, and there is no operation anywhere in
 * this package that rewrites one — no update, no delete, no "current result"
 * pointer. Running the same check again produces a *new* result with a new
 * `executionId`; a `Pass` from yesterday and a `Fail` today coexist, in order,
 * each bound to the revision it actually evaluated. Overwriting the first would
 * destroy the only evidence of what the case looked like when it passed, which
 * is the one thing an execution log exists to preserve.
 */
export declare const PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION = "aoc-protocolization-verification/1";
/**
 * What kind of thing one `VerificationInputRef` names.
 *
 * Every member names something the vertical or Protocol already identifies, and
 * the set is closed to what a check in this slice can legitimately have read. A
 * new asset category never adds a member here.
 */
export declare const VerificationInputKind: {
    /** An APV-04 material association inside the case. */
    readonly Material: "Material";
    /** A requirement of the pinned profile. */
    readonly Requirement: "Requirement";
    /** Protocol's identifier for an evidence record. */
    readonly EvidenceRecord: "EvidenceRecord";
    /** Protocol's identifier for a claim record. */
    readonly ClaimRecord: "ClaimRecord";
    /** An APV-05 evidence intake receipt. */
    readonly IntakeReceipt: "IntakeReceipt";
    /** An APV-06 declaration record. */
    readonly DeclarationRecord: "DeclarationRecord";
    /** The case's subject, by its sovereign asset id. */
    readonly Subject: "Subject";
    /** An entry inside an external registry, by its entry id. */
    readonly RegistryEntry: "RegistryEntry";
    /** An observation an injected resolver returned, named by whatever the resolver named it. */
    readonly Observation: "Observation";
};
export type VerificationInputKind = (typeof VerificationInputKind)[keyof typeof VerificationInputKind];
/**
 * One thing a check actually read, named by a stable reference.
 *
 * References, never copies. A result that embedded whole evidence documents,
 * claim records or declaration statements would be a second copy of somebody
 * else's record — free to drift from it, and carrying payload and possibly PII
 * into an audit trail that has no business holding either. What an auditor needs
 * is the ability to go and look at exactly what was read, and an identifier
 * gives them that.
 */
export interface VerificationInputRef {
    readonly kind: VerificationInputKind;
    /** The identifier, as its owner spells it. Opaque here; never parsed. */
    readonly ref: string;
}
export interface ProtocolizationVerificationResult {
    readonly schemaVersion: typeof PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION;
    /** Identity of the execution this result records. Unique within the tenant. */
    readonly executionId: VerificationExecutionId;
    /** The tenant that acted. Required and non-blank, exactly as on a case. */
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    /**
     * The profile version the case was pinned to when this check ran.
     *
     * Recorded rather than re-read, because the check contract that produced this
     * outcome is *this* version's. A pin never changes on a case, so this can
     * never disagree with it — it makes the result independently readable without
     * resolving the case, and it is what proves a v1-pinned case never executed a
     * v2 check.
     */
    readonly profile: ProtocolizationProfileRef;
    /** The verification requirement of the pinned profile that declared this check. */
    readonly requirementId: AssetRequirementId;
    /**
     * The check that ran. One of the `checkIds` the requirement above declares —
     * never merely one the registry happens to know.
     */
    readonly checkId: AssetVerificationCheckId;
    /**
     * The case revision this execution evaluated.
     *
     * The basis of the whole result. Recording a result never mutates the case,
     * so this is the *only* revision concept the slice needs: there is no
     * "recorded revision" that could differ from it, and no execution can be
     * caused by the recording of a previous one.
     */
    readonly evaluatedCaseRevision: number;
    readonly outcome: VerificationCheckOutcome;
    /** Why, as a stable machine token. Absent when the outcome needs no qualification. */
    readonly reasonCode?: VerificationReasonCode;
    /**
     * Human-readable detail, bounded.
     *
     * For people. Nothing in this package reads it, parses it, matches on it or
     * derives behaviour from it — machine behaviour depends on `checkId`,
     * `outcome`, `reasonCode` and `inputRefs`, and on nothing else. Checks must
     * keep declaration statements, document contents, personal data and secrets
     * out of it: this record is an audit artifact that travels further than the
     * material it describes.
     */
    readonly summary?: string;
    /** What the check actually read. References only; never copies. */
    readonly inputRefs?: readonly VerificationInputRef[];
    /**
     * When the check ran, from the injected clock. Never `Date.now()`.
     *
     * Every execution in one batch shares this instant, because a batch evaluates
     * one immutable case revision — the clock is read once, and results that
     * evaluated the same state do not pretend to have been staggered in time.
     */
    readonly executedAt: UtcDateTime;
    /**
     * A `CanonicalVerification` this execution legitimately observed, when one
     * exists.
     *
     * **Optional, and never synthesized.** Most APV checks have no
     * `CanonicalVerification` behind them: minting one would require an
     * `assertionRef`, an issuer, a verifier, a subject and a canonical identifier
     * that a profile-declared check simply does not have, and fabricating any of
     * them to make this field look populated would put a counterfeit Protocol
     * record into circulation. The field exists only so that an executor which
     * *did* consult a real one can say so, and it is absent everywhere else.
     *
     * It is emphatically not this result's own identity: a
     * `VerificationExecutionId` is a vertical workflow identifier and is never
     * written into this field or used as one.
     */
    readonly canonicalVerificationRef?: CanonicalVerificationId;
    /** Correlates this execution with the request that produced it. */
    readonly correlationId?: CanonicalId;
}
export declare function isVerificationInputKind(value: unknown): value is VerificationInputKind;
//# sourceMappingURL=verification-result.d.ts.map