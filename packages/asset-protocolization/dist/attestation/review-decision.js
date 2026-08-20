"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION = void 0;
/**
 * `ProfessionalReviewDecision` — the immutable record that an identified
 * reviewer **took a position** on one attestation requirement, on one review
 * basis.
 *
 * ### What a decision means
 *
 * Exactly this:
 *
 * ```text
 * this reviewer, presenting these credential references,
 * answering this review request, on this case, under this pinned profile version,
 * against this attestation requirement,
 * having reviewed this basis at this case revision,
 * took this action, for this machine-readable reason,
 * at this instant.
 * ```
 *
 * ### What a decision is not
 *
 * ```text
 * ProfessionalReviewDecision   !=   CanonicalAttestation
 * ```
 *
 * They are different things with different owners, and this slice keeps them
 * apart deliberately. A decision is a *vertical workflow record*: it exists for
 * all four actions, it lives in this package's own repository, and it is
 * addressed by a `ProfessionalReviewDecisionId` that is never written into a
 * `CanonicalAttestationId` field. A `CanonicalAttestation` is a *Protocol
 * record*: it exists only where `Attest` produced one legitimately, it names a
 * claim, an attester, a statement and an instant, and it is referenced from here
 * — never redefined here.
 *
 * That is also why `Reject`, `RequestMoreEvidence` and `Abstain` produce **no
 * canonical artifact at all**. Protocol defines no `CanonicalRejection`, no
 * `CanonicalAbstention` and no attestation variant meaning "declined", and
 * inventing an attestation whose type or statement encoded a refusal would put a
 * counterfeit record into circulation that every later reader would treat as an
 * attestation. The vertical record is sufficient, and it is honest.
 *
 * ### What a decision does not do
 *
 * ```text
 * Attest              != universal truth   != READY   != protocolized
 * Reject              != case Rejected     != fraud   != legal invalidity
 * RequestMoreEvidence != state transition  != deletion of anything
 * Abstain             != Fail              != Reject
 * ```
 *
 * No action transitions any case state. APV-09 owns state; this slice adds
 * none, and none of the four actions reaches for one.
 *
 * ### It never rewrites what it read
 *
 * A decision is written *beside* the basis it considered, never over it. An
 * `Attest` recorded against a basis containing a `Fail` leaves that `Fail`
 * exactly where it was — both facts remain true, both remain readable, and the
 * tension between them is information a later slice may need rather than a
 * contradiction to be tidied away. The same holds for declarations, evidence
 * receipts and claims: none of them gains a `verified`, `accepted` or `approved`
 * flag because a professional looked at it.
 *
 * ### Append-only
 *
 * Every field is fixed at construction and no operation in this package rewrites
 * one — no update, no delete, no retraction, no supersession pointer. A reviewer
 * who changes position does so through a *new* review request bound to a new
 * revision and a new decision beside the old one; overwriting the first would
 * destroy the only evidence of what was originally decided, which is the one
 * thing a professional review log exists to preserve.
 */
exports.PROFESSIONAL_REVIEW_DECISION_SCHEMA_VERSION = 'aoc-protocolization-professional-review-decision/1';
