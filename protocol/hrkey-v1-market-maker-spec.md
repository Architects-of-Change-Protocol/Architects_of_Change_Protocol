# HRKey v1 — Market Maker Specification on AOC v0.1
**Version:** 1.0 (implementation target)  
**Status:** Ready-for-build definition  
**Protocol dependency:** AOC Protocol v0.1 (unchanged)

---

## 1) Purpose and Non-Goals

### Purpose
HRKey v1 is a production market maker for employment-related trust data. It monetizes high-confidence, consented access to candidate employment verification packs and referee-verified signals for hiring workflows.

### Non-Goals
- No changes to AOC core primitives, cryptography, or consent model.
- No custodial wallet balances or HRKey-held user funds.
- No speculative token design.
- No broad “social graph scraping” or unbounded profiling.

---

## 2) Exact v1 Data Scope (What Is Monetized)

HRKey monetizes **time-scoped access to verification-grade data packs** assembled from candidate-controlled vault records and third-party attestations.

### 2.1 Monetized data products

1. **Employment Verification Pack (EVP)**
   - Prior employment episodes (employer legal name, role title, start/end dates, employment type).
   - Compensation band proofs (optional; range-level only in v1).
   - Separation reason class (optional, enumerated categories only).
   - Source quality labels (self-asserted, employer-issued, referee-verified).

2. **Professional Reference Pack (PRP)**
   - Referee identity and relationship metadata.
   - Structured reference responses (rating scales + constrained free text length).
   - Timestamped attestation signatures.
   - Integrity hash chain for tamper-evident provenance.

3. **Risk and Consistency Signals (RCS)**
   - Deterministic conflict checks (e.g., impossible date overlaps).
   - Coverage scores (how much of claimed history is evidenced).
   - Freshness indicators (age of latest attestation).
   - No opaque ML score in v1; only deterministic and explainable metrics.

### 2.2 Data explicitly out of scope in v1
- Raw payroll exports and full payslips.
- Health, biometric, or unrelated sensitive categories.
- Open-ended background investigations.
- Behavioral surveillance, scraped social activity, or inferred psychometrics.

---

## 3) Actor Model

1. **Candidate (Data Subject + Wallet Owner)**
   - Owns vault contents and private keys.
   - Approves or denies each access request.
   - Receives the primary payout from paid accesses.

2. **Employer / Recruiter (Data Consumer)**
   - Pays for access to specific HRKey data products.
   - Submits purpose-bound request definitions.
   - Receives capability-limited access after candidate consent.

3. **Referee (Attestation Issuer)**
   - Signs reference statements and relationship claims.
   - Does not gain default read access to candidate vault.
   - May optionally receive issuer incentives if configured by HRKey policy.

4. **HRKey (Market Maker / Integrator)**
   - Publishes schema templates and pricing schedules.
   - Operates request orchestration, validation, and billing rails.
   - Never takes custody of candidate assets.

5. **AOC Protocol (Trust and Control Plane)**
   - Provides pack structure, consent semantics, capability lifecycle, and auditability.
   - Enforces non-custodial wallet-mediated authorization.

---

## 4) Economic Flow (Who Pays Whom, When, and For What)

### 4.1 Chargeable events

1. **Paid Access Grant (core revenue event)**
   - Trigger: employer submits request, candidate approves, capability is minted.
   - Buyer pays per granted access (one-time or time-boxed capability SKU).

2. **Paid Re-access / Refresh**
   - Trigger: prior capability expires or new data version required.
   - New payment required unless package includes refresh rights.

3. **Optional Premium Processing (B2B)**
   - Trigger: employer selects SLA tier (e.g., expedited reference chase).
   - Charged to employer only; does not reduce candidate payout share.

### 4.2 Free events
- Candidate vault setup and self-data entry.
- Candidate review of incoming requests.
- Candidate rejection/expiry of requests.
- Consent revocation before access execution.
- Referee attestation submission (base path) unless explicit paid program exists.

### 4.3 Fee split model (v1 baseline)

For each paid access transaction amount `P`:
- **Candidate payout:** `Pc = P * 0.70`
- **HRKey market maker fee:** `Pm = P * 0.20`
- **AOC protocol fee:** `Pp = P * 0.10`

Constraints:
- Split is computed and displayed before candidate approval.
- Payment executes atomically with access entitlement issuance where possible.
- If payment settlement fails, capability must not be activated.

### 4.4 Settlement sequence

1. Employer signs purchase intent for specific pack + purpose + duration.
2. Candidate consents in wallet with visible payout and scope.
3. Payment rails settle `P` to destinations (candidate wallet + fee recipients).
4. On successful settlement, capability token becomes active.
5. Employer retrieves pack according to capability scope.

### 4.5 Refund and dispute boundary
- If candidate approved and data delivered within scope, refund is policy-based, not automatic.
- If delivery fails (integrity mismatch or unavailable data), capability is voided and buyer refunded per contract.
- Revocation after successful delivery does not retroactively claw back already delivered data usage rights.

---

