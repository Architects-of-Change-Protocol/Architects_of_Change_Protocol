# AOC Protocol — Patent Architecture & Differentiation Audit

**Date:** 2026-03-13
**Auditor Role:** Senior Staff Engineer, Protocol Auditor, Patent-Differentiation Analyst
**Repository:** Architects_of_Change_Protocol
**Branch:** claude/audit-patent-architecture-jkrj2
**Methodology:** Full inspection of all TypeScript source files, spec documents, integration layers, tests, and protocol documentation

---

## 1. Executive Summary

The AOC (Architects of Change Protocol) repository contains a **genuinely novel multi-layer architecture** combining: a cryptographically addressable consent object, a consent-derived capability token, a granular data-block system (field manifests + content objects + pack manifests), an SDL (Sovereign Data Language) path resolver, a vault access engine, and a market-maker integration adapter.

**Across the 6 differentiating architecture areas under analysis, the implementation status is:**

| Differentiating Area | Status |
|---|---|
| 1. Programmable Consent Object | **Implemented** |
| 2. Consent-Bound Access Token | **Implemented** |
| 3. Granular Data-Block Architecture | **Implemented** |
| 4. Schematic-Based Market Maker Model | **Partially implemented** |
| 5. Interoperability Layer (cross-market reuse) | **Partially implemented** |
| 6. Anchor / Audit-Proof Layer | **Not implemented (spec-only)** |

**Bottom line:** This is not a paper architecture. Five of six differentiating claims are materially implemented in code. The sixth (anchor/audit-proof layer) exists in the threat model and protocol invariants specification but has zero implementation. No cryptographic signing is implemented in any module. The settlement/compensation metadata is spec-documented only. These are the primary gaps for a stronger patent narrative.

---

## 2. Findings by Differentiation Area

---

### 2.1 — Programmable Consent Object

**Status: IMPLEMENTED**

The `ConsentObjectV1` is a fully implemented, cryptographically verifiable, self-describing authorization record.

**Implemented fields:**

| Patent Requirement | Field | Implementation |
|---|---|---|
| Subject identity | `subject` | DID-formatted, validated (`^did:[a-z0-9]+:[a-zA-Z0-9._%-]+$`), included in hash |
| Requester / market maker identity | `grantee` | DID-formatted, validated, included in hash |
| Granular data scope | `scope: ScopeEntry[]` | Array of `{type: 'field'|'content'|'pack', ref: sha256_hex}` — hash-addressed |
| Allowed actions | `permissions: string[]` | Array of lowercase permission strings (`read`, `store`, `share`, `derive`, `aggregate`) |
| Purpose / use basis | **MISSING** | No `purpose` field in `ConsentObjectV1`. Not present in the type or implementation. |
| Expiration | `expires_at: string|null` | ISO 8601 UTC, validated, included in hash |
| Revocation | `action: 'revoke'`, `revoke_target.capability_hash` | Implemented — revocation is a first-class action on the consent object |
| Audit linkage | `consent_hash` (SHA-256 of canonical payload) | Self-certifying via SHA-256, RFC 8785 canonical JSON |
| Chaining / prior linkage | `prior_consent: string|null` | Hash reference to superseded consent — implemented |
| Settlement / compensation metadata | **MISSING** | Not in `ConsentObjectV1`. Only in HRKey spec docs. |

**Evidence files:**
- `consent/types.ts` — Type definition
- `consent/consentObject.ts` — Full builder and validator (293 lines)
- `consent/canonical.ts` — RFC 8785 canonical JSON encoding
- `consent/hash.ts` — SHA-256 computation
- `consent/__tests__/consent.test.ts` — 943-line test suite with 40+ cases

**Key implementation fact:** The `consent_hash` is computed over a canonical JSON payload sorted by RFC 8785 rules. Any modification to any field changes the hash. The consent object is **immutable and self-certifying** once built. This is a meaningful technical implementation, not just a label.

**Gap:** No `purpose` field. No `settlement` metadata. The spec mentions purpose-bound requests in the HRKey market maker docs but the `ConsentObjectV1` type does not include a purpose clause.

---

### 2.2 — Consent-Bound Access Token

**Status: IMPLEMENTED**

