import type { AttestationType, CanonicalAttestation, CanonicalAttestationId, CanonicalClaimId, CanonicalCredentialRef, CanonicalPrincipalRef, CanonicalProofRef } from '@aoc/protocol/claims';
import type { CanonicalId } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationMaterialId } from '../case/case-identifiers';
import type { ProtocolizationCaseContext } from '../case/case-operations';
import type { ProtocolizationCaseEvent } from '../case/case-events';
import type { ProtocolizationCase } from '../case/protocolization-case';
import type { EvidenceIntakeReceipt } from '../evidence/evidence-intake-receipt';
import type { ProtocolizationDeclarationRecord } from '../declarations/declaration-record';
import type { ProtocolizationVerificationResult } from '../verification/verification-result';
import type { AttestationSigner } from './attestation-signer';
import { ProfessionalReviewAction } from './review-actions';
import type { ProfessionalReviewDecision, ProfessionalReviewMaterialRequest } from './review-decision';
import type { ProfessionalAttestationRecordedEvent, ProfessionalReviewDecisionRecordedEvent, ProfessionalReviewRequestedEvent } from './review-events';
import type { ProfessionalReviewDecisionId, ProfessionalReviewReasonCode, ProfessionalReviewRequestId } from './review-identifiers';
import type { ProfessionalReviewPacket } from './review-packet';
import type { ProfessionalReviewRequest } from './review-request';
import type { ProfessionalReviewBasisRef, ProfessionalReviewScope } from './review-scope';
/**
 * The professional review operations.
 *
 * ### What success means
 *
 * ```text
 * createProfessionalReviewRequest
 *   APV recorded that professional review was asked for, on one attestation
 *   requirement of this case's exact pinned profile version, bound to the case
 *   revision that stood at that instant.
 *
 * buildProfessionalReviewPacket
 *   APV projected, deterministically, exactly what that request's basis
 *   contains — and nothing added afterwards.
 *
 * recordProfessionalReviewDecision
 *   APV recorded what an identified reviewer decided, and — only for `Attest`,
 *   and only where Protocol's own record could be built without invention —
 *   produced a CanonicalAttestation and associated it to the case.
 * ```
 *
 * Success is *the workflow act happened and is recorded*. It is true for all
 * four actions: a `Reject` is as successful an operation as an `Attest`.
 *
 * ### What these operations never do
 *
 * ```text
 * transition a case state          add READY, Rejected or MoreEvidenceRequired
 * rewrite an evidence receipt      rewrite a declaration record
 * rewrite a verification result    turn a Fail into a Pass
 * mark a requirement satisfied     declare a case ready
 * assign or queue a reviewer       resolve a credential
 * adjudicate between reviewers     interpret a jurisdiction
 * persist anything                 mint a CanonicalAttestationId
 * ```
 *
 * The state line is worth dwelling on. `Reject` adds no `Rejected` state,
 * `RequestMoreEvidence` adds no `MoreEvidenceRequired` state, `Abstain` adds
 * nothing at all, and even a case whose every attestation requirement has been
 * attested gains no `Ready`. APV-04's three states are untouched, and what a
 * professional decision *means* for a case is APV-09's question.
 *
 * The only case mutation this slice can cause is APV-04's own
 * `addProtocolizationCaseMaterial`, called through APV-04's public operation
 * rather than by reaching into the aggregate, and only ever to associate a
 * legitimately constructed `CanonicalAttestation` to a compatible attestation
 * requirement. It moves that requirement from `Pending` to `MaterialPresent` and
 * no further: material present is never a requirement satisfied.
 *
 * ### Sync core, async edge
 *
 * Request creation and packet construction are synchronous and pure. Only
 * `recordProfessionalReviewDecision` is `async`, and only because an injected
 * `AttestationSigner` may need to go somewhere — the repository's own convention
 * for a port that might.
 *
 * ### Nothing is persisted here
 *
 * These operations return records and events and store neither, exactly as
 * APV-05, APV-06 and APV-07 do. A successful `Attest` returns an updated case, a
 * decision, an attestation and three events for the composition layer to commit
 * together under whatever transactional facility it actually has — this package
 * has none, and pretending that independent repository writes were atomic would
 * be worse than admitting they are not.
 */
