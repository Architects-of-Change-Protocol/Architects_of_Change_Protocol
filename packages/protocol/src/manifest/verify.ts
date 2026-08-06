import type { VerificationKeyResolver } from '../adapters';
import { verifyContentIdentity } from '../identity/content-identity';
import { verifySovereignSignature } from './proof';
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
  /** Raw content bytes to verify against `manifest.contentIdentity`. Omit to skip content verification honestly (not silently pass it). */
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

  let contentDigest: CheckOutcome = 'not_performed';
  if (options.contentBytes) {
    const contentCheck = verifyContentIdentity(options.contentBytes, signed.manifest.contentIdentity);
    contentDigest = contentCheck.valid ? 'valid' : 'invalid';
    if (!contentCheck.valid && contentCheck.reason) {
      reasons.push(contentCheck.reason);
    }
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
