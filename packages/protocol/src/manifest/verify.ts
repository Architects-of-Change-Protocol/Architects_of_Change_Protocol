import type { VerificationKeyResolver } from '../adapters';
import { canonicalizeJSON } from '../canonical';
import { ClaimType } from '../claims/claim-enums';
import { verifyContentIdentity } from '../identity/content-identity';
import { verifySovereignSignature } from './proof';
import {
  validateAuthorityClaim,
  validateDerivationClaim,
  validateOriginClaim,
  verifySignedClaim,
} from './claims';
import type {
  AuthorityClaim,
  ClaimValidationResult,
  DerivationClaim,
  OriginClaim,
  SignedClaim,
} from './claims';
import { computeManifestDigest, validateSovereignManifestV1 } from './manifest';
import type { SignedSovereignManifest } from './manifest';

export type CheckOutcome = 'valid' | 'invalid' | 'not_performed';
export type BindingOutcome = 'verified' | 'unverified' | 'not_performed';

export interface SovereignManifestVerificationChecks {
  readonly manifestStructure: CheckOutcome;
  readonly manifestDigest: CheckOutcome;
  readonly signature: CheckOutcome;
  readonly contentDigest: CheckOutcome;
  readonly issuerBinding: BindingOutcome;
}

export interface SovereignManifestVerificationResult {
  readonly valid: boolean;
  readonly checks: SovereignManifestVerificationChecks;
  readonly reasons: readonly string[];
}

export interface VerifySovereignManifestOptions {
  /**
   * Raw content bytes to verify against `manifest.contentIdentity`. Omit
   * to skip content verification honestly (not silently pass it). If the
   * manifest declares no `contentIdentity`, supplying bytes here cannot
   * make a content check happen: there is no declared commitment to
   * compare them against, and Protocol will not invent one (see
   * `contentDigest` below).
   */
  readonly contentBytes?: Uint8Array;
  /**
   * Optional key->principal binding check. Without this, `issuerBinding`
   * is honestly reported as `not_performed` rather than implied by a
   * passing signature check — a valid signature only proves the holder of
   * `proof.publicKey` signed the payload, not that `proof.publicKey`
   * belongs to any particular principal (see
   * `docs/architecture/sovereign-asset-core.md` § "Signature ≠ Truth of
   * the Signed Claim").
   */
  readonly verificationKeyResolver?: VerificationKeyResolver;
  /** Issuer id to resolve a verification key for, when `verificationKeyResolver` is supplied. Defaults to `manifest.registrant` if it is a string. */
  readonly issuer?: string;
}

/**
 * Independently verifies a `SignedSovereignManifest`. Never returns a bare
 * `true`/`false` — every attempted check is reported individually, and a
 * check that was never attempted is reported as `not_performed` rather
 * than folded silently into an optimistic overall result. `valid` reflects
 * whether every *attempted* check passed; checks that were not attempted
 * (e.g. no `contentBytes` supplied) do not by themselves make the result
 * invalid, but they are visible in `checks` so callers can decide whether
 * that is acceptable for their use case.
 */
export async function verifySovereignManifest(
  signed: SignedSovereignManifest,
  options: VerifySovereignManifestOptions = {},
): Promise<SovereignManifestVerificationResult> {
  const reasons: string[] = [];

  const structuralValidation = validateSovereignManifestV1(signed.manifest);
  const manifestStructure: CheckOutcome = structuralValidation.valid ? 'valid' : 'invalid';
  if (!structuralValidation.valid) {
    reasons.push(...structuralValidation.reasons);
  }

  const recomputedDigest = computeManifestDigest(signed.manifest);
  const manifestDigest: CheckOutcome = recomputedDigest === signed.manifestDigest ? 'valid' : 'invalid';
  if (manifestDigest === 'invalid') {
    reasons.push('MANIFEST_DIGEST_MISMATCH');
  }

  const signatureValid = verifySovereignSignature(signed.manifest, signed.proof);
  const signature: CheckOutcome = signatureValid ? 'valid' : 'invalid';
  if (!signatureValid) {
    reasons.push('SIGNATURE_INVALID');
  }
  if (signed.proof.payloadHash !== signed.manifestDigest) {
    reasons.push('PROOF_PAYLOAD_HASH_MISMATCH');
  }

  // Content verification is performed only when there is both something to
  // check (`contentBytes`) and a declared commitment to check it against
  // (`manifest.contentIdentity`). A manifest that declares no content
  // identity is not an integrity failure — it asserted no
  // content-integrity claim, so there is nothing to confirm or refute, and
  // fabricating a comparison target (hashing the external reference, the
  // locator, or the manifest) would manufacture a verification result
  // nobody ever signed. Both honest gaps are reported as `not_performed`,
  // never as `valid` and never as `invalid`.
  let contentDigest: CheckOutcome = 'not_performed';
  const declaredContentIdentity = signed.manifest.contentIdentity;
  if (options.contentBytes && declaredContentIdentity) {
    const contentCheck = verifyContentIdentity(options.contentBytes, declaredContentIdentity);
    contentDigest = contentCheck.valid ? 'valid' : 'invalid';
    if (!contentCheck.valid && contentCheck.reason) {
      reasons.push(contentCheck.reason);
    }
  } else if (options.contentBytes && !declaredContentIdentity) {
    reasons.push('CONTENT_DIGEST_NOT_PERFORMED_NO_CONTENT_IDENTITY');
  }

  let issuerBinding: BindingOutcome = 'not_performed';
  if (options.verificationKeyResolver) {
    const issuer = options.issuer ?? (typeof signed.manifest.registrant === 'string' ? signed.manifest.registrant : undefined);
    if (!issuer) {
      issuerBinding = 'not_performed';
      reasons.push('ISSUER_BINDING_NOT_PERFORMED_NO_ISSUER');
    } else {
      const descriptor = await options.verificationKeyResolver.resolveVerificationKey(issuer);
      if (descriptor && descriptor.keyId === signed.proof.keyId) {
        issuerBinding = 'verified';
      } else {
        issuerBinding = 'unverified';
        reasons.push('ISSUER_BINDING_UNVERIFIED');
      }
    }
  }

  const valid =
    manifestStructure === 'valid' &&
    manifestDigest === 'valid' &&
    signature === 'valid' &&
    contentDigest !== 'invalid' &&
    issuerBinding !== 'unverified';

  return {
    valid,
    checks: { manifestStructure, manifestDigest, signature, contentDigest, issuerBinding },
    reasons,
  };
}

