# HRKey ↔ AOC Protocol — Economic & Trust Model

**Version:** 0.1
**Status:** Normative Draft
**Scope:** Defines the economic flows, trust guarantees, and responsibility boundaries for the integration of HRKey (a commercial market maker in the employment vertical) with the AOC Protocol sovereign vault.

**Governing principle:** AOC Protocol is neutral, sovereign, and non-custodial. HRKey is a commercial entity consuming AOC Vault capabilities via the adapter. Authorization flows entirely through AOC consent + capability tokens. No changes to AOC core modules are required or permitted.

---

## Table of Contents

1. [Actors and Roles](#1-actors-and-roles)
2. [Economic Flows](#2-economic-flows)
3. [Trust Guarantees](#3-trust-guarantees)
4. [Boundaries of Responsibility](#4-boundaries-of-responsibility)
5. [Example Monetization Flows](#5-example-monetization-flows)

---

## 1. Actors and Roles

### 1.1 Actor Table

| Actor | DID Required | Role | Sovereignty Level |
|-------|-------------|------|-------------------|
| **Candidate** | Yes (`did:<method>:<id>`) | Data owner. Grants and revokes consent. Root of trust. | Full — controls all data and consent decisions |
| **Market Maker (HRKey)** | Yes (system DID) | Domain engine. Consumes vault capabilities via adapter. Operates scoring, matching, and commercial logic. | None over data — commercial autonomy over business logic |
| **Employer** | Yes (`did:<method>:<id>`) | Data consumer. Pays for access. Receives authorized field data via capability tokens. | None over data — receives only what consent permits |
| **Third-party Verifier** | Optional | Issues signed proofs attached to candidate fields (e.g., employment verification, credential issuance). Does not participate in consent flows directly. | None — proofs are embedded in fields at issuance time |
| **Storage Provider** | No | Blind persistence layer. Stores encrypted blobs. Cannot read, index, or correlate content. | None — storage is a commodity; provider is replaceable |

### 1.2 Actor Descriptions

**Candidate (Subject)**
The individual whose professional data (references, skills, credentials) is stored in the vault. The candidate is the sole entity that can:
- Construct and register pack manifests containing their field references.
- Grant consent objects specifying which data, to whom, for what purpose, and for how long.
- Revoke capability tokens at any time, immediately terminating access.

The candidate is never an account in HRKey's system. The candidate is identified by a DID, and their wallet is the source of truth.

**Market Maker (HRKey)**
A commercial service operating in the employment/recruiting vertical. HRKey:
- Publishes schematics describing what SDL fields it requires for matching.
- Provides the user interface for candidates and employers.
- Orchestrates the consent and access flow by calling the adapter.
- Executes proprietary business logic (scoring, ranking, matching) outside the protocol boundary.
- Sets commercial pricing and collects payments from employers.

HRKey is stateless with respect to identity. It operates on sessions backed by capability tokens, not persistent user accounts.

**Employer (Grantee)**
A hiring organization that wants to access candidate professional data. Employers:
- Discover candidates through HRKey's matching engine.
- Pay HRKey for access (the commercial transaction).
- Receive resolved field data only when a valid capability token is presented and the vault returns `ALLOW`.

**Third-party Verifier (Issuer)**
An entity that attests to the truthfulness of a candidate's field data. Examples: former employers confirming tenure, universities confirming degrees, certification bodies confirming credentials. Verifiers sign proofs that are bound to specific fields at issuance time. They do not participate in the consent or capability flow — their role is upstream (data quality), not downstream (data access).

**Storage Provider**
An infrastructure service that persists encrypted data blobs. The storage provider:
- Receives encrypted content via a locator abstraction.
- Cannot decrypt, read, index, or correlate stored blobs.
- Is replaceable without affecting consent or capability validity.
- Is invisible to the economic flow (no fee participation in the access model).

---

## 2. Economic Flows

### 2.1 Value Chain

```
Candidate (data owner)
    │
    │  grants consent (free — consent is a sovereign act, never a paid service)
    ▼
AOC Vault (enforcement)
    │
    │  mints capability token (protocol operation — no fee)
    ▼
HRKey (market maker)
    │
    │  executes matching, presents candidates (commercial service)
    ▼
Employer (data consumer)
    │
    │  pays for access (commercial transaction)
    ▼
Revenue Split
    ├── HRKey operational share
    └── Candidate sovereign share (non-custodial, direct to wallet)
```

### 2.2 Fee-Triggering Actions

| Action | Triggers Fee? | Payer | Payee(s) | Notes |
|--------|:------------:|-------|----------|-------|
| Pack registration | No | — | — | Candidate populates vault; sovereign act |
| Consent grant | No | — | — | Consent is never monetized directly |
| Consent revocation | No | — | — | Revocation is a right, never a cost |
| Capability minting | No | — | — | Protocol operation; no commercial value alone |
| **Access request (ALLOW)** | **Yes** | Employer | HRKey + Candidate | The monetizable event: employer receives resolved field data |
| Access request (DENY) | No | — | — | Failed access has no commercial value |
| Capability revocation | No | — | — | Sovereign act; immediate and free |
| Schematic publication | No | — | — | HRKey publishes schematics as part of its service |

**Core rule:** The only fee-triggering event is a successful access request that returns `ALLOW` with resolved fields. Everything else is either a sovereign act (free by principle) or a protocol operation (free by design).

### 2.3 Pricing Model

HRKey sets commercial pricing. AOC Protocol does not dictate prices — it enforces that the candidate's share is delivered non-custodially.

#### Example Pricing Tiers

| Tier | Description | Per-Access Price | Fields Included | Typical Use |
|------|-------------|:----------------:|-----------------|-------------|
| **Discovery** | Basic professional summary | $0.50 | `person.name.display`, `work.experience.total.years`, `person.location.country` | Initial screening, pipeline building |
| **Standard** | Detailed professional profile | $5.00 | Discovery + `work.skill.*`, `education.degree.*`, `work.history.recent.*` | Active hiring, shortlisting |
| **Verified** | Full profile with third-party proofs | $25.00 | Standard + verified credentials, signed references, proof chains | Final-stage hiring, compliance |
| **Bulk** | Volume pricing (negotiated) | Negotiated | Configurable per contract | Enterprise recruiting, staffing agencies |

Prices are illustrative. HRKey determines actual pricing based on market conditions.

#### Per-Access Price Decomposition

```json
{
  "tier": "standard",
  "gross_price_usd": 5.00,
  "split": {
    "candidate_share_pct": 40,
    "candidate_share_usd": 2.00,
    "hrkey_share_pct": 60,
    "hrkey_share_usd": 3.00
  },
  "settlement": "non_custodial",
  "candidate_wallet": "did:example:candidate_123"
}
```

### 2.4 Fee Split Models

| Model | Candidate Share | HRKey Share | When Used |
|-------|:--------------:|:-----------:|-----------|
| **Default** | 40% | 60% | Standard access requests |
| **Premium Candidate** | 60% | 40% | Candidate with verified credentials and high demand |
| **Employer Subscription** | 30% | 70% | Employer has prepaid volume commitment |
| **Candidate-Initiated** | 70% | 30% | Candidate proactively publishes profile to market |

**Invariant:** The candidate share is always > 0% for any access that returns resolved field data. A zero-candidate-share model violates the protocol's economic design principle that data owners are the primary economic beneficiaries.

### 2.5 Payment Settlement

```
Employer ──[pays]──► HRKey (commercial transaction, any payment rail)
                         │
                         ├──[retains]──► HRKey operational account
                         │
                         └──[sends]──► Candidate wallet (non-custodial, direct)
                                        │
                                        └── Settlement: on-chain, stablecoin,
                                            or fiat rail (wallet's choice)
```

**Non-custodial requirement:** HRKey never holds candidate funds in an internal balance or escrow account. The candidate share is settled directly to the candidate's wallet address. If settlement fails, the obligation is logged and retried — it is never absorbed by HRKey.

---

## 3. Trust Guarantees

### 3.1 What AOC Guarantees to Each Actor

#### To the Candidate

| Guarantee | Mechanism |
|-----------|-----------|
| No data leaves without explicit consent | Consent object required before any capability can be minted |
| Consent is revocable at any time | `revokeCapability()` immediately adds token to revocation registry; next `requestAccess()` returns `DENY(REVOKED)` |
| Scope cannot escalate | Capability token scope must be ⊆ parent consent scope (derivation invariant) |
| Permissions cannot escalate | Capability permissions must be ⊆ parent consent permissions |
| Access is temporally bounded | All capability tokens require finite `expires_at`; no perpetual access tokens |
| No information leaks on denial | When vault returns `DENY`, `resolved_fields` and `unresolved_fields` are empty arrays |
| Every access is replay-protected | 256-bit `token_id` nonce; same token cannot be presented twice |
| All objects are tamper-evident | SHA-256 canonical hash binding on consent, capability, and pack objects |

#### To the Employer

| Guarantee | Mechanism |
|-----------|-----------|
| Resolved fields are authentic | Fields are hash-bound to pack manifest; vault verifies integrity before returning |
| Access decision is deterministic | Identical inputs produce identical `VaultAccessResult` (same ALLOW/DENY, same fields) |
| SDL paths resolve consistently | Registered SDL mappings produce stable field resolution across requests |
| Denial reasons are explicit | `reason_codes` array in `VaultPolicyDecision` explains every denial |

#### To HRKey (Market Maker)

| Guarantee | Mechanism |
|-----------|-----------|
| Vault is a deterministic black box | Same request always produces same result; no hidden state or side effects |
| Derivation invariants are enforced | HRKey cannot accidentally mint an over-scoped capability; vault rejects it |
| Adapter is stateless and swappable | Vault interface is plain object; can be replaced with wallet-resident implementation without adapter changes |
| Multi-market isolation | Consent/capability chains are cryptographically bound; no cross-market escalation |

### 3.2 What HRKey Must Guarantee to Users

| Guarantee | Enforcement |
|-----------|-------------|
| Candidate share is always paid for successful access | HRKey business obligation; verifiable via wallet settlement receipts |
| Consent UI accurately represents scope | HRKey must present the exact SDL paths and permissions being requested; misrepresentation is a trust violation |
| No data caching beyond capability lifetime | HRKey must not persist resolved field data past the capability's `expires_at` |
| No secondary sharing without separate consent | Resolved field data cannot be forwarded to third parties without a new consent chain |
| Schematic accuracy | Published schematics must accurately describe what fields will be requested |
| Pricing transparency | Employer sees total price; candidate sees their share before consenting |

### 3.3 Inviolable Trust Boundaries

The following conditions, if violated, cause a complete loss of protocol guarantees:

| Violation | Consequence |
|-----------|-------------|
| Vault core module is modified | All derivation invariants, replay protection, and scope containment are void |
| Consent object is forged (bypasses `buildConsentObject`) | Hash integrity fails; vault rejects all derived capabilities |
| Capability token `token_id` is reused | Vault returns `DENY(REPLAY)` — no data is exposed |
| HRKey caches data beyond token expiry and serves it | Protocol guarantee is violated at the application layer; AOC cannot enforce deletion on HRKey's infrastructure |
| Candidate DID is impersonated | Out-of-scope for vault (identity layer responsibility); vault enforces authorization, not authentication |

---

## 4. Boundaries of Responsibility

### 4.1 Responsibility Matrix

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AOC PROTOCOL ENFORCES                        │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Scope            │  │ Temporal         │  │ Cryptographic       │ │
│  │ Containment      │  │ Bounds           │  │ Integrity           │ │
│  │                  │  │                  │  │                     │ │
│  │ capability.scope │  │ not_before ≤     │  │ SHA-256 canonical   │ │
│  │ ⊆ consent.scope  │  │ now ≤ expires_at │  │ hash binding on     │ │
│  │                  │  │                  │  │ all objects         │ │
│  │ No field access  │  │ Finite expiry    │  │                     │ │
│  │ outside scope    │  │ mandatory        │  │ Tamper detection    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Replay           │  │ Revocation       │  │ No Information      │ │
│  │ Protection        │  │ Enforcement      │  │ Leakage             │ │
│  │                  │  │                  │  │                     │ │
│  │ 256-bit token_id │  │ Revoked tokens   │  │ DENY responses      │ │
│  │ uniqueness       │  │ immediately      │  │ contain zero        │ │
│  │ per execution    │  │ rejected         │  │ resolved fields     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ Determinism      │  │ SDL Path Validation                      │ │
│  │                  │  │                                          │ │
│  │ Same inputs →    │  │ Format: ^[a-z][a-z0-9]*(\.[a-z]         │ │
│  │ same outputs     │  │ [a-z0-9]*)+$                             │ │
│  │ always           │  │ Deterministic field ordering             │ │
│  └─────────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          HRKey OWNS                                 │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Identity         │  │ Business Logic   │  │ User Interface      │ │
│  │ Management       │  │                  │  │                     │ │
│  │                  │  │ Scoring          │  │ Consent collection  │ │
│  │ Candidate DIDs   │  │ Ranking          │  │ Employer dashboard  │ │
│  │ Employer DIDs    │  │ Matching          │  │ Candidate profiles  │ │
│  │ DID lifecycle    │  │ Recommendations  │  │ Search & discovery  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Commercial       │  │ Temporal         │  │ Schematic           │ │
│  │ Pricing          │  │ Decisions        │  │ Publication         │ │
│  │                  │  │                  │  │                     │ │
│  │ Tier pricing     │  │ Consent expiry   │  │ SDL field lists     │ │
│  │ Fee splits       │  │ Capability TTL   │  │ Purpose statements  │ │
│  │ Payment rails    │  │ not_before gates │  │ Market schematics   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────────────────────────────┐ │
│  │ Settlement       │  │ Compliance & Jurisdiction                │ │
│  │                  │  │                                          │ │
│  │ Candidate share  │  │ GDPR, local labor law, data residency   │ │
│  │ disbursement     │  │ KYC/AML for employers (if applicable)   │ │
│  │ Employer billing │  │ Contractual terms with employers         │ │
│  └─────────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Boundary Rules

1. **AOC never prices.** The protocol has no concept of tiers, fees, or commercial transactions. Pricing exists entirely in HRKey's domain.

2. **AOC never stores identity.** DIDs are opaque strings to the vault. The vault validates DID format but does not resolve, authenticate, or manage identity.

3. **HRKey never enforces consent.** Consent validation, scope containment, replay protection, and revocation are vault responsibilities. HRKey must not re-implement these checks.

4. **HRKey never modifies AOC core.** The adapter is a translation layer. If HRKey needs functionality the vault does not provide, the correct path is a protocol proposal — never a local patch.

5. **Storage is invisible to economics.** Storage providers do not participate in the fee model. They are infrastructure, not economic actors.

---

## 5. Example Monetization Flows

### 5.1 Flow A — Candidate Consents to Reference Sharing

**Scenario:** A candidate wants to make their professional references available to employers through HRKey's marketplace.

#### Step 1: Pack Registration

The candidate's wallet constructs a pack manifest and registers it through the adapter.

```
Candidate wallet → HRKey Adapter → AOC Vault
                   registerPack()    storePack() + registerSdlMapping()
```

```json
{
  "action": "register_pack",
  "pack": {
    "version": "1.0",
    "subject": "did:example:candidate_alice",
    "fields": [
      {
        "field_id": "f_ref_01",
        "sdl_path": "work.reference.manager.name",
        "content_hash": "a1b2c3..."
      },
      {
        "field_id": "f_ref_02",
        "sdl_path": "work.reference.manager.statement",
        "content_hash": "d4e5f6..."
      },
      {
        "field_id": "f_ref_03",
        "sdl_path": "work.experience.total.years",
        "content_hash": "789abc..."
      }
    ]
  },
  "result": {
    "pack_hash": "pack_sha256_hash...",
    "sdl_paths_registered": 3
  }
}
```

**Fee:** None. Pack registration is a sovereign act.

#### Step 2: Consent Grant

The candidate reviews HRKey's schematic and grants consent for a specific employer to access their references.

```
Candidate (via HRKey UI) → HRKey Adapter → AOC Vault
                            grantConsent()   buildConsentObject() + storeConsent()
```

```json
{
  "action": "grant_consent",
  "input": {
    "candidate": "did:example:candidate_alice",
    "employer": "did:example:employer_acme",
    "scope": [
      { "type": "pack", "ref": "pack_sha256_hash..." }
    ],
    "permissions": ["read"],
    "expires_at": "2026-03-10T00:00:00Z"
  },
  "result": {
    "consent_hash": "consent_sha256_hash...",
    "consent": {
      "version": "1.0",
      "subject": "did:example:candidate_alice",
      "grantee": "did:example:employer_acme",
      "action": "grant",
      "scope": [{ "type": "pack", "ref": "pack_sha256_hash..." }],
      "permissions": ["read"],
      "issued_at": "2026-02-10T12:00:00Z",
      "expires_at": "2026-03-10T00:00:00Z",
      "prior_consent": null,
      "consent_hash": "consent_sha256_hash..."
    }
  }
}
```

**Fee:** None. Consent is a sovereign act — never monetized.

#### Step 3: Employer Pays HRKey for Access

The employer, using HRKey's dashboard, requests access to the candidate's references. This is where the commercial transaction occurs.

```
Employer ──[pays $5.00]──► HRKey (commercial transaction)
```

```json
{
  "action": "employer_purchase",
  "tier": "standard",
  "employer": "did:example:employer_acme",
  "candidate": "did:example:candidate_alice",
  "price": {
    "gross_usd": 5.00,
    "candidate_share_usd": 2.00,
    "hrkey_share_usd": 3.00
  },
  "payment_method": "invoice",
  "status": "paid"
}
```

**Fee:** $5.00 charged to employer by HRKey. This is a commercial transaction entirely in HRKey's domain.

#### Step 4: Capability Minting and Access

After payment clears, HRKey mints an attenuated capability token and executes the access request.

```
HRKey Adapter → AOC Vault
mintCapability()  (validates derivation invariants)
requestAccess()   (validates capability, resolves fields)
```

```json
{
  "action": "mint_capability",
  "input": {
    "consent_hash": "consent_sha256_hash...",
    "scope": [{ "type": "pack", "ref": "pack_sha256_hash..." }],
    "permissions": ["read"],
    "expires_at": "2026-02-10T13:00:00Z"
  },
  "result": {
    "capability_hash": "cap_sha256_hash...",
    "capability": {
      "version": "1.0",
      "subject": "did:example:candidate_alice",
      "grantee": "did:example:employer_acme",
      "consent_ref": "consent_sha256_hash...",
      "scope": [{ "type": "pack", "ref": "pack_sha256_hash..." }],
      "permissions": ["read"],
      "issued_at": "2026-02-10T12:01:00Z",
      "not_before": null,
      "expires_at": "2026-02-10T13:00:00Z",
      "token_id": "random_256bit_hex...",
      "capability_hash": "cap_sha256_hash..."
    }
  }
}
```

```json
{
  "action": "request_access",
  "input": {
    "capability": "<<capability object above>>",
    "sdl_paths": [
      "work.reference.manager.name",
      "work.reference.manager.statement",
      "work.experience.total.years"
    ],
    "pack_hash": "pack_sha256_hash..."
  },
  "result": {
    "policy": {
      "decision": "ALLOW",
      "reason_codes": []
    },
    "resolved_fields": [
      { "sdl_path": "work.reference.manager.name", "field_id": "f_ref_01", "content_hash": "a1b2c3..." },
      { "sdl_path": "work.reference.manager.statement", "field_id": "f_ref_02", "content_hash": "d4e5f6..." },
      { "sdl_path": "work.experience.total.years", "field_id": "f_ref_03", "content_hash": "789abc..." }
    ],
    "unresolved_fields": []
  }
}
```

**Fee:** None at the protocol level. The commercial transaction already occurred in Step 3.

#### Step 5: Settlement

HRKey disburses the candidate's share.

```json
{
  "action": "settlement",
  "access_event": "cap_sha256_hash...",
  "candidate": "did:example:candidate_alice",
  "candidate_share_usd": 2.00,
  "settlement_method": "direct_to_wallet",
  "settlement_status": "completed",
  "settled_at": "2026-02-10T12:05:00Z"
}
```

**Fee:** None to candidate. The $2.00 is their earnings, not a fee.

### 5.2 Flow B — Employer Subscription with Bulk Access

**Scenario:** An enterprise employer pre-purchases a volume package from HRKey.

#### Timeline

```
T0: Employer signs subscription contract with HRKey
    └── Pays $2,000/month for up to 500 Standard-tier accesses
    └── Effective per-access cost: $4.00

T1–T_n: For each candidate access:
    1. Candidate grants consent (free, sovereign)
    2. HRKey mints capability (protocol operation)
    3. Vault resolves access (ALLOW/DENY)
    4. If ALLOW: candidate receives share

Per-access settlement under subscription:
    gross_per_access: $4.00
    candidate_share (30%): $1.20
    hrkey_share (70%): $2.80
```

```json
{
  "subscription": {
    "employer": "did:example:employer_bigcorp",
    "plan": "enterprise_500",
    "monthly_price_usd": 2000.00,
    "included_accesses": 500,
    "effective_per_access_usd": 4.00,
    "split_model": "employer_subscription",
    "candidate_share_pct": 30,
    "hrkey_share_pct": 70
  }
}
```

**Key difference from Flow A:** The employer's payment is upfront and aggregated. Candidate shares are still settled per-access, as each access event involves a distinct consent chain.

### 5.3 Flow C — Access Denied (No Fee)

**Scenario:** An employer requests access, but the capability token has expired.

```json
{
  "action": "request_access",
  "result": {
    "policy": {
      "decision": "DENY",
      "reason_codes": ["EXPIRED"]
    },
    "resolved_fields": [],
    "unresolved_fields": []
  }
}
```

**Fee:** None. No data was delivered. The employer is not charged. No settlement occurs.

If the employer had already been charged (e.g., pre-paid), HRKey must issue a credit or retry with a valid token. This is HRKey's commercial obligation, not an AOC concern.

### 5.4 Flow D — Candidate Revokes Mid-Session

**Scenario:** A candidate revokes a capability token while an employer's session is still active.

#### Timeline

```
T0: Candidate grants consent, employer pays, capability minted
T1: First requestAccess() → ALLOW (employer receives data, candidate receives share)
T2: Candidate calls revokeCapability(capability_hash)
T3: Second requestAccess() with same token → DENY(REVOKED)
```

```json
{
  "event": "revocation",
  "capability_hash": "cap_sha256_hash...",
  "revoked_at": "2026-02-10T12:30:00Z",
  "subsequent_access_result": {
    "policy": {
      "decision": "DENY",
      "reason_codes": ["REVOKED"]
    },
    "resolved_fields": [],
    "unresolved_fields": []
  }
}
```

**Economic consequence:**
- T1 access: Employer was charged, candidate was paid. This stands — data was legitimately delivered.
- T3 access: No charge, no settlement. The vault enforced the revocation immediately.
- HRKey may offer the employer a credit or new consent request flow. This is a commercial decision.

### 5.5 Capability Issuance and Enforcement Timeline

```
Consent Lifetime
├──────────────────────────────────────────────────────────────┤
│  consent.issued_at                           consent.expires_at  │
│  2026-02-10T12:00:00Z                       2026-03-10T00:00:00Z │

    Capability 1 (1-hour window)
    ├──────────┤
    │ 12:01    │ 13:01
    │ issued   │ expires
    │          │
    │  ACCESS  │  DENY(EXPIRED)
    │  ALLOW   │

         Capability 2 (minted later, 30-min window)
         ├─────┤
         │14:00│14:30
         │     │
         │ALLOW│DENY(EXPIRED)

                   Capability 3 (with not_before gate)
                        ├──────────┤
                   not_before  expires_at
                   15:00       16:00
                   │           │
              DENY(before)  ALLOW(in window)  DENY(EXPIRED)
```

**Key properties:**
- Multiple capabilities can be minted from a single consent.
- Each capability has an independent temporal window that must be ⊆ the parent consent window.
- Capabilities attenuate — they can narrow scope, permissions, and time, but never expand.
- Revocation of any single capability does not affect other capabilities derived from the same consent.
- Revocation of the consent itself (via a new consent object with `action: "revoke"`) invalidates the authorization basis for all derived capabilities.

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Consent Object** | Immutable, hash-bound authorization record from subject to grantee |
| **Capability Token** | Portable, attenuated proof of authorization derived from a consent object |
| **Pack Manifest** | Immutable collection of field references with aggregate hash |
| **SDL Path** | Semantic field identifier (e.g., `work.reference.manager.name`) |
| **Scope Containment** | Invariant: capability scope must be a subset of consent scope |
| **Non-custodial** | No intermediary holds funds on behalf of participants |
| **Replay Protection** | 256-bit `token_id` nonce prevents same capability from being used twice |
| **Revocation** | Immediate invalidation of a capability token; next access returns `DENY(REVOKED)` |

## Appendix B: Anti-Patterns

The following patterns are explicitly prohibited under this economic model:

1. **Consent-as-a-service.** Charging candidates to grant consent violates sovereignty. Consent is always free.
2. **Revocation fees.** Charging to revoke access violates the right to withdraw. Revocation is always free and immediate.
3. **Zero candidate share.** Any model where the data owner receives 0% of access revenue violates the protocol's economic design.
4. **Data caching beyond token lifetime.** Persisting resolved field data past `expires_at` violates the temporal bound guarantee.
5. **Scope laundering.** Minting a narrow capability, receiving data, then sharing it outside the original scope. Each new recipient requires a new consent chain.
6. **Silent re-consent.** Auto-renewing consent without explicit candidate action. Each consent grant must be a deliberate sovereign act.
