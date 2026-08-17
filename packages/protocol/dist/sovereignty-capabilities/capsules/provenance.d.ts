import type { CanonicalClaimId, CanonicalEvidenceId, CanonicalIssuer, CanonicalStandingId, CanonicalTimestamp } from '../../claims/primitives';
import type { CanonicalStanding } from '../../claims/standing';
import { type SovereignAssetId } from '../../identity';
import { type AuthorityClaim, type DerivationClaim, type DerivationRelationKind, type OriginClaim, type SovereignLineageDirection, type SovereignLineageTrace } from '../../manifest';
import type { SovereigntyCapabilityImplementation } from '../implementation';
import { type SovereigntyCapabilityClock } from '../time';
/**
 * AOC.PROVENANCE — the production Sovereignty Capability capsule that answers:
 *
 *   "What does someone assert about where this sovereign subject came from,
 *    who claims to have authored it, what it derives from — and does anyone
 *    dispute that?"
 *
 * It is the third of the canonical eight to become a real implementation of
 * the SM-03 socket. Origin, authorship, signing and contestation primitives
 * already existed in `@aoc/protocol/manifest` and are reused verbatim
 * (`buildOriginClaim`, `buildAuthorityClaim`, `contestClaim`). What SM-05 adds
 * underneath is the one genuinely missing piece: a first-class
 * `DerivationClaim`, so a derivation relationship between sovereign subjects
 * is machine-identifiable rather than buried in free text.
 *
 * ## Assertions, not history
 *
 * Every operation here records what an issuer *asserts*. Protocol does not
 * determine whether the assertion is historically true, whether the issuer
 * owns anything, whether copyright exists, whether a derivation was legally
 * authorized, whether a licence was breached, or whether a court would accept
 * any of it:
 *
 *     provenance assertion ≠ historical truth
 *     provenance assertion ≠ legal ownership
 *     derivation relation  ≠ permission to derive
 *     signature            ≠ truth
 *
 * A caller asserting something disputable is therefore an ordinary *success*,
 * not a capability failure — the assertion was well formed and was recorded.
 * Disagreement is expressed by contesting the claim, which records that a
 * challenge exists without deciding who is right.
 *
 * ## What this capsule deliberately does not do
 *
 * - **Create identity.** It never calls `mintSovereignAssetId`. Provenance
 *   operates on subjects that already exist, so `invocation.subject` is
 *   required rather than minted — see `PROVENANCE_SUBJECT_REQUIRED`.
 * - **Compute or require integrity.** No bytes, no `ContentIdentity`, no
 *   manifest digest. A building, a legal entity or an API resource with no
 *   byte representation receives provenance exactly like a file does.
 * - **Sign or verify anything.** `signClaim`, `verifySignedClaim`,
 *   `signSovereignManifest`, key generation and signature verification are
 *   AOC.VERIFIABILITY's contract and none of them are called here. The claims
 *   this capsule returns are ordinary unsigned canonical records; a caller who
 *   wants cryptographic attribution passes one through those primitives, which
 *   remain public and unchanged.
 * - **Mutate a manifest.** Claims are appendable assertions. Nothing here
 *   rewrites `SovereignManifestV1` to insert a claim, and contesting a claim
 *   does not set a manifest's lifecycle state to disputed — a hidden state
 *   change is not a provenance record.
 * - **Infer anything along an edge.** A derivation copies no licence, rights,
 *   obligations, authority, authorship, evidence or governance policy from
 *   source to child. Those belong to AOC.LICENSING_TERMS and
 *   AOC.GOVERNANCE_COMPATIBILITY.
 * - **Touch the outside world.** `assertedOrigin` is an assertion value, never
 *   dereferenced even when it looks like a URL. No network, provider, chain,
 *   registry, database or filesystem access, and no key or credential input.
 *
 * ## Why licence and generic authority kinds are not exposed
 *
 * `AuthorityClaimKind` includes `Rights`, `License` and `Custom`, and the
 * low-level `buildAuthorityClaim` primitive still offers all of them. The
 * formal Provenance capsule exposes only `declare-authorship`, with the kind
 * fixed to `Authorship`. Offering licence creation as a headline Provenance
 * operation would blur the boundary with AOC.LICENSING_TERMS before that
 * mineral exists, and a generic declare-any-authority-kind operation would
 * make this capsule an authority factory rather than a provenance capsule.
 */
