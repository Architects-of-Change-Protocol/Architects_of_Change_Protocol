import { ProofType } from '@aoc/protocol/claims';
import type {
  AttestationType,
  CanonicalAttestation,
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalCredentialRef,
  CanonicalPrincipalRef,
  CanonicalProofRef,
} from '@aoc/protocol/claims';
import type { UtcDateTime } from '@aoc/protocol/contracts';

import { isValidUtcDateTime } from '../freshness';
import { PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH } from '../case/case-identifiers';
import { PROFESSIONAL_REVIEW_ERROR_CODES, ProfessionalReviewError } from './review-errors';

/**
 * Where — and only where — this vertical constructs a Protocol
 * `CanonicalAttestation`.
 *
 * ### The substrate decision
 *
 * APV-05 constructs no `CanonicalEvidence`, APV-06 constructs no
 * `CanonicalClaim` and APV-07 mints no `CanonicalVerification`, each for the
 * same structural reason: the record's mandatory fields could not be established
 * without inventing at least one of them. `CanonicalAttestation` is the first
 * case where that is *not* true, and the difference is worth stating precisely.
 *
 * ```text
 * id           a CanonicalId. Caller-provided here, exactly like every other
 *              instance identifier in this package — never minted, because a
 *              pure domain layer that mints cannot be tested by asserting on
 *              its output, and Protocol publishes no minting helper to reuse.
 *
 * type         an AttestationType. Comes from the pinned profile's own
 *              acceptedTypes, by way of the review request. Not chosen here.
 *
 * attester     a CanonicalAttester. The reviewer's own CanonicalPrincipalRef,
 *              which the decision already carries. Not synthesized.
 *
 * claimRef     a CanonicalClaimId. This is the field that keeps the whole
 *              thing honest — see below.
 *
 * statement    a string. The attester's own words. Supplied by the reviewer,
 *              never generated, never templated from the case.
 *
 * issuedAt     a CanonicalTimestamp. The injected clock's instant, the same one
 *              the decision carries.
 * ```
 *
 * Every mandatory field is therefore established from something that already
 * exists, and none is invented. That is why this slice can legitimately do what
 * the previous three could not — and it does so in exactly one place, so there
 * is one thing to audit.
 *
 * ### Why `claimRef` is the anti-invention rule
 *
 * A `CanonicalAttestation` is, structurally, an attestation *about a claim*.
 * Protocol makes `claimRef` mandatory, and there is no honest way around that:
 * an attestation naming a claim that does not exist would be an assertion about
 * nothing, and one naming a claim from a different case would be an assertion
 * about somebody else's subject.
 *
 * So the claim must be one this case already holds — an APV-06 declaration's
 * `CanonicalClaimId`, associated to the case as `Declaration` material at or
 * before the review basis revision. Where the case holds no such claim, no
 * attestation is constructed and the whole operation fails deterministically
 * with `REVIEW_ATTESTATION_CANNOT_BE_CONSTRUCTED`: **no decision is returned
 * either.** A caller that asked for a Protocol artifact and cannot legitimately
 * have one gets nothing, not a half-outcome it never requested. Recording the
 * professional position without the artifact stays available and is a different
 * call — the same `Attest`, with the `attestation` input omitted, which returns
 * a vertical decision carrying no `canonicalAttestationRef`, no attestation
 * material and no `resultingCaseRevision`.
 *
 * ### A professional attestation carries a proof reference
 *
 * Protocol makes `CanonicalAttestation.proofRefs` optional, and it is right to:
 * Protocol describes attestations in general. APV-08 does not. The artifact this
 * vertical produces is a *professional* attestation that Asset Protocolization
 * will later carry as `ProtocolizationMaterialKind.Attestation` evidence of a
 * reviewed position, and an unauditable one of those is not a weaker artifact —
 * it is an artifact nobody downstream can hold anyone to.
 *
 * ```text
 * Protocol permits        proofRefs absent
 * APV-08 requires         at least one CanonicalProofRef, always
 * ```
 *
 * So `proofRefs` is mandatory *here*: at least one, at most
 * `PROOF_REFS_MAX_COUNT`, each structurally usable. The reference may be one the
 * caller already held or one an injected `AttestationSigner` produced; where
 * neither exists, `recordProfessionalReviewDecision` refuses before reaching
 * this function. Requiring a proof to be *present* is emphatically not verifying
 * it — see `isUsableProofRef` — and this narrowing binds only what this vertical
 * constructs, never Protocol's own type.
 *
 * ### It constructs or it fails
 *
 * There is no partial attestation and no repair path. Every input is checked
 * before the record is assembled, and a record that would not satisfy Protocol's
 * shape is refused rather than patched.
 *
 * ### What it does not do
 *
 * It mutates no claim, no evidence, no declaration and no verification result.
 * An attestation is a *separate* assertion placed beside them: the declarant's
 * claim stays the declarant's, the check's `Fail` stays a `Fail`, and nothing
 * anywhere gains a `verified: true`.
 */

/** Bound on the attester's statement. A guard, not a semantic rule. */
const STATEMENT_MAX_LENGTH = 4096;