/** What a review operation needs beyond the case itself. */
export interface ProfessionalReviewContext extends ProtocolizationCaseContext {
    /**
     * The signer, when one is configured.
     *
     * Optional, and its absence is not a way to get an unsigned artifact. Where no
     * signer is configured, a requested `CanonicalAttestation` is constructed only
     * if the caller supplied at least one usable `CanonicalProofRef` of their own;
     * where they did not, the operation fails with
     * `REVIEW_SIGNATURE_UNAVAILABLE` rather than producing an unauditable
     * professional attestation. Nothing is ever fabricated to fill the gap.
     */
    readonly signer?: AttestationSigner;
}
export interface CreateProfessionalReviewRequestInput {
    /** Identity of this request. Unique within the tenant; caller-provided. */
    readonly reviewRequestId: ProfessionalReviewRequestId;
    /** The attestation requirement of the pinned profile review is asked for. */
    readonly attestationRequirementId: AssetRequirementId;
    /** One of that requirement's `acceptedTypes`. */
    readonly requestedAttestationType: AttestationType;
    /** What the reviewer is being asked to attest, machine-readably. */
    readonly requestedScope: ProfessionalReviewScope;
    readonly correlationId?: CanonicalId;
}
/** A raised request: the immutable record, and the fact it produced. */
export interface ProfessionalReviewRequestTransition {
    readonly request: ProfessionalReviewRequest;
    readonly event: ProfessionalReviewRequestedEvent;
}
/**
 * The case-scoped records a caller supplies for the packet to project.
 *
 * Supplied rather than fetched, because these operations hold no repository —
 * the same input minimization APV-07 applies. Everything supplied is checked to
 * belong to the acting tenant and this case before any of it reaches a packet.
 */
export interface ProfessionalReviewPacketInputs {
    readonly evidenceReceipts?: readonly EvidenceIntakeReceipt[];
    readonly declarations?: readonly ProtocolizationDeclarationRecord[];
    readonly verificationResults?: readonly ProtocolizationVerificationResult[];
}
/** What an `Attest` supplies when it wants a Protocol attestation produced. */
export interface ProfessionalAttestationInput {
    /** Caller-provided, exactly like every other identifier in this package. */
    readonly attestationId: CanonicalAttestationId;
    /**
     * The claim the attestation is about.
     *
     * Must already be associated to this case as `Declaration` material. A claim
     * this case does not hold is refused rather than attested to.
     */
    readonly claimRef: CanonicalClaimId;
    /** The attester's own words. Never generated from the case. */
    readonly statement: string;
    /** Identity of the APV-04 material association this will produce. */
    readonly materialId: ProtocolizationMaterialId;
    /**
     * Proof references the caller already holds.
     *
     * Where a signer is configured, its proof is appended to these. At least one
     * proof reference must come from one source or the other: a professional
     * attestation associated to a case as `ProtocolizationMaterialKind.Attestation`
     * is auditable or it is not produced. Supplying none here with no signer
     * configured fails the operation with `REVIEW_SIGNATURE_UNAVAILABLE`; it does
     * not quietly yield an unsigned artifact.
     *
     * Presence is not verification. This package resolves no proof and validates
     * no signature — Protocol defines `CanonicalProofRef` as a reference and
     * nothing more.
     */
    readonly proofRefs?: readonly CanonicalProofRef[];
}
export interface RecordProfessionalReviewDecisionInput {
    /** Identity of this decision. Unique within the tenant; caller-provided. */
    readonly decisionId: ProfessionalReviewDecisionId;
    /** Who decided. Never inferred from the tenant, the subject or a declarant. */
    readonly reviewer: CanonicalPrincipalRef;
    /** What the reviewer presented, as presented. Never resolved. */
    readonly reviewerCredentialRefs?: readonly CanonicalCredentialRef[];
    readonly action: ProfessionalReviewAction;
    /** Required for `Attest`; refused for the other three. */
    readonly scope?: ProfessionalReviewScope;
    /** Required for `Attest`: what the reviewer actually read. */
    readonly reviewedRefs?: readonly ProfessionalReviewBasisRef[];
    /** Required for `Reject`, `RequestMoreEvidence` and `Abstain`. */
    readonly reasonCode?: ProfessionalReviewReasonCode;
    /** Required for `RequestMoreEvidence`; refused for the other three. */
    readonly requestedMaterial?: readonly ProfessionalReviewMaterialRequest[];
    /** Bounded human detail. Presentation only; never machine semantics. */
    readonly note?: string;
    /** Permitted only with `Attest`. Absent means "no Protocol artifact". */
    readonly attestation?: ProfessionalAttestationInput;
    readonly correlationId?: CanonicalId;
}
/**
 * What recording a decision produced.
 *
 * A pure result for the composition layer to commit. The case, the case event,
 * the attestation and the attestation event are present together or not at all:
 * they describe one act, and only `Attest` with a legitimate attestation
 * performs it.
 */
export interface ProfessionalReviewDecisionTransition {
    readonly decision: ProfessionalReviewDecision;
    readonly decisionEvent: ProfessionalReviewDecisionRecordedEvent;
    /** Present only where a legitimate attestation was associated to the case. */
    readonly protocolizationCase?: ProtocolizationCase;
    /** APV-04's own material-added event, unchanged. Present with the case. */
    readonly caseEvent?: ProtocolizationCaseEvent;
    /** The Protocol record, where one was legitimately produced. */
    readonly attestation?: CanonicalAttestation;
    readonly attestationEvent?: ProfessionalAttestationRecordedEvent;
}
/**
 * Creates an immutable request for professional review, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request admission, then lifecycle, then the pinned profile, then requirement
 * kind, then attestation type, then scope, and only then the clock. A failure at
 * any step throws and produces nothing — no request, no event, and, since this
 * operation never touches the case, no mutation of any kind.
 *
 * It does not assign a reviewer, does not queue anything, does not notify
 * anyone, does not create an attestation and does not move the case one
 * revision. The case is byte-for-byte unchanged when it returns.
 */