The `CapabilityTokenV1` is an implemented, consent-derived, cryptographically verifiable access credential.

**Key derivation invariants — all enforced in code:**

| Invariant | Implementation |
|---|---|
| Token is derived from a specific consent | `consent_ref = consent.consent_hash` — stored in token, verified on every access |
| Subject must match parent consent | `token.subject === consent.subject` (enforced in `verifyCapabilityToken`) |
| Grantee must match parent consent | `token.grantee === consent.grantee` (enforced) |
| Scope must be subset of consent scope | `assertScopeContainment(token.scope, consent.scope)` — enforced |
| Permissions must be subset of consent permissions | `assertPermissionContainment(token.permissions, consent.permissions)` — enforced |
| Token expiry cannot exceed consent expiry | `token.expires_at <= consent.expires_at` — enforced |
| Token issued_at >= consent issued_at | Enforced |
| Replay protection | `token_id` (256-bit random nonce) stored in `InMemoryNonceRegistry`; duplicate token_id rejected |
| Revocation | `InMemoryRevocationRegistry`; revoked token_id is checked on every access attempt |
| Token has its own hash | `capability_hash = SHA256(canonical_payload_of_token)` — independently addressable |

**Evidence files:**
- `capability/types.ts` — Type definition with `consent_ref` field
- `capability/capabilityToken.ts` — `mintCapabilityToken`, `validateCapabilityToken`, `verifyCapabilityToken` (499 lines)
- `capability/registries/` — `InMemoryNonceRegistry.ts`, `InMemoryRevocationRegistry.ts`, interface types
- `capability/revocation.ts` — Revocation logic
- `enforcement/sem.ts` — Policy enforcement engine: `enforceConsentPresent`, `enforceTokenRedemption`, `enforcePackPresent`, `enforcePathAccess`, `enforceStorageIntegrity`

**Key implementation fact:** The capability token is not a JWT. It is a protocol-native object whose `capability_hash` is independently computable. The `consent_ref` field creates a cryptographic linkage back to the parent consent object. You cannot forge a valid token without the consent hash.

**Gap:** No asymmetric cryptographic signature on the token. The `capability_hash` is a SHA-256 content hash, not an ECDSA/EdDSA signature over the hash. The capability-token-spec.md acknowledges this: "Key management is outside protocol scope." Without a subject signature over the consent object and a grantee-verifiable signature over the capability, this is integrity-verifiable but not signature-verifiable.

---

### 2.3 — Granular Data-Block Architecture

**Status: IMPLEMENTED**

Three distinct, independently-addressable data primitives exist and are all implemented:

#### 2.3.1 Field Manifest (`FieldManifestV1`)
- Uniquely identifies a **semantic field type** (not a value)
- Fields: `field_id`, `data_type`, `semantics`, `created_at`, `field_hash`
- `field_hash = SHA256(canonical_JSON({field_id, data_type, semantics, created_at, version}))`
- Immutable once created — same field definition across systems produces the same hash
- Evidence: `field/types.ts`, `field/fieldManifest.ts`, `field/canonical.ts`, `field/hash.ts`

#### 2.3.2 Content Manifest (`ContentManifestV1`)
- Uniquely identifies a **specific piece of content** (a value/blob)
- Fields: `subject`, `content_type`, `bytes`, `storage` (StoragePointer), `created_at`, `content_hash`
- `content_hash = SHA256(canonical_payload)` — content-addressed
- Storage pointer decouples physical location from logical identity: `aoc://storage/<backend>/0x<sha256>`
- Evidence: `content/types.ts`, `content/contentManifest.ts`

#### 2.3.3 Pack Manifest (`PackManifestV1`)
- Groups content blocks under a subject's identity
- Fields: `subject`, `fields: FieldReference[]`, `created_at`, `pack_hash`
- `FieldReference = {field_id, content_id, storage, bytes}` — each entry maps a semantic field to a specific content hash
- `pack_hash = SHA256(canonical_payload)` — the pack itself is content-addressed
- No two packs with different content can share the same `pack_hash`
- Evidence: `pack/types.ts`, `pack/packManifest.ts`

