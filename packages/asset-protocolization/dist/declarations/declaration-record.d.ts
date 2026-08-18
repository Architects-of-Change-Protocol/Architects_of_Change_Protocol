import type { CanonicalClaimId, CanonicalEvidenceId, CanonicalPrincipalRef, CanonicalReferenceSource, ClaimType } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from '../case/case-identifiers';
import type { DeclarationId } from './declaration-identifiers';
/**
 * `ProtocolizationDeclarationRecord` — the immutable record that a participant
 * **made a declaration** into one case at one instant, correlated in one way.
 *
 * ### What a record means
 *
 * Exactly this, and it is worth spelling out because reading more into it is
 * the central risk of the whole slice:
 *
 * ```text
 * this participant was recorded as asserting this proposition,
 * about this case's subject, under this pinned profile version,
 * offered against these requirements,
 * pointing at this already-admitted evidence,
 * carried by this Protocol claim record,
 * by a caller acting as this tenant,
 * at this instant.
 * ```
 *
 * ### What a record does not mean
 *
 * ```text
 * the proposition is true            the claim has been verified
 * the declarant is who they say      the declarant had authority
 * the linked evidence supports it    the requirement is satisfied
 * ownership is established           the case is ready
 * ```
 *
 * There is deliberately no `verified`, `valid`, `accepted`, `approved`,
 * `authorized`, `supported` or `proven` boolean anywhere on this type, no
 * status field and no outcome vocabulary. A record existing *is* the record of
 * structural acceptance; nothing else on it is needed to say so, and any
 * additional flag would be read as a verdict this layer cannot reach.
 *
 * ### The audit fact and the asserted proposition are different things
 *
 * This distinction is what makes the slice worth having. Once recorded,
 *
 * ```text
 * "Actor A declared X at T"
 * ```
 *
 * is itself a *historical fact about the workflow* — auditable, timestamped,
 * pinned to a profile version, and true regardless of X. Whereas
 *
 * ```text
 * "X"
 * ```
 *
 * remains merely the asserted proposition until something later evaluates it.
 * A declaration recorded early therefore creates evidence *that the declaration
 * was made*, never evidence that it was correct — and the system can prove the
 * first long before it can say anything at all about the second.
 *
 * ### What it does not carry
 *
 * The `CanonicalClaim` document itself. A record names the claim by its
 * `CanonicalClaimId` and stops there. Snapshotting a Protocol record into
 * vertical workflow state would create a second copy that can drift from the
 * record it copies, and this package neither owns claim records nor stores
 * them. The same holds for evidence: a linked `CanonicalEvidenceId` is a
 * reference to material APV-05 already admitted, never a second copy of it.
 *
 * ### Immutability and correction
 *
 * Every field is fixed when the record is created, and there is no operation
 * anywhere in this package that rewrites one — no update, no delete, no
 * retraction. A participant who wants to correct a statement makes a *new*
 * declaration with a new `declarationId`; both remain observable, in order, and
 * a later slice reads the pair. Erasing or overwriting the first would destroy
 * the only evidence of what was originally asserted, which is the one thing an
 * assertion log exists to preserve.
 *
 * That is also what keeps `requirementIds` and `supportingEvidenceRefs` honest:
 * they are what *this declaration* correlated and pointed at — historical
 * facts — not a live view of the material's current associations.
 */
export declare const PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION = "aoc-protocolization-declaration/1";
export interface ProtocolizationDeclarationRecord {
    readonly schemaVersion: typeof PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION;
    /** Identity of the declaration operation this record documents. Unique within the tenant. */
    readonly declarationId: DeclarationId;
    /** The tenant that acted. Required and non-blank, exactly as on a case. */
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    /**
     * The profile version the case was pinned to when this declaration was
     * recorded.
     *
     * Recorded rather than re-read, because the correlation below was checked
     * against *this* version's requirements. A pin never changes on a case, so
     * this can never disagree with it — it makes the record independently
     * readable without resolving the case.
     */
    readonly profile: ProtocolizationProfileRef;
    /**
     * Who was recorded as declaring. Never the tenant, never the case subject,
     * and never a statement that this principal was entitled to declare.
     */
    readonly declarant: CanonicalPrincipalRef;
    /** The machine-readable proposition family, as Protocol names it. */
    readonly claimType: ClaimType;
    /** The vertical token narrowing it, when the pinned profile named one. */
    readonly claimSubtype?: string;
    /** Protocol's identifier for the claim. Never dereferenced by this package. */
    readonly claimRef: CanonicalClaimId;
    /** The APV-04 material association this declaration produced. */
    readonly materialId: ProtocolizationMaterialId;
    /** The requirements *this declaration* was correlated to. Non-empty, unique. */
    readonly requirementIds: readonly AssetRequirementId[];
    /**
     * Evidence in this case the declarant pointed at. Linkage only — never a
     * finding that any of it supports the assertion.
     */
    readonly supportingEvidenceRefs?: readonly CanonicalEvidenceId[];
    /** Human-readable text, as submitted. Presentation only; never machine semantics. */
    readonly statement?: string;
    /**
     * When the declarant says it was made, when one was supplied. Preserved
     * verbatim and never compared, defaulted or repaired.
     */
    readonly declaredAt?: UtcDateTime;
    /**
     * When the vertical recorded it. The operation's own instant, read from the
     * injected clock, and the same instant the resulting material carries as its
     * `addedAt`.
     *
     * Deliberately distinct from `declaredAt`. The two answer different
     * questions — "when do they say they asserted it?" and "when did we accept
     * it?" — and collapsing them would let the workflow's own timeline be
     * rewritten by whoever fills in a form.
     */
    readonly recordedAt: UtcDateTime;
    /** Where the declaration reached the workflow from, as supplied. Recording is not endorsing. */
    readonly sourceRef?: CanonicalReferenceSource;
    /** The case revision this declaration produced. Orders records against case history. */
    readonly caseRevision: number;
    readonly correlationId?: CanonicalId;
}
//# sourceMappingURL=declaration-record.d.ts.map