/** Stable, machine-readable reason codes this capsule can report. */
export declare const PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES: Readonly<{
    /**
     * No sovereign subject was named. Provenance describes something that
     * already exists, and minting an identity to have something to describe
     * would make this capsule quietly become AOC.IDENTITY.
     */
    readonly subjectRequired: "PROVENANCE_SUBJECT_REQUIRED";
    readonly invalidInput: "PROVENANCE_INVALID_INPUT";
    readonly unsupportedOperation: "PROVENANCE_UNSUPPORTED_OPERATION";
    readonly invalidClaimId: "PROVENANCE_INVALID_CLAIM_ID";
    readonly invalidStandingId: "PROVENANCE_INVALID_STANDING_ID";
    readonly invalidIssuer: "PROVENANCE_INVALID_ISSUER";
    readonly invalidOrigin: "PROVENANCE_INVALID_ORIGIN";
    readonly invalidAuthorshipStatement: "PROVENANCE_INVALID_AUTHORSHIP_STATEMENT";
    readonly derivationSourcesRequired: "PROVENANCE_DERIVATION_SOURCES_REQUIRED";
    readonly invalidSourceSubject: "PROVENANCE_INVALID_SOURCE_SUBJECT";
    readonly duplicateDerivationSource: "PROVENANCE_DUPLICATE_DERIVATION_SOURCE";
    /** The invocation subject appeared among its own asserted sources. */
    readonly derivationSelfReference: "PROVENANCE_DERIVATION_SELF_REFERENCE";
    readonly invalidDerivationRelation: "PROVENANCE_INVALID_DERIVATION_RELATION";
    readonly invalidStatement: "PROVENANCE_INVALID_STATEMENT";
    readonly invalidTimestamp: "PROVENANCE_INVALID_TIMESTAMP";
    readonly invalidEvidenceRefs: "PROVENANCE_INVALID_EVIDENCE_REFS";
    readonly invalidProvenanceClaim: "PROVENANCE_INVALID_PROVENANCE_CLAIM";
    /** The claim being contested is about a different subject than the invocation. */
    readonly claimSubjectMismatch: "PROVENANCE_CLAIM_SUBJECT_MISMATCH";
    readonly invalidContestationReason: "PROVENANCE_INVALID_CONTESTATION_REASON";
    readonly invalidLineageData: "PROVENANCE_INVALID_LINEAGE_DATA";
    readonly invalidLineageDirection: "PROVENANCE_INVALID_LINEAGE_DIRECTION";
    readonly invalidMaxDepth: "PROVENANCE_INVALID_MAX_DEPTH";
}>;
export type ProvenanceSovereigntyCapabilityReasonCode = (typeof PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES)[keyof typeof PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES];
/**
 * The operations AOC.PROVENANCE 1.0.0 supports. Closed for this capability
 * version: an unrecognized operation is reported rather than guessed at.
 */
export declare const PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS: readonly ["declare-origin", "declare-authorship", "record-derivation", "contest-provenance-claim", "trace-lineage"];
export type ProvenanceSovereigntyCapabilityOperation = (typeof PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];
/**
 * Fields every claim-creating Provenance operation shares.
 *
 * `claimId` is caller-supplied and is emphatically not the `invocationId`:
 * one identifies *this execution of a capability*, the other identifies *this
 * assertion*, and they have different lifetimes, different holders and
 * different reasons to be referenced later. Protocol has no claim-id minting
 * primitive, so rather than inventing an id grammar for SM-05, the caller's id
 * is accepted under existing `CanonicalId` semantics.
 *
 * `issuedAt` is optional. Supplied, it is preserved — which is what makes
 * importing historical assertions possible. Omitted, it comes from the
 * injectable Protocol clock as a canonical UTC timestamp, never a local-offset
 * or locale-formatted string.
 */