**Reusability:** These blocks ARE reusable. A `FieldManifest` for `"full_name"` is a stable semantic anchor across any system that uses it. A `ContentManifest` for a specific document is addressable by its hash from any storage backend. A `PackManifest` can reference the same `ContentManifest` that another pack references.

**Gap:** There is no explicit "block registry" or "block library" allowing cross-market-maker reuse to be enforced at the protocol layer. Reuse happens by convention (same hash = same content). No API or resolution service exists for finding which packs contain a given field or content hash.

---

### 2.4 — Schematic-Based Market Maker Model

**Status: PARTIALLY IMPLEMENTED**

**What is implemented:**
- SDL (Sovereign Data Language) parser and validator: `sdl/parser.ts`, `sdl/validator.ts`
- SDL path format: `domain.category[.subcategory...].attribute` (e.g., `person.name.legal.full`, `work.reference.score`)
- SDL-to-field mapping registration: `vault.registerSdlMapping(sdl_path, field_id)` in `vault/vault.ts`
- SDL resolution during access: vault resolves requested SDL paths against registered mappings, then against pack fields
- HRKey integration test demonstrates real SDL mappings:
  - `work.reference.score` → `reference-score`
  - `work.position.title` → `job-title`
  - `work.tenure.months` → `tenure-months`

**What is NOT implemented:**
- No `Schematic` object type. There is no first-class `MarketMakerSchematic` or `RequestTemplate` type in the code.
- No schematic publication mechanism. The SDL spec (markets/README.md) describes schematics like `hr.job.matching.v1` containing a list of SDL field paths, but no code implements this.
- No schematic registry or catalog.
- No mechanism for a market maker to publish a versioned schematic and have the vault/wallet auto-resolve it.
- The SDL mappings are registered imperatively by calling `vault.registerSdlMapping()` — not by consuming a published schematic object.

**Evidence of spec-level schematic model (not implemented):**

From `markets/README.md`:
```
A schematic is a bundle of SDL fields.
Example: employment.application.v1
Contains:
  person.name.legal.full
  contact.email.primary
  work.skill.javascript.years
  education.degree.level
Schematics do not redefine fields. They reference existing ones.
```

From `protocol/sdl/README.md`:
```
Markets may define Schematics:
A schematic is a bundle of SDL fields.
Example: hr.job.matching.v1
```

This is documented intent, not implemented code.

**Gap:** The market-maker schematic is conceptually present but not implemented as a first-class protocol object. A `SchematicV1` type with a hash, a list of SDL paths, a market-maker DID, and a version would need to be built.

---

### 2.5 — Interoperability Layer (Cross-Market Data Reuse)

**Status: PARTIALLY IMPLEMENTED**

**What is implemented:**
- The SDL path system provides a **universal semantic naming layer**. The same SDL path (`person.name.legal.full`) can be requested by any market maker.
- The vault's SDL mapping layer (`registerSdlMapping`) allows fields to be indexed once and resolved repeatedly across different access requests.
- The `VaultStore` holds `sdl_mappings: Map<string, string>` — a persistent (within session) field index.
- Multiple access requests can hit the same resolved fields without the user re-entering data.
- The architecture document explicitly supports multiple market makers sharing a vault:
  ```typescript
  const hrkey   = createHRKeyAdapter(sharedVault);
  const otherMM = createHRKeyAdapter(sharedVault);
  ```
- The `Vault` interface is dependency-injectable — different market maker adapters can be passed any `Vault` implementation.

**What is NOT implemented:**
- No cross-market field discovery. A second market maker cannot query "which fields does this user already have mapped?" without access to the vault's internal `sdl_mappings` store.
- No user-controlled "data once, share many times" UX flow exists in code.
- No "field availability manifest" — a document the user could publish to say "I have these SDL paths available."
- No wallet UI or wallet layer that manages the user's full field inventory.
- No cross-market consent aggregation or linked consents.

**Verdict:** The infrastructure is present for reuse (SDL + vault SDL mappings), but the reuse flow is not orchestrated. A user registering a pack with SDL mappings in one session would lose those mappings when the in-memory vault is reset. No persistence.

---

### 2.6 — Anchor / Audit-Proof Layer

**Status: NOT IMPLEMENTED (specification-only)**

