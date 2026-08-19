/**
 * Identifier vocabulary for the professional review workflow.
 *
 * The same split APV-05, APV-06 and APV-07 made, for the same reason: some
 * identifiers name an **instance** — one request, one decision — and are minted
 * per operation, while others name a **stable machine reason** and are authored
 * and reviewed like code.
 *
 * `ProfessionalReviewRequestId` and `ProfessionalReviewDecisionId` are instance
 * identifiers and therefore carry APV-04's instance grammar, exactly like a case
 * id, a material id, an intake id, a declaration id or an execution id.
 *
 * `ProfessionalReviewReasonCode` is a definition identifier and therefore
 * carries APV-03's dotted-token grammar, exactly like a check id or a
 * verification reason code.
 *
 * ### What is deliberately not declared here
 *
 * There is no `packetId`, no `reviewerSessionId`, no `attestationWorkflowId` and
 * no reviewer identifier of any kind. A packet is a deterministic projection
 * over records that already have identities, so an identifier of its own would
 * name nothing new. A reviewer is a Protocol `CanonicalPrincipalRef` and the
 * vertical defines no second identity model for one. And a
 * `CanonicalAttestationId` is Protocol's — never a review identifier wearing
 * Protocol's name.
 */
/**
 * Stable identity of one request for professional review.
 *
 * Caller-provided, never generated here — minting needs a UUID source or a
 * counter, and a pure domain layer that mints its own identifiers cannot be
 * tested by asserting on its output.
 *
 * ### Uniqueness scope
 *
 * `(tenantId, reviewRequestId)`, exactly like an intake id, a declaration id and
 * an execution id. Request ids are minted by tenants, so a globally unique
 * constraint would let one tenant's choice of identifier collide with another's
 * — which both leaks the existence of a review across a tenant boundary and
 * makes a legitimate `save` fail for a reason its caller can neither see nor fix.
 */
export type ProfessionalReviewRequestId = string;
/**
 * Stable identity of one professional review decision.
 *
 * Caller-provided and tenant-scoped, on the same terms as a request id. It is
 * emphatically **not** a `CanonicalAttestationId`: a decision is a vertical
 * workflow record and an attestation is a Protocol record, and writing one into
 * the other's field would be a type-level lie every downstream reader would
 * inherit.
 */
export type ProfessionalReviewDecisionId = string;
/**
 * Why a reviewer decided as they did, as a stable machine-readable token.
 *
 * ### Why an action is not enough
 *
 * `Reject` alone tells a reader that the reviewer declined, not *why*. Two
 * rejections for entirely different reasons — insufficient evidence versus a
 * matter outside the reviewer's competence — would be indistinguishable, and a
 * later slice deciding what a rejection means for the case would have to parse
 * prose to tell them apart.
 *
 * ### Why it is an opaque token and not an enum
 *
 * A closed union here would mean every new reason a profession or a profile
 * needs is a change to this package's core. An opaque dotted token means a new
 * review context ships with its own reasons and needs no change here — the same
 * argument APV-05 made for its intake category id and APV-07 for its reason
 * code.
 *
 * ### What it must never be
 *
 * A legal conclusion. `review.insufficient-evidence`,
 * `review.scope-outside-competence` and `review.unresolved-warning` describe
 * what the reviewer observed about their own basis;
 * `owner.not.legal.titleholder` would be a conclusion this vertical is not
 * entitled to encode, in any jurisdiction. It is likewise never free text: the
 * human-readable half is `note`, and nothing may derive machine meaning from
 * that.
 */
export type ProfessionalReviewReasonCode = string;
export declare function isValidProfessionalReviewRequestId(value: unknown): value is ProfessionalReviewRequestId;
export declare function isValidProfessionalReviewDecisionId(value: unknown): value is ProfessionalReviewDecisionId;
export declare function isValidProfessionalReviewReasonCode(value: unknown): value is ProfessionalReviewReasonCode;
//# sourceMappingURL=review-identifiers.d.ts.map