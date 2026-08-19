"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION = void 0;
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
exports.PROTOCOLIZATION_DECLARATION_RECORD_SCHEMA_VERSION = 'aoc-protocolization-declaration/1';
