"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalReviewParticipantRole = exports.PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION = void 0;
/**
 * `ProfessionalReviewPacket` — the bounded, deterministic view of one review
 * basis that a professional is asked to consider.
 *
 * ### It is a projection, not an aggregate
 *
 * Nothing constructs a packet and stores it. Every fact in it comes from a
 * record that is already immutable and already revision-bound — the case at the
 * basis revision, APV-05 receipts, APV-06 declaration records, APV-07 results
 * and the pinned profile document — so a stored packet would be a second copy
 * of state that can drift from the records it copies, and would need its own
 * identity, its own lifecycle and its own persistence for no fact it adds.
 * Rebuilding it from the same inputs produces the same packet, byte for byte.
 *
 * That determinism is why there is **no `builtAt` field**. An instant would be
 * the one thing on this type that changed between two builds of the same basis,
 * and a packet whose bytes move is a packet nobody can prove was the one the
 * reviewer saw.
 *
 * ### It is bounded
 *
 * A reviewer sees this case, at this revision, under this pinned profile
 * version. There is no repository in scope, no catalogue, no other case, no
 * other tenant's anything. What could possibly have been reviewed is readable
 * from this type alone.
 *
 * ### It hides nothing
 *
 * Every APV-07 outcome the basis contains is present, in full:
 *
 * ```text
 * Pass          present     Fail          present
 * Warning       present     ManualReview  present
 * Unavailable   present
 * ```
 *
 * There is deliberately no filter, no severity threshold, no "only show
 * failures", no aggregate verdict and no reduction of any kind. A `Warning` next
 * to four passes stays a `Warning`; a `ManualReview` does not block packet
 * construction, because human review is precisely what a `ManualReview` asks
 * for, and refusing to build the packet that enables it would defeat the whole
 * architecture; and an `Unavailable` is never reinterpreted as a `Fail`.
 *
 * ### It decides nothing
 *
 * There is no `recommendation`, no `readiness`, no `score`, no `eligible` and no
 * `suggestedAction` field anywhere on this type or its parts. Automated checks
 * *inform* the professional; they do not decide for them, and a packet that
 * arrived with an answer already in it would be a packet whose reviewer was
 * ratifying rather than reviewing.
 */
exports.PROFESSIONAL_REVIEW_PACKET_SCHEMA_VERSION = 'aoc-protocolization-professional-review-packet/1';
/**
 * The roles the workflow has actually observed a principal in.
 *
 * ### Why there is no `Applicant`
 *
 * Because APV-04 models none. A `ProtocolizationCase` has a tenant, a subject,
 * a pinned profile and material; it has no applicant field, no owner field and
 * no party list, and inventing one here would put a fact into a professional's
 * packet that no part of this system ever established. The only participant
 * role the workflow genuinely observes is *who was recorded as declaring
 * something*, which APV-06 carries as `ProtocolizationDeclarationRecord.declarant`.
 *
 * The member set is open to growth by a slice that genuinely learns a new role.
 * It is deliberately not grown speculatively.
 */
exports.ProfessionalReviewParticipantRole = {
    /** Recorded by APV-06 as having made a declaration into this case. */
    Declarant: 'Declarant',
};
