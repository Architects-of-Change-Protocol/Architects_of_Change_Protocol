import type { AttestationType } from '@aoc/protocol/claims';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';

import type { AssetRequirementId } from '../identifiers';

/**
 * What a professional is being asked to attest, and what they actually
 * attested — as structure, never as prose.
 *
 * ### Why scope is mandatory
 *
 * An unscoped attestation is an assertion about everything, which is an
 * assertion nobody can responsibly make and nobody can responsibly rely on.
 * "The professional approved the case" is exactly the sentence this type exists
 * to make unrepresentable: what a reviewer signs their name to is one
 * proposition, about one subject, over one identified basis, at one case
 * revision — and every one of those four is a field below.
 *
 * ### Why machine semantics never depend on prose
 *
 * `scopeStatement` and `limitations` exist because a professional often has
 * something to say that no schema anticipates. Nothing in this package reads
 * them, matches on them, branches on them or derives meaning from them, and a
 * later readiness evaluator must not either: downstream behaviour depends on
 * `requirementId`, `attestationType`, `subjectRef`, `caseRevision` and
 * `propositionRefs`, and on nothing else. A system whose readiness depended on
 * parsing a sentence would be a system whose readiness could be changed by
 * rephrasing one.
 */

/**
 * What kind of thing one `ProfessionalReviewBasisRef` names.
 *
 * ### Deliberately not APV-07's `VerificationInputKind`
 *
 * The two vocabularies look similar and mean different things.
 * `VerificationInputKind` names *what an automated check read*;
 * this names *what a professional reviewed*. The difference is load-bearing in
 * both directions: a professional must be able to point at a **verification
 * result**, which no check can read (a check that read another check's output
 * would make execution order part of the answer), and a check may cite an
 * `Observation` a resolver returned, which never appears in a review basis
 * because a reviewer reads records, not resolver call results.
 *
 * Widening APV-07's enum to cover this slice would have been the same mistake as
 * widening Protocol's to cover APV-07's — a member added for one consumer that
 * every other consumer then has to understand.
 */
export const ProfessionalReviewBasisKind = {
  /** An APV-04 material association inside the case. */
  Material: 'Material',
  /** A requirement of the pinned profile. */
  Requirement: 'Requirement',
  /** An APV-05 evidence intake receipt. */
  IntakeReceipt: 'IntakeReceipt',
  /** Protocol's identifier for an evidence record. */
  EvidenceRecord: 'EvidenceRecord',
  /** An APV-06 declaration record. */
  DeclarationRecord: 'DeclarationRecord',
  /** Protocol's identifier for a claim record. */
  ClaimRecord: 'ClaimRecord',
  /** An APV-07 verification result, by its execution id. */
  VerificationResult: 'VerificationResult',
  /** The case's subject, by its sovereign asset id. */
  Subject: 'Subject',
} as const;
export type ProfessionalReviewBasisKind =
  (typeof ProfessionalReviewBasisKind)[keyof typeof ProfessionalReviewBasisKind];

/**
 * One thing a reviewer read, or one thing an attestation is about, named by a
 * stable reference.
 *
 * References, never copies. A decision that embedded whole evidence documents,
 * claim records or declaration statements would be a second copy of somebody
 * else's record — free to drift from it, and carrying payload and possibly PII
 * into an audit trail that has no business holding either. What an auditor
 * needs is the ability to go and look at exactly what the professional looked
 * at, and an identifier gives them that.
 */
export interface ProfessionalReviewBasisRef {
  readonly kind: ProfessionalReviewBasisKind;
  /** The identifier, as its owner spells it. Opaque here; never parsed. */
  readonly ref: string;
}

export function isProfessionalReviewBasisKind(
  value: unknown,
): value is ProfessionalReviewBasisKind {
  return (
    typeof value === 'string' && Object.values<string>(ProfessionalReviewBasisKind).includes(value)
  );
}

/**
 * The bounded, machine-readable statement of what one attestation covers.
 *
 * Every field below is either a vertical identifier the pinned profile already
 * declares, a Protocol reference the case already carries, or an integer. None
 * of them is interpreted, and none of them is a legal conclusion.
 */
export interface ProfessionalReviewScope {
  /**
   * The attestation requirement of the pinned profile this scope answers.
   *
   * One requirement, never a list. A profile with three attestation
   * requirements is reviewed three times, each with its own scope, its own
   * reviewer and its own decision — there is deliberately no way to spell "the
   * professional attested all of it".
   */
  readonly requirementId: AssetRequirementId;

  /**
   * The Protocol attestation type being attested. Always one of the pinned
   * requirement's `acceptedTypes`; a type only a later profile version accepts
   * is refused.
   */
  readonly attestationType: AttestationType;

  /**
   * The subject the proposition applies to. Always the case's own subject
   * reference, checked field by field — an attestation prepared for one subject
   * can never be attached to another, even inside one tenant.
   */
  readonly subjectRef: SovereignSubjectRef;

  /**
   * The case revision this scope is bound to.
   *
   * Recorded here as well as on the request and the decision, and required to
   * agree with both, so that a scope read on its own still says which state of
   * the case it describes. An attestation scoped to revision `8` never silently
   * becomes an attestation about revision `15`.
   */
  readonly caseRevision: number;

  /**
   * What, specifically, the attestation is about: the declarations, evidence,
   * verification results, materials or requirements the proposition concerns.
   * Non-empty.
   *
   * This is narrower than `ProfessionalReviewDecision.reviewedRefs`, and the
   * difference matters. `reviewedRefs` is everything the professional looked
   * at; this is the subset the attestation actually speaks to. A reviewer who
   * read fifteen records and attests to one declaration says exactly that.
   */
  readonly propositionRefs: readonly ProfessionalReviewBasisRef[];

  /**
   * The reviewer's own words for what they are attesting. Bounded.
   *
   * Presentation only. Nothing in this package reads it, and no downstream
   * readiness decision may depend on it.
   */
  readonly scopeStatement?: string;

  /**
   * Explicit limitations the reviewer wishes recorded. Bounded, each entry
   * bounded.
   *
   * Also presentation only, and deliberately not a closed vocabulary: the
   * limitations a profession places on its own work are that profession's to
   * state, and a fixed enum here would be this package deciding what a
   * professional is allowed to qualify.
   */
  readonly limitations?: readonly string[];
}
