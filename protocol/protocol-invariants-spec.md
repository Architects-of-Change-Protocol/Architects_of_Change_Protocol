# AOC Protocol — Protocol Invariants Specification

**Version:** 0.1  
**Status:** Draft  
**Layer:** Normative Specification  
**Parent Documents:**  
- [governance/governance-compliance-spec.md](./governance/governance-compliance-spec.md)  
- [error-objects-spec.md](./error-objects-spec.md)  
- [wallet/architecture.md](./wallet/architecture.md)  
- [wallet/crypto-spec.md](./wallet/crypto-spec.md)  
- [consent/consent-object-spec.md](./consent/consent-object-spec.md)  
- [consent/capability-token-spec.md](./consent/capability-token-spec.md)  
- [pack/pack-object-spec.md](./pack/pack-object-spec.md)  
- [content/content-object-spec.md](./content/content-object-spec.md)  
- [field/field-manifest-spec.md](./field/field-manifest-spec.md)  
- [storage/storage-pointer-spec.md](./storage/storage-pointer-spec.md)  
- [threat-model-spec.md](./threat-model-spec.md)  

---

## Table of Contents

1. [Scope](#1-scope)  
2. [Normative Language](#2-normative-language)  
3. [Invariant Registry](#3-invariant-registry)  
4. [Global Protocol Invariants](#4-global-protocol-invariants)  
5. [Enforcement Points](#5-enforcement-points)  
6. [Compliance Matrix](#6-compliance-matrix)  
7. [Relationship to Other Specs](#7-relationship-to-other-specs)  
8. [Security Considerations](#8-security-considerations)  
9. [Implementation Notes](#9-implementation-notes)  
10. [Change Log](#10-change-log)  

---

## 1. Scope

This specification defines **protocol-wide invariants** that MUST hold across AOC objects, wallet vault behavior, adapters, and market-maker integrations.

It does **not** replace object-level invariant sections inside individual specifications. Instead, it provides a **single registry and cross-object rules** that bind the protocol together.

---

## 2. Normative Language

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are to be interpreted as described in RFC 2119.

---

## 3. Invariant Registry

### 3.1 Invariant IDs

Invariants in this document are identified using:

- `INV-GEN-*` — Global, cross-object invariants  
- `INV-AUTH-*` — Authorization / consent / capability invariants  
- `INV-INT-*` — Integrity / hashing / determinism invariants  
- `INV-SEC-*` — Security posture invariants (key handling, encryption, transport)  
- `INV-OBS-*` — Observability invariants (logging, auditability)

### 3.2 Failure Behavior

If an invariant in this document is violated, implementations MUST:

1. **Fail closed** (deny access / reject object / halt operation), and  
2. Emit a **Decision Object** with a stable error code family (see `error-objects-spec.md`), and  
3. Record an **audit log entry** with sufficient context for debugging without leaking protected content.

---

## 4. Global Protocol Invariants

### 4.1 Canonicalization & Determinism

**INV-INT-01 — Canonical bytes are unique**  
Implementations MUST define a canonical encoding for any object that is hashed or signed. Two semantically identical objects MUST NOT produce different canonical byte representations.

**INV-INT-02 — Deterministic identifiers**  
Any identifier derived from object bytes (hashes, content IDs, pack hashes) MUST be deterministic with respect to canonical bytes.

**INV-INT-03 — Round-trip stability**  
When a spec declares a serialization format, implementations MUST satisfy:  
`parse(serialize(x)) = x` for all valid `x` (subject to normalization rules).

---

### 4.2 Integrity & Tamper Evidence

**INV-INT-10 — Declared hash must verify**  
If an object declares a hash of its content/canonical bytes, implementations MUST recompute and verify it. Mismatches MUST be rejected.

**INV-INT-11 — Pointer-to-bytes integrity**  
When a Storage Pointer is used to retrieve bytes, the retrieved bytes MUST satisfy the hash invariant and URI invariants defined in the Storage Pointer specification.

**INV-INT-12 — No silent downgrade**  
Implementations MUST NOT silently accept weaker verification modes when strict verification is required by a spec.

---

### 4.3 Authorization: Consent + Capability

**INV-AUTH-01 — No access without valid authorization**  
Protected field/blob access MUST require authorization artifacts as defined by the Consent and Capability specifications.

**INV-AUTH-02 — Scope containment (no escalation)**  
Capability Token scope MUST be a strict subset (or equal, where allowed) of the parent Consent scope. Any attempt to widen scope MUST be rejected.

**INV-AUTH-03 — Permission containment (no escalation)**  
Capability permissions MUST be a strict subset (or equal, where allowed) of parent Consent permissions. Any attempt to escalate permissions MUST be rejected.

**INV-AUTH-04 — Revocation is effective immediately**  
Once a consent or capability is revoked, subsequent access attempts MUST be denied (no grace period).

**INV-AUTH-05 — Consent-by-omission prohibited**  
Implementations MUST NOT infer consent from missing fields, default flags, or absent denial markers.

---

### 4.4 Replay Resistance & Freshness

**INV-AUTH-10 — Replay protection required**  
Any signed request that authorizes access or state transition MUST include replay protection (nonce and/or bounded timestamp).

**INV-AUTH-11 — Time-bounds enforced**  
Expiration and not-before constraints MUST be enforced for Consent and Capability tokens (per their specs). Expired or premature tokens MUST be rejected.

---

### 4.5 Key Handling & Confidentiality

**INV-SEC-01 — Private keys never leave the wallet unencrypted**  
Wallet implementations MUST NOT expose raw private key material to adapters or external callers.

**INV-SEC-02 — Adapter never sees plaintext protected data (when applicable)**  
Where the architecture declares that adapters must not access plaintext user data, implementations MUST enforce that boundary.

**INV-SEC-03 — Encryption at rest**  
Protected stored data MUST be encrypted at rest as defined by wallet crypto requirements.

**INV-SEC-04 — Signed transport for protocol messages**  
Protocol messages that assert identity, authorization, or integrity MUST be signed. Transport security (TLS) MUST be used for HTTP/WebSocket where applicable.

---

### 4.6 Observability & Auditability

**INV-OBS-01 — Invariant violations are logged**  
Invariant failures MUST be logged with sufficient metadata to trace root cause. Logs MUST NOT contain protected plaintext data.

**INV-OBS-02 — Decisions are explainable**  
Deny decisions MUST include machine-readable reasons and stable error codes (Decision + Error Objects).

---

## 5. Enforcement Points

Implementations MUST enforce invariants at the following points (at minimum):

1. **Object acceptance** (ingest/parse/validate)  
2. **Object persistence** (before writing to storage)  
3. **Authorization boundary** (before resolving or returning protected fields/blobs)  
4. **Token minting** (capability derivation rules)  
5. **Pointer resolution** (bytes retrieval + integrity verification)  
6. **Revocation checks** (every access attempt)  

---

## 6. Compliance Matrix

| Invariant ID | Category | Primary Enforcement Point(s) | Related Spec(s) |
|---|---|---|---|
| INV-INT-01 | Integrity | Object acceptance | wallet/architecture, wallet/crypto, pack/content/field/storage specs |
| INV-INT-10 | Integrity | Pointer resolution, object acceptance | storage-pointer, pack/content |
| INV-AUTH-01 | Authorization | Authorization boundary | consent-object, capability-token, wallet/architecture |
| INV-AUTH-02 | Authorization | Token minting, authorization boundary | capability-token, governance-compliance |
| INV-AUTH-10 | Authorization | Authorization boundary | capability-token, wallet/threat-model |
| INV-SEC-01 | Security | Wallet module boundary | wallet/architecture, wallet/crypto |
| INV-OBS-02 | Observability | Deny responses | error-objects-spec |

Implementations SHOULD expand this matrix with additional rows as object specs evolve.

---

## 7. Relationship to Other Specs

- Object specs (Consent, Capability, Pack, Content, Field Manifest, Storage Pointer) define **structural and semantic invariants** at the object layer.
- This document defines **cross-object invariants** and consistent failure behavior.
- Governance and Compliance defines organizational and market-maker obligations to uphold invariants.

---

## 8. Security Considerations

Violating protocol invariants can break sovereignty guarantees, enable unauthorized access, replay attacks, or integrity compromise. Implementations MUST treat invariant enforcement as security-critical and fail closed.

---

## 9. Implementation Notes

- Prefer centralized validation utilities to reduce drift across modules.
- Treat invariant enforcement as a testable contract: each invariant SHOULD have at least one negative-path test demonstrating rejection behavior.
- Align error reporting with Decision + Error Objects for consistent UX and audit tooling.

---

## 10. Change Log

- **0.1** — Initial registry and global invariants scaffold, referencing existing object-level invariant sections.
