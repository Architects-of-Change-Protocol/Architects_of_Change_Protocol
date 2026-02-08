# AOC Protocol — Capability Token Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** Consent Object Specification (v0.1.2)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Goals](#2-design-goals)
3. [Capability Token Definition](#3-capability-token-definition)
4. [Derivation Constraints](#4-derivation-constraints)
5. [Attenuation Model](#5-attenuation-model)
6. [Validity & Replay Semantics](#6-validity--replay-semantics)
7. [Canonicalization Rules](#7-canonicalization-rules)
8. [Hashing Boundary](#8-hashing-boundary)
9. [Identifier Construction](#9-identifier-construction)
10. [Structural and Semantic Invariants](#10-structural-and-semantic-invariants)
11. [Security Considerations](#11-security-considerations)
12. [Examples](#12-examples)
13. [Non-Goals](#13-non-goals)

---

## 1. Overview

### 1.1 Definition

A **Capability Token** is an immutable, cryptographically verifiable, portable proof of authorization derived from a single Consent Object. A Capability Token binds a subject, grantee, scope, permissions, and time bounds into a self-contained presentation artifact that is independently hashable and identifiable.

```
CapabilityToken := {
  version,          // Protocol version
  subject,          // DID of the data owner
  grantee,          // DID of the authorized party
  consent_ref,      // Hash of the parent Consent Object
  scope,            // Array of scope entries (subset of consent scope)
  permissions,      // Array of permitted operations (subset of consent permissions)
  issued_at,        // Timestamp of token issuance
  not_before,       // Earliest validity time (optional)
  expires_at,       // Expiration timestamp (required, non-null)
  token_id,         // Unique identifier for replay resistance
  capability_hash   // SHA-256 hash of canonical payload
}
```

### 1.2 What a Capability Token Represents

| Concept | Description |
|---------|-------------|
| **Portable Proof** | A self-contained artifact that proves authorization without requiring the verifier to retrieve the parent Consent Object |
| **Attenuated Authorization** | A grant that is equal to or narrower than the parent consent in scope, permissions, and time |
| **Presentation Credential** | An artifact a grantee presents to exercise authorized operations |
| **Replay-Resistant Instrument** | A uniquely identified token that supports detection of duplicate presentation |
| **Time-Bounded Grant** | A proof with a mandatory finite validity window |

### 1.3 What a Capability Token Does NOT Represent

| Excluded Concept | Rationale |
|------------------|-----------|
| **Authorization Record** | The Consent Object is the authoritative source of authorization; the Capability Token is a derived proof |
| **Revocation Instrument** | Revocation is expressed through Consent Objects with `action: "revoke"`; Capability Tokens do not revoke |
| **Identity Assertion** | The token carries identity bindings but does not authenticate the presenter |
| **Consent Lifecycle** | Grant/revoke chains, supersession, and consent history are Consent Object concerns |
| **Access Control Decision** | Enforcement semantics are outside protocol scope |

### 1.4 Design Principles

| Principle | Description |
|-----------|-------------|
| **Derivation** | Every Capability Token MUST be traceable to exactly one parent Consent Object |
| **Attenuation Only** | A Capability Token MUST NOT exceed the authorization of its parent consent |
| **Immutability** | Once created, a Capability Token MUST NOT be modified |
| **Self-Describing** | Contains all fields necessary for structural and semantic validation |
| **Cryptographic Binding** | Hash binds all fields into a tamper-evident unit |
| **Mandatory Expiration** | Every Capability Token MUST have a finite expiration |
| **Replay Resistance** | Every Capability Token carries a unique identifier to support replay detection |

### 1.5 Relationship to Protocol Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       CONSENT LAYER                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Consent Object                           │   │
│  │  subject ─────► DID of data owner                       │   │
│  │  grantee ─────► DID of authorized party                 │   │
│  │  scope ───────► Objects authorized                      │   │
│  │  permissions ─► Operations permitted                    │   │
│  │  consent_hash ► Canonical identifier                    │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│                         │ derives (attenuation)                 │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Capability Token                           │   │
│  │  consent_ref ─► Binding to parent consent               │   │
│  │  scope ───────► Subset of consent scope                 │   │
│  │  permissions ─► Subset of consent permissions           │   │
│  │  time bounds ─► Equal or narrower window                │   │
│  │  token_id ───► Replay-resistance identifier             │   │
│  │  capability_hash ► Canonical identifier                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ authorizes access to
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Pack Object  │  │Content Object│  │Field Manifest│         │
│  │  pack_hash   │  │ content_hash │  │  field_hash  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Goals

### 2.1 Primary Goals

| Goal | Description |
|------|-------------|
| **Portability** | A Capability Token MUST be interpretable and verifiable without access to external systems |
| **Attenuation Safety** | A Capability Token MUST NOT grant broader authorization than its parent Consent Object |
| **Independent Identity** | Each token MUST be uniquely identifiable by its own canonical hash |
| **Determinism** | Identical inputs MUST produce identical capability hashes |
| **Mandatory Expiration** | Every token MUST carry a finite expiration to limit exposure from compromise |

### 2.2 Secondary Goals

| Goal | Description |
|------|-------------|
| **Minimal Surface** | Include only essential fields for portable proof semantics |
| **Consent Complementarity** | Token fields and semantics MUST NOT duplicate Consent Object lifecycle concerns |
| **Offline Verification** | Structural and hash integrity MUST be verifiable without network access |
| **Replay Awareness** | Protocol-level fields MUST support replay detection without prescribing enforcement mechanisms |

---

## 3. Capability Token Definition

### 3.1 Field Summary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | REQUIRED | Protocol version identifier |
| `subject` | string | REQUIRED | DID of the data owner |
| `grantee` | string | REQUIRED | DID of the authorized party |
| `consent_ref` | string | REQUIRED | Hash of the parent Consent Object |
| `scope` | array | REQUIRED | Scope entries authorized by this token |
| `permissions` | array | REQUIRED | Operations permitted by this token |
| `issued_at` | string | REQUIRED | ISO 8601 UTC timestamp of token issuance |
| `not_before` | string or null | OPTIONAL | ISO 8601 UTC timestamp of earliest validity |
| `expires_at` | string | REQUIRED | ISO 8601 UTC timestamp of token expiration |
| `token_id` | string | REQUIRED | Unique identifier for replay resistance |
| `capability_hash` | string | REQUIRED | SHA-256 hash of canonical payload |

### 3.2 Field Definitions

#### 3.2.1 version

| Property | Value |
|----------|-------|
| **Name** | `version` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Semantic version (`major.minor`) |
| **Constraints** | Pattern: `^[0-9]+\.[0-9]+$` |
| **Initial Value** | `"1.0"` |

**Description:** The protocol version governing this Capability Token's structure and semantics.

**Semantic Rules:**

1. Implementations MUST reject Capability Tokens with unsupported version numbers.
2. Version `"1.0"` indicates conformance to this specification.
3. Minor version increments indicate backward-compatible additions.
4. Major version increments indicate breaking changes.

#### 3.2.2 subject

| Property | Value |
|----------|-------|
| **Name** | `subject` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Decentralized Identifier (DID) |
| **Constraints** | Pattern: `^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$` |
| **Min Length** | 8 |
| **Max Length** | 2048 |

**Description:** The DID of the data owner whose authorization this token represents. The subject MUST match the `subject` field of the parent Consent Object referenced by `consent_ref`.

**Semantic Rules:**

1. The subject MUST be identical to the parent Consent Object's subject.
2. The subject identifies the authoritative data owner, not the token presenter.
3. The subject and grantee MAY be the same DID.

#### 3.2.3 grantee

| Property | Value |
|----------|-------|
| **Name** | `grantee` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Decentralized Identifier (DID) |
| **Constraints** | Pattern: `^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$` |
| **Min Length** | 8 |
| **Max Length** | 2048 |

**Description:** The DID of the party authorized to present this token. The grantee MUST match the `grantee` field of the parent Consent Object referenced by `consent_ref`.

**Semantic Rules:**

1. The grantee MUST be identical to the parent Consent Object's grantee.
2. Authorization applies only to the specified grantee.
3. A grantee value of `"did:aoc:public"` indicates public access, consistent with Consent Object semantics.

#### 3.2.4 consent_ref

| Property | Value |
|----------|-------|
| **Name** | `consent_ref` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | SHA-256 hash (lowercase hexadecimal) |
| **Constraints** | Pattern: `^[a-f0-9]{64}$`; exactly 64 characters |

**Description:** The `consent_hash` of the parent Consent Object from which this Capability Token is derived. This field establishes the provenance chain between the token and its authoritative consent.

**Semantic Rules:**

1. The referenced Consent Object MUST have `action` equal to `"grant"`.
2. The referenced Consent Object MUST NOT be expired at the token's `issued_at` time.
3. A Capability Token MUST reference exactly one Consent Object.
4. The `consent_ref` value MUST be the `consent_hash` of a structurally valid Consent Object.

#### 3.2.5 scope

| Property | Value |
|----------|-------|
| **Name** | `scope` |
| **Type** | array |
| **Required** | REQUIRED |
| **Format** | Array of Scope Entry objects |
| **Constraints** | MUST NOT be empty; minimum 1 entry; maximum 10000 entries |

**Description:** The set of AOC protocol objects to which this Capability Token grants access. Each scope entry follows the Scope Entry structure defined in the Consent Object Specification (Section 4).

**Semantic Rules:**

1. Every scope entry in the token MUST appear in the parent Consent Object's scope.
2. The token's scope MUST be a subset of (or equal to) the parent consent's scope.
3. Scope entries MUST be unique within a Capability Token.
4. An empty scope array is invalid; a token MUST have explicit targets.

See [Section 5: Attenuation Model](#5-attenuation-model) for subset constraints.

#### 3.2.6 permissions

| Property | Value |
|----------|-------|
| **Name** | `permissions` |
| **Type** | array |
| **Required** | REQUIRED |
| **Format** | Array of permission strings |
| **Constraints** | MUST NOT be empty; minimum 1 entry; maximum 100 entries |

**Description:** The operations the grantee is permitted to perform when presenting this token. Permissions MUST be drawn from the vocabulary defined in the Consent Object Specification (Section 3.2.6).

**Semantic Rules:**

1. Every permission in the token MUST appear in the parent Consent Object's permissions.
2. The token's permissions MUST be a subset of (or equal to) the parent consent's permissions.
3. Permission strings MUST be lowercase alphanumeric with hyphens.
4. Permissions MUST NOT contain duplicates within a single token.

#### 3.2.7 issued_at

| Property | Value |
|----------|-------|
| **Name** | `issued_at` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | ISO 8601 UTC timestamp |
| **Constraints** | Pattern: `^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$` |

**Description:** The UTC timestamp when this Capability Token was created.

**Semantic Rules:**

1. Timestamps MUST be in UTC (indicated by trailing `Z`).
2. Timestamps MUST NOT include fractional seconds.
3. The `issued_at` value MUST NOT be more than 300 seconds in the future relative to evaluation time.
4. The `issued_at` value MUST be at or after the parent Consent Object's `issued_at`.

**Example:** `"2025-06-15T10:00:00Z"`

#### 3.2.8 not_before

| Property | Value |
|----------|-------|
| **Name** | `not_before` |
| **Type** | string or null |
| **Required** | OPTIONAL |
| **Format** | ISO 8601 UTC timestamp or null |
| **Constraints** | Pattern: `^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$` |
| **Default** | `null` |

**Description:** The earliest UTC timestamp at which this Capability Token becomes valid. A value of `null` indicates the token is valid from its `issued_at` time.

**Semantic Rules:**

1. If non-null, `not_before` MUST be at or after `issued_at`.
2. If non-null, `not_before` MUST be before `expires_at`.
3. If non-null, `not_before` MUST be at or after the parent Consent Object's `issued_at`.
4. A `null` value indicates the effective validity start is `issued_at`.

**Example:** `"2025-07-01T00:00:00Z"`

#### 3.2.9 expires_at

| Property | Value |
|----------|-------|
| **Name** | `expires_at` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | ISO 8601 UTC timestamp |
| **Constraints** | Pattern: `^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$`; MUST NOT be null |

**Description:** The UTC timestamp when this Capability Token expires. Unlike Consent Objects, Capability Tokens MUST always carry a finite expiration.

**Semantic Rules:**

1. The `expires_at` field MUST NOT be null.
2. The `expires_at` value MUST be after `issued_at`.
3. If `not_before` is non-null, `expires_at` MUST be after `not_before`.
4. If the parent Consent Object has a non-null `expires_at`, the token's `expires_at` MUST be at or before the consent's `expires_at`.
5. If the parent Consent Object has a null `expires_at`, the token MAY use any valid future timestamp.
6. An expired Capability Token MUST NOT be accepted as proof of authorization.

**Example:** `"2025-07-15T10:00:00Z"`

#### 3.2.10 token_id

| Property | Value |
|----------|-------|
| **Name** | `token_id` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | Pattern: `^[a-f0-9]{64}$`; exactly 64 characters |

**Description:** A unique, non-repeatable identifier for this Capability Token. The `token_id` provides replay-resistance semantics at the protocol level. It is NOT derived from any hash; it is an independently generated unique value.

**Semantic Rules:**

1. The `token_id` MUST be globally unique across all Capability Tokens.
2. The `token_id` MUST NOT be reused, even across different (subject, grantee) pairs.
3. The `token_id` MUST NOT be derived from the `capability_hash` or any other field of the token.
4. Implementations SHOULD generate `token_id` values with sufficient entropy to make collision computationally infeasible.

#### 3.2.11 capability_hash

| Property | Value |
|----------|-------|
| **Name** | `capability_hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | SHA-256 hash (lowercase hexadecimal) |
| **Constraints** | Pattern: `^[a-f0-9]{64}$`; exactly 64 characters |

**Description:** The SHA-256 hash of the canonical payload, serving as the unique identifier for this Capability Token.

**Semantic Rules:**

1. The `capability_hash` MUST equal the SHA-256 hash of the canonical payload.
2. Hash verification failure indicates tampering or corruption.
3. The `capability_hash` field itself is excluded from the canonical payload.
4. Identical canonical payloads MUST produce identical capability hashes.

---

## 4. Derivation Constraints

### 4.1 Parent Consent Binding

A Capability Token MUST be derived from exactly one Consent Object. The `consent_ref` field binds the token to its parent consent.

| Constraint | Rule |
|------------|------|
| **Single Parent** | A token MUST reference exactly one Consent Object via `consent_ref` |
| **Grant Only** | The parent consent's `action` MUST be `"grant"` |
| **Active Consent** | The parent consent MUST NOT be expired at the token's `issued_at` time |
| **Hash Integrity** | The `consent_ref` MUST equal the parent consent's `consent_hash` |

### 4.2 Identity Binding

| Field | Constraint |
|-------|------------|
| `subject` | MUST be identical to the parent Consent Object's `subject` |
| `grantee` | MUST be identical to the parent Consent Object's `grantee` |

Identity fields MUST NOT be altered during derivation. A Capability Token cannot redirect authorization to a different subject or grantee.

### 4.3 Scope Binding

The token's `scope` MUST be a subset of (or equal to) the parent consent's `scope`.

| Rule | Description |
|------|-------------|
| **Subset Constraint** | Every scope entry `(type, ref)` in the token MUST appear in the parent consent's scope |
| **No Addition** | The token MUST NOT contain scope entries absent from the parent consent |
| **Non-Empty** | The token MUST contain at least one scope entry |

### 4.4 Permission Binding

The token's `permissions` MUST be a subset of (or equal to) the parent consent's `permissions`.

| Rule | Description |
|------|-------------|
| **Subset Constraint** | Every permission string in the token MUST appear in the parent consent's permissions |
| **No Addition** | The token MUST NOT contain permissions absent from the parent consent |
| **Non-Empty** | The token MUST contain at least one permission |

### 4.5 Temporal Binding

The token's validity window MUST be contained within the parent consent's temporal bounds.

| Constraint | Rule |
|------------|------|
| **Start Bound** | Token `issued_at` MUST be at or after the parent consent's `issued_at` |
| **End Bound (bounded consent)** | If the parent consent's `expires_at` is non-null, the token's `expires_at` MUST be at or before the consent's `expires_at` |
| **End Bound (unbounded consent)** | If the parent consent's `expires_at` is null, the token's `expires_at` MAY be any valid future timestamp |
| **Mandatory Expiration** | The token's `expires_at` MUST NOT be null, regardless of the parent consent's temporal bounds |

---

## 5. Attenuation Model

### 5.1 Attenuation Principle

A Capability Token represents an **equal or narrower** grant of authorization compared to its parent Consent Object. Attenuation MAY occur along three independent dimensions: scope, permissions, and time. Attenuation along one dimension does not require attenuation along others.

### 5.2 Scope Attenuation

A token MAY authorize access to fewer objects than the parent consent.

| Attenuation Type | Description |
|------------------|-------------|
| **Full Scope** | Token scope equals parent consent scope (no attenuation) |
| **Reduced Scope** | Token scope is a proper subset of parent consent scope |

Scope attenuation is expressed by including fewer scope entries in the token than exist in the parent consent. Each retained entry MUST be an exact `(type, ref)` match.

### 5.3 Permission Attenuation

A token MAY permit fewer operations than the parent consent.

| Attenuation Type | Description |
|------------------|-------------|
| **Full Permissions** | Token permissions equal parent consent permissions (no attenuation) |
| **Reduced Permissions** | Token permissions are a proper subset of parent consent permissions |

Permission attenuation is expressed by including fewer permission strings in the token than exist in the parent consent. Each retained permission MUST be an exact string match.

### 5.4 Temporal Attenuation

A token MAY have a narrower validity window than the parent consent.

| Attenuation Type | Description |
|------------------|-------------|
| **Full Window** | Token validity window matches the maximum allowed by consent |
| **Later Start** | Token `not_before` is after consent's `issued_at` |
| **Earlier End** | Token `expires_at` is before consent's `expires_at` |
| **Both** | Token has both a later start and an earlier end |

### 5.5 Non-Escalation Rule

A Capability Token MUST NOT exceed its parent consent's authorization in any dimension.

| Dimension | Escalation (PROHIBITED) | Attenuation (PERMITTED) |
|-----------|------------------------|------------------------|
| **Scope** | Adding scope entries not in parent consent | Removing scope entries from parent consent |
| **Permissions** | Adding permissions not in parent consent | Removing permissions from parent consent |
| **Time** | Extending `expires_at` beyond consent's `expires_at` | Shortening the validity window |
| **Subject** | Changing the subject DID | (Subject MUST be identical) |
| **Grantee** | Changing the grantee DID | (Grantee MUST be identical) |

---

## 6. Validity & Replay Semantics

### 6.1 Temporal Validity

A Capability Token is temporally valid when the evaluation time falls within the token's validity window.

| Condition | Rule |
|-----------|------|
| **Effective Start** | If `not_before` is non-null, validity begins at `not_before`; otherwise, validity begins at `issued_at` |
| **Effective End** | Validity ends at `expires_at` |
| **Valid Window** | The evaluation time MUST be at or after the effective start AND before or at `expires_at` |
| **Expired Token** | A token past its `expires_at` MUST NOT be accepted as proof of authorization |

### 6.2 Replay Resistance

The `token_id` field provides protocol-level replay-resistance semantics.

| Property | Rule |
|----------|------|
| **Uniqueness** | The `token_id` MUST be globally unique across all Capability Tokens |
| **Non-Reuse** | A `token_id` value MUST NOT appear in more than one Capability Token |
| **Independence** | The `token_id` MUST NOT be derived from the capability_hash or any other token field |
| **Collision Infeasibility** | 256-bit `token_id` values MUST have sufficient entropy to make accidental collision computationally infeasible |

The combination of a globally unique `token_id` and a finite `expires_at` bounds the window during which replay detection state MUST be maintained: implementations MAY discard `token_id` tracking records for tokens whose `expires_at` has passed.

### 6.3 Consent Validity Dependency

A Capability Token's authorization is contingent on the continued validity of its parent Consent Object.

| Condition | Effect on Token |
|-----------|----------------|
| Parent consent is active and unexpired | Token authorization is active (subject to token's own time bounds) |
| Parent consent has been revoked | Token MUST NOT be accepted as proof of authorization |
| Parent consent has expired | Token MUST NOT be accepted as proof of authorization |

A Capability Token does not extend or preserve authorization beyond the lifetime of its parent consent. Revocation of the parent consent invalidates all derived tokens, regardless of the token's own `expires_at`.

---

## 7. Canonicalization Rules

### 7.1 Overview

Capability Tokens MUST be canonicalized before hashing to ensure deterministic hash computation across implementations. Canonicalization follows RFC 8785 (JSON Canonicalization Scheme), consistent with the canonicalization rules defined in the Consent Object Specification (Section 6).

### 7.2 Canonical JSON Rules

#### 7.2.1 Object Key Ordering

1. Object keys MUST be sorted in ascending Unicode code point order.
2. Sorting applies recursively to nested objects (within scope entries).
3. The canonical key order for the Capability Token payload is:

```
consent_ref
expires_at
grantee
issued_at
not_before
permissions
scope
subject
token_id
version
```

4. Within scope entries, key order is: `ref`, `type`.

#### 7.2.2 Whitespace

1. No whitespace between tokens.
2. No trailing newlines.
3. No leading whitespace.

#### 7.2.3 String Encoding

1. UTF-8 encoding MUST be used.
2. Strings MUST be NFC normalized (Unicode Canonical Composition).
3. Control characters (U+0000 to U+001F) MUST use `\uXXXX` escapes.
4. Non-ASCII characters MUST be literal UTF-8 bytes (NOT escaped).
5. Solidus (`/`) MUST NOT be escaped.
6. Required escapes: `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t`.

#### 7.2.4 Array Ordering

1. The `scope` array MUST be sorted by (`type`, `ref`) in ascending lexicographic order before encoding.
2. The `permissions` array MUST be sorted in ascending lexicographic order before encoding.
3. Array element order affects the canonical form and hash.

#### 7.2.5 Null Values

1. Fields with `null` values MUST be included in the canonical payload.
2. Null is encoded as the literal `null` (no quotes).
3. Omitting optional null fields would change the hash.

### 7.3 Encoding Consistency

To confirm canonical encoding:

1. Parse the JSON payload.
2. Re-encode using canonical rules.
3. Compare byte-for-byte with the original.
4. A mismatch indicates non-canonical encoding.

---

## 8. Hashing Boundary

### 8.1 Definition

The **hashing boundary** defines which fields participate in the canonical payload used for hash computation of the `capability_hash`.

### 8.2 Included Fields

| Field | Included in Hash | Rationale |
|-------|------------------|-----------|
| `version` | YES | Protocol version affects semantics |
| `subject` | YES | Identity of data owner |
| `grantee` | YES | Identity of authorized party |
| `consent_ref` | YES | Binding to parent consent |
| `scope` | YES | What objects are authorized |
| `permissions` | YES | What operations are permitted |
| `issued_at` | YES | Temporal binding (issuance) |
| `not_before` | YES | Temporal binding (earliest validity) |
| `expires_at` | YES | Temporal binding (expiration) |
| `token_id` | YES | Replay-resistance identity |
| `capability_hash` | NO | Cannot include self-reference |

### 8.3 Canonical Payload Structure

```
canonical_payload := {
  "consent_ref": consent_ref,
  "expires_at": expires_at,
  "grantee": grantee,
  "issued_at": issued_at,
  "not_before": not_before,
  "permissions": sorted(permissions),
  "scope": sorted(scope),
  "subject": subject,
  "token_id": token_id,
  "version": version
}
```

Note: Keys are in ascending Unicode code point order per canonicalization rules. The `capability_hash` field is excluded.

### 8.4 Payload Boundary Invariants

```
INV-HASH-01: capability_hash = lowercase_hex(SHA-256(canonical_payload))
  "Capability hash MUST equal SHA-256 of canonical payload"

INV-HASH-02: capability_hash ∉ canonical_payload
  "Capability hash MUST NOT be included in its own computation"

INV-HASH-03: length(capability_hash) = 64
  "Capability hash MUST be exactly 64 hexadecimal characters"

INV-HASH-04: |canonical_payload.fields| = 10
  "Canonical payload contains exactly ten fields"
```

---

## 9. Identifier Construction

### 9.1 Capability Token Identifier

The `capability_hash` serves as the canonical identifier for a Capability Token.

### 9.2 URI Form

Capability Tokens MAY be referenced using the AOC URI scheme:

```
aoc://capability/v{major}/{minor}/0x{capability_hash}
```

**Components:**

| Component | Description | Example |
|-----------|-------------|---------|
| Scheme | Protocol identifier | `aoc` |
| Type | Object type | `capability` |
| Version | Major.minor version | `v1/0` |
| Hash | Prefixed capability hash | `0x{64 hex chars}` |

**Example:**

```
aoc://capability/v1/0/0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

### 9.3 Identifier Properties

1. Identifiers MUST be case-insensitive for the hexadecimal portion.
2. Implementations MUST normalize to lowercase for comparison.
3. The `0x` prefix distinguishes hashes from other identifiers.
4. URI form includes version for forward compatibility.

---

## 10. Structural and Semantic Invariants

### 10.1 Structural Invariants

```
INV-STRUCT-01: typeof(token.version) = string ∧ token.version matches ^[0-9]+\.[0-9]+$
  "Version MUST be a semantic version string"

INV-STRUCT-02: typeof(token.subject) = string ∧ token.subject matches ^did:[a-z0-9]+:
  "Subject MUST be a valid DID"

INV-STRUCT-03: typeof(token.grantee) = string ∧ token.grantee matches ^did:[a-z0-9]+:
  "Grantee MUST be a valid DID"

INV-STRUCT-04: typeof(token.consent_ref) = string ∧ token.consent_ref matches ^[a-f0-9]{64}$
  "Consent reference MUST be a valid SHA-256 hash"

INV-STRUCT-05: typeof(token.scope) = array ∧ length(token.scope) ≥ 1
  "Scope MUST be a non-empty array"

INV-STRUCT-06: typeof(token.permissions) = array ∧ length(token.permissions) ≥ 1
  "Permissions MUST be a non-empty array"

INV-STRUCT-07: token.issued_at matches ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$
  "Issued timestamp MUST be ISO 8601 UTC format"

INV-STRUCT-08: token.expires_at matches ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$
  "Expiration timestamp MUST be ISO 8601 UTC format and MUST NOT be null"

INV-STRUCT-09: token.not_before = null ∨
               token.not_before matches ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$
  "Not-before MUST be null or ISO 8601 UTC format"

INV-STRUCT-10: typeof(token.token_id) = string ∧ token.token_id matches ^[a-f0-9]{64}$
  "Token ID MUST be a 64-character lowercase hexadecimal string"
```

### 10.2 Semantic Invariants

```
INV-SEM-01: token.expires_at > token.issued_at
  "Expiration MUST be after issuance"

INV-SEM-02: token.not_before = null ∨ token.not_before ≥ token.issued_at
  "Not-before MUST be at or after issuance if specified"

INV-SEM-03: token.not_before = null ∨ token.not_before < token.expires_at
  "Not-before MUST be before expiration if specified"

INV-SEM-04: ∀ entry ∈ token.scope: entry.type ∈ {"field", "content", "pack"}
  "All scope entries MUST reference valid AOC object types"

INV-SEM-05: ∀ entry ∈ token.scope: entry.ref matches ^[a-f0-9]{64}$
  "All scope references MUST be valid SHA-256 hashes"

INV-SEM-06: unique(token.scope, (entry) => (entry.type, entry.ref))
  "Scope entries MUST be unique by (type, ref) pair"

INV-SEM-07: unique(token.permissions)
  "Permissions MUST NOT contain duplicates"

INV-SEM-08: token.expires_at ≠ null
  "Capability Tokens MUST have a finite expiration"
```

### 10.3 Derivation Invariants

```
INV-DER-01: token.subject = parent_consent.subject
  "Token subject MUST match parent consent subject"

INV-DER-02: token.grantee = parent_consent.grantee
  "Token grantee MUST match parent consent grantee"

INV-DER-03: token.consent_ref = parent_consent.consent_hash
  "Consent reference MUST equal parent consent hash"

INV-DER-04: parent_consent.action = "grant"
  "Parent consent action MUST be grant"

INV-DER-05: ∀ entry ∈ token.scope: entry ∈ parent_consent.scope
  "Every token scope entry MUST appear in parent consent scope"

INV-DER-06: ∀ perm ∈ token.permissions: perm ∈ parent_consent.permissions
  "Every token permission MUST appear in parent consent permissions"

INV-DER-07: token.issued_at ≥ parent_consent.issued_at
  "Token issuance MUST be at or after consent issuance"

INV-DER-08: parent_consent.expires_at ≠ null →
            token.expires_at ≤ parent_consent.expires_at
  "Token expiration MUST NOT exceed consent expiration when consent has finite expiration"

INV-DER-09: token.not_before = null ∨
            token.not_before ≥ parent_consent.issued_at
  "Token not-before MUST be at or after consent issuance if specified"
```

### 10.4 Replay-Resistance Invariants

```
INV-RPL-01: ∀ CapabilityToken T1, T2: T1 ≠ T2 → T1.token_id ≠ T2.token_id
  "Token IDs MUST be globally unique across all Capability Tokens"

INV-RPL-02: token.token_id ≠ token.capability_hash
  "Token ID MUST NOT equal the token's own capability hash"

INV-RPL-03: token.token_id ≠ token.consent_ref
  "Token ID MUST NOT equal the consent reference"
```

### 10.5 Determinism Invariants

```
INV-DET-01: ∀ CapabilityToken T1, T2:
  (T1.version = T2.version ∧ T1.subject = T2.subject ∧
   T1.grantee = T2.grantee ∧ T1.consent_ref = T2.consent_ref ∧
   set(T1.scope) = set(T2.scope) ∧
   set(T1.permissions) = set(T2.permissions) ∧
   T1.issued_at = T2.issued_at ∧ T1.not_before = T2.not_before ∧
   T1.expires_at = T2.expires_at ∧ T1.token_id = T2.token_id)
  → T1.capability_hash = T2.capability_hash

"Tokens with identical fields MUST have identical capability hashes"
```

### 10.6 Immutability Invariants

```
INV-IMM-01: ∀ CapabilityToken T, time t1 < t2:
  T(t1) = T(t2)
  "Capability Tokens MUST NOT change after creation"

INV-IMM-02: modification(token) → new_capability_hash
  "Any change requires creating a new Capability Token"
```

---

## 11. Security Considerations

### 11.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| **Token Forgery** | Cryptographic signature by the subject required; hash integrity verification detects unsigned or tampered tokens |
| **Token Tampering** | `capability_hash` integrity check detects any field modification |
| **Replay Attack** | Globally unique `token_id` combined with finite `expires_at` provides replay-resistance semantics |
| **Scope Escalation** | Derivation invariants enforce strict subset relationship to parent consent |
| **Permission Escalation** | Derivation invariants enforce strict subset relationship to parent consent |
| **Temporal Escalation** | Token `expires_at` MUST NOT exceed parent consent `expires_at` |
| **Consent Revocation Bypass** | Token validity is contingent on parent consent remaining active |

### 11.2 Signature Requirements

1. Capability Tokens MUST be signed by the subject's private key.
2. Signature verification MUST succeed before a token is accepted as proof of authorization.
3. Signature algorithm and format are outside this specification's scope.
4. Implementations MUST support signature verification without network access.

### 11.3 Hash Security

```
INV-SEC-01: collision_probability(SHA-256) < 2^-128
  "SHA-256 collision resistance provides sufficient security"

INV-SEC-02: capability_hash uniquely identifies token
  "Hash serves as tamper-evident unique identifier"

INV-SEC-03: token_id collision_probability < 2^-128
  "256-bit token_id values provide sufficient uniqueness"
```

### 11.4 Temporal Security

1. Clock synchronization affects token validity evaluation.
2. Implementations MUST define acceptable clock skew tolerance.
3. Implementations SHOULD allow clock skew tolerance of ±300 seconds.
4. Expired tokens MUST NOT be accepted as proof of authorization.
5. Mandatory expiration limits the exposure window from token compromise.

### 11.5 Privacy Considerations

1. Capability Tokens reveal authorization relationships between subject and grantee.
2. The `consent_ref` field links tokens to their parent consent, enabling correlation.
3. Storage and transmission SHOULD use encrypted channels.
4. Aggregation of tokens may reveal sensitive access patterns.
5. The `token_id` is pseudonymous but linkable across presentations of the same token.

### 11.6 Invariant Enforcement

Implementations MUST enforce all structural, semantic, and derivation invariants:

1. Reject Capability Tokens failing structural validation.
2. Reject Capability Tokens failing semantic validation.
3. Reject Capability Tokens with invalid `capability_hash`.
4. Reject Capability Tokens with invalid signatures.
5. Reject Capability Tokens whose derivation invariants are violated relative to the parent Consent Object.

---

## 12. Examples

### 12.1 Canonical Payload Example

The following shows the canonical payload for a Capability Token (compact, sorted keys, no whitespace). The `capability_hash` field is excluded.

```json
{"consent_ref":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","expires_at":"2025-07-15T10:00:00Z","grantee":"did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH","issued_at":"2025-06-15T10:00:00Z","not_before":null,"permissions":["read"],"scope":[{"ref":"a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2","type":"content"}],"subject":"did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK","token_id":"f47ac10b58cc4372a5670e02b2c3d479aabbccdd11223344556677889900eeff","version":"1.0"}
```

### 12.2 Basic Capability Token Example

A token derived from a consent granting `read` access to a single content object, with full scope and permissions carried forward.

```json
{
  "version": "1.0",
  "subject": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "grantee": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
  "consent_ref": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "scope": [
    {
      "type": "content",
      "ref": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
    }
  ],
  "permissions": ["read"],
  "issued_at": "2025-06-15T10:00:00Z",
  "not_before": null,
  "expires_at": "2025-07-15T10:00:00Z",
  "token_id": "f47ac10b58cc4372a5670e02b2c3d479aabbccdd11223344556677889900eeff",
  "capability_hash": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
}
```

### 12.3 Attenuated Scope Example

Parent consent grants access to three objects. This token attenuates to a single content object.

**Parent consent scope (3 entries):**
- `("content", "1111111111111111111111111111111111111111111111111111111111111111")`
- `("content", "2222222222222222222222222222222222222222222222222222222222222222")`
- `("pack",    "3333333333333333333333333333333333333333333333333333333333333333")`

**Parent consent permissions:** `["read", "store"]`

**Token (attenuated scope, full permissions):**

```json
{
  "version": "1.0",
  "subject": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "grantee": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
  "consent_ref": "f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
  "scope": [
    {
      "type": "content",
      "ref": "2222222222222222222222222222222222222222222222222222222222222222"
    }
  ],
  "permissions": ["read", "store"],
  "issued_at": "2025-06-15T10:00:00Z",
  "not_before": null,
  "expires_at": "2025-08-15T10:00:00Z",
  "token_id": "aabb00112233445566778899aabbccddeeff00112233445566778899aabbccdd",
  "capability_hash": "b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6"
}
```

### 12.4 Attenuated Permission and Time Example

Parent consent grants `["read", "store", "share"]` with `expires_at: "2026-01-15T14:30:00Z"`. This token attenuates to `read` only, with a 30-day validity window and deferred activation.

```json
{
  "version": "1.0",
  "subject": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "grantee": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
  "consent_ref": "c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
  "scope": [
    {
      "type": "field",
      "ref": "4444444444444444444444444444444444444444444444444444444444444444"
    }
  ],
  "permissions": ["read"],
  "issued_at": "2025-06-15T10:00:00Z",
  "not_before": "2025-07-01T00:00:00Z",
  "expires_at": "2025-07-31T00:00:00Z",
  "token_id": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "capability_hash": "d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9"
}
```

### 12.5 Public Access Token Example

Token derived from a public access consent (`grantee: "did:aoc:public"`).

```json
{
  "version": "1.0",
  "subject": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "grantee": "did:aoc:public",
  "consent_ref": "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1",
  "scope": [
    {
      "type": "pack",
      "ref": "7777777777777777777777777777777777777777777777777777777777777777"
    }
  ],
  "permissions": ["read"],
  "issued_at": "2025-06-15T10:00:00Z",
  "not_before": null,
  "expires_at": "2025-12-31T23:59:59Z",
  "token_id": "deadbeefcafebabe0123456789abcdef0123456789abcdefdeadbeefcafebabe",
  "capability_hash": "e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
}
```

---

## 13. Non-Goals

The following are explicitly outside the scope of this specification:

| Non-Goal | Rationale |
|----------|-----------|
| **Consent Lifecycle Management** | Grant, revocation, and supersession chains are Consent Object concerns |
| **Permission Vocabulary Definition** | Standard permissions are defined in the Consent Object Specification |
| **Scope Entry Type Definition** | Scope entry structure and types are defined in the Consent Object Specification |
| **Access Control Enforcement** | Enforcement mechanisms are implementation-specific |
| **Key Management** | Cryptographic key lifecycle is a separate concern |
| **Transport Protocol** | How tokens are transmitted is not specified |
| **Storage Requirements** | Where tokens are persisted is implementation choice |
| **Token Discovery** | How parties locate relevant tokens is not specified |
| **Delegation Chains** | Multi-hop delegation and token-to-token derivation are deferred to future versions |
| **Conditional Authorization** | Complex conditions beyond time bounds are not supported |
| **Token Negotiation** | Request/response flows for token issuance are outside protocol scope |
| **Notification Systems** | Alerting parties to token issuance or expiration is not specified |
| **Signature Format** | Cryptographic signature encoding is outside this specification |

---

**End of Specification**
