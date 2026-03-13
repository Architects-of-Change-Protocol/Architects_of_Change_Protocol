# AOC Protocol — Next-Generation Architecture Design

**Status:** Working Draft
**Branch:** `claude/audit-patent-architecture-jkrj2`
**Authors:** Protocol Architecture Review
**Prerequisite:** `PATENT_ARCHITECTURE_AUDIT.md` (completed audit)

---

## Preamble

This document is the concrete, implementation-grounded design for the six protocol primitives identified as missing or partial in the patent architecture audit. It is written for the engineers who will build them — not for a general audience.

Every design decision below is anchored to the **existing codebase** (`v0.1.0`). The word "reuse" is used precisely: it means specific files and specific types that should be extended, not replaced.

---

## 1. Protocol Upgrade Overview

### What the audit found

| Primitive | Status | Gap |
|---|---|---|
| `ConsentObjectV1` | Implemented | No `purpose`; no settlement binding; no subject signature |
| `CapabilityTokenV1` | Implemented | No subject signature; no schematic binding |
| `SchematicV1` | Not implemented | Described in 3 spec docs, zero TypeScript |
| `AccessEventV1` | Not implemented | `requestAccess()` ALLOW decisions leave no trace |
| `VaultSnapshotV1` | Not implemented | Vault is in-memory only; cross-session impossible |
| `SettlementMetadataV1` | Not implemented | Economics model is in ECONOMICS.md, not in any type |
| Subject signatures | Not implemented | No EdDSA/ECDSA anywhere |

### What we are designing here

Six new or upgraded protocol objects, in dependency order:

```
ConsentObjectV2          ← extends V1 (purpose + settlement_metadata)
  │
  └── CapabilityTokenV2  ← extends V1 (schematic_ref binding)
        │
        └── AccessEventV1  ← new (append-only, hash-chained log entry)
              │
              └── VaultSnapshotV1  ← new (exportable, importable vault state)

SchematicV1              ← new, independent primitive
  │
  └── (referenced by ConsentObjectV2 via purpose.schematic_ref)

SettlementMetadataV1     ← new, embedded in ConsentObjectV2
SignedConsentEnvelope    ← new, optional wrapper around ConsentObjectV2
SignedCapabilityEnvelope ← new, optional wrapper around CapabilityTokenV2
```

---

## 2. Object Models

### 2.1 `ConsentObjectV2`

**Design principle:** V2 is an additive extension of V1. The hash computation changes because the canonical payload changes. V1 objects remain valid where V1 is sufficient. V2 is required when `purpose` or `settlement_metadata` must be provable.

```typescript
// consent/types.ts — extend existing file, do not replace

export type PurposeV1 = {
  /**
   * Human-readable statement of why this data is being accessed.
   * Required. Not for display only — included in the canonical hash.
   * Example: "Employment screening for Software Engineer role, ACME Corp, 2026-Q1"
   */
  statement: string;

  /**
   * Optional reference to the SchematicV1 that motivated this consent.
   * When present, enables automated "no-refill" schematic satisfaction checking.
   * Value: schematic_hash (64-char lowercase hex SHA-256).
   */
  schematic_ref: string | null;

  /**
   * Optional semantic category from a controlled vocabulary.
   * Examples: "employment_screening" | "background_check" | "credential_verification"
   * Not validated by the protocol — market makers define their own terms.
   */
  category: string | null;
};

export type SettlementMetadataV1 = {
  /**
   * DID of the wallet that should receive the subject's share of access revenue.
   * May differ from consent.subject if the subject delegates settlement.
   * Required for non-custodial settlement enforcement.
   */
  recipient_did: string;

  /**
   * Percentage of gross access revenue owed to the subject.
   * Integer 0–100. Protocol invariant: must be > 0 for any consent
   * with permissions that include "read".
   * Market makers enforce the actual split; this field makes the
   * agreed split cryptographically bound to the consent.
   */
  subject_share_pct: number;

  /**
   * The payment rail the subject prefers for settlement.
   * Not enforced by the protocol — informational for market makers.
   * Examples: "direct_wallet" | "stablecoin_usdc" | "fiat_bank_transfer"
   */
  settlement_rail: string | null;

  /**
   * Optional: ISO 4217 currency code for fiat settlement.
   * Null if settlement is on-chain/stablecoin.
   */
  currency: string | null;
};

export type ConsentObjectV2 = {
  version: '2.0';                      // discriminant from V1
  subject: string;                     // DID of consenting party
  grantee: string;                     // DID of authorized party
  action: 'grant' | 'revoke';
  scope: ScopeEntry[];
  permissions: string[];
  purpose: PurposeV1;                  // NEW — required in V2
  settlement_metadata: SettlementMetadataV1 | null; // NEW — null if non-commercial
  revoke_target?: { capability_hash: string };
  issued_at: string;                   // ISO 8601 UTC
  expires_at: string | null;
  prior_consent: string | null;        // hash of parent ConsentObjectV1 or V2
  consent_hash: string;                // SHA-256 of canonical V2 payload
};
```

**How it hashes:**
Canonical payload is identical to V1 process (`canonicalize.ts` → `sha256Hex`) but the payload object now includes `purpose` and `settlement_metadata` in alphabetical key order. The hash commitment algorithm is unchanged — only the payload grows.

**Canonical key order for V2:**
```
action, expires_at, grantee, issued_at, permissions, prior_consent,
purpose, revoke_target (if present), scope, settlement_metadata,
subject, version
```

**`purpose` sub-object canonical key order:**
```
category, schematic_ref, statement
```

**`settlement_metadata` sub-object canonical key order:**
```
currency, recipient_did, settlement_rail, subject_share_pct
```

**Relationships:**
- `prior_consent` → `ConsentObjectV1.consent_hash` or `ConsentObjectV2.consent_hash`
- `purpose.schematic_ref` → `SchematicV1.schematic_hash` (when present)
- `settlement_metadata.recipient_did` → subject's wallet DID

**Backward compatibility:** `ConsentObjectV1 | ConsentObjectV2` union type. V1 paths in the vault continue to work. `applyConsent()` and `storeConsent()` accept the union. The canonical hash distinguishes them.

---

### 2.2 `SchematicV1`

**Design principle:** A schematic is a **market maker's formal declaration** of what SDL fields it needs, why, and under what conditions. It is a protocol object — hash-bound, immutable, publishable. It is NOT a request; it is a standing template that individual consents reference.

