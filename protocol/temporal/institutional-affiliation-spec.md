# AOC Protocol — Institutional Affiliation Access Specification

**Version:** 1.0.0
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:**
- Temporal Consent Control Specification (v1.0.0)
- Consent Object Specification (v0.1.2)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Affiliation Binding Structure](#2-affiliation-binding-structure)
3. [Supported Affiliation Types](#3-supported-affiliation-types)
4. [Consent Lifecycle](#4-consent-lifecycle)
5. [Revocation Model](#5-revocation-model)
6. [Scope Constraints](#6-scope-constraints)
7. [Security Considerations](#7-security-considerations)
8. [Examples](#8-examples)

---

## 1. Overview

**Institutional Affiliation Access** is a structured consent mode (`consent_mode:
"institutional-affiliation"`) that enables persistent, credential-tied access to user
data while the user maintains an affiliation with an institution.

### 1.1 Use Cases

| Scenario | Affiliation Type |
|----------|-----------------|
| Club or society membership | `membership` |
| Employment / HR record | `employment` |
| University enrollment | `enrollment` |

### 1.2 Key Properties

- Access duration is tied to an institutional Verifiable Credential (VC).
- When the affiliation VC is invalidated (e.g., membership lapses, employment ends,
  enrollment concludes), access is revoked automatically if
  `auto_expires_on_affiliation_change = true`.
- Access is revocable instantly by the user at any time, regardless of affiliation.
- Only explicitly selected scope fields are shared; unrelated data is never exposed.
- The consent mode is cryptographically bound in `consent_hash`; it cannot be changed
  without producing a new consent.

---

## 2. Affiliation Binding Structure

```
AffiliationBinding := {
  affiliation_credential_ref,       // SHA-256 hash of the Verifiable Credential
  affiliation_type,                 // "membership" | "employment" | "enrollment"
  auto_expires_on_affiliation_change, // boolean: whether VC invalidation auto-revokes
  institution_did                   // DID of the institution
}
```

### 2.1 Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `affiliation_credential_ref` | string (64 hex) | SHA-256 hash of the VC proving affiliation |
| `affiliation_type` | enum | One of: `membership`, `employment`, `enrollment` |
| `auto_expires_on_affiliation_change` | boolean | If true, VC invalidation triggers instant revocation |
| `institution_did` | string (DID) | DID of the institution owning the VC |

### 2.2 Canonical Key Order (alphabetical)

```
affiliation_credential_ref
affiliation_type
auto_expires_on_affiliation_change
institution_did
```

---

## 3. Supported Affiliation Types

### 3.1 `membership`

Ongoing membership in a club, professional body, or association.

- VC is typically renewable annually.
- Expiry of membership automatically revokes access (if `auto_expires_on_affiliation_change = true`).
- Data shared is limited to what is relevant to membership verification.

### 3.2 `employment`

Employment relationship with an organisation.

- VC is issued by HR/payroll system.
- Termination of employment invalidates VC → auto-revokes access.
- Typical use: access to professional records, credentials, or benefits data.

### 3.3 `enrollment`

University or course enrollment.

- VC is issued by academic registry.
- Graduation or withdrawal invalidates VC → auto-revokes access.
- Typical use: access to academic records, student identity data.

---

## 4. Consent Lifecycle

### 4.1 Initial Grant

1. User selects `consent_mode: "institutional-affiliation"`.
2. User provides the institution's DID and selects the VC proving affiliation.
3. System computes `affiliation_credential_ref = SHA-256(VC bytes)`.
4. User selects scope (fields to share) and sets a maximum duration
   (`access_expiration_timestamp`).
5. System builds a `ConsentObjectV2` with `consent_mode: "institutional-affiliation"`.
6. The `access_scope_hash` cryptographically binds scope + window.
7. The `consent_hash` covers all fields including the affiliation binding.

### 4.2 Active Access

- Institution presents a `CapabilityTokenV2` derived from the affiliation consent.
- The Vault checks: consent active, VC still valid (via `affiliation_credential_ref`),
  token not expired, scope not escalated.
- `ACCESS_GRANTED` is logged to the Access Ledger.

### 4.3 VC Invalidation → Auto-Revocation

When an affiliation VC is invalidated:

1. The issuer (institution or identity provider) signals VC invalidation via
   `vault.revokeByAffiliation(affiliation_credential_ref)`.
2. The Vault iterates all `consents_v2` entries with:
   - `consent_mode == "institutional-affiliation"`
   - `affiliation.affiliation_credential_ref == invalidated_vc_ref`
   - `affiliation.auto_expires_on_affiliation_change == true`
3. Each matched consent is added to `revoked_consents`.
4. All derived capability tokens are revoked.
5. An `AFFILIATION_REVOKED` event is logged per revoked consent.

### 4.4 Manual Revocation

The user may revoke at any time via `vault.revokeConsentV2(consent_hash)`,
regardless of whether the VC is still valid.

---

## 5. Revocation Model

```
                  [ACTIVE]
                     │
         ┌───────────┼───────────────┐
         │           │               │
   User revokes  VC invalidated  Expiry reached
   (immediate)   (if auto=true)   (natural end)
         │           │               │
         ▼           ▼               ▼
      [REVOKED]  [REVOKED]       [EXPIRED]
            (all terminal; access denied)
```

### 5.1 Revocation Invariants

```
AFF-REV-01: revokeByAffiliation(vc_ref) affects ONLY consents with:
  - consent_mode == "institutional-affiliation"
  - affiliation.affiliation_credential_ref == vc_ref
  - affiliation.auto_expires_on_affiliation_change == true

AFF-REV-02: Revocation is instantaneous (no grace period)

AFF-REV-03: Revocation is irreversible at the protocol level

AFF-REV-04: Revocation does NOT expose other data fields of the user
```

---

## 6. Scope Constraints

Institutional Affiliation Access MUST NOT implicitly grant access to unrelated data.

```
AFF-SCOPE-01: Scope entries are explicitly selected by the user at consent time

AFF-SCOPE-02: The affiliation binding does NOT grant access to all fields of a Pack

AFF-SCOPE-03: Scope selection follows the same rules as standard consent (subset of
              parent if derived from pack consent)

AFF-SCOPE-04: Adding scope entries after consent creation requires a new consent
              (immutability principle)
```

---

## 7. Security Considerations

### 7.1 VC Hash Binding

The `affiliation_credential_ref` is a SHA-256 hash of the VC bytes, not the VC itself.
This prevents the VC content from being embedded in the consent chain while still
providing a tamper-evident binding.

### 7.2 Separation of Concerns

- The AOC Protocol does NOT validate VC signatures or status; it relies on the
  calling system to determine when a VC is invalidated.
- The `revokeByAffiliation` call is the integration boundary between the VC lifecycle
  system and the AOC consent system.

### 7.3 No Implicit Trust

The institution's DID (`institution_did`) is recorded for auditing but does NOT
automatically grant that institution any special privileges. Authorization still
flows through normal Capability Token presentation.

### 7.4 Minimal Disclosure

Only explicitly consented scope entries are accessible. The institution MUST NOT
infer or access data beyond what is listed in the consent's scope.

---

## 8. Examples

### 8.1 Employment-Tied Consent

```json
{
  "version": "2.0",
  "subject": "did:key:z6MkEmployee...",
  "grantee": "did:web:company.example.com",
  "action": "grant",
  "scope": [
    { "type": "field", "ref": "name-field-hash..." },
    { "type": "field", "ref": "role-field-hash..." }
  ],
  "permissions": ["read"],
  "issued_at": "2025-01-15T09:00:00Z",
  "expires_at": "2026-01-15T09:00:00Z",
  "prior_consent": null,
  "consent_hash": "...",
  "access_start_timestamp": "2025-01-15T09:00:00Z",
  "access_expiration_timestamp": "2026-01-15T09:00:00Z",
  "renewable": true,
  "max_renewals": null,
  "renewal_count": 0,
  "access_scope_hash": "...",
  "consent_mode": "institutional-affiliation",
  "affiliation": {
    "affiliation_credential_ref": "sha256-of-employment-vc...",
    "affiliation_type": "employment",
    "auto_expires_on_affiliation_change": true,
    "institution_did": "did:web:company.example.com"
  }
}
```

### 8.2 Membership-Tied Consent (manual revocation only)

```json
{
  "...": "...",
  "consent_mode": "institutional-affiliation",
  "affiliation": {
    "affiliation_credential_ref": "sha256-of-club-membership-vc...",
    "affiliation_type": "membership",
    "auto_expires_on_affiliation_change": false,
    "institution_did": "did:web:club.example.org"
  }
}
```

With `auto_expires_on_affiliation_change: false`, the user must explicitly revoke
access even if the membership lapses. This configuration is suitable when the user
wants to retain control over revocation timing.

---

**End of Specification**
