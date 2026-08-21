import type { AdapterResult } from '@aoc/protocol/adapters';
import type {
  AttestationType,
  CanonicalAttestationId,
  CanonicalClaimId,
  CanonicalPrincipalRef,
  CanonicalProofRef,
} from '@aoc/protocol/claims';
import type { UtcDateTime } from '@aoc/protocol/contracts';

import type {
  ProtocolizationCaseId,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type {
  ProfessionalReviewDecisionId,
  ProfessionalReviewRequestId,
} from './review-identifiers';

/**
 * The narrow port through which an attestation acquires a proof.
 *
 * ### What "signed" means here
 *
 * It means whatever Protocol already means by it, and nothing more. Protocol
 * models a proof as a `CanonicalProofRef` — an identifier, a `ProofType`, a
 * source locator — and deliberately "references a proof artifact without
 * embedding, resolving, or validating that artifact". APV-08 therefore does not
 * sign anything: it *asks* an injected signer for a reference to a proof that
 * something else produced, and attaches what comes back.
 *
 * ### What this package will never do
 *
 * ```text
 * base64 a reviewer id and call it a signature
 * hash the attestation object and call it signed
 * generate a key pair
 * ship a test key in production code
 * treat a credential id as a signature
 * invent a signature envelope, algorithm identifier or proof format
 * ```
 *
 * None of those is a signature; each is a forgery that looks like one to every
 * later reader. The vertical has no key custody, no signing algorithm and no
 * cryptography of its own, and this port exists precisely so that it never
 * needs any.
 *
 * ### No implementation ships in this slice
 *
 * There is deliberately no KMS binding, no HSM binding, no wallet, no browser
 * signer and no blockchain anything in this package — those are infrastructure
 * decisions with their own owners and their own review, exactly like a database
 * adapter.
 *
 * ### The port is optional; a proof reference is not
 *
 * Protocol's own `CanonicalAttestation` allows `proofRefs` to be absent, and for
 * attestations in general that is right. It is not right for the *professional*
 * attestation this vertical produces and associates to a case as
 * `ProtocolizationMaterialKind.Attestation`: that artifact exists to be audited
 * later, and one carrying no reference to any proof cannot be.
 *
 * So a configured signer is one of two ways to obtain the reference APV-08
 * requires — the other is a caller who already holds one. Where a
 * `CanonicalAttestation` is requested and neither produces a usable
 * `CanonicalProofRef`, the operation fails with
 * `REVIEW_SIGNATURE_UNAVAILABLE`; no artifact is produced, no case is mutated,
 * and nothing is fabricated to fill the gap.
 *
 * Recording the professional's position without a Protocol artifact stays
 * available and needs no signer at all: an `Attest` with the attestation input
 * omitted is a complete vertical decision. A position without an artifact is an
 * honest outcome; an unauditable artifact is not.
 *
 * ### Signed is not legally valid
 *
 * ```text
 * proof reference required !=  proof reference resolved
 * proof reference present  !=  signature verified
 * signature verified       !=  attestation legally sufficient
 * legally sufficient       !=  authority over this subject
 * ```
 *
 * Requiring a proof reference to be *present* is a completeness rule about the
 * artifact APV-08 will produce, and emphatically not a verification step.
 * Nothing in this package resolves a proof, verifies a proof, or draws a legal
 * conclusion from one.
 */

/**
 * Exactly what a signer is told, and nothing else.
 *
 * The identifying fields of the attestation about to be created, plus the
 * workflow identifiers an audit trail needs to correlate the call. No packet, no
 * evidence, no declaration prose, no credential and no case aggregate: a signer
 * is asked to attach a proof to a specific attestation, not to review one.
 */
export interface AttestationSigningRequest {
  readonly tenantId: ProtocolizationTenantId;
  readonly caseId: ProtocolizationCaseId;
  readonly reviewRequestId: ProfessionalReviewRequestId;
  readonly decisionId: ProfessionalReviewDecisionId;
  readonly attestationId: CanonicalAttestationId;
  readonly attestationType: AttestationType;
  /** The reviewer the attestation names as its attester. */
  readonly attester: CanonicalPrincipalRef;
  /** The claim the attestation is about. */
  readonly claimRef: CanonicalClaimId;
  /** The attester's own statement, as it will appear on the attestation. */
  readonly statement: string;
  /** The instant the attestation carries. Supplied, never read from a host clock. */
  readonly issuedAt: UtcDateTime;
}

export interface AttestationSigner {
  /**
   * Returns a reference to a proof over this attestation, or fails.
   *
   * It must not return a placeholder, a derived value, or a reference to
   * something it did not actually obtain. A signer that cannot sign should throw
   * or reject — `REVIEW_SIGNATURE_UNAVAILABLE` is the honest outcome, and an
   * attestation is not produced.
   */
  sign(request: AttestationSigningRequest): AdapterResult<CanonicalProofRef>;
}