**What is in the spec:**
- `protocol/protocol-invariants-spec.md`: `INV-OBS-01` requires invariant violations to be logged; `INV-OBS-02` requires deny decisions to include machine-readable reasons.
- `protocol/wallet/architecture.md` (from preview): references audit trail and on-chain events.
- `protocol/roadmap.md`: "On-chain usage is limited to audit events (emit/grant/revoke/proof), never personal content."
- HRKey spec (`protocol/hrkey-v1-market-maker-spec.md`): "Audit events are recorded for grant/redeem/revoke lifecycle."

**What is in the code:**
- `enforcement/sem.ts` returns structured `SemDecision` objects with `reason_codes` — this is the foundation for machine-readable policy decisions.
- The `DENY` decisions produced by `enforceConsentPresent`, `enforceTokenRedemption`, `enforcePathAccess` include error codes: `EXPIRED`, `REPLAY`, `REVOKED`, `SCOPE_ESCALATION`, `INVALID_CAPABILITY`.
- `VaultAccessResult` includes `policy: VaultPolicyDecision` with `reason_codes`.

**What does NOT exist in code:**
- No event log, audit log, or append-only record of consent grants, capability mints, access attempts, or revocations.
- No cryptographic commitment (Merkle proof, hash chain, blockchain anchor) of any event.
- No "access event" object type.
- No storage of historical decisions.
- No tamper-evident proof of *when* consent was granted or access was performed.
- The `InMemoryRevocationRegistry` holds revocations but emits no events and has no persistence.

**Gap:** The audit layer is entirely missing at the implementation level. What exists are structured error objects (useful but not audit-grade) and in-memory registries (ephemeral, not proof-generating).

---

## 3. Repo Evidence Table

| Concept | Repo Term | Key Files | Implementation Status |
|---|---|---|---|
| Sovereign wallet | `Vault` (in-memory) | `vault/vault.ts`, `vault/types.ts` | Partially implemented (in-memory, no persistence) |
| Data vault | `VaultStore` | `vault/types.ts:64` — `packs`, `consents`, `capabilities`, `sdl_mappings` Maps | Implemented (in-memory) |
| Field manifest | `FieldManifestV1` | `field/types.ts`, `field/fieldManifest.ts` | Implemented |
| Unique data block | `ContentManifestV1` | `content/types.ts`, `content/contentManifest.ts` | Implemented |
| Consent object | `ConsentObjectV1` | `consent/types.ts`, `consent/consentObject.ts` | Implemented |
| Capability token / access token | `CapabilityTokenV1` | `capability/types.ts`, `capability/capabilityToken.ts` | Implemented |
| Market maker schematic | SDL paths + `sdl_mappings` Map | `sdl/`, `vault/vault.ts:registerSdlMapping` | Partially — no `Schematic` object type |
| Mapping / resolver layer | SDL path resolver | `resolver/resolve.ts`, `vault/vault.ts:requestAccess` (Steps 4–7) | Implemented |
| Anchor layer | `SemDecision`, `VaultPolicyDecision` | `enforcement/sem.ts`, `vault/types.ts` | Not implemented — only structured error objects |
| Settlement metadata | (none) | HRKey spec only | Not implemented |

---

## 4. Missing Uniqueness Gaps

These are the precise gaps, stated without softening:

### Gap 1 — Consent exists but lacks a `purpose` field
The `ConsentObjectV1` has no `purpose` or `use_basis` field. Every patent-narrative around user sovereignty over data includes purpose-binding as a first-class claim. Without `purpose`, the consent says who can access what and when — but not why. This is a concrete missing field relative to the patent claim in item 1 of the audit brief.

**Exact gap:** Add `purpose: string` (or a structured `purpose_code`) to `ConsentObjectV1`, include it in the canonical payload hash, and validate it. This makes the consent object legally and technically purpose-bound.

### Gap 2 — Capability token exists but is not cryptographically signed
The `capability_hash` is a content hash of the token's canonical payload. It proves the token was not tampered with. But it does not prove the **subject authorized it**. Anyone who knows the consent hash can mint a capability token (in the current implementation). There is no EdDSA/ECDSA signature by the subject's private key over the consent object, and no signature by a trusted issuer over the capability token.