```typescript
// schematic/types.ts — new file in new directory

export type SchematicFieldRequirement = {
  /**
   * The SDL path being required.
   * Must pass SDL validation (sdl/validator.ts).
   * Example: "work.experience.total.years"
   */
  sdl_path: string;

  /**
   * Whether this field is required for the schematic to be satisfiable.
   * required=true: access cannot proceed without this field.
   * required=false: schematic can be partially satisfied; field is "nice to have".
   */
  required: boolean;

  /**
   * Human-readable reason this specific field is needed.
   * Shown to user during consent review. Not empty.
   * Example: "Used to verify minimum experience threshold for role"
   */
  rationale: string;
};

export type SchematicV1 = {
  version: '1.0';

  /**
   * DID of the market maker publishing this schematic.
   * Example: "did:example:hrkey_system"
   */
  publisher: string;

  /**
   * Stable identifier for this schematic within the publisher's namespace.
   * Example: "employment_screening_standard_v1"
   * Opaque to the protocol — market maker defines its own naming.
   */
  schematic_id: string;

  /**
   * Human-readable name shown in consent UI.
   */
  name: string;

  /**
   * Human-readable description of what this schematic is for.
   */
  description: string;

  /**
   * The ordered list of SDL field requirements.
   * Sorted by sdl_path (lexicographic) in the canonical payload.
   */
  fields: SchematicFieldRequirement[];

  /**
   * Ordered list of permissions this schematic requires.
   * Sorted lexicographically in canonical payload.
   * Example: ["read"]
   */
  permissions: string[];

  /**
   * ISO 8601 UTC timestamp of schematic publication.
   */
  published_at: string;

  /**
   * Optional: ISO 8601 UTC expiry for this schematic version.
   * Null = schematic does not expire (market maker may publish a successor).
   */
  expires_at: string | null;

  /**
   * SHA-256 of the canonical schematic payload.
   * Self-certifying: this hash is what ConsentObjectV2.purpose.schematic_ref points to.
   */
  schematic_hash: string;
};

export type BuildSchematicOptions = {
  now?: Date;
  expires_at?: string | null;
};

// --- Schematic evaluation types (used by vault.evaluateSchematic) ---

export type SchematicEvaluationInput = {
  schematic: SchematicV1;
  pack_ref: string;           // pack_hash the vault should search
};

export type SchematicFieldStatus = {
  sdl_path: string;
  required: boolean;
  status: 'SATISFIED' | 'MISSING' | 'UNRESOLVABLE';
  field_id: string | null;    // null when MISSING or UNRESOLVABLE
  content_id: string | null;  // null when MISSING or UNRESOLVABLE
};

export type SchematicEvaluationResult = {
  schematic_hash: string;
  pack_ref: string;
  satisfiable: boolean;         // true iff all required fields are SATISFIED
  fully_satisfied: boolean;     // true iff ALL fields (required + optional) are SATISFIED
  fields: SchematicFieldStatus[];
  missing_required: string[];   // sdl_paths of required fields that are MISSING
  missing_optional: string[];   // sdl_paths of optional fields that are MISSING
};
```

**How it hashes:**
```typescript
// Canonical payload — schematic_hash excluded, fields sorted by sdl_path
{
  description: ...,
  expires_at: ...,
  fields: [sorted by sdl_path, each: { rationale, required, sdl_path }],
  name: ...,
  permissions: [sorted lexicographically],
  published_at: ...,
  publisher: ...,
  schematic_id: ...,
  version: ...
}
// → canonicalizeJSON → TextEncoder → sha256Hex
```

**Relationships:**
- `SchematicV1.schematic_hash` ← referenced by `ConsentObjectV2.purpose.schematic_ref`
- `SchematicV1.fields[].sdl_path` ← validated by `sdl/validator.ts` (existing)
- `SchematicEvaluationInput.pack_ref` → `PackManifestV1.pack_hash` (existing)

---

### 2.3 `AccessEventV1`

**Design principle:** Every `requestAccess()` call that returns `ALLOW` must produce a tamper-evident, append-only log entry. The log is a hash chain: each event commits to the hash of the previous event. This makes retroactive tampering detectable.

```typescript
// event/types.ts — new file in new directory

export type AccessEventV1 = {
  version: '1.0';

  /**
   * Monotonically incrementing sequence number within this vault.
   * Starts at 0. Enforces ordering without requiring a clock.
   */
  sequence: number;

  /**
   * SHA-256 hash of the previous AccessEventV1 (its canonical form).
   * For sequence=0 (genesis event), this is the all-zeros hash:
   * "0000000000000000000000000000000000000000000000000000000000000000"
   */
  prev_event_hash: string;

  /**
   * The capability_hash of the token that was presented.
   * Links to CapabilityTokenV1 or V2 in the vault store.
   */
  capability_hash: string;

  /**
   * The consent_ref from the capability token — links to the authorizing consent.
   */
  consent_ref: string;

  /**
   * DID of the subject whose data was accessed.
   */
  subject: string;

  /**
   * DID of the grantee who presented the capability.
   */
  grantee: string;

  /**
   * The pack that was accessed.
   */
  pack_ref: string;

  /**
   * The SDL paths that were requested.
   * Sorted lexicographically (matches vault.requestAccess deterministic ordering).
   */
  sdl_paths_requested: string[];

  /**
   * The SDL paths that were successfully resolved (returned in resolved_fields).
   * Sorted lexicographically.
   */
  sdl_paths_resolved: string[];

  /**
   * The policy decision returned by the vault.
   */
  decision: 'ALLOW' | 'DENY';

  /**
   * ISO 8601 UTC timestamp of the access event.
   */
  occurred_at: string;

  /**
   * SHA-256 of this event's canonical payload (including prev_event_hash).
   * Self-certifying. The hash chain is: event_hash = sha256(canonical(event minus event_hash)).
   */
  event_hash: string;
};

// --- Event log types ---

export type AccessEventLog = {
  /**
   * Ordered sequence of events, oldest first.
   * event_log[i].sequence === i (enforced by EventLog implementation).
   */
  events: AccessEventV1[];

  /**
   * Hash of the most recent event. Allows fast chain-tip verification.
   * Null if the log is empty.
   */
  head_hash: string | null;
};
```

**How it hashes:**
```typescript
// Canonical payload — event_hash excluded
{
  capability_hash: ...,
  consent_ref: ...,
  decision: ...,
  grantee: ...,
  occurred_at: ...,
  pack_ref: ...,
  prev_event_hash: ...,
  sdl_paths_requested: [sorted],
  sdl_paths_resolved: [sorted],
  sequence: ...,
  subject: ...,
  version: ...
}
// → canonicalizeJSON → TextEncoder → sha256Hex → event_hash
```

**Chain integrity:** To verify the chain, iterate from sequence 0 to N, recomputing each `event_hash` and checking that it matches `events[i+1].prev_event_hash`. Any tampered event breaks the chain from that point forward.

**Important:** Events are written for BOTH `ALLOW` and `DENY` decisions. `sdl_paths_resolved` is empty for DENY events. This preserves a complete audit trail without leaking data contents (only paths are logged, never field values).

**Relationships:**
- `capability_hash` → `CapabilityTokenV1.capability_hash`
- `consent_ref` → `ConsentObjectV1.consent_hash` or `ConsentObjectV2.consent_hash`
- `pack_ref` → `PackManifestV1.pack_hash`
- `prev_event_hash` → previous `AccessEventV1.event_hash`

---

### 2.4 `VaultSnapshotV1`

**Design principle:** The vault must be exportable and importable without losing integrity guarantees. A snapshot is a point-in-time capture of vault state. The snapshot itself is hash-bound so tampering is detectable.

