import type { AttestationType } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationProfileRef, ProtocolizationTenantId } from '../case/case-identifiers';
import type { ProfessionalReviewRequestId } from './review-identifiers';
import type { ProfessionalReviewScope } from './review-scope';
/**
 * `ProfessionalReviewRequest` — the immutable record that professional review
 * **was asked for**, on one attestation requirement, against one case revision.
 *
 * ### What a request means
 *
 * Exactly this:
 *
 * ```text
 * a caller acting as this tenant asked for professional review
 * of this case, under this pinned profile version,
 * against this attestation requirement,
 * for this attestation type and this scope,
 * on the case as it stood at this revision,
 * at this instant.
 * ```
 *
 * ### What a request does not mean
 *
 * ```text
 * a reviewer has been assigned      a reviewer has accepted
 * a reviewer exists                 a reviewer is qualified
 * the case is ready for review      the case is ready
 * an attestation will follow        an attestation is owed
 * ```
 *
 * There is deliberately no `reviewer`, no `assignedTo`, no `status`, no `state`
 * and no `dueAt` field on this type. Assignment is a workforce concern APV-13
 * owns; a request that carried a reviewer would be an assignment, and a request
 * that carried a status would be a second lifecycle competing with APV-04's.
 *
 * ### Why it binds a revision
 *
 * A professional must never unknowingly attest a moving target. `reviewBasisRevision`
 * fixes what "this case" meant when review was asked for, and it never moves:
 * evidence admitted at revision `13`, a declaration recorded at `14` and a check
 * executed against `15` are all outside a request bound to `12`, and the packet
 * built for it says so by refusing to absorb them
 * (`buildProfessionalReviewPacket`).
 *
 * A reviewer who needs the newer material gets a *new* request bound to the
 * newer revision. That is what makes the history readable:
 *
 * ```text
 * R1  revision 5   -> RequestMoreEvidence
 * new evidence, new declaration, re-run checks
 * R2  revision 8   -> Attest
 * ```
 *
 * ### Immutability
 *
 * Every field is fixed at creation and no operation in this package rewrites
 * one. There is no update, no delete, no reassignment and no re-basing: a
 * request whose basis could be edited would be a request whose reviewer could be
 * shown one case and recorded as having reviewed another.
 */
export declare const PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION = "aoc-protocolization-professional-review-request/1";
export interface ProfessionalReviewRequest {
    readonly schemaVersion: typeof PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION;
    /** Identity of this request. Unique within the tenant. */
    readonly reviewRequestId: ProfessionalReviewRequestId;
    /** The tenant that acted. Required and non-blank, exactly as on a case. */
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    /**
     * The profile version the case was pinned to when review was requested.
     *
     * Recorded rather than re-read, because the attestation requirement, the
     * accepted types and the attester constraints that govern this review are
     * *this* version's. A pin never changes on a case, so this can never disagree
     * with it — it makes the request independently readable without resolving the
     * case, and it is what proves a `1.0.0`-pinned case never reviewed against
     * `2.0.0`'s professional requirements.
     */
    readonly profile: ProtocolizationProfileRef;
    /**
     * The requirement of the pinned profile this review answers. Always of kind
     * `AssetRequirementKind.Attestation`; an Identity, Declaration, Evidence or
     * Verification requirement is refused before this record exists.
     */
    readonly attestationRequirementId: AssetRequirementId;
    /** One of that requirement's `acceptedTypes`. Never merely a type Protocol knows. */
    readonly requestedAttestationType: AttestationType;
    /**
     * What the reviewer is being asked to attest, machine-readably.
     *
     * Deliberately not "approve the case". The requested scope is narrower than
     * the case by construction, and a decision that attests may not widen it.
     */
    readonly requestedScope: ProfessionalReviewScope;
    /**
     * The case revision this request is bound to. Fixed forever; see above.
     */
    readonly reviewBasisRevision: number;
    /** When review was requested, from the injected clock. Never `Date.now()`. */
    readonly requestedAt: UtcDateTime;
    /** Correlates this request with the operation that raised it. */
    readonly correlationId?: CanonicalId;
}
//# sourceMappingURL=review-request.d.ts.map