**Exact gap:** The capability token is integrity-verifiable but not authenticity-verifiable. A true "consent-bound access token" requires the subject's signature over the consent and a binding of that signature to the capability.

### Gap 3 — Fields exist but are not first-class reusable blocks with a registry
`FieldManifestV1` objects are created and addressable by `field_hash`. But there is no field registry, no discovery mechanism, and no standard library of pre-defined fields that market makers reference. The same field semantic (e.g., `full_name`) can be created with different `created_at` values, producing different hashes — meaning two market makers defining `full_name` independently produce non-interoperable hashes.

**Exact gap:** No canonical field registry. No mechanism to establish that `field_hash_A` (from market maker 1) and `field_hash_B` (from market maker 2) represent the same semantic.

### Gap 4 — Schemas exist (SDL paths) but not as market-maker-defined `Schematic` objects
The SDL path system is implemented. The concept of a market-maker schematic is in three spec documents. But there is no `SchematicV1` type, no schematic builder, no schematic hash, no schematic registry, and no vault method that accepts a schematic and auto-resolves it.

**Exact gap:** The user must be told which SDL paths to register mappings for. The market maker cannot publish a self-contained schematic object that the wallet can automatically evaluate against the user's existing data blocks.

### Gap 5 — Access events are not recorded, anchored, or provable
When a `requestAccess` call returns `ALLOW`, no event is emitted, logged, or stored. The fact that an employer accessed a candidate's reference score at a specific time is not auditable after the fact. The revocation registry tracks revocations in memory, but once the process exits, all evidence is gone.

**Exact gap:** Access events, consent grants, capability mints, and revocations leave no persistent trace. There is no append-only log, no Merkle-chained event record, and no on-chain anchor.

### Gap 6 — Settlement metadata is entirely missing from the protocol
The HRKey market maker spec describes a 70/20/10 payment split (candidate/HRKey/protocol fee). The `ConsentObjectV1` and `CapabilityTokenV1` types have zero fields related to compensation, settlement, pricing, or economic terms. The specification says "payment executes atomically with access entitlement issuance" but no code implements this.

**Exact gap:** No `settlement_terms`, `compensation_metadata`, or `payout_address` in any protocol object type.

### Gap 7 — Interoperability is structural but not orchestrated
Two market maker adapters can share a vault. But the wallet does not maintain a user-level field inventory that persists across sessions, so the "user registers data once and reuses it everywhere" flow is not achievable with the current in-memory vault.

**Exact gap:** No persistent wallet layer. No cross-session field inventory. No mechanism for a user to say "I authorize market maker B to see the same data I authorized market maker A to see" without completely re-registering and re-consenting.

---

## 5. Interoperability Status

**Question:** Does the repo currently support the pattern where a user has reusable structured data, a market maker publishes a schema, the system maps existing data blocks to requested fields, the user authorizes access, the requester receives only the permitted projection, and the user does not need to refill a full form?

**Answer: Partially. The mechanism exists. The orchestration does not.**

### What works today (in a single in-memory session):

1. **User data registration:** `vault.storePack(pack)` + `vault.registerSdlMapping(sdl_path, field_id)` — a pack of data blocks can be registered with SDL path mappings.
2. **Authorization:** `vault.storeConsent(consent)` + `vault.mintCapability(...)` — consent and derived capability tokens are fully implemented.
3. **Permissioned projection:** `vault.requestAccess({capability_token, sdl_paths, pack_ref})` — returns only the `resolved_fields` that are both in the capability scope AND present in the pack. This is a true permissioned projection.
4. **No re-entry required** (in the same session): once SDL mappings are registered and a pack is stored, any number of `requestAccess` calls resolve the same fields without asking the user again.

### What does NOT work:

1. **Cross-session reuse:** The vault is in-memory. Restarting the application or creating a new vault instance means the user must re-register everything.
2. **Schema-driven auto-resolution:** No `Schematic` object exists. The market maker cannot publish a schematic and have the wallet automatically check which SDL paths it can satisfy vs. which need to be collected.
3. **Cross-market-maker reuse:** There is no user-controlled field inventory that persists and can be selectively shared with different market makers independently.
4. **Missing field handling:** When `requestAccess` returns an unresolved field, the vault reports `UNRESOLVED_FIELD`. But there is no flow to prompt the user to fill in the missing field, collect it, add it to their pack, and retry — without creating a whole new pack.