```typescript
// vault/snapshot.ts — new file

export type VaultSnapshotV1 = {
  version: '1.0';

  /**
   * ISO 8601 UTC timestamp of snapshot creation.
   */
  exported_at: string;

  /**
   * SHA-256 of the vault's head event hash at export time.
   * Null if the event log was empty at export.
   * This is the authoritative link between snapshot state and event log.
   */
  event_log_head: string | null;

  /**
   * Total number of events in the log at export time.
   */
  event_count: number;

  /**
   * Serialized store state.
   */
  store: VaultSnapshotStore;

  /**
   * Serialized event log (all events in sequence order).
   */
  event_log: AccessEventV1[];

  /**
   * SHA-256 of the canonical snapshot payload (excluding snapshot_hash).
   * Covers store + event_log + metadata. Tamper-evident.
   */
  snapshot_hash: string;
};

export type VaultSnapshotStore = {
  /**
   * All packs indexed by pack_hash.
   * Array of [pack_hash, PackManifestV1] pairs, sorted by pack_hash.
   */
  packs: Array<[string, PackManifestV1]>;

  /**
   * All consents indexed by consent_hash.
   * Array of [consent_hash, ConsentObjectV1 | ConsentObjectV2] pairs, sorted by consent_hash.
   */
  consents: Array<[string, ConsentObjectV1 | ConsentObjectV2]>;

  /**
   * All capability tokens indexed by capability_hash.
   * Array of [capability_hash, CapabilityTokenV1] pairs, sorted by capability_hash.
   */
  capabilities: Array<[string, CapabilityTokenV1]>;

  /**
   * SDL path → field_id mappings.
   * Array of [sdl_path, field_id] pairs, sorted by sdl_path.
   */
  sdl_mappings: Array<[string, string]>;

  /**
   * Revoked capability hashes. Array of hashes, sorted.
   */
  revoked_capabilities: string[];

  /**
   * Seen nonces (token_ids). Array of token_ids, sorted.
   * WARNING: This list can become large. See §4.3 for pruning strategy.
   */
  seen_nonces: string[];

  /**
   * All schematics indexed by schematic_hash.
   * Array of [schematic_hash, SchematicV1] pairs, sorted by schematic_hash.
   */
  schematics: Array<[string, SchematicV1]>;
};
```

**How the snapshot hashes:**
The snapshot payload is the entire `VaultSnapshotStore` plus metadata fields. Arrays are already sorted (deterministic). The same `canonicalizeJSON` from `canonicalize.ts` is used. The resulting `snapshot_hash` allows any consumer of the snapshot to verify it has not been tampered with after export.

**Import invariants:**
When importing a snapshot, the vault implementation must:
1. Recompute `snapshot_hash` from the serialized payload and reject if mismatched.
2. Recompute every `event_hash` in `event_log` and verify the hash chain is intact.
3. Recompute every `consent_hash`, `capability_hash`, and `pack_hash` from their respective canonical payloads and reject any that fail.
4. Apply revoked capability hashes to the `RevocationRegistry`.
5. Apply seen nonces to the `NonceRegistry`.

**Nonce pruning:** Seen nonces for capabilities whose `expires_at` is in the past can be pruned from the snapshot. Include a `nonce_pruned_before` timestamp field documenting what was removed.

---

### 2.5 `SettlementMetadataV1`

`SettlementMetadataV1` is defined inline in `ConsentObjectV2` (see §2.1). It is not a standalone protocol object — it is always embedded in a consent. This is intentional: settlement terms must be cryptographically bound to the consent that authorizes the access generating the revenue.

For completeness, the standalone type used during access event logging:

```typescript
// event/types.ts — add to existing file

export type SettlementObligationV1 = {
  /**
   * The event that triggered this settlement obligation.
   */
  event_hash: string;

  /**
   * The capability whose access triggered settlement.
   */
  capability_hash: string;

  /**
   * Copied from the parent consent's settlement_metadata.
   * Null if the consent was V1 (no settlement metadata).
   */
  recipient_did: string | null;
  subject_share_pct: number | null;
  settlement_rail: string | null;
  currency: string | null;

  /**
   * ISO 8601 UTC: when settlement should occur.
   * Market maker determines this from their billing cycle.
   */
  settle_by: string | null;

  /**
   * Settlement status — tracked by market maker, not protocol.
   * The protocol records the obligation; settlement itself is off-protocol.
   */
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  settled_at: string | null;
};
```

---

### 2.6 `SignedConsentEnvelope` and `SignedCapabilityEnvelope`

**Design principle:** Signatures are **optional wrappers**. The core objects (`ConsentObjectV2`, `CapabilityTokenV1`) remain plain serializable objects. The envelope pattern means: the same vault enforcement code works whether signatures are present or not. Signature verification is a separate, additive step.

The protocol uses **Ed25519** (EdDSA over Curve25519) because:
- Fixed-size 64-byte signatures (predictable)
- Fast verification
- Widely supported in DID/VC ecosystems
- No nonce required for signing (unlike ECDSA)

```typescript
// crypto/signatures.ts — new file

export type Ed25519SignatureV1 = {
  algorithm: 'Ed25519';
  /**
   * Base64url-encoded Ed25519 public key (32 bytes).
   */
  public_key: string;
  /**
   * Base64url-encoded Ed25519 signature over the payload bytes (64 bytes).
   * Payload bytes: UTF-8 encoding of the canonical JSON of the inner object
   * (consent_hash or capability_hash bytes — the same bytes used for hashing).
   */
  signature: string;
  /**
   * DID key reference — which key in the subject's DID document signed this.
   * Example: "did:example:alice#key-1"
   */
  key_ref: string;
};

export type SignedConsentEnvelope = {
  version: '1.0';
  /**
   * The inner consent object. V1 or V2. Not modified.
   */
  consent: ConsentObjectV1 | ConsentObjectV2;
  /**
   * Signature by the subject (data owner) over consent.consent_hash bytes.
   * Specifically: Ed25519.sign(key, sha256_bytes_of_canonical_consent_payload)
   * This proves the subject deliberately authorized this consent.
   */
  subject_signature: Ed25519SignatureV1;
  /**
   * ISO 8601 UTC timestamp of envelope creation.
   * May differ slightly from consent.issued_at.
   */
  signed_at: string;
};

export type SignedCapabilityEnvelope = {
  version: '1.0';
  /**
   * The inner capability token. V1 only currently.
   */
  capability: CapabilityTokenV1;
  /**
   * Signature by the subject over capability.capability_hash bytes.
   * This proves the subject (data owner) acknowledges the derived capability.
   * Optional use case: subject co-signs capability to prevent market maker forgery.
   */
  subject_signature: Ed25519SignatureV1 | null;
  /**
   * Signature by the grantee over capability.capability_hash bytes.
   * Proves grantee accepted the token (non-repudiation for access logging).
   * Optional.
   */
  grantee_signature: Ed25519SignatureV1 | null;
  /**
   * ISO 8601 UTC timestamp of envelope creation.
   */
  signed_at: string;
};
```