interface ProvenanceClaimInputBase {
    readonly claimId: CanonicalClaimId;
    readonly issuer: CanonicalIssuer;
    readonly issuedAt?: CanonicalTimestamp;
    /**
     * Real, caller-owned canonical evidence references, preserved verbatim.
     * Nothing is ever fabricated here: a claim digest, an invocation id, a
     * subject id, a `ContentIdentity` or a URL is not a `CanonicalEvidenceId`,
     * and an empty list is the honest representation of "no evidence was
     * referenced". Protocol does not resolve these refs — a reference is not
     * proof that its target exists.
     */
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
export interface DeclareOriginProvenanceInput extends ProvenanceClaimInputBase {
    readonly operation: 'declare-origin';
    /** An assertion value. Never parsed, resolved or dereferenced, URL-shaped or not. */
    readonly assertedOrigin: string;
}
export interface DeclareAuthorshipProvenanceInput extends ProvenanceClaimInputBase {
    readonly operation: 'declare-authorship';
    readonly statement: string;
}
export interface RecordDerivationProvenanceInput extends ProvenanceClaimInputBase {
    readonly operation: 'record-derivation';
    /**
     * The asserted parents. The *child* is deliberately not a field: it is
     * always `invocation.subject.sovereignAssetId`, so a claim can never
     * disagree with the invocation it was made under.
     */
    readonly sourceSovereignAssetIds: readonly SovereignAssetId[];
    readonly relation: DerivationRelationKind;
    readonly statement?: string;
    /** When the derivation is asserted to have happened — not when it was recorded. */
    readonly occurredAt?: CanonicalTimestamp;
}
export interface ContestProvenanceClaimInput {
    readonly operation: 'contest-provenance-claim';
    readonly standingId: CanonicalStandingId;
    /** The claim to contest, unchanged. It is read, never rewritten. */
    readonly claim: OriginClaim | AuthorityClaim | DerivationClaim;
    readonly reason: string;
    readonly effectiveAt?: CanonicalTimestamp;
}
export interface TraceLineageProvenanceInput {
    readonly operation: 'trace-lineage';
    readonly direction: SovereignLineageDirection;
    /**
     * The claims to analyse, supplied by the caller. Protocol keeps no global
     * lineage graph and needs no database, index or provider to answer this.
     */
    readonly derivationClaims: readonly DerivationClaim[];
    readonly maxDepth?: number;
}
export type ProvenanceSovereigntyCapabilityInput = DeclareOriginProvenanceInput | DeclareAuthorshipProvenanceInput | RecordDerivationProvenanceInput | ContestProvenanceClaimInput | TraceLineageProvenanceInput;
export interface DeclareOriginProvenanceOutput {
    readonly operation: 'declare-origin';
    readonly claim: OriginClaim;
}
export interface DeclareAuthorshipProvenanceOutput {
    readonly operation: 'declare-authorship';
    readonly claim: AuthorityClaim;
}
export interface RecordDerivationProvenanceOutput {
    readonly operation: 'record-derivation';
    readonly claim: DerivationClaim;
}
/**
 * The contested claim and the standing recording the challenge.
 *
 * `claim` is the caller's original object, returned untouched — contestation
 * preserves history rather than replacing it. `standing.status` is
 * `Contested`, which states only that a challenge exists. It does not state
 * that the challenger is right, does not delete or supersede the claim, and
 * does not resolve the dispute; no policy, approval, governance body, oracle
 * or reviewer is consulted, because Protocol is not the adjudicator.
 */
export interface ContestProvenanceClaimOutput {
    readonly operation: 'contest-provenance-claim';
    readonly claim: OriginClaim | AuthorityClaim | DerivationClaim;
    readonly standing: CanonicalStanding;
}
export interface TraceLineageProvenanceOutput {
    readonly operation: 'trace-lineage';
    readonly trace: SovereignLineageTrace;
}
export type ProvenanceSovereigntyCapabilityOutput = DeclareOriginProvenanceOutput | DeclareAuthorshipProvenanceOutput | RecordDerivationProvenanceOutput | ContestProvenanceClaimOutput | TraceLineageProvenanceOutput;
export interface ProvenanceSovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly ProvenanceSovereigntyCapabilityReasonCode[];
}
export interface CreateProvenanceSovereigntyCapabilityImplementationOptions {
    /**
     * Injectable time source for a claim's `issuedAt` and a standing's
     * `effectiveAt` when the caller supplied neither. Reuses the existing SM-03
     * `SovereigntyCapabilityClock` rather than adding a second clock.
     *
     * `invocation.requestedAt` is deliberately not used: it is caller-supplied
     * envelope metadata about when a request was constructed, which is a
     * different fact from when an assertion was issued.
     */
    readonly clock?: SovereigntyCapabilityClock;
}
/**
 * Validates the capability-specific Provenance input, accumulating every
 * reason rather than reporting only the first, and never mutating what it was
 * given — no array is sorted, deduplicated, trimmed or frozen in place.
 *
 * Subject-dependent rules are deliberately *not* checked here: whether the
 * child appears among its own sources, and whether a contested claim is about
 * the invocation's subject, are questions about the pairing of an input with
 * an invocation, and this function only sees the input. The capsule applies
 * them once the subject is known.
 */
export declare function validateProvenanceSovereigntyCapabilityInput(value: unknown): ProvenanceSovereigntyCapabilityInputValidationResult;
export declare function isValidProvenanceSovereigntyCapabilityInput(value: unknown): value is ProvenanceSovereigntyCapabilityInput;
export interface ProvenanceSovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<ProvenanceSovereigntyCapabilityInput, ProvenanceSovereigntyCapabilityOutput> {
}
/**
 * Builds the production AOC.PROVENANCE capsule.
 *
 * A factory, for the injectable clock and so that importing this module
 * performs no work: nothing is registered, nothing is mutated, no global is
 * touched and no id is generated at import time. There is no implementation
 * registry — the capsule is passed explicitly to `invokeSovereigntyCapability`,
 * which is the only supported way to execute it.
 */
export declare function createProvenanceSovereigntyCapabilityImplementation(options?: CreateProvenanceSovereigntyCapabilityImplementationOptions): ProvenanceSovereigntyCapabilityImplementation;
export {};
//# sourceMappingURL=provenance.d.ts.map