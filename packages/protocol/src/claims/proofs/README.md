# Canonical Proof Contracts

This package defines the canonical proof vocabulary for the RFC-005 trust model.
It lives under `claims/proofs` because proofs are referenced by evidence,
assertions, claims, attestations, and verifications, but are not themselves
verification, standing, authority, or decision engines.

## What a proof is

A proof is a portable schema artifact or reference that records support for a
subject. It may describe a hash, signature, attestation, integrity record, chain
lineage, credential artifact, audit entry, runtime trace, or custom proof source.

## What a proof is not

A proof contract is not a cryptographic implementation, blockchain primitive,
wallet verifier, DID resolver, runtime verifier, trust scorer, standing evaluator,
authority evaluator, or decision authorizer. These contracts intentionally do not
implement `verifyProof`, `validateProof`, `verifySignature`, `verifyChain`,
`verifyHash`, `verifyCredential`, or `resolveDID` behavior.

## Evidence vs. Proof vs. Verification

- **Evidence** records source material that supports an assertion or claim.
- **Proof** records or references artifacts that can support evidence, claims,
  attestations, traces, or lineage without judging them.
- **Verification** records a verifier's findings about a claim. Verification may
  reference proofs, but proof presence alone does not imply verified status.