**What is signed:** The signature is over the **canonical payload bytes** — the same `Uint8Array` that was passed to `sha256Hex()` to produce `consent_hash` or `capability_hash`. This means the signer is committing to the hash-preimage, not just the hash. Verification is: recompute canonical bytes → verify Ed25519 signature.

**What signatures do NOT do in this version:**
- They do not replace hash-based integrity (that stays).
- They do not affect `requestAccess()` enforcement (vault still works without them).
- They do not require a PKI or DID resolver (verification is done with the embedded `public_key`).

DID resolution integration (to bind `key_ref` to an on-chain or off-chain DID document) is a v2 concern.

---

## 3. Repo Integration Plan

### Directory structure after upgrades

```
/
├── consent/
│   ├── types.ts              MODIFY — add PurposeV1, SettlementMetadataV1, ConsentObjectV2
│   ├── canonical.ts          MODIFY — add canonicalizeConsentV2Payload()
│   ├── consentObject.ts      MODIFY — add buildConsentObjectV2(), validateConsentObjectV2()
│   ├── consentId.ts          REUSE — buildAOCId() works for V2 unchanged
│   └── hash.ts               REUSE — computeConsentHash() unchanged (same algo)
│
├── schematic/                NEW DIRECTORY
│   ├── types.ts              NEW — SchematicV1, SchematicFieldRequirement,
│   │                               SchematicEvaluationResult
│   ├── schematicManifest.ts  NEW — buildSchematic(), validateSchematic()
│   ├── schematicId.ts        NEW — buildSchematicId() → aoc://schematic/v1/0/0x{hash}
│   ├── canonical.ts          NEW — canonicalizeSchematicPayload()
│   ├── hash.ts               NEW — computeSchematicHash()
│   └── __tests__/
│       └── schematic.test.ts NEW
│
├── event/                    NEW DIRECTORY
│   ├── types.ts              NEW — AccessEventV1, AccessEventLog, SettlementObligationV1
│   ├── eventLog.ts           NEW — createEventLog(), appendEvent(), verifyChain()
│   ├── canonical.ts          NEW — canonicalizeAccessEventPayload()
│   ├── hash.ts               NEW — computeEventHash()
│   └── __tests__/
│       └── eventLog.test.ts  NEW
│
├── vault/
│   ├── types.ts              MODIFY — add event log to VaultStore, add evaluateSchematic()
│   │                                   add exportSnapshot(), importSnapshot() to Vault interface
│   ├── vault.ts              MODIFY — append event on requestAccess(), implement
│   │                                   evaluateSchematic(), exportSnapshot(), importSnapshot()
│   ├── snapshot.ts           NEW — VaultSnapshotV1, serializeSnapshot(), deserializeSnapshot()
│   └── __tests__/
│       └── vault.test.ts     MODIFY — add snapshot, event log, schematic evaluation tests
│
├── crypto/
│   ├── engine.ts             REUSE — no changes (AES-256-GCM stays)
│   ├── signatures.ts         NEW — Ed25519SignatureV1, SignedConsentEnvelope,
│   │                               SignedCapabilityEnvelope, signConsent(), verifyConsentSignature(),
│   │                               signCapability(), verifyCapabilitySignature()
│   ├── types.ts              REUSE — EncryptedObject unchanged
│   └── __tests__/
│       └── signatures.test.ts NEW
│
├── enforcement/
│   └── sem.ts                MODIFY — add enforceSchematicSatisfied(), enforceEventLogIntegrity()
│                                       add enforceSettlementPresent() (warning-only, not blocking)
│
└── integration/hrkey/
    ├── types.ts              MODIFY — add PublishSchematicInput, EvaluateSchematicInput,
    │                                   GrantConsentV2Input, AccessEventQueryInput
    └── aocVaultAdapter.ts    MODIFY — add publishSchematic(), evaluateSchematic(),
                                        grantConsentV2(), queryAccessEvents()
```

### File-by-file modification guide

#### `consent/types.ts` — Modify

Add `PurposeV1`, `SettlementMetadataV1`, `ConsentObjectV2`, `BuildConsentV2Options` after existing types. Export union type `AnyConsentObject = ConsentObjectV1 | ConsentObjectV2`. Do not remove V1 types.

#### `consent/canonical.ts` — Modify

Add `canonicalizeConsentV2Payload(payload: ConsentPayloadV2): Uint8Array` alongside existing `canonicalizeConsentPayload()`. The V2 function extends the V1 key set with `purpose` and `settlement_metadata`. Use the same `canonicalizeJSON` from `canonicalize.ts`.

#### `consent/consentObject.ts` — Modify

Add `buildConsentObjectV2()` and `validateConsentObjectV2()`. The existing `buildConsentObject()` and `validateConsentObject()` remain untouched for V1. Validation for V2 adds: `purpose.statement` non-empty, `settlement_metadata.subject_share_pct` in [1,100] when `permissions` includes `"read"`.

#### `vault/types.ts` — Modify

```typescript
// Add to VaultStore:
event_log: AccessEventLog;
schematics: Map<string, SchematicV1>;

// Add to Vault interface:
storeSchematic(schematic: SchematicV1): string;
evaluateSchematic(input: SchematicEvaluationInput): SchematicEvaluationResult;
exportSnapshot(opts?: { now?: Date }): VaultSnapshotV1;
importSnapshot(snapshot: VaultSnapshotV1): void;
getEventLog(): Readonly<AccessEventLog>;
```

#### `vault/vault.ts` — Modify

1. Initialize `store.event_log = { events: [], head_hash: null }` and `store.schematics = new Map()`.
2. In `requestAccess()`: after computing `VaultAccessResult`, call `appendEvent()` to write an `AccessEventV1`. This happens for BOTH ALLOW and DENY.
3. Implement `storeSchematic()`: validate `schematic_hash`, store in `store.schematics`.
4. Implement `evaluateSchematic()`: SDL resolution without capability enforcement — this is a dry-run that tells the user whether their pack satisfies a schematic.
5. Implement `exportSnapshot()` and `importSnapshot()` delegating to `vault/snapshot.ts`.

#### `enforcement/sem.ts` — Modify

Add:
```typescript
// Check that a schematic is satisfiable (all required fields present)
enforceSchematicSatisfied(result: SchematicEvaluationResult): SemResult

// Verify hash chain integrity of the event log
enforceEventLogIntegrity(log: AccessEventLog): SemResult
```

#### `integration/hrkey/types.ts` — Modify

Add:
```typescript
PublishSchematicInput = { schematic: SchematicV1 }
PublishSchematicResult = { schematic_hash: string }
EvaluateSchematicInput = { schematic_hash: string; pack_hash: string }
GrantConsentV2Input = GrantConsentInput & { purpose: PurposeV1; settlement_metadata: SettlementMetadataV1 | null }
AccessEventQueryInput = { subject?: string; grantee?: string; from?: string; to?: string }
```

### What current code is reused without modification

