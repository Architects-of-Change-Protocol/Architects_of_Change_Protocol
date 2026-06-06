# PR-04 Verification Extraction

## Extracted components

- Identity verification rules previously embedded in `runtime/trust/service.ts` now live in `enterprise/src/assurance/verification/identity-verification.ts` as `IdentityVerificationEngine`.
- The Enterprise trust service delegates candidate selection, issuer activity, revocation, expiry, consent, and success evaluation to that engine.
- `EnterpriseVerificationProvider` implements the Protocol-owned `VerificationProvider` adapter for canonical claims.
- `InMemoryVerificationKeyResolver` implements the Protocol-owned `VerificationKeyResolver` adapter.

## Preserved behavior

The legacy hosted identity workflow preserves:

- latest-credential selection;
- `NOT_FOUND`, `ISSUER_INACTIVE`, `REVOKED`, `EXPIRED`, `CONSENT_REQUIRED`, and `VERIFIED` reason codes;
- consumer-consent requirements;
- verification audit event shape and ordering; and
- payout KYC allow/deny reason strings.

`runtime/trust/service.ts` remains a compatibility re-export, so API routes and existing consumers continue using the old import path without behavior changes.

## Adapter use

Canonical verification orchestration resolves a key through `VerificationKeyResolver` and evaluates the claim through an injected strategy before returning the existing `CanonicalVerification` contract. No verification contract, claim, fixture, or error was changed.

## Deferred verification components

- `protocol/capability/capability-verify.ts` remains in place because moving it would broaden PR-04 into capability protocol/runtime separation.
- `crypto/engine.ts` remains shared cryptographic infrastructure.
- `packages/portable-cognition` integrity verification remains package-owned pending a dedicated extraction and parity corpus.
- Attestation verification remains deferred with the rest of `runtime/attestations/*`.

## Risks

- Canonical verification IDs include the requested/observed timestamp; callers requiring stable IDs must provide `AdapterLookupContext.requestedAt`.
- Verification strategies are injected because Protocol defines the seam but does not prescribe cryptographic or policy behavior.
