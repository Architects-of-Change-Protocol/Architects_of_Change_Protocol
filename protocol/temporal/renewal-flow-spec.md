# AOC Protocol — Consent Renewal Flow Specification

**Version:** 1.0.0
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:**
- Temporal Consent Control Specification (v1.0.0)
- Consent Object Specification (v0.1.2)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Renewal Eligibility](#2-renewal-eligibility)
3. [Renewal Request Structure](#3-renewal-request-structure)
4. [Renewal Response Structure](#4-renewal-response-structure)
5. [Renewal Flow Diagram](#5-renewal-flow-diagram)
6. [Manual vs Auto Renewal](#6-manual-vs-auto-renewal)
7. [Renewed Consent Object](#7-renewed-consent-object)
8. [Security Considerations](#8-security-considerations)
9. [Invariants](#9-invariants)

---

## 1. Overview

**Renewal** is the process by which a time-bound consent is extended by creating a
new `ConsentObjectV2` with a later `access_expiration_timestamp`. The renewed consent
is a new immutable object; the original consent is not modified.

### 1.1 Default Behaviour

> **Manual renewal is required by default.**

Unless `auto_renewal: true` is explicitly passed to `processRenewal`, the vault returns
`PENDING_SUBJECT_SIGNATURE`, indicating the subject (data owner) must approve the renewal
before a new consent is issued.

### 1.2 Renewal Chain

Each renewal creates a new `ConsentObjectV2` with:
- `prior_consent = existing_consent.consent_hash`
- `renewal_count = existing_consent.renewal_count + 1`
- New temporal window starting exactly where the previous one closed

This creates an auditable chain of consent objects tracing the full renewal history.

---

## 2. Renewal Eligibility

A consent is eligible for renewal only if ALL of the following conditions hold:

| Condition | Rule |
|-----------|------|
| **Renewable flag** | `consent.renewable == true` |
| **Cap not reached** | `consent.renewal_count < consent.max_renewals` OR `consent.max_renewals == null` |
| **Correct grantee** | `request.requesting_grantee == consent.grantee` |
| **Valid new expiry** | `request.proposed_expiration > consent.access_expiration_timestamp` |
| **Consent exists** | `consent_hash` is in the vault's V2 consent store |

If any condition fails, the vault returns `DENIED` with a human-readable `denial_reason`.

---

## 3. Renewal Request Structure

```
RenewalRequest := {
  prior_consent_hash,        // SHA-256 hash of consent being renewed (64 hex)
  requesting_grantee,        // DID of the institution requesting renewal
  proposed_expiration,       // ISO 8601 UTC: proposed new access_expiration_timestamp
  requires_user_signature,   // true: subject approval required; false: pre-authorised
  renewal_signature,         // subject's signature (null if not yet provided)
  requested_at,              // ISO 8601 UTC timestamp of the request
  renewal_reason             // optional human-readable reason
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `prior_consent_hash` | REQUIRED | Identifies which consent to renew |
| `requesting_grantee` | REQUIRED | Must match `consent.grantee` |
| `proposed_expiration` | REQUIRED | Must be after current `access_expiration_timestamp` |
| `requires_user_signature` | REQUIRED | Whether the subject must sign off |
| `renewal_signature` | OPTIONAL | When present with `requires_user_signature=true`, constitutes pre-approval |
| `requested_at` | REQUIRED | Timestamp of the request |
| `renewal_reason` | OPTIONAL | Human-readable rationale |

---

## 4. Renewal Response Structure

```
RenewalResponse := {
  status,                    // "APPROVED" | "DENIED" | "PENDING_SUBJECT_SIGNATURE"
  new_consent_hash,          // non-null only if APPROVED
  denial_reason,             // non-null only if DENIED
  signature_request_id       // non-null only if PENDING_SUBJECT_SIGNATURE
}
```

| Status | Meaning |
|--------|---------|
| `APPROVED` | Renewal granted; `new_consent_hash` points to the new consent |
| `DENIED` | Renewal refused; `denial_reason` explains why |
| `PENDING_SUBJECT_SIGNATURE` | Renewal cannot proceed until the subject approves; `signature_request_id` tracks the pending request |

---

## 5. Renewal Flow Diagram

### 5.1 Happy Path (Auto-Renewal or Pre-Signed)

```
Institution                    Vault                      Subject (Data Owner)
    │                            │                                │
    │  RenewalRequest            │                                │
    │  (requires_user_sig=false  │                                │
    │   OR renewal_signature≠null│                                │
    ├───────────────────────────►│                                │
    │                            │  Check eligibility             │
    │                            │  ✓ renewable                   │
    │                            │  ✓ within cap                  │
    │                            │  ✓ grantee matches             │
    │                            │  ✓ expiry valid                │
    │                            │                                │
    │                            │  buildConsentObjectV2(         │
    │                            │    prior_consent = old_hash,   │
    │                            │    renewal_count = n+1,        │
    │                            │    access_start = old_expiry,  │
    │                            │    new_expiry = proposed        │
    │                            │  )                             │
    │                            │                                │
    │                            │  Log RENEWED to Access Ledger  │
    │                            │                                │
    │  APPROVED                  │                                │
    │  new_consent_hash          │                                │
    │◄───────────────────────────┤                                │
```

### 5.2 Manual Renewal Path (Default)

```
Institution                    Vault                      Subject (Data Owner)
    │                            │                                │
    │  RenewalRequest            │                                │
    │  (requires_user_sig=true   │                                │
    │   renewal_signature=null)  │                                │
    ├───────────────────────────►│                                │
    │                            │  Check eligibility             │
    │                            │  ✓ All conditions met          │
    │                            │  ✗ No signature present        │
    │                            │                                │
    │  PENDING_SUBJECT_SIGNATURE │                                │
    │  signature_request_id=...  │                                │
    │◄───────────────────────────┤                                │
    │                            │                                │
    │    (notifies user out-of-band, e.g., mobile push)           │
    │                            │◄───────────────────────────────│
    │                            │  User reviews & signs          │
    │                            │                                │
    │                            │  buildConsentObjectV2(...)     │
    │                            │  Log RENEWED                   │
    │                            │                                │
    │  APPROVED                  │                                │
    │  new_consent_hash          │                                │
    │◄───────────────────────────┤                                │
```

### 5.3 Denied Path

```
Institution                    Vault
    │                            │
    │  RenewalRequest            │
    ├───────────────────────────►│
    │                            │  Eligibility check fails:
    │                            │  - Not renewable, OR
    │                            │  - Cap exceeded, OR
    │                            │  - Grantee mismatch, OR
    │                            │  - Invalid proposed expiry
    │                            │
    │  DENIED                    │
    │  denial_reason             │
    │◄───────────────────────────┤
```

---

## 6. Manual vs Auto Renewal

| Configuration | Behaviour |
|---------------|-----------|
| `requires_user_signature: true`, `renewal_signature: null`, `auto_renewal: false` | Returns `PENDING_SUBJECT_SIGNATURE` |
| `requires_user_signature: true`, `renewal_signature: <sig>` | Returns `APPROVED` (signature treated as pre-approval) |
| `requires_user_signature: false`, `auto_renewal: true` | Returns `APPROVED` immediately |
| `requires_user_signature: false`, `auto_renewal: false` | Returns `APPROVED` (no sig required) |

**Default is manual renewal** (`requires_user_signature: true`, `auto_renewal: false`).
Auto-renewal MUST be explicitly opted into and is NOT the default.

### 6.1 Why Manual First

Auto-renewal undermines Sovereign Data Control: a data owner must have the final say
on whether access continues. The protocol defaults to requiring subject approval to
ensure consent remains a genuine act, not a passive default.

---

## 7. Renewed Consent Object

A renewed `ConsentObjectV2` has the following characteristics:

| Field | Value |
|-------|-------|
| `version` | `"2.0"` |
| `action` | `"grant"` |
| `prior_consent` | Hash of the consent being renewed |
| `renewal_count` | Previous `renewal_count + 1` |
| `access_start_timestamp` | Equal to previous `access_expiration_timestamp` |
| `access_expiration_timestamp` | `request.proposed_expiration` |
| `expires_at` | Equal to `access_expiration_timestamp` |
| `scope` | Unchanged from previous consent |
| `permissions` | Unchanged from previous consent |
| `renewable` | Unchanged |
| `max_renewals` | Unchanged |
| `consent_mode` | Unchanged |
| `affiliation` | Unchanged |
| `access_scope_hash` | Recomputed from new scope + new timestamps |
| `consent_hash` | SHA-256 of the new canonical V2 payload |

### 7.1 Continuity of Access Window

The renewed window starts exactly where the previous one ended:

```
Previous:  [access_start_timestamp ──────────► access_expiration_timestamp]
                                                        │
Renewed:                                     [access_start ──► new_expiry]
```

There is no gap and no overlap; the user's data access window is contiguous.

### 7.2 Audit Trail

The chain of `prior_consent` references allows any party to reconstruct the full
renewal history of a consent:

```
Original (renewal_count=0) ─►prior_consent──► null
First Renewal (renewal_count=1) ─►prior_consent──► original.consent_hash
Second Renewal (renewal_count=2) ─►prior_consent──► first_renewal.consent_hash
```

---

## 8. Security Considerations

### 8.1 Renewal Does Not Reset the Clock

A renewal does NOT reactivate a revoked consent. If `consent_hash` is in
`revoked_consents`, the renewal is effectively of a dead consent; the new consent
is a fresh grant but the original remains revoked.

### 8.2 Renewal Cap Enforcement

`max_renewals` is enforced atomically. Implementations MUST check
`renewal_count >= max_renewals` before issuing a new consent.

### 8.3 Grantee Verification

Only the original grantee may request renewal. A different entity presenting the
prior consent hash MUST be denied.

### 8.4 Proposed Expiry Validation

The vault MUST reject `proposed_expiration <= existing.access_expiration_timestamp`.
This prevents clock rollback attacks where an institution proposes an earlier expiry
to avoid detection of stale tokens.

---

## 9. Invariants

```
REN-INV-01: renewable == false → processRenewal() returns DENIED

REN-INV-02: renewal_count >= max_renewals AND max_renewals != null
            → processRenewal() returns DENIED

REN-INV-03: new_consent.prior_consent == existing_consent.consent_hash

REN-INV-04: new_consent.renewal_count == existing_consent.renewal_count + 1

REN-INV-05: new_consent.access_start_timestamp == existing_consent.access_expiration_timestamp

REN-INV-06: new_consent.access_expiration_timestamp == request.proposed_expiration

REN-INV-07: APPROVED renewal → new_consent stored in vault.consents_v2

REN-INV-08: APPROVED renewal → RENEWED event logged to Access Ledger

REN-INV-09: requires_user_signature AND renewal_signature == null AND auto_renewal == false
            → PENDING_SUBJECT_SIGNATURE (never APPROVED)
```

---

**End of Specification**