| Existing file | Reused as-is |
|---|---|
| `canonicalize.ts` | Same `canonicalizeJSON()` for all new canonical payloads |
| `storage/hash.ts` | Same `sha256Hex()` for all new hash computations |
| `aocId.ts` | Same `buildAOCId()` for `buildSchematicId()` |
| `sdl/validator.ts` | Used by `buildSchematic()` to validate each `sdl_path` |
| `sdl/parser.ts` | Same parser for schematic SDL path validation |
| `capability/registries/` | Both registries reused for snapshot import |
| `crypto/engine.ts` | AES-256-GCM unchanged |

---

## 4. Interoperability Flow

### Full end-to-end "No-Refill Form" sequence

This is the target flow when all six primitives exist.

```
ACTORS:
  MM  = Market Maker (e.g. HRKey system DID)
  U   = User (candidate), their wallet
  R   = Requester (employer), their system
  V   = Vault (AOC protocol enforcement)
```

```
Step 1 — MM publishes schematic (once, not per-request)
─────────────────────────────────────────────────────────
MM → V: storeSchematic(SchematicV1{
  publisher: "did:mm:hrkey",
  schematic_id: "employment_screening_standard_v1",
  fields: [
    { sdl_path: "person.name.legal.full",         required: true,  rationale: "Identity verification" },
    { sdl_path: "work.experience.total.years",    required: true,  rationale: "Experience threshold" },
    { sdl_path: "work.reference.manager.name",    required: false, rationale: "Optional manager ref" },
    { sdl_path: "education.degree.highest.field", required: false, rationale: "Optional field of study" }
  ],
  permissions: ["read"],
  published_at: "2026-01-01T00:00:00Z",
  expires_at: null
})
V returns: schematic_hash = "a1b2c3..."

Step 2 — U's wallet evaluates schematic against existing pack (no form needed if satisfied)
──────────────────────────────────────────────────────────────────────────────────────────────
U → V: evaluateSchematic({ schematic_hash: "a1b2c3...", pack_ref: "pack_hash_xyz" })
V returns: SchematicEvaluationResult{
  satisfiable: true,          // all required fields present
  fully_satisfied: false,     // optional fields missing
  fields: [
    { sdl_path: "person.name.legal.full",         status: "SATISFIED",   field_id: "f1", content_id: "c1" },
    { sdl_path: "work.experience.total.years",    status: "SATISFIED",   field_id: "f2", content_id: "c2" },
    { sdl_path: "work.reference.manager.name",    status: "MISSING",     field_id: null, content_id: null },
    { sdl_path: "education.degree.highest.field", status: "MISSING",     field_id: null, content_id: null }
  ],
  missing_required: [],
  missing_optional: ["work.reference.manager.name", "education.degree.highest.field"]
}

→ U sees: "2 optional fields are missing. Add them to improve matching, or proceed."
→ U decides: proceed without optional fields (no form required for required fields).

Step 3 — U grants consent with purpose and settlement terms bound
──────────────────────────────────────────────────────────────────
U → V: applyConsent(ConsentObjectV2{
  version: "2.0",
  subject: "did:user:alice",
  grantee: "did:employer:acme",
  action: "grant",
  scope: [{ type: "pack", ref: "pack_hash_xyz" }],
  permissions: ["read"],
  purpose: {
    statement: "Employment screening for Senior Engineer role, ACME Corp, Q1 2026",
    schematic_ref: "a1b2c3...",    // binds this consent to the schematic
    category: "employment_screening"
  },
  settlement_metadata: {
    recipient_did: "did:wallet:alice_wallet",
    subject_share_pct: 40,
    settlement_rail: "direct_wallet",
    currency: null
  },
  expires_at: "2026-04-01T00:00:00Z",
  issued_at: "2026-03-13T09:00:00Z",
  prior_consent: null,
  consent_hash: "<sha256 of canonical V2 payload>"
})
V returns: consent_hash = "d4e5f6..."

Optional: U wraps in SignedConsentEnvelope
U → signs with Ed25519 key over canonical consent payload bytes
U → V: storeSignedEnvelope(envelope) [future capability — V1 vault stores inner consent only]

Step 4 — MM mints attenuated capability for R
───────────────────────────────────────────────
MM → V: mintCapability(
  consent_hash: "d4e5f6...",
  scope: [{ type: "pack", ref: "pack_hash_xyz" }],  // cannot escalate beyond consent
  permissions: ["read"],
  expires_at: "2026-03-13T10:00:00Z"   // 1-hour window, subset of consent expiry
)
V enforces: scope ⊆ consent.scope, permissions ⊆ consent.permissions,
            expires_at ≤ consent.expires_at
V returns: CapabilityTokenV1 { capability_hash: "e5f6a7...", token_id: "<256-bit random>", ... }

Step 5 — R presents capability to request access
──────────────────────────────────────────────────
R → V: requestAccess({
  capability_token: <token from step 4>,
  sdl_paths: ["person.name.legal.full", "work.experience.total.years"],
  pack_ref: "pack_hash_xyz"
})

V enforces (in order):
  1. enforceConsentPresent()       — "d4e5f6..." exists in store
  2. enforceTokenRedemption()      — not expired, not revoked, not replayed
  3. enforcePackPresent()          — "pack_hash_xyz" exists in store
  4. enforcePathAccess()           — both SDL paths within capability scope
  5. SDL resolution                — paths → field_ids → content_ids

V returns: VaultAccessResult{
  policy: { decision: "ALLOW", reason_codes: [] },
  resolved_fields: [
    { sdl_path: "person.name.legal.full",      field_id: "f1", content_id: "c1" },
    { sdl_path: "work.experience.total.years", field_id: "f2", content_id: "c2" }
  ],
  unresolved_fields: []
}

Step 6 — Access event is written to the hash-chained log
──────────────────────────────────────────────────────────
[Happens atomically inside requestAccess(), after policy evaluation]

V: appendEvent(AccessEventV1{
  version: "1.0",
  sequence: 0,                          // or N if not first event
  prev_event_hash: "0000...0000",       // genesis; or previous event_hash
  capability_hash: "e5f6a7...",
  consent_ref: "d4e5f6...",
  subject: "did:user:alice",
  grantee: "did:employer:acme",
  pack_ref: "pack_hash_xyz",
  sdl_paths_requested: ["person.name.legal.full", "work.experience.total.years"],
  sdl_paths_resolved: ["person.name.legal.full", "work.experience.total.years"],
  decision: "ALLOW",
  occurred_at: "2026-03-13T09:01:00Z",
  event_hash: "<sha256 of canonical event payload>"
})
V updates: store.event_log.head_hash = event_hash

Step 7 — R fetches actual content via storage adapter (existing flow)
───────────────────────────────────────────────────────────────────────
R uses content_id to fetch encrypted blob from storage adapter (localFsAdapter or r2Adapter).
R decrypts with shared key from wallet exchange (out of protocol scope).
The content_id = SHA-256 of the encrypted blob = storage integrity proof.

Step 8 — Settlement obligation is derived from the access event
────────────────────────────────────────────────────────────────
MM reads event log, finds ALLOW events where consent has settlement_metadata.
For event_hash "g7h8i9...":
  consent_ref "d4e5f6..." → ConsentObjectV2.settlement_metadata = {
    recipient_did: "did:wallet:alice_wallet",
    subject_share_pct: 40,
    ...
  }
MM creates SettlementObligationV1{
  event_hash: "g7h8i9...",
  capability_hash: "e5f6a7...",
  recipient_did: "did:wallet:alice_wallet",
  subject_share_pct: 40,
  settlement_rail: "direct_wallet",
  status: "PENDING"
}
MM settles to wallet, marks status: "SETTLED"
```