## 5) Mapping AOC Primitives to HRKey Actions

### 5.1 Pack creation
- **AOC primitive:** Signed response pack generation.
- **HRKey action:** Build EVP/PRP/RCS pack from candidate-approved fields + attestations.
- **Implementation notes:**
  - Deterministic resolver mapping only.
  - Include provenance metadata, issuer signature references, and pack hash.
  - Store pointer/index metadata in wallet-friendly format.

### 5.2 Consent grant
- **AOC primitive:** Consent object.
- **HRKey action:** Candidate grants purpose-bound consent for named employer, pack type, and duration.
- **Required consent fields:**
  - Requester identity
  - Purpose code (e.g., hiring verification)
  - Data scope (fields/sections)
  - Duration / expiry
  - Monetization terms and split preview

### 5.3 Capability minting
- **AOC primitive:** Capability token + revocation mechanism.
- **HRKey action:** Mint least-privilege, time-limited capability after successful payment + consent.
- **Rules:**
  - One capability per approved request ID.
  - Non-transferable and audience-bound to requester identity.
  - Revocable by candidate under AOC revocation semantics.

### 5.4 Access request
- **AOC primitive:** Request + policy evaluation against consent and capability.
- **HRKey action:** Employer requests access using capability token.
- **Evaluation gates:**
  - Capability validity (signature, expiry, audience)
  - Purpose match
  - Scope match
  - Replay protection (nonce/request ID constraints)

---

## 6) Operational Flow (End-to-End v1)

1. Candidate links wallet and imports/emits employment records.
2. Candidate invites referees or receives issuer attestations.
3. Employer submits HRKey request template selection + payment intent.
4. Wallet displays request details, payout split, and consent terms.
5. Candidate approves (or rejects).
6. HRKey triggers settlement and mints capability on success.
7. Employer redeems capability and receives signed pack.
8. Audit events are recorded for grant/redeem/revoke lifecycle.

---

## 7) Abuse Boundaries and Security Economics

### 7.1 HRKey allows but does not subsidize
- High-volume employer querying is allowed only as paid requests.
- Repeated refresh requests are allowed but separately billable.
- Candidate may over-share if they choose; HRKey provides warnings but no forced paternalism.
- Referees may submit low-value references; acceptance depends on deterministic quality thresholds.

### 7.2 Non-profitable-by-design attack surfaces

1. **Mass fishing by employers**
   - Each access costs money; consent required per candidate.
   - No free bulk API for undisclosed purposes.

2. **Replay of old authorization**
   - Expiring, audience-bound capabilities and nonce constraints limit replay utility.

3. **Tampering with delivered data**
   - Signed packs + hash integrity checks make tampering detectable and commercially useless.

4. **Synthetic referee farms**
   - Referee identity + relationship constraints + issuer reputation weights reduce payout viability.
   - Low-trust attestations reduce product grade, reducing buyer willingness to pay.

5. **Scope creep post-consent**
   - Capability scope is fixed at mint time; extra fields require new paid request and consent.

### 7.3 Explicit risk acceptance in v1
- Off-platform collusion (candidate + referee) cannot be fully eliminated; mitigated by multi-source consistency checks.
- Legal/process misuse by employers outside protocol cannot be technically prevented; mitigated through contracts, audit trails, and revocation of future access.

---

## 8) Build Requirements for Engineering

### 8.1 Core modules
- Request Intake Service (employer API)
- Consent Orchestration Service (wallet callback + request state machine)
- Pricing and Settlement Service (non-custodial disbursement routing)
- Pack Assembler (deterministic resolver + provenance packager)
- Capability Service (mint/redeem/revoke integration with AOC)
- Audit and Evidence Store (event logs + integrity proofs)

### 8.2 Minimum production controls
- Idempotent transaction processing for payment + capability lifecycle.
- Strict schema version pinning for data products.
- Cryptographic signature verification at every ingress.
- PII-minimized logging defaults.
- Per-request trace IDs and auditable state transitions.

### 8.3 External integration contract (partner-facing)
- OpenAPI for request submission and status polling.
- Webhook callbacks for consent outcome and delivery readiness.
- Capability redemption endpoint with deterministic error objects.
- Versioned product catalog (EVP/PRP/RCS SKUs + price schedule + SLA terms).

---

## 9) Investor-Readable Unit Economics Frame (No Token Dependency)

- Revenue unit: paid access grant.
- Cost drivers: verification operations, referee outreach, support/disputes, compliance operations.
- Margin lever: increase high-confidence data coverage while reducing manual operations.
- Defensibility: trust provenance graph + consented access rails + deterministic integrity guarantees.
- Regulatory resilience: user-controlled consent artifacts and explicit auditability lower governance risk.

---

## v1 Summary

HRKey v1 is a non-custodial employment verification market maker on AOC where employers pay per consented access, candidates receive the majority payout, protocol and market-maker fees are explicit, capabilities are least-privilege and time-bound, and abuse is constrained by making unauthorized or low-trust behavior economically unattractive.
