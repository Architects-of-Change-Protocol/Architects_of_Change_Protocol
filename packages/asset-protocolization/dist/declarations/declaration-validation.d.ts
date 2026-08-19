import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim, CanonicalPrincipalRef, CanonicalReferenceSource } from '@aoc/protocol/claims';
import type { ProtocolizationDeclarationSubmission } from './declaration-submission';
import type { ProtocolizationDeclarationRecord } from './declaration-record';
/**
 * Deterministic **structural** validation for the declaration layer.
 *
 * Read the word "validation" here narrowly and literally: every check below
 * decides whether a value has the *shape* this workflow can carry. Not one of
 * them decides whether anything asserted is true, whether the declarant is who
 * they claim to be, whether they were entitled to declare it, whether the
 * evidence they point at supports them, or whether any requirement is
 * satisfied. The vocabulary in this slice says *admitted*, *structurally
 * accepted* and *recorded* precisely so that a reader is never invited to
 * mistake the one for the other.
 *
 * What this module checks:
 *
 * ```text
 * identifiers are well formed        timestamps are canonical UTC
 * required fields are present        optionals are absent rather than undefined
 * unknown fields are rejected        requirement ids are unique and non-empty
 * the declarant ref is usable        the declared claim type is one Protocol declares
 * the statement is bounded text      the pathway matches its payload
 * ```
 *
 * What it deliberately does not check — and could not:
 *
 * ```text
 * the claim record exists            the proposition is true
 * the declarant is authenticated     the declarant has authority
 * the delegation is valid            the linked evidence supports the claim
 * the assertion is legally binding   the requirement is satisfied
 * ```
 *
 * Correlation against the pinned profile, and the existence of the linked
 * evidence inside the case, are deliberately **not** here: both need the case,
 * so they happen where the case is resolved — in
 * `recordProtocolizationDeclaration`.
 *
 * Style follows APV-03/APV-04/APV-05 exactly: stable `SCREAMING_SNAKE` reason
 * codes, a present-but-`undefined` optional treated as invalid rather than
 * absent, and no semantic interpretation anywhere.
 */
export declare const DECLARATION_VALIDATION_CODES: Readonly<{
    readonly notAnObject: "DECLARATION_NOT_AN_OBJECT";
    readonly unknownField: "DECLARATION_UNKNOWN_FIELD";
    readonly invalidSchemaVersion: "DECLARATION_SCHEMA_VERSION_INVALID";
    readonly invalidDeclarationId: "DECLARATION_ID_INVALID";
    readonly invalidTenantId: "DECLARATION_TENANT_ID_INVALID";
    readonly invalidCaseId: "DECLARATION_CASE_ID_INVALID";
    readonly invalidMaterialId: "DECLARATION_MATERIAL_ID_INVALID";
    readonly invalidProfileRef: "DECLARATION_PROFILE_REF_INVALID";
    readonly invalidDeclarant: "DECLARATION_DECLARANT_INVALID";
    readonly invalidPathway: "DECLARATION_PATHWAY_INVALID";
    readonly invalidClaimRef: "DECLARATION_CLAIM_REF_INVALID";
    readonly invalidClaimDocument: "DECLARATION_CLAIM_DOCUMENT_INVALID";
    readonly invalidClaimType: "DECLARATION_CLAIM_TYPE_INVALID";
    readonly invalidClaimSubtype: "DECLARATION_CLAIM_SUBTYPE_INVALID";
    readonly invalidStatement: "DECLARATION_STATEMENT_INVALID";
    readonly invalidRequirementIds: "DECLARATION_REQUIREMENT_IDS_INVALID";
    readonly invalidSupportingEvidenceRefs: "DECLARATION_SUPPORTING_EVIDENCE_REFS_INVALID";
    readonly invalidDeclaredAt: "DECLARATION_DECLARED_AT_INVALID";
    readonly invalidRecordedAt: "DECLARATION_RECORDED_AT_INVALID";
    readonly invalidSourceRef: "DECLARATION_SOURCE_REF_INVALID";
    readonly invalidCaseRevision: "DECLARATION_CASE_REVISION_INVALID";
    readonly invalidCorrelationId: "DECLARATION_CORRELATION_ID_INVALID";
}>;
export type DeclarationValidationCode = (typeof DECLARATION_VALIDATION_CODES)[keyof typeof DECLARATION_VALIDATION_CODES];
export interface DeclarationValidationResult {
    /**
     * Structural admissibility only.
     *
     * Named `admitted` rather than `valid` on purpose, exactly as APV-05 named
     * its own. "Valid" is the word that quietly slides from *conforms to a
     * schema* to *is legitimate*, and this layer only ever means the first — which
     * matters more here than anywhere else in the vertical, because the thing
     * being admitted is somebody's assertion about the world.
     */
    readonly admitted: boolean;
    readonly reasons: readonly DeclarationValidationCode[];
}
export declare function isClaimType(value: unknown): value is ClaimType;
/**
 * The minimum that makes a supplied principal reference usable as a declarant:
 * it names a principal, and states which generic *kind* of principal Protocol
 * says it is.
 *
 * Deliberately not a restatement of `CanonicalPrincipalRef`'s full shape —
 * `displayName`, `source` and `metadata` are carried through untouched and
 * unexamined — for the anti-drift reason APV-04 gave for
 * `CanonicalRegistryEntryRef` and APV-05 for `CanonicalReferenceSource`: a
 * second, hand-maintained copy of a Protocol contract in this package is a copy
 * that will drift from the contract it copies.
 *
 * `PrincipalKind.Unknown` is admissible, and that is not an oversight. A
 * participant whose canonical identity has not yet been resolved is a
 * first-class case in progressive protocolization: the honest record is "an
 * unresolved principal asserted X", and refusing it would push callers into
 * inventing a kind they do not know.
 *
 * Admitting a declarant ref says nothing whatever about whether that principal
 * exists, is authenticated, or is entitled to declare anything.
 */