---

## 5. No-Refill Form Architecture

### Problem statement

Today, every market maker presents a form to every user for every job. The user fills in name, experience, references — again, every time. The vault already has this data. The goal is to make consent the only user action required when the vault already holds the required data.

### Core concept: schematic-driven projection

A **schematic** is the market maker's formal data request. A **pack** is the user's structured data store. **Evaluating a schematic against a pack** tells us exactly which fields the user already has, which are missing, and whether required fields are satisfied.

The "no-refill" guarantee: if `schematic.satisfiable === true`, the user never sees a form. They see only a consent review screen.

### API surface

```typescript
// vault/types.ts additions

interface Vault {
  // --- Existing ---
  storePack(pack: PackManifestV1): string;
  applyConsent(consent: ConsentObjectV1 | ConsentObjectV2): string;
  mintCapability(...): CapabilityTokenV1;
  requestAccess(request, opts): VaultAccessResult;

  // --- New: Schematic support ---

  /**
   * Register a market maker's schematic. Validates SDL paths.
   * Returns schematic_hash. Idempotent — same schematic produces same hash.
   */
  storeSchematic(schematic: SchematicV1): string;

  /**
   * Dry-run: evaluate whether a pack satisfies a schematic.
   * Does NOT enforce consent or capability — authorization-free.
   * Used to show user what they already have vs. what is missing.
   */
  evaluateSchematic(input: SchematicEvaluationInput): SchematicEvaluationResult;

  /**
   * Given a SchematicEvaluationResult, build the minimal consent scope
   * that covers exactly the satisfied fields.
   * Utility: used by consent UI to pre-populate scope.
   */
  buildConsentScopeForSchematic(
    evaluation: SchematicEvaluationResult,
    pack_ref: string,
    options?: { include_optional?: boolean }
  ): ScopeEntry[];
}
```

### Object flow for "no-refill" user journey

```
                    ┌─────────────────────────────────────┐
                    │   Market Maker (HRKey)               │
                    │   stores SchematicV1 in vault        │
                    │   schematic_hash = "a1b2..."         │
                    └──────────────┬──────────────────────┘
                                   │ schematic_hash presented to user
                                   ▼
          ┌────────────────────────────────────────────────────┐
          │  User Wallet                                        │
          │                                                     │
          │  1. vault.evaluateSchematic({                       │
          │       schematic_hash: "a1b2...",                    │
          │       pack_ref: "pack_xyz"                          │
          │     })                                              │
          │                                                     │
          │  Returns SchematicEvaluationResult:                 │
          │    satisfiable: true   ← no form needed             │
          │    missing_optional: ["work.reference.manager.name"]│
          │                                                     │
          │  2. User sees consent review (not a form):          │
          │     "ACME wants to access:                          │
          │      ✓ Full name (already in vault)                 │
          │      ✓ Years of experience (already in vault)       │
          │      ○ Manager reference (optional, not in vault)   │
          │      Purpose: Senior Engineer screening, Q1 2026    │
          │      You will earn: 40% of access fee"              │
          │                                                     │
          │  3. User taps "Approve"                             │
          │                                                     │
          │  4. vault.applyConsent(ConsentObjectV2{             │
          │       scope: [{ type: "pack", ref: "pack_xyz" }],   │
          │       purpose: {                                     │
          │         schematic_ref: "a1b2...",                    │
          │         statement: "ACME screening Q1 2026"         │
          │       },                                            │
          │       settlement_metadata: { subject_share_pct: 40} │
          │     })                                              │
          └──────────────────────────────────────────────────┬─┘
                                                             │ consent_hash
                                                             ▼
                                          ┌──────────────────────────────┐
                                          │ Market Maker mints capability │
                                          │ Employer requests access      │
                                          │ Vault returns resolved fields │
                                          │ Access event logged           │
                                          │ Settlement obligation created │
                                          └──────────────────────────────┘
```

### Partial satisfaction handling

When `satisfiable === false` (required fields are missing), the vault's `SchematicEvaluationResult` provides the exact list in `missing_required`. The wallet UI then shows only those fields as a minimal form — not the full schematic.

```typescript
// Pseudocode for wallet UI logic

const evaluation = vault.evaluateSchematic({ schematic_hash, pack_ref });

if (evaluation.satisfiable) {
  // Show consent review — no form
  showConsentReview(evaluation, schematic);
} else {
  // Show minimal form — only missing required fields
  showPartialForm(evaluation.missing_required, schematic);
  // After user fills in missing fields:
  // → build new FieldManifest + ContentManifest for each missing field
  // → build new PackManifest with existing + new fields
  // → storePack(newPack)
  // → re-evaluate: evaluation2 = vault.evaluateSchematic({ ..., pack_ref: newPack.pack_hash })
  // → evaluation2.satisfiable === true → show consent review
}
```

### Projection-only disclosure

The consent scope can be narrowed to exactly the fields the schematic requires, even if the pack contains more fields:

```typescript
// buildConsentScopeForSchematic produces the minimal scope
const scope = vault.buildConsentScopeForSchematic(evaluation, pack_ref, {
  include_optional: false   // user chose not to share optional fields
});
// scope = [{ type: "content", ref: "c1" }, { type: "content", ref: "c2" }]
// — only the two required satisfied fields, not the whole pack

// The resulting capability can ONLY resolve those two content_ids.
// Even if the employer requests more SDL paths, they get SCOPE_ESCALATION.
```

This is the "projection-only disclosure" guarantee: the consent scope can be as narrow as individual content objects, not just whole packs.

### Missing field detection algorithm

`vault.evaluateSchematic()` internal logic:

```typescript
for (const field of schematic.fields) {
  const field_id = store.sdl_mappings.get(field.sdl_path);
  if (!field_id) {
    result.fields.push({ ...field, status: 'UNRESOLVABLE', field_id: null, content_id: null });
    if (field.required) result.missing_required.push(field.sdl_path);
    else result.missing_optional.push(field.sdl_path);
    continue;
  }
  const pack = store.packs.get(pack_ref);
  const fieldRef = pack?.fields.find(f => f.field_id === field_id);
  if (!fieldRef) {
    result.fields.push({ ...field, status: 'MISSING', field_id, content_id: null });
    if (field.required) result.missing_required.push(field.sdl_path);
    else result.missing_optional.push(field.sdl_path);
    continue;
  }
  result.fields.push({ ...field, status: 'SATISFIED', field_id, content_id: fieldRef.content_id });
}
result.satisfiable = result.missing_required.length === 0;
result.fully_satisfied = result.missing_required.length === 0 && result.missing_optional.length === 0;
```

