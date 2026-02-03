# AOC Protocol — Consent Object Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [../wallet/architecture.md](../wallet/architecture.md), [../wallet/crypto-spec.md](../wallet/crypto-spec.md)

---

## Table of Contents

1. [Consent Token Definition](#1-consent-token-definition)
2. [Consent Token Fields (Normative)](#2-consent-token-fields-normative)
3. [Field Semantics](#3-field-semantics)
4. [Canonical Payload Boundary](#4-canonical-payload-boundary)
5. [Deterministic Encoding Rules](#5-deterministic-encoding-rules)
6. [Extensibility Rules](#6-extensibility-rules)
7. [Example Consent Token](#7-example-consent-token)
8. [Security Invariants](#8-security-invariants)

---

## 1. Consent Token Definition

A **Consent Token** is a cryptographically signed authorization object that represents explicit, informed, and revocable permission granted by a data subject to a grantee for access to specified data fields under defined constraints.

### 1.1 Purpose

The Consent Token serves as the portable, verifiable proof of authorization within the AOC Protocol. It enables:

- **Decentralized Verification:** Any party possessing the token and the subject's public key MAY verify the consent without contacting a central authority.
- **Offline Validation:** Verification requires no network connectivity or external service availability.
- **Portability:** Tokens MAY be transmitted, stored, and presented across any transport mechanism.
- **Non-Repudiation:** The subject's signature binds them to the authorization; the token serves as cryptographic evidence of consent.

### 1.2 Scope

This specification defines:

- The structure and semantics of Consent Token fields
- The canonical encoding for signature computation
- The deterministic serialization rules
- The security invariants that implementations MUST enforce

This specification does NOT define:

- Signature algorithms (see [crypto-spec.md](../wallet/crypto-spec.md))
- Revocation mechanisms (defined separately)
- Transport or storage protocols
- Application-level consent workflows

### 1.3 Terminology

| Term | Definition |
|------|------------|
| **Subject** | The entity granting consent; owner of the data being authorized |
| **Grantee** | The entity receiving consent; authorized to access specified fields |
| **Scope** | The set of field identifiers covered by the consent |
| **Purpose** | The declared intent for which data access is authorized |
| **Token** | The complete Consent Token object including all fields and signature |
| **Payload** | The subset of token fields included in signature computation |

---

## 2. Consent Token Fields (Normative)

### 2.1 Field Summary Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | uint8 | REQUIRED | Protocol version identifier |
| `token_id` | string | REQUIRED | Globally unique token identifier |
| `subject` | string | REQUIRED | DID of the consenting party |
| `grantee` | string | REQUIRED | DID of the authorized recipient |
| `purpose` | string | REQUIRED | Declared purpose for data access |
| `scope` | string[] | REQUIRED | Array of authorized field identifiers |
| `issued_at` | uint64 | REQUIRED | Unix timestamp of token issuance |
| `expires_at` | uint64 | REQUIRED | Unix timestamp of token expiration |
| `nonce` | string | REQUIRED | Unique value preventing replay attacks |
| `signature` | string | REQUIRED | Subject's cryptographic signature |

### 2.2 Field Definitions

#### 2.2.1 version

| Property | Value |
|----------|-------|
| **Name** | `version` |
| **Type** | uint8 |
| **Required** | REQUIRED |
| **Description** | Protocol version for this token format |
| **Constraints** | MUST be `1` for this specification version |

The version field enables forward compatibility. Implementations MUST reject tokens with unrecognized version values.

#### 2.2.2 token_id

| Property | Value |
|----------|-------|
| **Name** | `token_id` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Globally unique identifier for this consent token |
| **Constraints** | MUST be a valid UUID (RFC 4122) in lowercase hyphenated format |
| **Format** | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

The token_id MUST be generated using a cryptographically secure random number generator. UUIDv4 is RECOMMENDED.

#### 2.2.3 subject

| Property | Value |
|----------|-------|
| **Name** | `subject` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Decentralized Identifier of the entity granting consent |
| **Constraints** | MUST be a valid DID conforming to W3C DID Core specification |
| **Format** | `did:<method>:<method-specific-id>` |

The subject is the data owner who authorizes access. The signature on the token MUST be verifiable against a public key associated with this DID.

#### 2.2.4 grantee

| Property | Value |
|----------|-------|
| **Name** | `grantee` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Decentralized Identifier of the entity receiving consent |
| **Constraints** | MUST be a valid DID conforming to W3C DID Core specification |
| **Format** | `did:<method>:<method-specific-id>` |

The grantee is the entity authorized to access fields within the defined scope. Implementations MUST verify that the presenting party controls the grantee DID.

#### 2.2.5 purpose

| Property | Value |
|----------|-------|
| **Name** | `purpose` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Declared intent for which data access is authorized |
| **Constraints** | MUST be non-empty; MUST be UTF-8 encoded; MUST NOT exceed 256 bytes |
| **Format** | Lowercase alphanumeric with underscores: `[a-z0-9_]+` |

The purpose field binds the consent to a specific use case. Data access for purposes outside the declared purpose is a consent violation.

#### 2.2.6 scope

| Property | Value |
|----------|-------|
| **Name** | `scope` |
| **Type** | string[] |
| **Required** | REQUIRED |
| **Description** | Array of field identifiers authorized for access |
| **Constraints** | MUST be non-empty array; each element MUST be a valid SDL field identifier |
| **Format** | Each element follows pattern: `<namespace>.<category>.<subcategory>.<attribute>` |

The scope defines the precise fields covered by this consent. Field access outside the scope MUST be rejected. Wildcard patterns are NOT permitted; each field MUST be explicitly enumerated.

#### 2.2.7 issued_at

| Property | Value |
|----------|-------|
| **Name** | `issued_at` |
| **Type** | uint64 |
| **Required** | REQUIRED |
| **Description** | Unix timestamp (seconds since epoch) when the token was issued |
| **Constraints** | MUST be a positive integer; MUST represent a valid timestamp |

The issued_at timestamp records when the subject signed the consent. Implementations MAY reject tokens with issued_at values significantly in the future (clock skew tolerance is implementation-defined but SHOULD NOT exceed 300 seconds).

#### 2.2.8 expires_at

| Property | Value |
|----------|-------|
| **Name** | `expires_at` |
| **Type** | uint64 |
| **Required** | REQUIRED |
| **Description** | Unix timestamp (seconds since epoch) when the token expires |
| **Constraints** | MUST be greater than `issued_at`; MUST be a positive integer |

The expires_at timestamp defines the token's validity period. After this time, the token MUST be rejected regardless of signature validity. Perpetual consent (infinite expiration) is NOT permitted.

#### 2.2.9 nonce

| Property | Value |
|----------|-------|
| **Name** | `nonce` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Unique random value preventing replay attacks |
| **Constraints** | MUST be non-empty; MUST be at least 16 bytes of entropy; MUST be Base64url-encoded |
| **Format** | Base64url (RFC 4648 Section 5) without padding |

The nonce MUST be generated using a cryptographically secure random number generator. Each token MUST have a unique nonce. Implementations SHOULD maintain a nonce registry to detect replay attempts.

#### 2.2.10 signature

| Property | Value |
|----------|-------|
| **Name** | `signature` |
| **Type** | string |
| **Required** | REQUIRED |
| **Description** | Subject's cryptographic signature over the canonical payload |
| **Constraints** | MUST be a valid signature; encoding is algorithm-dependent |
| **Format** | Hex-encoded with `0x` prefix for ECDSA signatures |

The signature is computed over the canonical payload (see Section 4) and MUST be verifiable against a public key associated with the subject DID.

---

## 3. Field Semantics

### 3.1 version

The version field provides protocol evolution capability. When a verifier encounters a token:

1. If `version` equals a known supported version, proceed with validation using that version's rules.
2. If `version` is unknown, the token MUST be rejected with error `UNSUPPORTED_VERSION`.
3. Implementations MUST NOT attempt to parse unknown versions.

Version `1` (the current specification) defines the baseline consent token format.

### 3.2 token_id

The token_id serves multiple purposes:

- **Uniqueness:** Prevents token confusion and enables unambiguous reference.
- **Revocation:** Enables revocation by token identifier without exposing token contents.
- **Audit:** Enables consent audit trails keyed by token identifier.
- **Idempotency:** Enables detection of duplicate token presentations.

Implementations MUST treat token_id as an opaque identifier. No semantic meaning SHOULD be inferred from its structure.

### 3.3 subject

The subject field identifies who is granting consent:

- The subject MUST be resolvable to a DID Document containing at least one verification method.
- The signature MUST verify against a key listed in the subject's DID Document.
- The subject represents the data owner, not necessarily the data creator or issuer.

The relationship between subject and signature is the core trust anchor of the consent token.

### 3.4 grantee

The grantee field identifies who is receiving consent:

- The grantee MAY be an individual, organization, or service.
- Implementations presenting the token MUST prove control of the grantee DID.
- Consent is non-transferable; the grantee MUST NOT delegate access to third parties.

Proof of grantee control is implementation-defined but typically involves signature challenge-response.

### 3.5 purpose

The purpose field declares the intended use:

- Purpose codes SHOULD be drawn from a controlled vocabulary when available.
- The purpose binds legal and ethical obligations to the consent.
- Access for undeclared purposes is a consent violation regardless of scope match.

Example purpose codes:
- `identity_verification`
- `employment_screening`
- `credit_assessment`
- `service_delivery`
- `research_anonymized`

### 3.6 scope

The scope field defines the data boundary:

- Each element is an SDL field identifier following the namespace hierarchy.
- The scope establishes a positive access list; unlisted fields are implicitly denied.
- Implementations MUST perform exact string matching; no pattern expansion.
- Empty scope is invalid and MUST be rejected.

Access control evaluation:
```
ALLOW if field_id ∈ scope
DENY otherwise
```

### 3.7 issued_at and expires_at

The temporal fields define the validity window:

- Tokens are valid only within the interval `[issued_at, expires_at)`.
- The interval is closed at issued_at and open at expires_at.
- Clocks SHOULD be synchronized via NTP; clock skew tolerance is implementation-defined.
- The maximum permitted validity period is implementation-defined; protocols MAY impose upper bounds.

Temporal validation:
```
current_time >= issued_at AND current_time < expires_at
```

### 3.8 nonce

The nonce field prevents replay attacks:

- The nonce MUST be cryptographically random and unpredictable.
- Minimum entropy: 128 bits (16 bytes before encoding).
- RECOMMENDED entropy: 256 bits (32 bytes before encoding).
- Implementations SHOULD maintain a nonce cache for replay detection.
- Nonce cache entries MAY be evicted after `expires_at` plus a grace period.

### 3.9 signature

The signature field provides authenticity:

- The signature binds the subject to the consent grant.
- Signature algorithm is determined by the subject's DID Document verification method.
- The signature covers the canonical payload, not the complete token.
- Signature verification failure MUST result in token rejection.

---

## 4. Canonical Payload Boundary

### 4.1 Fields Included in Signing Payload

The following fields are included in the canonical signing payload, in the specified order:

| Order | Field | Included |
|-------|-------|----------|
| 1 | `version` | YES |
| 2 | `token_id` | YES |
| 3 | `subject` | YES |
| 4 | `grantee` | YES |
| 5 | `purpose` | YES |
| 6 | `scope` | YES |
| 7 | `issued_at` | YES |
| 8 | `expires_at` | YES |
| 9 | `nonce` | YES |
| 10 | `signature` | NO |

### 4.2 Payload Construction

The canonical payload is constructed as follows:

```
CanonicalPayload := {
  "version":    <version>,
  "token_id":   <token_id>,
  "subject":    <subject>,
  "grantee":    <grantee>,
  "purpose":    <purpose>,
  "scope":      <scope>,
  "issued_at":  <issued_at>,
  "expires_at": <expires_at>,
  "nonce":      <nonce>
}
```

The signature field is explicitly excluded from the payload to avoid circular dependency.

### 4.3 Payload Serialization

The payload MUST be serialized according to the deterministic encoding rules (Section 5) before signature computation:

```
payload_bytes := DeterministicEncode(CanonicalPayload)
signature := Sign(subject_private_key, payload_bytes)
```

### 4.4 Verification Procedure

```
1. Extract signature from token
2. Construct CanonicalPayload from remaining fields
3. Serialize payload using deterministic encoding
4. Resolve subject DID to obtain public key
5. Verify signature against payload_bytes and public_key
6. Return VALID if verification succeeds, INVALID otherwise
```

---

## 5. Deterministic Encoding Rules

### 5.1 Canonical JSON

Consent Tokens MUST be serialized using Canonical JSON for signature computation. This ensures identical byte sequences across implementations.

### 5.2 Object Key Ordering

Keys MUST be sorted lexicographically by Unicode code point value (ascending).

```
CORRECT:   {"expires_at":...,"grantee":...,"issued_at":...,"nonce":...}
INCORRECT: {"nonce":...,"expires_at":...,"issued_at":...,"grantee":...}
```

Nested objects are sorted recursively.

### 5.3 Whitespace

- No whitespace between tokens.
- No whitespace after colons or commas.
- No leading or trailing whitespace.
- No trailing newline.

```
CORRECT:   {"key":"value","num":42}
INCORRECT: { "key" : "value", "num" : 42 }
INCORRECT: {"key": "value", "num": 42}
```

### 5.4 String Encoding

- Strings MUST be UTF-8 encoded.
- Unicode MUST be NFC normalized before encoding.
- Required escape sequences: `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t`
- Control characters (U+0000 to U+001F): MUST use `\uXXXX` escapes (lowercase hex).
- Non-ASCII characters: Use literal UTF-8 bytes, NOT `\uXXXX` escapes.
- Forward slash (`/`): MUST NOT be escaped.

### 5.5 Numeric Encoding

- Integers: No leading zeros, no decimal point, no exponent notation.
- Negative zero: Encode as `0`, not `-0`.
- Large integers (>2^53): Encode as strings to preserve precision.
- Floating point: NOT permitted in consent tokens.

```
CORRECT:   {"issued_at":1706745600}
INCORRECT: {"issued_at":1.7067456e9}
INCORRECT: {"issued_at":"1706745600"}  // for values ≤ 2^53
```

### 5.6 Boolean and Null

- Boolean values: `true` or `false` (lowercase).
- Null values: `null` (lowercase).
- Consent Token fields do not use null; absent optional fields are omitted entirely.

### 5.7 Array Encoding

- Arrays maintain element order (no sorting).
- No whitespace after `[`, before `]`, or around commas.
- Empty arrays: `[]`

The `scope` array elements are ordered as provided by the token creator. Verifiers MUST NOT reorder scope elements.

### 5.8 Reference

This encoding is compatible with RFC 8785 (JSON Canonicalization Scheme) with the following profile:

- No floating point numbers.
- No null values.
- UTF-8 encoding only.

---

## 6. Extensibility Rules

### 6.1 Version Increments

New versions of this specification MAY:

- Add new optional fields.
- Add new required fields (major version increment).
- Deprecate existing fields.
- Modify field constraints (major version increment).

### 6.2 Unknown Field Handling

When encountering unknown fields:

- Implementations parsing version `1` tokens MUST ignore unknown fields.
- Unknown fields MUST NOT be included in signature verification.
- Unknown fields MAY be preserved during token forwarding.
- Unknown fields MUST NOT alter validation semantics.

### 6.3 Optional Field Addition

Future minor versions MAY introduce optional fields:

- Optional fields MUST have explicit default values.
- Absence of an optional field is equivalent to its default value.
- Optional fields, when present, MUST be included in the canonical payload.
- Optional fields MUST be positioned after all required fields in canonical ordering.

### 6.4 Deprecation Process

Field deprecation follows this lifecycle:

| Phase | Duration | Behavior |
|-------|----------|----------|
| Active | Unlimited | Field fully supported |
| Deprecated | Minimum 1 year | Field accepted, warning emitted |
| Obsolete | Minimum 1 year | Field ignored, error logged |
| Removed | - | Field presence causes rejection |

### 6.5 Backward Compatibility

Implementations MUST:

- Accept tokens from all minor versions within the same major version.
- Reject tokens from unknown major versions.
- Provide clear error messages for version mismatches.

---

## 7. Example Consent Token

### 7.1 Complete Token (JSON)

```json
{
  "version": 1,
  "token_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "subject": "did:aoc:7sHxtdZ9bE3F5kNmZM4vbU",
  "grantee": "did:aoc:market:2DrjgbN7v5TJfQkX9BCXP4",
  "purpose": "employment_verification",
  "scope": [
    "person.name.legal.full",
    "person.name.legal.given",
    "person.name.legal.family",
    "work.employment.current.title",
    "work.employment.current.employer"
  ],
  "issued_at": 1706745600,
  "expires_at": 1709424000,
  "nonce": "Kx7vNqP2mR9sT4wY8zA3bC",
  "signature": "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8325a2d4d0a76b1f23e3f4f7d..."
}
```

### 7.2 Canonical Payload (for signing)

```json
{"expires_at":1709424000,"grantee":"did:aoc:market:2DrjgbN7v5TJfQkX9BCXP4","issued_at":1706745600,"nonce":"Kx7vNqP2mR9sT4wY8zA3bC","purpose":"employment_verification","scope":["person.name.legal.full","person.name.legal.given","person.name.legal.family","work.employment.current.title","work.employment.current.employer"],"subject":"did:aoc:7sHxtdZ9bE3F5kNmZM4vbU","token_id":"f47ac10b-58cc-4372-a567-0e02b2c3d479","version":1}
```

Note: The canonical payload has keys sorted lexicographically and contains no whitespace.

### 7.3 Field Breakdown

| Field | Value | Notes |
|-------|-------|-------|
| version | `1` | Current specification version |
| token_id | `f47ac10b-58cc-...` | UUIDv4 identifier |
| subject | `did:aoc:7sHxtdZ9bE3F5kNmZM4vbU` | Wallet DID of consenting user |
| grantee | `did:aoc:market:2Drjgb...` | Market DID receiving consent |
| purpose | `employment_verification` | Declared use case |
| scope | 5 field identifiers | Explicit field enumeration |
| issued_at | `1706745600` | 2024-02-01T00:00:00Z |
| expires_at | `1709424000` | 2024-03-03T00:00:00Z (31 days) |
| nonce | `Kx7vNqP2mR9sT4wY8zA3bC` | Base64url-encoded random value |
| signature | `0x1c8aff95...` | ECDSA signature (hex-encoded) |

---

## 8. Security Invariants

Implementations MUST enforce the following invariants. Violation of any invariant MUST result in token rejection.

### 8.1 Signature Invariants

```
INV-SIG-01: ∀ token T: Verify(T.signature, CanonicalPayload(T), PublicKey(T.subject)) = true
  "Signature MUST verify against the subject's public key over the canonical payload"

INV-SIG-02: ∀ token T: T.signature ≠ ∅
  "Signature MUST be present and non-empty"

INV-SIG-03: ∀ token T: PublicKey(T.subject) resolvable
  "Subject DID MUST resolve to a DID Document containing a valid verification method"
```

### 8.2 Temporal Invariants

```
INV-TMP-01: ∀ token T: T.expires_at > T.issued_at
  "Expiration timestamp MUST be strictly greater than issuance timestamp"

INV-TMP-02: ∀ token T, time t: valid(T, t) → t ≥ T.issued_at ∧ t < T.expires_at
  "Token MUST only be valid within the defined temporal window"

INV-TMP-03: ∀ token T: T.issued_at ≤ current_time + CLOCK_SKEW_TOLERANCE
  "Issuance timestamp MUST NOT be excessively in the future"

INV-TMP-04: ∀ token T: T.expires_at > current_time
  "Token MUST NOT be expired at time of validation"
```

### 8.3 Scope Invariants

```
INV-SCP-01: ∀ token T: T.scope ≠ ∅
  "Scope MUST be a non-empty array"

INV-SCP-02: ∀ token T, field F: access(F, T) → F ∈ T.scope
  "Field access MUST be explicitly authorized in scope"

INV-SCP-03: ∀ token T, s ∈ T.scope: valid_field_id(s)
  "Each scope element MUST be a valid SDL field identifier"

INV-SCP-04: ∀ token T: ∀ s ∈ T.scope: s is unique within T.scope
  "Scope MUST NOT contain duplicate field identifiers"
```

### 8.4 Identity Invariants

```
INV-IDT-01: ∀ token T: valid_did(T.subject)
  "Subject MUST be a well-formed DID"

INV-IDT-02: ∀ token T: valid_did(T.grantee)
  "Grantee MUST be a well-formed DID"

INV-IDT-03: ∀ token T: T.subject ≠ T.grantee
  "Subject and grantee MUST be distinct identities"
```

### 8.5 Nonce Invariants

```
INV-NON-01: ∀ token T: T.nonce ≠ ∅
  "Nonce MUST be present and non-empty"

INV-NON-02: ∀ token T: entropy(T.nonce) ≥ 128 bits
  "Nonce MUST contain at least 128 bits of entropy"

INV-NON-03: ∀ tokens T1, T2: T1 ≠ T2 → T1.nonce ≠ T2.nonce
  "Nonce MUST be globally unique across all tokens"

INV-NON-04: ∀ token T: ¬replayed(T.nonce)
  "Nonce MUST NOT have been previously observed"
```

### 8.6 Format Invariants

```
INV-FMT-01: ∀ token T: T.version ∈ SUPPORTED_VERSIONS
  "Version MUST be a recognized protocol version"

INV-FMT-02: ∀ token T: valid_uuid(T.token_id)
  "Token ID MUST be a valid UUID"

INV-FMT-03: ∀ token T: T.purpose ≠ ∅ ∧ length(T.purpose) ≤ 256
  "Purpose MUST be non-empty and not exceed 256 bytes"

INV-FMT-04: ∀ token T: canonical_encoding(T) is deterministic
  "Canonical encoding MUST produce identical bytes for identical tokens"
```

### 8.7 Invariant Summary Table

| ID | Category | Invariant | Severity |
|----|----------|-----------|----------|
| INV-SIG-01 | Signature | Signature verifies against subject key | CRITICAL |
| INV-SIG-02 | Signature | Signature is non-empty | CRITICAL |
| INV-SIG-03 | Signature | Subject DID is resolvable | CRITICAL |
| INV-TMP-01 | Temporal | expires_at > issued_at | HIGH |
| INV-TMP-02 | Temporal | Token within validity window | HIGH |
| INV-TMP-03 | Temporal | issued_at not excessively future | MEDIUM |
| INV-TMP-04 | Temporal | Token not expired | HIGH |
| INV-SCP-01 | Scope | Scope is non-empty | HIGH |
| INV-SCP-02 | Scope | Access limited to scope | CRITICAL |
| INV-SCP-03 | Scope | Scope elements are valid field IDs | HIGH |
| INV-SCP-04 | Scope | No duplicate scope entries | MEDIUM |
| INV-IDT-01 | Identity | Subject is valid DID | HIGH |
| INV-IDT-02 | Identity | Grantee is valid DID | HIGH |
| INV-IDT-03 | Identity | Subject ≠ grantee | MEDIUM |
| INV-NON-01 | Nonce | Nonce is non-empty | HIGH |
| INV-NON-02 | Nonce | Nonce has sufficient entropy | HIGH |
| INV-NON-03 | Nonce | Nonce is globally unique | HIGH |
| INV-NON-04 | Nonce | Nonce not replayed | CRITICAL |
| INV-FMT-01 | Format | Version is supported | HIGH |
| INV-FMT-02 | Format | Token ID is valid UUID | MEDIUM |
| INV-FMT-03 | Format | Purpose is valid | MEDIUM |
| INV-FMT-04 | Format | Encoding is deterministic | HIGH |

### 8.8 Enforcement Requirements

Implementations MUST:

1. Check all invariants before accepting a token as valid.
2. Reject the token immediately upon any invariant violation.
3. Log invariant violations with sufficient context for debugging.
4. Return specific error codes indicating which invariant failed.
5. Never proceed with data access when any invariant is violated.

Implementations MUST NOT:

1. Silently ignore invariant violations.
2. Accept tokens with partial validity.
3. Attempt to repair or correct invalid tokens.
4. Cache validation results beyond the token's validity period.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial consent object specification |

---

*This document is normative. Implementations MUST conform to produce interoperable consent tokens.*