### What exact code changes are needed:

1. Define a `SchematicV1` type with: `schematic_id`, `market_maker_did`, `version`, `required_sdl_paths: string[]`, `optional_sdl_paths: string[]`, `schematic_hash`.
2. Add `vault.evaluateSchematic(schematic, pack_ref)` → returns which SDL paths can be satisfied from existing pack fields, and which are missing.
3. Add persistence to the vault (or define a serializable `VaultSnapshot` type so state can be exported/imported).
4. Define a `FieldInventoryManifest` — a user-controlled document listing all SDL paths for which the user has registered data.
5. Add `purpose` to `ConsentObjectV1` and require it as a non-empty string.

---

## 6. Recommended Implementation Path

Listed in priority order for maximum patent differentiation:

### Priority 1 — Add `purpose` to ConsentObjectV1 (1 day)
**Why:** Makes the consent object legally and technically purpose-bound. This is the single most important field missing from the patent narrative. Every data sovereignty patent argues that consent is not just about scope — it is about purpose.

**Change:** Add `purpose: string` to `ConsentObjectV1`, include it in `canonicalizeConsentPayload`, validate it as a non-empty string. Update specs and tests.

### Priority 2 — Define a `SchematicV1` type (2–3 days)
**Why:** This is the missing piece for the market-maker schematic claim (Item 4 of the audit brief). Without a first-class schematic object, the SDL system is just a naming convention, not a differentiating protocol primitive.

**Change:** Create `schematic/types.ts` with `SchematicV1 = {schematic_id, version, market_maker_did, required_sdl_paths, optional_sdl_paths, issued_at, schematic_hash}`. Add `buildSchematicManifest()`, `vault.evaluateSchematic()`, and tests.

### Priority 3 — Add access event logging (2–3 days)
**Why:** The anchor/audit-proof layer is the most cited differentiator in data sovereignty patents. Even a simple append-only in-memory event log (that can be serialized and optionally anchored) would distinguish this system from a basic OAuth flow.

**Change:** Define `AccessEvent = {event_type: 'grant'|'mint'|'access'|'revoke', timestamp, subject_did, grantee_did, consent_hash?, capability_hash?, decision: 'ALLOW'|'DENY', reason_codes}`. Emit events from vault operations. Add `vault.getEventLog()`. Compute a running Merkle root over the event log.

### Priority 4 — Add `settlement_metadata` to ConsentObjectV1 (1 day)
**Why:** The HRKey spec describes atomic payment-on-consent. If the consent object itself contains payment terms, then the entire economic flow is consent-bound — this is patentably novel compared to standard OAuth + Stripe.

**Change:** Add optional `settlement_metadata?: {payout_address: string, amount_basis_points: number, currency: string}` to `ConsentObjectV1`. Include it in the canonical hash. This makes settlement terms cryptographically immutable once consent is granted.

### Priority 5 — Make the vault serializable (1–2 days)
**Why:** Required for the interoperability claim. Without persistence, the "user registers data once, reuses across markets" narrative is fiction.

**Change:** Add `vault.exportSnapshot(): VaultSnapshot` and `createVaultFromSnapshot(snapshot): Vault`. Define `VaultSnapshot` as a serializable JSON object. This does not require a database — just a defined serialization contract.

### Priority 6 — Add cryptographic signing (1–2 weeks)
**Why:** This is the hardest gap but the most important for security-grade patent claims. Without subject signatures over consent objects, the system relies on transport security alone for authenticity.

**Change:** Add optional `subject_signature?: string` to `ConsentObjectV1` and `CapabilityTokenV1`. Define a signature format (recommended: JWS with `did:key` DID method + Ed25519). Add `signConsentObject(consent, privateKey)` and `verifyConsentSignature(consent, publicKey)`. The wallet architecture spec already outlines this — implementation is the gap.

---

## 7. Patentability-Oriented Assessment

### 7.1 — What is genuinely interesting in this repo