---

## 6. Patent Differentiation Notes

### 6.1 `ConsentObjectV2` — Purpose-Bound Consent

**Novelty:** The `purpose` field is included in the canonical hash. This means the purpose is cryptographically bound to the authorization — it is not metadata attached after the fact. A consent for "employment screening" and a consent for "background check" over the same scope are **different objects** with different hashes. They cannot be confused, reused, or misrepresented.

**Differentiates from:**
- OAuth 2.0 / OIDC: no purpose field; scope is a string label with no cryptographic commitment to stated purpose
- W3C Verifiable Credentials: purpose is an optional annotation in VC metadata, not in the signed payload
- GDPR consent management platforms (OneTrust, Didomi): purpose is a database field, not part of a cryptographic object

**Patent narrative:** *"A method for cryptographically binding a human-readable purpose statement to an authorization grant, such that the purpose forms part of the hash commitment over which the authorization is computed, preventing purpose drift and enabling auditable purpose-specificity at the protocol layer rather than the application layer."*

### 6.2 `SchematicV1` — Formal Machine-Readable Data Request

**Novelty:** The schematic is a **first-class protocol object** with its own hash. When a consent references a `schematic_ref`, the user's authorization is provably linked to a specific version of the market maker's data request. If the market maker changes the schematic, the `schematic_hash` changes, and existing consents do not apply to the new version — users must re-consent explicitly.

**Differentiates from:**
- OIDC claims requests: informal JSON structure, no hash binding, no versioning mechanism
- FAPI/RAR (Rich Authorization Requests): closer, but scope is a structured JSON object in the token, not a separately hashable, referenceable, publishable object
- OpenID4VP / SIOPv2: presentation requests are ephemeral; no standing schematic with a stable hash identifier

**Patent narrative:** *"A protocol object representing a market maker's standing data requirement, wherein the object is immutable, cryptographically self-certifying via hash commitment, and referenceable by hash from individual consent objects, enabling verifiable binding between a specific version of a data access request and the user's authorization thereof."*

### 6.3 `AccessEventV1` — Hash-Chained Access Audit Log

