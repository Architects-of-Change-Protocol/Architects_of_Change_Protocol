# AOC Market Maker v1 — Canonical End-to-End Flow Template (One Slide)

Use this template for any domain-specific market maker (health, education, finance) built on AOC v0.1.

Replace placeholders:
- **[SUBJECT]**: person or entity whose data is shared
- **[ISSUER]**: third-party attester (provider/school/bank/etc.)
- **[BUYER]**: relying party requesting access
- **[MARKET_MAKER]**: domain operator integrating request, pricing, and delivery
- **[PACK_TYPE]**: data product name
- **[PURPOSE_CODE]**: constrained purpose value
- **[SUBJECT_SHARE] / [MM_SHARE] / [PROTOCOL_SHARE]**: fee shares (e.g., 0.70P / 0.20P / 0.10P)

```text
┌────────────────────────── Wallet-controlled ───────────────────────────┐
│ [SUBJECT] wallet: key custody, scope selection, consent, revocation    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌────────────────────┐      ┌──────────────┐
│ [ISSUER]    │      │ [MARKET_MAKER]     │      │ [BUYER]      │
│ (attester)  │      │ (orchestrator)     │      │ (requester)  │
└─────┬───────┘      └──────────┬─────────┘      └──────┬───────┘
      │                         │                       │
      │ (2) signed attestation  │                       │
      ▼                         │                       │
┌─────────────────────────────────────────────────────────────────────────┐
│ AOC Protocol (vault / consent / capability)                            │
│ Enforces: hashes, signatures, consent invariants, capability invariants│
└─────────────────────────────────────────────────────────────────────────┘
      ▲                         ▲                       │
      │ (1) data creation       │ (4) consent relay     │ (3) request([PACK_TYPE],[PURPOSE_CODE],ttl,price)
      │ signed records + hashes │ + payout preview      │
      │                         │                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ (5) Payment on approval: [BUYER] pays P                                │
│     P -> [SUBJECT_SHARE] [SUBJECT] | [MM_SHARE] [MARKET_MAKER]         │
│          | [PROTOCOL_SHARE] protocol fee endpoint                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ (6) capability mint (only if consent + payment success)
                              ▼
                  [BUYER] receives scoped, expiring, audience-bound capability
                              │
                              │ (7) access request with capability token
                              ▼
                  [MARKET_MAKER]/AOC returns signed [PACK_TYPE] + provenance hashes

Boundaries

Wallet controls: approve/deny, scope, expiry acceptance, revocation, key custody.

[MARKET_MAKER] does: request lifecycle, pricing, payment routing, deterministic pack assembly.

AOC enforces: consent validity, capability checks (audience/scope/expiry/nonce), integrity verification.

Trust checks happen at creation, attestation, mint, and access.

Money moves once per approved request, before capability activation.

Caption template (plain English)

[BUYER] submits a scoped request to [MARKET_MAKER], [SUBJECT] approves exact disclosure terms in wallet, payment is split, AOC mints a constrained capability after payment success, and [BUYER] redeems that capability to receive a signed, hash-verifiable [PACK_TYPE].

Why Web2 cannot easily copy this

Web2 can copy interface flow, but cannot replicate protocol-level enforcement where user-held keys, portable consent artifacts, and capability invariants are cryptographically verifiable across organizations without centralized custody.

5-Step Buyer-Facing Explanation (for procurement teams)

Define the request scope before purchase
[BUYER] selects [PACK_TYPE], [PURPOSE_CODE], required fields, and access duration. Pricing is shown up front.

Submit request to [MARKET_MAKER]
[BUYER] sends a request with organization identity, purpose, and commercial terms. No data is released at this stage.

Wait for subject-controlled consent
[SUBJECT] receives the exact request in wallet and can approve or deny. Approval fixes scope and expiry for downstream access.

Settle payment and receive capability
On approval, [BUYER] pays P; payout is split per policy ([SUBJECT_SHARE], [MM_SHARE], [PROTOCOL_SHARE]). AOC mints a scoped, expiring, audience-bound capability only after payment success.

Redeem capability and ingest evidence
[BUYER] redeems capability to retrieve signed [PACK_TYPE] data plus provenance hashes/signatures for audit, compliance, and vendor-risk review.
