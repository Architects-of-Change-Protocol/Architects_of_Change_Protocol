"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION = void 0;
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
exports.PROFESSIONAL_REVIEW_REQUEST_SCHEMA_VERSION = 'aoc-protocolization-professional-review-request/1';