**Novelty:** The event log uses a Merkle-chain structure (each event commits to its predecessor's hash). Unlike a database audit log, this is append-only and tamper-detectable by any party with access to the log. The log is embedded in the vault, not an external system.

**Differentiates from:**
- GDPR Article 30 processing records: text-based, mutable, not cryptographically chained
- AWS CloudTrail / Azure Monitor: centralized, mutable by the provider, trust is based on platform authority
- IPFS-based logs: content-addressed but no sequential chain; no protocol-defined log semantics

**Patent narrative:** *"A hash-chained, append-only access event log embedded in a sovereign data vault, wherein each event contains a cryptographic commitment to its predecessor, enabling retroactive tamper detection by any party holding the log, without requiring a trusted third-party audit authority."*

### 6.4 `VaultSnapshotV1` — Verifiable Portable Vault State

**Novelty:** The snapshot is itself hash-bound. Any party receiving a snapshot can independently verify that the store contents and event log are consistent with the declared `snapshot_hash`. The snapshot includes the full event log, making the access history portable with the data.

**Differentiates from:**
- Database backups: binary, format-dependent, no self-contained integrity proof
- Git repositories: content-addressed tree but no concept of a "vault" with consent/capability semantics
- Verifiable Data Registries (W3C): registries are external infrastructure; this is a self-contained, self-verifiable unit

**Patent narrative:** *"A self-certifying, portable vault state representation that includes a canonical serialization of all stored authorization objects, a complete access event log, and a hash commitment over both, enabling any recipient to independently verify the completeness and integrity of the transferred state without trusting the exporting party."*

### 6.5 `SettlementMetadataV1` — Consent-Bound Economic Terms

**Novelty:** Settlement terms are included in the canonical consent hash. This means: (1) the data owner's compensation share is cryptographically fixed at consent time; (2) a market maker cannot change the split after the fact without invalidating the consent; (3) the access event log can be audited to confirm that every ALLOW event has an associated settlement obligation derivable from the consent.

**Differentiates from:**
- Any existing data marketplace: settlement is a commercial agreement separate from access authorization; there is no system where the revenue split is part of the access authorization object
- Smart contract royalty systems (ERC-2981): splits are per-NFT, not per-consent; no integration with access control; no purpose binding

**Patent narrative:** *"A method for embedding non-custodial settlement terms within a cryptographically-bound consent object, such that the data owner's revenue share is determined at authorization time, cannot be modified without invalidating the authorization, and is cryptographically auditable via the consent hash, enabling protocol-level enforcement of data owner economic rights."*

### 6.6 `SignedConsentEnvelope` — Subject-Authenticated Authorization

**Novelty:** The signature is over the canonical payload bytes — the same bytes used to compute the hash. This means the Ed25519 signature is a proof-of-knowledge of the hash preimage and a digital signature over the authorization. Any verifier who can recompute the canonical bytes can verify the signature without a trusted signature oracle.

**Differentiates from:**
- JWTs: signature is over the base64url-encoded header+payload, not canonical JSON; verification requires JWT library; no commitment to hash
- W3C Verifiable Credentials: close, but VC signatures are over a credential document with a separate proof section; the signature and the hash are separate commitments
- OAuth tokens: no user signature; authorization is issued by the AS, not signed by the resource owner

**Patent narrative:** *"A signed consent envelope wherein the digital signature is computed over the identical byte representation used for the hash commitment, such that signature verification and hash verification share a common canonical form, enabling a single canonical serialization to serve as both the integrity proof and the authentication proof of the authorization."*

---

## 7. Build Order

### Priority 1 — `ConsentObjectV2` (Purpose + Settlement)

**Rationale:** Everything else references consent. Highest leverage change — affects the hash, affects all downstream consumers, must be backward-compatible. Purpose-bound consent is the most immediately differentiating feature for both patent and commercial positioning.

**Effort:** 2–3 days
**Dependencies:** None (extends existing V1)
**Files:** `consent/types.ts`, `consent/canonical.ts`, `consent/consentObject.ts`
**Test target:** Determinism, backward compat with V1, purpose included in hash, settlement_metadata included in hash, settlement_metadata.subject_share_pct ≥ 1 when permissions includes "read"

---

### Priority 2 — `SchematicV1` (Market Maker Data Request)

**Rationale:** Schematics unlock the "no-refill form" user experience, which is the core commercial differentiator of AOC over any data marketplace. Also enables `purpose.schematic_ref` binding in V2 consents.

**Effort:** 3–4 days
**Dependencies:** `sdl/validator.ts` (existing), `ConsentObjectV2` for schematic_ref field
**Files:** New `schematic/` directory (5 files), `vault/types.ts`, `vault/vault.ts`
**Test target:** Schematic hashing determinism, SDL path validation on build, evaluateSchematic() satisfiability logic, partial satisfaction, projection-only scope building

---

### Priority 3 — `AccessEventV1` (Append-Only Access Log)

**Rationale:** Without an event log, the system cannot prove access history to regulators, auditors, or the data subject. Also the prerequisite for settlement obligation tracking. The hash chain is the core technical novelty.

**Effort:** 3–4 days
**Dependencies:** `requestAccess()` in `vault/vault.ts`, `VaultStore` extension
**Files:** New `event/` directory (4 files), `vault/types.ts`, `vault/vault.ts`
**Test target:** Hash chain continuity, DENY events are logged (no data leakage), chain integrity verification detects tampering, genesis event has all-zeros prev_event_hash

---

### Priority 4 — `VaultSnapshotV1` (Persistence Layer)

**Rationale:** Without snapshots, the protocol is not deployable in production. Every restart loses all state. The snapshot also enables multi-party vault handoffs and backup/restore.

**Effort:** 2–3 days
**Dependencies:** `AccessEventV1` (event log must exist to be snapshotted)
**Files:** New `vault/snapshot.ts`, modifications to `vault/types.ts`, `vault/vault.ts`
**Test target:** Export → import roundtrip produces identical store, snapshot_hash fails if any field is tampered, event chain is re-verified on import, revocation/nonce state is restored correctly

---

### Priority 5 — `SettlementObligationV1` derivation

**Rationale:** The settlement_metadata in ConsentObjectV2 is useful only when the market maker has a systematic way to derive obligations from ALLOW events. This priority implements the derivation logic (not the payment rail — that is market maker territory).

**Effort:** 1–2 days
**Dependencies:** `ConsentObjectV2`, `AccessEventV1`
**Files:** `event/types.ts` (SettlementObligationV1 type), `integration/hrkey/aocVaultAdapter.ts` (queryAccessEvents, deriveSettlementObligations)
**Test target:** ALLOW events with V2 consent produce obligations, DENY events produce no obligation, V1 consents produce obligation with null settlement fields

---

### Priority 6 — `SignedConsentEnvelope` (Optional Subject Signatures)

**Rationale:** Signatures are optional and the vault works without them. Build this last because it requires a stable canonical form for everything above, and because the identity layer (DID document key resolution) is out of protocol scope for v0.1.0. Build the types and verification logic now; defer DID resolution integration.

**Effort:** 3–5 days
**Dependencies:** All objects above (stable canonical forms required), Node.js `crypto.sign` with Ed25519
**Files:** New `crypto/signatures.ts`, `crypto/__tests__/signatures.test.ts`
**Test target:** Sign → verify roundtrip (Ed25519), canonical bytes match hash preimage bytes, wrong key fails verification, tampered consent fails verification, envelope with V1 consent works, envelope with V2 consent works

---

### Dependency graph

```
ConsentObjectV2
    │
    ├──► SchematicV1              (purpose.schematic_ref binding)
    │         │
    │         └──► evaluateSchematic() in Vault
    │
    └──► AccessEventV1            (consent_ref in events)
              │
              ├──► VaultSnapshotV1  (event log included in snapshot)
              │
              └──► SettlementObligationV1 (derived from ALLOW events + V2 consent)

SignedConsentEnvelope             (wraps ConsentObjectV2, independent)
SignedCapabilityEnvelope          (wraps CapabilityTokenV1, independent)
```

### Effort summary

| Priority | Primitive | Effort | Cumulative |
|---|---|---|---|
| 1 | ConsentObjectV2 | 2–3 days | 3 days |
| 2 | SchematicV1 | 3–4 days | 7 days |
| 3 | AccessEventV1 | 3–4 days | 11 days |
| 4 | VaultSnapshotV1 | 2–3 days | 14 days |
| 5 | SettlementObligationV1 | 1–2 days | 16 days |
| 6 | SignedConsentEnvelope | 3–5 days | 21 days |

**Total:** ~3–4 weeks of focused engineering for a single experienced TypeScript developer familiar with the existing codebase. The primitives are largely independent after Priority 1, so Priority 2, 3, and 6 can be parallelized by a two-person team.

---

## Appendix A: Canonical payload key ordering reference

For each new object, the complete alphabetically-ordered key set:

**ConsentObjectV2** (full payload minus `consent_hash`):
```
action, expires_at, grantee, issued_at, permissions, prior_consent,
purpose, [revoke_target], scope, settlement_metadata, subject, version
```

**PurposeV1** (sub-object):
```
category, schematic_ref, statement
```

**SettlementMetadataV1** (sub-object):
```
currency, recipient_did, settlement_rail, subject_share_pct
```

**SchematicV1** (full payload minus `schematic_hash`):
```
description, expires_at, fields, name, permissions, published_at,
publisher, schematic_id, version
```

**SchematicFieldRequirement** (sub-object):
```
rationale, required, sdl_path
```

**AccessEventV1** (full payload minus `event_hash`):
```
capability_hash, consent_ref, decision, grantee, occurred_at, pack_ref,
prev_event_hash, sdl_paths_requested, sdl_paths_resolved, sequence,
subject, version
```

**VaultSnapshotV1** (full payload minus `snapshot_hash`):
```
event_count, event_log, event_log_head, exported_at, store, version
```

---

## Appendix B: Error codes to add

Add to `VaultErrorCode` in `vault/types.ts`:

```typescript
| 'SCHEMATIC_NOT_FOUND'      // evaluateSchematic called with unknown schematic_hash
| 'SCHEMATIC_UNSATISFIABLE'  // required fields missing from pack
| 'SNAPSHOT_HASH_MISMATCH'   // imported snapshot fails hash verification
| 'SNAPSHOT_CHAIN_BROKEN'    // event log hash chain fails on import
| 'INVALID_SIGNATURE'        // Ed25519 signature verification failed
| 'SETTLEMENT_MISSING'       // consent has permissions["read"] but no settlement_metadata
```

---

## Appendix C: Open questions (deferred decisions)

1. **Nonce pruning threshold:** At what age should expired-token nonces be pruned from VaultSnapshotV1? Suggested: prune nonces for tokens whose `expires_at` is more than 90 days in the past. Needs an explicit protocol decision.

2. **DID document key resolution:** SignedConsentEnvelope embeds the public key directly. In a production system, the key should be resolvable from the `key_ref` DID URL. How should the vault handle key rotation? Suggested: envelope verification uses the embedded key; DID resolution is caller's responsibility.

3. **SchematicV1 versioning:** When a market maker updates a schematic (e.g., adds a new required field), how should the old `schematic_hash` references in existing V2 consents behave? Suggested: old consents remain valid for their `expires_at`; new consents must reference the new schematic_hash.

4. **Multi-pack schematic evaluation:** Can a schematic be satisfied across multiple packs? Current design: one pack per evaluation. Multi-pack evaluation is a future extension (requires VaultAccessRequest to accept `pack_refs: string[]`).

5. **Event log pruning:** For long-lived vaults, the event log can become very large. Suggested: implement log segment archives — a segment is a sub-log with its own head hash, and the vault maintains a segment index. Deferred to after VaultSnapshotV1 is stable.