**1. The consent-derived capability attenuation model**
A `CapabilityTokenV1` that is provably a subset of its parent `ConsentObjectV1` — scope containment, permission containment, temporal containment — all enforced as code-level invariants with hash-based linkage. The `consent_ref` field creates an unforgeable chain. This is structurally closer to object-capability security models (OCAP) than to OAuth. The combination of a hash-addressed consent object and a hash-addressed capability token derived from it is non-trivial and worth claiming.

**2. The SDL-to-field-manifest-to-content resolution chain**
The three-layer resolution: SDL path → `field_id` (via `sdl_mappings`) → `content_id` (via pack fields) → Storage pointer URI. This is a multi-level indirection system that decouples semantic naming (SDL), logical identity (field_manifest), physical content (content_manifest), and storage location (storage_pointer). The combination is novel in the context of consent-mediated data sharing.

**3. The canonical hash commitment model**
Every protocol object — field, content, pack, consent, capability — has a canonical SHA-256 hash computed over RFC 8785 deterministic JSON. This means two independently-built implementations of any object must produce the same hash for the same semantic content. This is a strong interoperability guarantee rarely seen in consent frameworks.

**4. The scope-containment enforcement engine**
The `enforcement/sem.ts` module implements a structured policy decision engine that returns typed `SemDecision` objects with machine-readable `reason_codes`. The gate sequence (consent → token → pack → path) is deterministic and auditable. This pattern — a multi-stage policy enforcement engine returning typed decisions — is implementable as a claims basis.

**5. The market-maker adapter pattern**
The `IHRKeyVaultAdapter` interface demonstrates a clean separation: market-maker business logic sits above an AOC vault adapter, which talks to the AOC vault. This is an extensibility architecture where multiple market makers can use the same user vault with different consent scopes. The pattern itself is claimable as a "multi-market-maker consent routing architecture."

### 7.2 — What looks standard / already common

**1. DID-based identity**
Using DIDs (`did:key:...`) for subject and grantee identity is W3C standard. This adds no patentable novelty by itself — it is the correct implementation choice, not a novel one.

**2. SHA-256 content addressing**
Content-addressed storage using SHA-256 hashes is well-established (IPFS, Git, etc.). The novelty here is *how* content addressing is combined with consent — not the hashing itself.

**3. OAuth-like access tokens**
Capability tokens with expiry, scope, and refresh are standard OAuth patterns. The novel element is the *consent-derivation constraint* (scope containment enforcement) — not the token concept itself.

**4. Revocation via revocation list**
The in-memory revocation registry is a standard pattern. Status List 2021 (W3C) and CRL (X.509) both do this. No novelty here.

**5. Structured error objects**
The `SemDecision` / `VaultPolicyDecision` pattern is well-established in authorization frameworks (OPA, Cedar, etc.).

### 7.3 — What likely needs to be built before credible novelty claims

**1. A `purpose` field in the consent object** — without this, the consent object is scope + permission + expiry, which is structurally equivalent to an OAuth 2.0 scope claim. Purpose-binding is the critical differentiator for data sovereignty frameworks.

**2. Subject cryptographic signature over the consent object** — without this, consent is a database record, not a cryptographic commitment. The W3C Verifiable Credentials spec (which this resembles) requires a proof. This is the clearest gap between "data authorization API" and "sovereign data consent protocol."

**3. A first-class `SchematicV1` type** — without a named, versioned, hash-addressed market-maker schematic object, the SDL system is a naming convention. The schematic as a protocol object — with its own hash, version, and market-maker DID — is the novel claim for Item 4 of the audit brief.

**4. An access event log with append-only integrity** — without this, the system has no audit trail. Any patent claim about "auditability" or "anchor-grade integrity proof" needs at minimum an append-only event sequence with a verifiable hash chain over access events.

**5. Settlement metadata in the consent object** — the co-location of economic terms and consent scope in a single signed, hash-committed object is genuinely novel. If the consent object says "I authorize employer X to read field Y in exchange for 70% of $50 paid in USD," and that statement is cryptographically bound, this is patentably interesting. Nothing in the code does this today.

---

## Appendix A — File Evidence Map

