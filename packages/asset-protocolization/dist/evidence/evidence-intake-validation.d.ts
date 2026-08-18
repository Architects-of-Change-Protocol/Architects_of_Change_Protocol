import type { CanonicalEvidence, CanonicalReferenceSource } from '@aoc/protocol/claims';
import type { ProtocolizationEvidenceSubmission } from './evidence-submission';
import type { EvidenceIntakeReceipt } from './evidence-intake-receipt';
/**
 * Deterministic **structural** validation for the intake layer.
 *
 * Read the word "validation" here narrowly and literally: every check below
 * decides whether a value has the *shape* this workflow can carry. Not one of
 * them decides whether anything is true, current, authentic, authoritative,
 * sufficient or legally effective. The vocabulary elsewhere in this slice says
 * *admitted*, *structurally accepted*, *received* and *recorded* precisely so
 * that a reader is never invited to mistake the one for the other.
 *
 * What this module checks:
 *
 * ```text
 * identifiers are well formed         timestamps are canonical UTC
 * required fields are present         optionals are absent rather than undefined
 * unknown fields are rejected         requirement ids are unique and non-empty
 * references are non-blank            declared pathway matches its payload
 * ```
 *
 * What it deliberately does not check — and could not:
 *
 * ```text
 * the evidence record exists          a digest matches any bytes
 * a signature is valid                a document is authentic or unexpired
 * a registry statement is true        a credential belongs to its presenter
 * the evidence is fresh enough        the requirement is satisfied
 * ```
 *
 * Style follows APV-03/APV-04 exactly: stable `SCREAMING_SNAKE` reason codes, a
 * present-but-`undefined` optional treated as invalid rather than absent, and
 * no semantic interpretation anywhere.
 */
export declare const EVIDENCE_INTAKE_VALIDATION_CODES: Readonly<{
    readonly notAnObject: "EVIDENCE_INTAKE_NOT_AN_OBJECT";
    readonly unknownField: "EVIDENCE_INTAKE_UNKNOWN_FIELD";
    readonly invalidSchemaVersion: "EVIDENCE_INTAKE_SCHEMA_VERSION_INVALID";
    readonly invalidIntakeId: "EVIDENCE_INTAKE_ID_INVALID";
    readonly invalidTenantId: "EVIDENCE_INTAKE_TENANT_ID_INVALID";
    readonly invalidCaseId: "EVIDENCE_INTAKE_CASE_ID_INVALID";
    readonly invalidMaterialId: "EVIDENCE_INTAKE_MATERIAL_ID_INVALID";
    readonly invalidProfileRef: "EVIDENCE_INTAKE_PROFILE_REF_INVALID";
    readonly invalidCategoryId: "EVIDENCE_INTAKE_CATEGORY_INVALID";
    readonly invalidPathway: "EVIDENCE_INTAKE_PATHWAY_INVALID";
    readonly invalidEvidenceRef: "EVIDENCE_INTAKE_EVIDENCE_REF_INVALID";
    readonly invalidEvidenceDocument: "EVIDENCE_INTAKE_EVIDENCE_DOCUMENT_INVALID";
    readonly invalidRequirementIds: "EVIDENCE_INTAKE_REQUIREMENT_IDS_INVALID";
    readonly invalidReceivedAt: "EVIDENCE_INTAKE_RECEIVED_AT_INVALID";
    readonly invalidObservedAt: "EVIDENCE_INTAKE_OBSERVED_AT_INVALID";
    readonly invalidSourceRef: "EVIDENCE_INTAKE_SOURCE_REF_INVALID";
    readonly invalidCaseRevision: "EVIDENCE_INTAKE_CASE_REVISION_INVALID";
    readonly invalidCorrelationId: "EVIDENCE_INTAKE_CORRELATION_ID_INVALID";
}>;
export type EvidenceIntakeValidationCode = (typeof EVIDENCE_INTAKE_VALIDATION_CODES)[keyof typeof EVIDENCE_INTAKE_VALIDATION_CODES];
export interface EvidenceIntakeValidationResult {
    /**
     * Structural admissibility only.
     *
     * Named `admitted` rather than `valid` on purpose. "Valid" is the word that
     * quietly slides from *conforms to a schema* to *is legitimate*, and this
     * layer only ever means the first.
     */
    readonly admitted: boolean;
    readonly reasons: readonly EvidenceIntakeValidationCode[];
}
/**
 * The minimum that makes a supplied source descriptor usable as provenance: it
 * names a source *kind* Protocol declares, and a non-blank locator.
 *
 * Deliberately not a restatement of `CanonicalReferenceSource`'s full shape.
 * APV-04 made the same call for `CanonicalRegistryEntryRef` and the reasoning is
 * unchanged: a second, hand-maintained copy of a Protocol contract in this
 * package is a copy that will drift from the contract it copies. `label` and
 * `metadata` are carried through untouched and unexamined.
 */
export declare function isUsableReferenceSource(value: unknown): value is CanonicalReferenceSource;
/**
 * The minimum that makes a supplied `CanonicalEvidence` document admissible as
 * the thing an intake is about: it has a usable id, a declared `EvidenceType`,
 * and a canonical creation instant.
 *
 * Exactly the three fields intake actually reads — `id` becomes the recorded
 * reference, `type` and `createdAt` are what make the document coherent enough
 * to name — and nothing more, for the same anti-drift reason as above. This is
 * an *admission* check on a Protocol type, not a second definition of it. If
 * Protocol later publishes its own `CanonicalEvidence` validator (it publishes
 * one for `CanonicalStanding` today, and none for evidence), this collapses
 * into a call to it.
 *
 * Admitting a document says nothing whatever about whether the evidence it
 * describes is real, current or honest.
 */
export declare function isAdmissibleCanonicalEvidence(value: unknown): value is CanonicalEvidence;
/**
 * Structural admission of one submission.
 *
 * Correlation against the pinned profile is deliberately **not** here: it needs
 * the case and its profile, so it happens where both are resolved — in
 * `intakeProtocolizationEvidence`, delegating to APV-04's own requirement check
 * rather than re-implementing it.
 */
export declare function validateProtocolizationEvidenceSubmission(value: unknown): EvidenceIntakeValidationResult;
/** Boolean form, for a caller that does not need the reasons. */
export declare function isAdmissibleProtocolizationEvidenceSubmission(value: unknown): value is ProtocolizationEvidenceSubmission;
/**
 * Structural validation of a receipt.
 *
 * Applied to every receipt this package produces before it is returned, and
 * again by the repository before one is stored, for the reason APV-04 gave for
 * re-validating a case on every operation: a receipt may arrive from a store,
 * from a network boundary, or from a caller that built it by hand, and a
 * malformed one must fail where it enters rather than somewhere downstream.
 */
export declare function validateEvidenceIntakeReceipt(value: unknown): EvidenceIntakeValidationResult;
export declare function isValidEvidenceIntakeReceipt(value: unknown): value is EvidenceIntakeReceipt;
//# sourceMappingURL=evidence-intake-validation.d.ts.map