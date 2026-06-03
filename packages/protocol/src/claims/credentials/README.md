# Canonical Credential Contracts

Canonical credential contracts define the public RFC-005 protocol surface for portable credential descriptors.

A credential is a portable bundle or container of claim references, evidence references, attestation references, proof references, registry references, issuer information, subject information, and status references. It can be carried across systems so that a separate verifier, standing evaluator, authority resolver, or decision engine can inspect the trust-chain artifacts it references.

## What a credential is not

A credential is not an implementation engine. These contracts do not issue credentials, store credentials, resolve DIDs, integrate wallets, verify signatures, check revocation, evaluate standing, derive authority, score trust, or authorize decisions.

## Credential vs claim

A claim is a formal statement about a subject. A credential is a package that references one or more claims and related trust-chain artifacts. Canonical credentials use `claimRefs` instead of embedding full claims so claim semantics remain governed by the RFC-005 claim contracts.

## Credential vs proof

A proof is an artifact or reference used to support integrity, signature, chain, audit, trace, or related evidence. A credential may reference proofs, but it is not itself a proof and does not validate proof material.

## Credential vs verification

Verification evaluates whether a claim or credential-related artifact is supported. A credential may contain status descriptors and proof references, but it does not verify itself.

## Credential vs standing

Standing is the current usability state of a claim for trust, capability, authority, or decision purposes. A credential status reference is only a descriptor; it is not standing and does not decide whether a credential or claim is currently usable.

## Credential vs authority

Authority is derived from standing claims, capabilities, delegation rules, governance policy, and applicable constraints. Possessing a credential does not grant authority by itself.

## Credential vs decision

A decision is a consequential action taken under authority. Presenting or referencing a credential does not authorize a decision; decision authorization remains the responsibility of policy, standing, authority, and runtime governance systems.