// --- SM-08: signed sovereign claim verification -----------------------------

/**
 * The claim union AOC.VERIFIABILITY structurally verifies today: exactly the
 * canonical sovereign claim types that have real runtime validators
 * (`validateOriginClaim`, `validateAuthorityClaim`, `validateDerivationClaim`)
 * and that participate in the production mineral architecture.
 *
 * Deliberately not `CanonicalClaim` in general, for the same reason
 * `PortableSovereignClaim` is not: there is no canonical runtime validator for
 * every current and future `CanonicalClaim` variant, so advertising structural
 * verification of an arbitrary one would be advertising an understanding
 * Protocol does not have. `ClaimType.Custom` is not used as an escape hatch for
 * that gap, and a future additive version can widen this union once the
 * validators exist.
 *
 * It is declared here rather than imported from `@aoc/protocol/portability`
 * because the dependency runs the other way — `portability` imports `manifest`,
 * never the reverse — and duplicating the *claim shapes* is exactly what is
 * avoided: this is a type alias over the three existing claim interfaces, not a
 * second claim model.
 */
export type VerifiableSovereignClaim = OriginClaim | AuthorityClaim | DerivationClaim;

/**
 * The independent dimensions of a signed sovereign claim's verification.
 *
 * `claimStructure` and `signature` are deliberately separate and deliberately
 * independent: an issuer can cryptographically sign malformed data, so
 * `claimStructure: 'invalid'` alongside `signature: 'valid'` is an ordinary,
 * expressible outcome rather than a contradiction or a crash. Equally,
 * `claimDigest` and `signature` are separate because the proof signs the claim
 * payload, not the `SignedClaim.digest` field beside it — tampering with only
 * that field invalidates the digest check while leaving the signature intact.
 *
 * `claimStructure`, `claimDigest` and `signature` are always attempted — the
 * claim is the target, so there is nothing to decline to check. `issuerBinding`
 * is the only three-state check, because binding a key to an issuer requires
 * knowledge Protocol does not have offline.
 */
export interface SovereignClaimVerificationChecks {
  readonly claimStructure: CheckOutcome;
  readonly claimDigest: CheckOutcome;
  readonly signature: CheckOutcome;
  readonly issuerBinding: BindingOutcome;
}

export interface SovereignClaimVerificationResult {
  readonly valid: boolean;
  readonly checks: SovereignClaimVerificationChecks;
  readonly reasons: readonly string[];
}

