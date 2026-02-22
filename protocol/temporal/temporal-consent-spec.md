# AOC Protocol — Temporal Consent Control Specification

**Version:** 1.0.0
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:**
- Consent Object Specification (v0.1.2)
- Capability Token Specification (v0.1)
- Protocol Invariants Specification

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Goals](#2-design-goals)
3. [ConsentObjectV2 — Temporal Extension](#3-consentobjectv2--temporal-extension)
4. [CapabilityTokenV2 — Temporal Binding](#4-capabilitytokenv2--temporal-binding)
5. [Access Scope Hash](#5-access-scope-hash)
6. [Vault Temporal Enforcement](#6-vault-temporal-enforcement)
7. [Access Ledger](#7-access-ledger)
8. [State Transition Model](#8-state-transition-model)
9. [Security Constraints](#9-security-constraints)
10. [Canonicalization Rules](#10-canonicalization-rules)
11. [Backward Compatibility](#11-backward-compatibility)
12. [Migration Plan](#12-migration-plan)
13. [UI Requirements](#13-ui-requirements)
14. [Invariants](#14-invariants)

---

## 1. Overview

### 1.1 Motivation

The AOC Protocol's Sovereign Data Control principle requires that users control not only
**what** is shared, but also **how long** it is shared. Prior to this specification,
temporal control was limited to the optional `expires_at` field in `ConsentObjectV1`,
which carried no explicit access window semantics and was not cryptographically bound
to the scope.

This specification introduces **Temporal Consent Control** as a first-class protocol
feature, enforced at the protocol level across Consent Objects, Capability Tokens, and
the Vault enforcement layer.

### 1.2 Architectural Principle

> **Time is a first-class permission variable.**

All temporal constraints are:
- **Cryptographically signed** — covered by the consent/capability hash
- **Hash-bound** — `access_scope_hash` ties scope + duration into one digest
- **Not modifiable** — any change invalidates the hash
- **Vault-enforced** — the Vault rejects expired tokens even if cryptographically valid

### 1.3 Relationship to V1

`ConsentObjectV2` and `CapabilityTokenV2` are additive, versioned extensions.
All V1 objects remain valid. V2 objects are identified by `version: "2.0"`.
V1 processing paths are unaffected. See Section 11 for backward compatibility details.

---

## 2. Design Goals

| Goal | Description |
|------|-------------|
| **Explicit Window** | Access has a declared open time and a declared close time |
| **Cryptographic Binding** | Temporal constraints are hash-bound and tamper-evident |
| **Revocability** | Any consent can be revoked before its natural expiration |
| **Renewability** | Consents may be configured for user-controlled renewal |
| **Affiliation Support** | Institutional access tied to credential lifecycle |
| **Ledger Traceability** | All temporal events are logged immutably |
| **No Time Manipulation** | Expired tokens are rejected even if structurally valid |

---

## 3. ConsentObjectV2 — Temporal Extension

### 3.1 Overview

`ConsentObjectV2` extends `ConsentObjectV1` with explicit temporal access control fields.
Version is `"2.0"`. All new fields are included in the canonical hash payload.

### 3.2 Additional Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `access_start_timestamp` | string | REQUIRED | ISO 8601 UTC: when access window opens |
| `access_expiration_timestamp` | string | REQUIRED | ISO 8601 UTC: when access window closes (non-null) |
| `renewable` | boolean | REQUIRED | Whether consent may be renewed |
| `max_renewals` | integer or null | REQUIRED | Cap on renewal cycles; null = unlimited |
| `renewal_count` | integer | REQUIRED | Current generation (0 = original grant) |
| `access_scope_hash` | string (64 hex) | REQUIRED | SHA-256 commitment over scope + temporal window |
| `consent_mode` | string | REQUIRED | `"standard"` or `"institutional-affiliation"` |
| `affiliation` | object or null | REQUIRED | Affiliation binding (non-null iff institutional mode) |

### 3.3 Temporal Field Rules

```
TMP-01: access_start_timestamp >= issued_at
  "Access window MUST NOT open before the consent was issued"

TMP-02: access_expiration_timestamp > access_start_timestamp
  "Access window MUST have positive duration"

TMP-03: expires_at == access_expiration_timestamp  [V2 invariant]
  "expires_at MUST mirror access_expiration_timestamp for V1 compatibility"

TMP-04: access_scope_hash == SHA-256(canonical(scope, start, expiry))
  "Scope hash MUST cryptographically bind scope to temporal window"

TMP-05: max_renewals == null || renewable == true
  "max_renewals is only meaningful when renewable is true"

TMP-06: renewal_count <= max_renewals || max_renewals == null
  "renewal_count MUST NOT exceed the cap"

TMP-07: renewable == false → renewal_count == 0
  "Non-renewable consents MUST NOT have a non-zero renewal count"
```

### 3.4 Consent Mode

| Mode | Description |
|------|-------------|
| `"standard"` | Fixed-duration access; affiliation binding is null |
| `"institutional-affiliation"` | Access tied to a Verifiable Credential; see Section 5 of institutional-affiliation-spec.md |

### 3.5 Canonical Payload (V2)

Top-level keys in strict alphabetical (Unicode code point) order:

```
access_expiration_timestamp
access_scope_hash
access_start_timestamp
action
affiliation
consent_mode
expires_at
grantee
issued_at
max_renewals
permissions
prior_consent
renewable
renewal_count
scope
subject
version
```

Affiliation object keys (when non-null), alphabetical:
```
affiliation_credential_ref
affiliation_type
auto_expires_on_affiliation_change
institution_did
```

The `consent_hash` field is excluded from canonical payload (self-referential).

### 3.6 Example ConsentObjectV2

```json
{
  "version": "2.0",
  "subject": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "grantee": "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
  "action": "grant",
  "scope": [
    { "type": "content", "ref": "aaaa...aaaa" }
  ],
  "permissions": ["read"],
  "issued_at": "2025-01-01T00:00:00Z",
  "expires_at": "2026-01-01T00:00:00Z",
  "prior_consent": null,
  "consent_hash": "...",
  "access_start_timestamp": "2025-01-01T00:00:00Z",
  "access_expiration_timestamp": "2026-01-01T00:00:00Z",
  "renewable": true,
  "max_renewals": 3,
  "renewal_count": 0,
  "access_scope_hash": "...",
  "consent_mode": "standard",
  "affiliation": null
}
```

---

## 4. CapabilityTokenV2 — Temporal Binding

### 4.1 Additional Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bound_consent_hash` | string (64 hex) | REQUIRED | Equals `consent_ref`; explicit temporal-binding reference |
| `renewal_generation` | integer | REQUIRED | 0 for original; +1 per renewal cycle |
| `issuer_signature` | string or null | REQUIRED | Placeholder for subject's digital signature |

### 4.2 Version

`CapabilityTokenV2` uses `version: "2.0"`. The canonical payload includes all V2 fields.

### 4.3 Temporal Derivation Rules (additional to V1)

```
CAP-TMP-01: token.issued_at >= consent.access_start_timestamp
  "Token MUST NOT be issued before the consent access window opens"

CAP-TMP-02: token.expires_at <= consent.access_expiration_timestamp
  "Token MUST expire at or before the consent access window closes"

CAP-TMP-03: bound_consent_hash == consent_ref
  "Explicit temporal-binding field MUST equal the consent reference"

CAP-TMP-04: renewal_generation >= 0
  "Renewal generation counter MUST be non-negative"
```

### 4.4 Expiry Enforcement

An expired `CapabilityTokenV2` (evaluation time > `expires_at`) MUST be rejected even
if its structural `capability_hash` is cryptographically valid. The Vault logs an
`EXPIRED` event and auto-revokes the token in the revocation registry.

### 4.5 Canonical Payload (V2)

Top-level keys, alphabetical:
```
bound_consent_hash
consent_ref
expires_at
grantee
issued_at
issuer_signature
not_before
permissions
renewal_generation
scope
subject
token_id
version
```

---

## 5. Access Scope Hash

### 5.1 Definition

The `access_scope_hash` is a cryptographic commitment that binds the selected scope
entries and the temporal access window into a single digest. This ensures that neither
the scope nor the time bounds can be modified without invalidating the hash.

### 5.2 Computation

```
function compute_access_scope_hash(scope, start, expiration):
  payload := canonical_json({
    "access_expiration_timestamp": expiration,
    "access_start_timestamp": start,
    "scope": sorted_scope_entries(scope)
  })
  RETURN lowercase_hex(SHA-256(UTF-8(payload)))
```

Keys are in alphabetical order. Scope entries are sorted by `(type, ref)`. Within
each scope entry, keys are `ref` then `type` (alphabetical).

### 5.3 Verification

Implementations MUST recompute `access_scope_hash` from the live fields and compare
it to the stored value. A mismatch indicates tampering with either scope or timestamps.

### 5.4 Invariant

```
SCOPE-HASH-01: access_scope_hash !=
  compute_access_scope_hash(tampered_scope, start, expiration)
  "Scope hash detects any scope modification"

SCOPE-HASH-02: access_scope_hash !=
  compute_access_scope_hash(scope, tampered_start, expiration)
  "Scope hash detects any start timestamp modification"

SCOPE-HASH-03: access_scope_hash !=
  compute_access_scope_hash(scope, start, tampered_expiration)
  "Scope hash detects any expiration modification"
```

---

## 6. Vault Temporal Enforcement

### 6.1 V2 Access Request Pipeline

The Vault enforces temporal constraints in the following ordered pipeline:

```
Step 1: Consent Presence
  → DENY (CONSENT_NOT_FOUND) if consent not in V2 store

Step 2: Pre-expiry Revocation Check
  → DENY (REVOKED) if consent_hash is in revoked_consents set

Step 3: Token Verification (verifyCapabilityTokenV2)
  → Structural integrity check
  → consent_ref binding
  → Subject / grantee identity binding
  → Scope containment
  → Permission containment
  → Temporal derivation bounds
  → Access window check: now >= access_start_timestamp
        → DENY (ACCESS_WINDOW_NOT_OPEN) if too early
  → Expiry check: now <= expires_at
        → DENY (EXPIRED) + auto-revoke + log EXPIRED event
  → not_before check
  → Revocation registry check
  → Replay rejection (nonce uniqueness)

Step 4: Pack Presence
  → DENY (PACK_NOT_FOUND)

Step 5: Field Resolution
  → SDL path validation → INVALID_SDL_PATH
  → SDL → field_id mapping → UNRESOLVED_FIELD
  → field_id → pack field → UNRESOLVED_FIELD
  → Scope coverage check → SCOPE_ESCALATION

Step 6: Access Log
  → Append ACCESS_GRANTED entry to Access Ledger
```

### 6.2 Auto-Invalidation on Expiry

When the Vault detects an expired token:
1. Logs an `EXPIRED` event to the Access Ledger
2. Calls `revokeCapabilityToken(capability_hash)` to prevent future replay
3. Returns `DENY` with reason code `EXPIRED`

### 6.3 Consent Revocation Before Expiry

`revokeConsentV2(consent_hash)` immediately:
1. Adds `consent_hash` to `revoked_consents` set
2. Iterates all V2 capability tokens derived from this consent
3. Revokes each derived token in the revocation registry
4. Logs one `REVOKED` event per capability token

---

## 7. Access Ledger

### 7.1 Overview

The Access Ledger is an append-only, immutable log of all protocol-significant events.
Every entry is created once and never modified.

### 7.2 Entry Structure

| Field | Type | Description |
|-------|------|-------------|
| `entry_id` | string (64 hex) | Unique random identifier |
| `event_type` | LedgerEventType | See Section 7.3 |
| `capability_hash` | string (64 hex) | Capability token involved |
| `consent_hash` | string (64 hex) | Consent involved |
| `subject` | string (DID) | Data owner |
| `grantee` | string (DID) | Accessor |
| `timestamp` | string (ISO 8601) | When the event occurred |
| `reason_code` | string or null | Structured code for DENY/EXPIRED/REVOKED events |
| `metadata` | object or null | Key-value pairs for additional context |

### 7.3 Event Types

| Event | Trigger |
|-------|---------|
| `ACCESS_GRANTED` | Successful vault access |
| `ACCESS_DENIED` | Rejected access attempt (with reason code) |
| `EXPIRED` | Token rejected due to expiration; token auto-revoked |
| `REVOKED` | Token revoked before natural expiration |
| `RENEWED` | Consent successfully renewed |
| `AFFILIATION_REVOKED` | Institutional affiliation VC invalidated |

---

## 8. State Transition Model

### 8.1 ConsentObjectV2 States

```
                    [ISSUED]
                       │
          ┌────────────┼────────────┐
          │            │            │
    before start    in window   after expiry
          │            │            │
          ▼            ▼            ▼
   [NOT_ACTIVE]   [ACTIVE]      [EXPIRED]
          │            │
          │    revokeConsentV2()
          │            │
          │            ▼
          │       [REVOKED]
          │            │
          └────────────┘
                [TERMINAL]
```

### 8.2 ConsentObjectV2 State Rules

| State | Condition | Access Permitted |
|-------|-----------|-----------------|
| `NOT_ACTIVE` | `now < access_start_timestamp` | NO |
| `ACTIVE` | `access_start_timestamp <= now <= access_expiration_timestamp` | YES (if token valid) |
| `EXPIRED` | `now > access_expiration_timestamp` | NO |
| `REVOKED` | Consent in `revoked_consents` set | NO |

### 8.3 CapabilityTokenV2 States

```
                    [MINTED]
                       │
              ┌────────┴────────┐
              │                 │
         not_before?          valid
              │                 │
              ▼                 ▼
       [PENDING_START]      [VALID]
              │                 │
              │    expires      │  revoke
              │       │         │
              ▼       ▼         ▼
              └──►[EXPIRED] [REVOKED]
                     (terminal)
```

---

## 9. Security Constraints

### 9.1 No Plaintext Timestamps in Unverified State

- Timestamps are included in the canonical payload and covered by `consent_hash`.
- An implementation MUST verify `consent_hash` before trusting any timestamp values.
- Unverified timestamps MUST NOT be used for authorization decisions.

### 9.2 Replay Attack Prevention

- `token_id` provides 256-bit uniqueness; used nonces are tracked in an in-memory registry.
- `expires_at` bounds the window during which replay tracking must be maintained.
- After expiry, tracking state MAY be discarded (but replay detection MAY also cease).
- The combination of unique `token_id` + finite `expires_at` prevents indefinite tracking.

### 9.3 Capability Cloning Prevention

- `capability_hash` covers all token fields; any clone with modified fields produces a different hash.
- The canonical payload is deterministic; an identical clone of a valid token has an identical `token_id` and will be rejected as a replay on second presentation.

### 9.4 Time Manipulation Prevention

- Vault evaluates `now` from the system clock at request time.
- `opts.now` injection is permitted for testing only; production deployments MUST use a trusted clock.
- `access_scope_hash` prevents retroactive modification of the temporal window.
- `prior_consent` chain prevents silent reuse of old consents.

### 9.5 Token Expiry is Unconditional

An expired `CapabilityTokenV2` MUST be rejected even if:
- Its `capability_hash` verifies correctly
- Its `issuer_signature` is valid
- The parent consent is still active

Structural validity does NOT override temporal invalidity.

---

## 10. Canonicalization Rules

See Section 3.5 (ConsentObjectV2) and Section 4.5 (CapabilityTokenV2) for canonical
key orders. These follow RFC 8785 (JSON Canonicalization Scheme):

- Keys in ascending Unicode code point order
- No whitespace between tokens
- UTF-8 encoding, NFC normalized
- Null values included as literal `null`
- Scope entries sorted by `(type, ref)` ascending
- Permissions sorted in ascending lexicographic order

---

## 11. Backward Compatibility

### 11.1 V1 Objects Are Unchanged

`ConsentObjectV1` (version `"1.0"`) and `CapabilityTokenV1` (version `"1.0"`) are
**not modified**. Existing V1 processing paths continue to function without change.

### 11.2 Co-existence

The Vault maintains separate stores:
- `consents` / `capabilities` — V1 objects
- `consents_v2` / `capabilities_v2` — V2 objects

The `requestAccess` method serves V1 tokens; `requestAccessV2` serves V2 tokens.
These paths are fully independent.

### 11.3 V1 Tokens Cannot Access V2 Consents

A V1 `CapabilityTokenV1` cannot be presented to `requestAccessV2`. The grantee must
obtain a V2 token from a V2 consent.

### 11.4 Existing Tests

All 294 pre-existing tests continue to pass unmodified.

---

## 12. Migration Plan

### Phase 0: No-op for V1 Issuers

V1 issuers need not change. V2 is opt-in.

### Phase 1: Issuer Upgrade

- Issuers that wish to use Temporal Consent Control call `buildConsentObjectV2` with
  the desired temporal parameters.
- The vault's `storeConsentV2` / `mintCapabilityV2` / `requestAccessV2` methods handle V2 objects.

### Phase 2: Grantee Token Refresh

- Existing V1 Capability Tokens remain valid until their `expires_at`.
- New tokens issued from V2 consents are V2 tokens; they carry the enhanced temporal fields.

### Phase 3: Full V2 Adoption

- When the majority of consents are V2, V1 processing paths may be declared deprecated.
- A major version bump (e.g., v3.0) would remove V1 support; this requires a separate RFC.

### Phase 4: Deprecation Timeline

| Milestone | Action |
|-----------|--------|
| v2.0 (this spec) | V2 introduced alongside V1; V1 unchanged |
| v2.1 | V1 deprecated (documented, still functional) |
| v3.0 | V1 removed |

---

## 13. UI Requirements

The following describes required UI elements. Frontend implementation is outside protocol scope.

### 13.1 Duration Selector

When issuing a consent, the user MUST be presented with:
- A date-picker for `access_expiration_timestamp`
- OR preset durations (7 days, 30 days, 90 days, 1 year, custom)
- An optional separate date-picker for `access_start_timestamp` (defaults to now)
- A toggle for `renewable` with an optional `max_renewals` numeric input

### 13.2 Active Access Dashboard

Users MUST see a list of active consents showing:
- Grantee DID (or human-readable alias)
- Fields/scope in plain language
- Access start time
- Time remaining until expiration (countdown)
- Consent mode (standard / institutional)
- Current renewal count / max_renewals

### 13.3 Countdown to Expiration

Each active consent card MUST display a real-time countdown to `access_expiration_timestamp`.
At ≤72h remaining, the UI SHOULD show a warning indicator.

### 13.4 Revoke Access Button

Each active consent card MUST have a one-click "Revoke Access" button.
Pressing it calls `revokeConsentV2(consent_hash)` via the Vault API.
The revocation MUST be immediate and irreversible.

---

## 14. Invariants

### 14.1 Temporal Invariants

```
TMP-INV-01: consent.access_start_timestamp >= consent.issued_at
TMP-INV-02: consent.access_expiration_timestamp > consent.access_start_timestamp
TMP-INV-03: consent.expires_at == consent.access_expiration_timestamp  [V2]
TMP-INV-04: access_scope_hash == compute_access_scope_hash(scope, start, expiry)
TMP-INV-05: token.expires_at <= consent.access_expiration_timestamp
TMP-INV-06: token.issued_at >= consent.access_start_timestamp
TMP-INV-07: bound_consent_hash == consent_ref
```

### 14.2 Revocation Invariants

```
REV-INV-01: revoke(consent_hash) => ALL derived tokens are revoked
REV-INV-02: revocation is irreversible
REV-INV-03: affiliation revocation requires auto_expires_on_affiliation_change == true
```

### 14.3 Ledger Invariants

```
LED-INV-01: Access Ledger is append-only; entries are never modified or deleted
LED-INV-02: Every ACCESS_GRANTED corresponds to a successful verifyCapabilityTokenV2
LED-INV-03: Every EXPIRED entry corresponds to a token auto-revocation
LED-INV-04: Every RENEWED entry references a valid prior_consent_hash
```

---

**End of Specification**