/** Bound on how many proof references one attestation may carry. Also a guard. */
const PROOF_REFS_MAX_COUNT = 8;

function isCanonicalRecordId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value.length <= PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH
  );
}

/**
 * A proof reference this package will attach.
 *
 * Identity, a Protocol `ProofType` and a source. Whether the proof verifies is
 * emphatically not decided here — Protocol's own contract for this type is
 * "references a proof artifact without embedding, resolving, or validating that
 * artifact", and this package has no way to do more.
 */
export function isUsableProofRef(value: unknown): value is CanonicalProofRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (!isCanonicalRecordId(candidate.id)) return false;
  if (typeof candidate.type !== 'string' || !Object.values<string>(ProofType).includes(candidate.type)) {
    return false;
  }
  const source = candidate.source;
  if (typeof source === 'string') return source.trim() !== '';
  if (typeof source !== 'object' || source === null || Array.isArray(source)) return false;
  return typeof (source as { readonly value?: unknown }).value === 'string';
}

/** Everything `prepareCanonicalAttestationFromReview` needs, and nothing more. */
export interface PrepareCanonicalAttestationInput {
  /** Caller-provided, exactly like every other identifier in this package. */
  readonly attestationId: CanonicalAttestationId;
  /** One of the pinned requirement's `acceptedTypes`, checked before this point. */
  readonly attestationType: AttestationType;
  /** The reviewer. Becomes the attestation's `attester`. */
  readonly attester: CanonicalPrincipalRef;
  /** A claim this case already holds. Checked against the case before this point. */
  readonly claimRef: CanonicalClaimId;
  /** The attester's own words. Never generated from the case. */
  readonly statement: string;
  /** The decision instant, from the injected clock. */
  readonly issuedAt: UtcDateTime;
  /** The credential references the reviewer presented, as presented. */
  readonly credentialRefs?: readonly CanonicalCredentialRef[];
  /**
   * At least one proof reference. **Mandatory**, unlike Protocol's own optional
   * field: a professional attestation this vertical produces is auditable or it
   * is not produced.
   *
   * Held by the caller or obtained from an injected `AttestationSigner`. Never
   * synthesized here, and never verified here.
   */
  readonly proofRefs: readonly CanonicalProofRef[];
}

function refuse(message: string, reasonCodes: readonly string[]): never {
  throw new ProfessionalReviewError(
    PROFESSIONAL_REVIEW_ERROR_CODES.attestationCannotBeConstructed,
    message,
    { reasonCodes },
  );
}

/**
 * Builds a structurally legitimate `CanonicalAttestation`, or fails.
 *
 * Pure and synchronous: no clock, no repository, no catalogue, no I/O. It
 * assembles Protocol's record from values its caller established and returns it;
 * persisting it, associating it to a case and emitting anything about it happen
 * elsewhere.
 *
 * Optional fields are omitted rather than set to `undefined`, because
 * `{ credentialRefs: undefined }` and `{}` serialize differently and a store
 * that round-tripped one into the other would change what the record says.
 * `proofRefs` is never among them: it is always present, because an attestation
 * without one is never returned.
 */
export function prepareCanonicalAttestationFromReview(
  input: PrepareCanonicalAttestationInput,
): CanonicalAttestation {
  const reasons: string[] = [];

  if (!isCanonicalRecordId(input.attestationId)) {
    reasons.push('ATTESTATION_ID_INVALID');
  }
  if (!isCanonicalRecordId(input.claimRef)) {
    reasons.push('ATTESTATION_CLAIM_REF_INVALID');
  }
  if (
    typeof input.statement !== 'string' ||
    input.statement.trim() === '' ||
    input.statement.length > STATEMENT_MAX_LENGTH
  ) {
    reasons.push('ATTESTATION_STATEMENT_INVALID');
  }
  if (!isValidUtcDateTime(input.issuedAt)) {
    reasons.push('ATTESTATION_ISSUED_AT_INVALID');
  }
  if (!Array.isArray(input.proofRefs) || input.proofRefs.length === 0) {
    // Split from the malformed case on purpose: "you gave me none" and "the one
    // you gave me is not a proof reference" are different things to fix.
    reasons.push('ATTESTATION_PROOF_REFS_REQUIRED');
  } else if (
    input.proofRefs.length > PROOF_REFS_MAX_COUNT ||
    !input.proofRefs.every((entry) => isUsableProofRef(entry))
  ) {
    reasons.push('ATTESTATION_PROOF_REFS_INVALID');
  }

  if (reasons.length > 0) {
    refuse(
      `Refusing to construct a CanonicalAttestation from incomplete inputs: ${reasons.join(', ')}`,
      reasons,
    );
  }

  return {
    id: input.attestationId,
    type: input.attestationType,
    attester: input.attester,
    claimRef: input.claimRef,
    statement: input.statement,
    issuedAt: input.issuedAt,
    ...(input.credentialRefs === undefined ? {} : { credentialRefs: [...input.credentialRefs] }),
    proofRefs: [...input.proofRefs],
  };
}