export interface VerifySignedSovereignClaimOptions {
  /**
   * Optional key->issuer binding check, with exactly the semantics
   * `VerifySovereignManifestOptions.verificationKeyResolver` has: without it,
   * `issuerBinding` is reported as `not_performed` rather than implied by a
   * passing signature. A valid signature proves the holder of
   * `proof.publicKey` signed the claim, never that `proof.publicKey` belongs
   * to the asserted issuer.
   */
  readonly verificationKeyResolver?: VerificationKeyResolver;
  /** Issuer id to resolve a key for. Defaults to the claim's own `issuer`. */
  readonly issuer?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * The issuer id a binding check resolves against.
 *
 * `CanonicalIssuer` is `string | CanonicalPrincipalRef`, and only the
 * identifier participates: `displayName`, `source` and `metadata` are never
 * read, never resolved and never treated as identity. Returning `undefined`
 * for anything else is what makes a binding honestly `not_performed` instead
 * of guessed.
 */
function canonicalIssuerId(issuer: unknown): string | undefined {
  if (isNonBlankString(issuer)) return issuer;
  if (isPlainObject(issuer) && isNonBlankString(issuer.id)) return issuer.id;
  return undefined;
}

/**
 * Whether a value can be serialized under `aoc-canonical-json/1` at all.
 *
 * Uses the one authoritative canonicalizer rather than reimplementing its
 * rules; the thrown error is discarded rather than surfaced, so no raw
 * exception text or stack reaches a verification result.
 */
function isCanonicalizable(value: unknown): boolean {
  // The outcome is assigned rather than returned out of the `catch`, so the
  // failing branch is an explicit negative result rather than a swallowed
  // error. The thrown value itself is deliberately discarded: no raw exception
  // text, message or stack ever reaches a verification result or evidence.
  let canonicalizable = true;
  try {
    canonicalizeJSON(value);
  } catch {
    canonicalizable = false;
  }
  return canonicalizable;
}

function validateVerifiableSovereignClaim(claim: unknown): ClaimValidationResult {
  if (!isPlainObject(claim)) {
    return { valid: false, reasons: ['INVALID_CLAIM_STRUCTURE'] };
  }
  switch (claim.type) {
    case ClaimType.Origin:
      return validateOriginClaim(claim);
    case ClaimType.Authorship:
      return validateAuthorityClaim(claim);
    case ClaimType.Derivation:
      return validateDerivationClaim(claim);
    default:
      // Structurally inspectable, but not a claim type this version can
      // structurally verify. Reported honestly as an invalid target rather
      // than waved through on the strength of a passing signature.
      return { valid: false, reasons: ['UNSUPPORTED_SOVEREIGN_CLAIM_TYPE'] };
  }
}

/**
 * Independently verifies a `SignedClaim`, reporting each dimension separately.
 *
 * Additive companion to `verifySovereignManifest`, with the same shape and the
 * same honesty rules. The cryptographic work is **not** reimplemented here:
 * `verifySignedClaim` remains the owning primitive for the claim digest and
 * the Ed25519 signature, and its existing reason codes
 * (`CLAIM_DIGEST_MISMATCH`, `CLAIM_SIGNATURE_INVALID`) are preserved verbatim
 * and mapped onto explicit check outcomes. What this adds on top is the two
 * things a bare digest/signature check cannot answer on its own: whether the
 * signed artifact is a structurally valid canonical sovereign claim, and
 * whether the signing key binds to the asserted issuer.
 *
 * What a passing result establishes, at most: the holder of the private key
 * matching `proof.publicKey` signed this canonical claim, and — when
 * `issuerBinding` is `verified` — the supplied resolver binds that key id to
 * the asserted issuer. It does not establish that the assertion is
 * historically true, that the issuer had authority to make it, that ownership
 * or a licence exists, that the key has not been revoked, or that the claim is
 * uncontested. A cryptographically valid claim can be `Contested`, and this
 * function neither reads nor writes claim standing.
 */
export async function verifySignedSovereignClaim(
  signed: SignedClaim,
  options: VerifySignedSovereignClaimOptions = {},
): Promise<SovereignClaimVerificationResult> {
  const reasons: string[] = [];

  const structuralValidation = validateVerifiableSovereignClaim(signed.claim);
  const claimStructure: CheckOutcome = structuralValidation.valid ? 'valid' : 'invalid';
  if (!structuralValidation.valid) {
    reasons.push(...structuralValidation.reasons);
  }

  let claimDigest: CheckOutcome;
  let signature: CheckOutcome;
  if (isCanonicalizable(signed.claim)) {
    const cryptographic = verifySignedClaim(signed);
    reasons.push(...cryptographic.reasons);
    claimDigest = cryptographic.reasons.includes('CLAIM_DIGEST_MISMATCH') ? 'invalid' : 'valid';
    signature = cryptographic.reasons.includes('CLAIM_SIGNATURE_INVALID') ? 'invalid' : 'valid';
  } else {
    // A claim that cannot be canonicalized cannot match any digest or any
    // signature, because there is no canonical serialization to recompute
    // either over. Failing both checks closed is the truthful answer; the
    // alternative — letting the canonicalizer throw out of a verification
    // call — would turn "this artifact does not verify" into a crash.
    claimDigest = 'invalid';
    signature = 'invalid';
    reasons.push('CLAIM_NOT_CANONICALIZABLE');
  }

  let issuerBinding: BindingOutcome = 'not_performed';
  if (options.verificationKeyResolver) {
    const issuer = options.issuer ?? canonicalIssuerId((signed.claim as { issuer?: unknown } | undefined)?.issuer);
    if (!issuer) {
      issuerBinding = 'not_performed';
      reasons.push('ISSUER_BINDING_NOT_PERFORMED_NO_ISSUER');
    } else {
      const descriptor = await options.verificationKeyResolver.resolveVerificationKey(issuer);
      if (descriptor && descriptor.keyId === signed.proof.keyId) {
        issuerBinding = 'verified';
      } else {
        issuerBinding = 'unverified';
        reasons.push('ISSUER_BINDING_UNVERIFIED');
      }
    }
  }

  const valid =
    claimStructure === 'valid'
    && claimDigest === 'valid'
    && signature === 'valid'
    && issuerBinding !== 'unverified';

  return { valid, checks: { claimStructure, claimDigest, signature, issuerBinding }, reasons };
}
