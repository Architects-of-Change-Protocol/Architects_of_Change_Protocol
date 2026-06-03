# Proof Envelope Compliance Audit

Date: 2026-06-03

## Summary

The canonical proof contracts establish a protocol vocabulary for proof artifacts while preserving the constitutional separation of the RFC-005 trust chain:

```text
Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision
```

Proofs may support artifacts in that chain, but they do not replace any stage of the chain and do not implement any Enterprise verification, runtime, authority, standing, or decision behavior.

## Alignment with GA-01

GA-01 requires auditable, explicit governance boundaries. The proof contracts increase auditability by naming proof references, subjects, issuers, signers, attestations, audit artifacts, trace artifacts, and lineage artifacts without granting authority. They preserve explicit governance because no proof contract creates governance decisions, authority grants, standing, or policy outcomes.

## Alignment with RFC-001

RFC-001 identity concerns are respected through string-compatible principal references inherited from A3. `CanonicalProofEnvelope.issuer`, `CanonicalSignatureProof.signer`, and `CanonicalAttestationProof.attester` can use canonical principal references without resolving DIDs, wallets, identity providers, or credentials.

## Alignment with RFC-002

RFC-002 governance concerns remain separate. Proof contracts can reference governance attestations and audit records, but they do not evaluate governance sessions, policies, obligations, or human review outcomes.

## Alignment with RFC-003

RFC-003 knowledge concerns remain separate. Proof contracts can describe proof artifacts related to knowledge or runtime traces, but they do not retrieve knowledge, evaluate provenance, or infer truth.

## Alignment with RFC-004

RFC-004 evidence concerns are directly supported. Evidence can now optionally reference `CanonicalProofRef[]` when a source document, signature, digest, audit record, credential, or trace artifact supports evidentiary value. The proof contract remains infrastructure-neutral and does not become a storage system, blockchain, cryptographic engine, or document management platform.

## Alignment with RFC-005

RFC-005 defines the trust and authority model. Optional proof references on evidence, assertions, claims, attestations, and verifications make proof artifacts explainable without collapsing claim stages. A proof can support a claim, but only `CanonicalVerification` records verifier findings; only `CanonicalStanding` records standing; only `CanonicalCapability` and `CanonicalAuthority` represent capability and authority; only `CanonicalDecision` records decisions.

## Alignment with A2 canonical contracts

A2 established canonical trust contracts including capability token proof metadata. The new proof vocabulary does not remove or mutate A2 compatibility types. It provides a future canonical mapping target for `ProofMetadata` and `CapabilityToken.proof` while preserving existing package exports.

## Alignment with A3 principal reference contracts

A3 established canonical principal, source, and scope references. The proof contracts reuse `CanonicalSubject`, `CanonicalIssuer`, `CanonicalAttester`, and `CanonicalSource`, so proof artifacts can identify participants and artifact sources without resolving identity, source authenticity, or authority.

## Why proofs are not verification

A proof records or references a supporting artifact. Verification records a verifier's status, findings, timestamp, and optional confidence about a claim. The presence of `CanonicalProofRef`, `CanonicalHashProof`, `CanonicalSignatureProof`, or `CanonicalProofEnvelope` does not imply `Verified`; it only identifies material a verifier may consider.

## Why proofs are not standing

Standing is a lifecycle conclusion about a claim after verification and policy interpretation. Proofs do not determine whether a claim is active, expired, suspended, revoked, or not yet active. They may explain what artifacts were available when standing was later established.

## Why proofs are not authority

Authority is derived from capabilities and standing within a scope. A signature proof, hash proof, attestation proof, credential proof, audit proof, or trace proof does not grant permission to act. Proof artifacts preserve support and lineage; authority remains represented by `CanonicalAuthority`.

## Why proofs are not decisions

Decisions are explicit outcomes made by a decision maker under authority. Proofs can support the explanation of a decision, but they do not approve, deny, execute, or authorize anything.

## Non-implementation confirmation

The canonical proof package defines schemas and const objects only. It does not implement `verifyProof`, `validateProof`, `verifySignature`, `verifyChain`, `verifyHash`, `verifyCredential`, `resolveDID`, wallet verification, runtime verification, standing evaluation, authority evaluation, trust scoring, or decision authorization.

## Compliance conclusion

The canonical proof vocabulary is constitutionally compliant because it makes proof artifacts portable and explainable while preserving all separations required by GA-01, RFC-001, RFC-002, RFC-003, RFC-004, RFC-005, A2, and A3.