export declare function createProfessionalReviewRequest(context: ProfessionalReviewContext, protocolizationCase: ProtocolizationCase, input: CreateProfessionalReviewRequestInput): ProfessionalReviewRequestTransition;
/**
 * Projects the bounded, deterministic view of one review basis.
 *
 * Pure and synchronous: no clock, no repository, no I/O, no mutation. Building
 * a packet twice from the same inputs produces the same packet, and building one
 * never changes a case, a receipt, a declaration or a result.
 *
 * ### What it refuses
 *
 * A request from another tenant, for another case, under another pin, naming an
 * unknown requirement or one of the wrong kind, or bound to a revision the
 * supplied case is not at. It repairs none of those: a packet silently built
 * from a corrected reference would be a packet describing a review that was
 * never requested.
 *
 * ### What it never filters
 *
 * Outcomes. Every APV-07 result in the basis appears, whatever it says. A
 * `ManualReview` in particular does not block construction — a packet is exactly
 * what a `ManualReview` is asking for, and refusing to build it would defeat the
 * architecture that emitted it.
 */
export declare function buildProfessionalReviewPacket(context: ProfessionalReviewContext, protocolizationCase: ProtocolizationCase, request: ProfessionalReviewRequest, inputs?: ProfessionalReviewPacketInputs): ProfessionalReviewPacket;
/**
 * Records what a reviewer decided, or fails.
 *
 * Order of checks is part of the contract: tenant, then case validity, then
 * request ownership, then basis revision, then input admission, then lifecycle,
 * then the pinned profile, then requirement kind, then the action's own shape,
 * then the reviewer against the profile's attester constraints, then the scope,
 * then — only for an `Attest` that asked for one — the claim, the proof
 * references and the attestation. A failure at any step throws and produces
 * nothing: no decision, no attestation, no event, and no case mutation.
 *
 * ### Asking for an artifact is atomic; not asking for one is a workflow
 *
 * These are two different calls, and the distinction is the whole reason a
 * refusal here can be absolute:
 *
 * ```text
 * Attest, `attestation` omitted     -> a complete vertical decision, with no
 *                                      canonicalAttestationRef, no Attestation
 *                                      material and no resultingCaseRevision
 *
 * Attest, `attestation` supplied    -> the decision and the CanonicalAttestation
 *                                      and the material association, together,
 *                                      or nothing at all
 * ```
 *
 * So a caller who asked APV to produce a Protocol artifact and cannot
 * legitimately have one — the claim is not the case's, no proof reference can be
 * obtained, the record would not satisfy Protocol's shape — receives an error,
 * not a silently downgraded decision. Downgrading would answer a request nobody
 * made and would hide, behind a success, that the artifact the caller is about
 * to look for does not exist. A professional who wants the position on record
 * without the artifact expresses that by omitting the input, which is a
 * supported outcome and always was.
 *
 * ### None of the four actions is an error
 *
 * A `Reject`, a `RequestMoreEvidence` and an `Abstain` all return successfully.
 * The only things that throw are malformed, unauthorized or incoherent
 * *operations* — never a professional's substantive conclusion.
 *
 * ### Automated results never decide this
 *
 * There is no branch anywhere in this function on an APV-07 outcome. No
 * `if (allPass) attest`, no `if (anyFail) reject`, no threshold, no score. A
 * reviewer may attest over a `Fail` within a narrower scope, and may reject with
 * every check passing; both are recorded exactly as given, and the tension
 * between an automated finding and a professional position stays visible for
 * APV-09 to weigh.
 */
export declare function recordProfessionalReviewDecision(context: ProfessionalReviewContext, protocolizationCase: ProtocolizationCase, request: ProfessionalReviewRequest, input: RecordProfessionalReviewDecisionInput): Promise<ProfessionalReviewDecisionTransition>;
/**
 * Turns an untrusted, persisted value back into a review request, or fails.
 *
 * The single supported way to bring one back across a persistence or network
 * boundary. It validates before it trusts and freezes what it returns, so a
 * store cannot hand a caller a request the workflow would have refused to
 * produce.
 */
export declare function reconstituteProfessionalReviewRequest(value: unknown): ProfessionalReviewRequest;
/**
 * Turns an untrusted, persisted value back into a review decision, or fails.
 *
 * Same discipline, and one extra guarantee that matters here: a decision whose
 * action is a string outside the closed set, or whose action-conditioned shape
 * is wrong — a `Reject` carrying an attestation reference, an `Attest` with no
 * scope — is refused rather than repaired.
 */
export declare function reconstituteProfessionalReviewDecision(value: unknown): ProfessionalReviewDecision;
//# sourceMappingURL=review-operations.d.ts.map