export declare function isUsableDeclarantRef(value: unknown): value is CanonicalPrincipalRef;
/** The same admission rule APV-05 applies to a supplied provenance source. */
export declare function isUsableReferenceSource(value: unknown): value is CanonicalReferenceSource;
/**
 * The minimum that makes a supplied `CanonicalClaim` admissible as the thing a
 * declaration is carried by: it has a usable id, a declared `ClaimType`, and a
 * canonical issuance instant.
 *
 * Exactly the three fields this layer actually reads — `id` becomes the
 * recorded reference, `type` becomes the declared claim type, `issuedAt` is
 * what makes the document coherent enough to name — and nothing more. This is
 * an *admission* check on a Protocol type, not a second definition of one; if
 * Protocol later publishes its own `CanonicalClaim` validator (it publishes one
 * for `CanonicalStanding` today, and none for claims), this collapses into a
 * call to it.
 *
 * Admitting a claim document says nothing about whether the claim is true, has
 * been verified, was issued by whom it names, or is supported by the evidence
 * it references.
 */
export declare function isAdmissibleCanonicalClaim(value: unknown): value is CanonicalClaim;
/** Structural admission of one submission. */
export declare function validateProtocolizationDeclarationSubmission(value: unknown): DeclarationValidationResult;
/** Boolean form, for a caller that does not need the reasons. */
export declare function isAdmissibleProtocolizationDeclarationSubmission(value: unknown): value is ProtocolizationDeclarationSubmission;
/**
 * Structural validation of a declaration record.
 *
 * Applied to every record this package produces before it is returned, and
 * again by the repository before one is stored, for the reason APV-04 gave for
 * re-validating a case on every operation: a record may arrive from a store,
 * from a network boundary, or from a caller that built it by hand, and a
 * malformed one must fail where it enters rather than somewhere downstream.
 */
export declare function validateProtocolizationDeclarationRecord(value: unknown): DeclarationValidationResult;
export declare function isValidProtocolizationDeclarationRecord(value: unknown): value is ProtocolizationDeclarationRecord;
//# sourceMappingURL=declaration-validation.d.ts.map