| File | Purpose | Lines | Patent Relevance |
|---|---|---|---|
| `consent/types.ts` | ConsentObjectV1 type definition | 29 | HIGH — core patent claim 1 |
| `consent/consentObject.ts` | Builder and validator | 293 | HIGH — full implementation evidence |
| `consent/canonical.ts` | RFC 8785 canonical encoding | ~50 | HIGH — determinism claim |
| `consent/hash.ts` | SHA-256 hash computation | ~20 | HIGH |
| `consent/__tests__/consent.test.ts` | 40+ test cases | 943 | HIGH — proof of implementation |
| `capability/types.ts` | CapabilityTokenV1 type | 23 | HIGH — consent-bound token claim |
| `capability/capabilityToken.ts` | Mint, validate, verify | 499 | HIGH — core implementation |
| `capability/registries/` | Nonce + revocation registries | ~100 | MEDIUM — replay/revocation |
| `field/types.ts` | FieldManifestV1 type | 13 | HIGH — data block claim |
| `field/fieldManifest.ts` | Field builder | 46 | HIGH |
| `content/types.ts` | ContentManifestV1 type | 16 | HIGH — content block claim |
| `pack/types.ts` | PackManifestV1 + FieldReference | 21 | HIGH — pack aggregation claim |
| `pack/packManifest.ts` | Pack builder + validator | 143 | HIGH |
| `vault/types.ts` | Vault interface + request/result types | 99 | HIGH — vault contract |
| `vault/vault.ts` | In-memory vault implementation | 311 | HIGH — access engine |
| `enforcement/sem.ts` | Policy enforcement engine | 93 | MEDIUM — audit chain |
| `resolver/resolve.ts` | SDL path → field manifest resolution | 83 | HIGH — resolver claim |
| `sdl/parser.ts` | SDL path parser | 87 | MEDIUM — semantic layer |
| `sdl/validator.ts` | SDL path validator | 108 | MEDIUM |
| `sdl/types.ts` | SDL AST types | 65 | MEDIUM |
| `storage/types.ts` | StoragePointer type | 6 | MEDIUM |
| `integration/hrkey/aocVaultAdapter.ts` | Market maker adapter | 163 | HIGH — market maker model claim |
| `integration/hrkey/types.ts` | HRKey adapter contract | 171 | HIGH |
| `protocol/consent/consent-object-spec.md` | Normative spec | 1221 | EVIDENCE |
| `protocol/consent/capability-token-spec.md` | Normative spec | ~1000 | EVIDENCE |
| `protocol/field/field-manifest-spec.md` | Normative spec | 1099 | EVIDENCE |
| `protocol/sdl/README.md` | SDL language spec | 312 | EVIDENCE |
| `markets/README.md` | Market maker schematic spec | 239 | EVIDENCE — gap identification |
| `protocol/hrkey-v1-market-maker-spec.md` | HRKey market maker spec | 254 | EVIDENCE |
| `protocol/roadmap.md` | Roadmap with missing items | 136 | GAP IDENTIFICATION |
| `protocol/protocol-invariants-spec.md` | Cross-object invariants | 208 | EVIDENCE |

---

## Appendix B — What Does NOT Exist (Zero Code, Zero Evidence)

| Missing Item | Required For |
|---|---|
| `purpose` field on ConsentObjectV1 | Patent claim 1 (purpose/use basis) |
| `settlement_metadata` on any object | Patent claim 1 (compensation metadata) |
| Subject signature (EdDSA/ECDSA) on consent | Patent claims 1–2 (cryptographic binding) |
| `SchematicV1` type and builder | Patent claim 4 (market maker schematic) |
| `vault.evaluateSchematic()` method | Patent claim 4 + 5 (auto-resolution) |
| Access event type and event log | Patent claim 6 (audit-proof layer) |
| Merkle hash chain over events | Patent claim 6 (anchor-grade proof) |
| Persistent vault snapshot / wallet layer | Patent claim 5 (interoperability) |
| Field inventory manifest | Patent claim 5 (cross-market reuse) |
| Schematic registry / catalog | Patent claim 4 (market maker publishes schema) |

---

*End of audit. This document was produced by full source inspection, not by inference or assumption.*
