# HRKey ↔ AOC Vault Integration Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HRKey Application                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Candidate    │  │  Employer    │  │  HRKey Business Logic     │ │
│  │  Onboarding   │  │  Dashboard   │  │  (scoring, matching, etc) │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────────┘ │
│         │                 │                       │                  │
│         ▼                 ▼                       ▼                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              IHRKeyVaultAdapter (contract)                   │   │
│  │                                                              │   │
│  │  registerPack()   grantConsent()   mintCapability()          │   │
│  │  requestAccess()  revokeCapability()                         │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
├─────────────────────────────┼───────────────────────────────────────┤
│  INTEGRATION BOUNDARY       │  (this layer)                         │
├─────────────────────────────┼───────────────────────────────────────┤
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              AocVaultAdapter (implementation)                │   │
│  │                                                              │   │
│  │  Translates HRKey domain calls → AOC Vault operations.       │   │
│  │  Holds Vault reference. No business logic.                   │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
├─────────────────────────────┼───────────────────────────────────────┤
│  AOC PROTOCOL (black box)   │  DO NOT MODIFY                       │
├─────────────────────────────┼───────────────────────────────────────┤
│                             ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    AOC Vault (in-memory)                     │   │
│  │                                                              │   │
│  │  storePack()        storeConsent()      mintCapability()     │   │
│  │  requestAccess()    registerSdlMapping() revokeCapability()  │   │
│  │  getStore()                                                  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Consent Objects │ Capability Tokens │ Pack Manifests │ SDL  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Integration Contract Summary

| Adapter Method      | AOC Vault Method(s) Called          | HRKey Provides               | AOC Enforces                              |
|---------------------|-------------------------------------|------------------------------|-------------------------------------------|
| `registerPack`      | `storePack` + `registerSdlMapping`  | PackManifest, SDL mappings   | Hash integrity, SDL path format           |
| `grantConsent`      | `buildConsentObject` + `storeConsent`| DIDs, scope, perms, expiry  | DID format, scope/perm validation, hashing|
| `mintCapability`    | `mintCapability`                    | consent_hash, attenuated scope| Derivation invariants, temporal bounds    |
| `requestAccess`     | `requestAccess`                     | capability, SDL paths, pack  | Expiry, replay, revocation, scope, resolution |
| `revokeCapability`  | `revokeCapability`                  | capability_hash              | Revocation registry update                |

## Boundary Clarification

### HRKey is responsible for:

- **User identity**: managing candidate and employer DIDs
- **Pack construction**: building PackManifestV1 objects from candidate data (using AOC builders)
- **SDL domain modeling**: deciding which SDL paths map to which field_ids
- **Business logic**: scoring, ranking, matching, pricing — all outside this adapter
- **UX flows**: onboarding, consent collection UI, access request UI
- **Temporal decisions**: choosing when consents/capabilities expire
- **Scope decisions**: choosing which fields to include in consents and capabilities

### AOC Vault enforces (adapter must NOT re-implement):

- **Hash integrity**: canonical JSON → SHA-256 on all objects
- **Consent validation**: DID format, scope bounds, permission format, timestamps
- **Derivation invariants**: capability scope ⊆ consent scope, capability perms ⊆ consent perms
- **Temporal bounds**: not_before ≤ now ≤ expires_at
- **Replay protection**: per-execution nonce tracking via token_id
- **Revocation**: in-memory revocation registry
- **Scope containment**: field access checked against capability scope
- **SDL path validation**: format enforcement (`^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`)
- **Deterministic ordering**: resolved/unresolved fields sorted by sdl_path

### Out of scope (must NOT be added to this integration):

- Tokenomics, payments, credits, billing
- Persistent storage (database, filesystem) — Vault is in-memory
- Network transport, API endpoints, HTTP handlers
- Authentication/authorization beyond AOC capability tokens
- Key management, signing, encryption
- Multi-tenancy, rate limiting, quotas

## Reference Flow

```
Timeline →

Candidate                    HRKey Adapter                    AOC Vault
    │                             │                               │
    │  1. Upload references       │                               │
    │──────────────────────────►  │                               │
    │                             │  registerPack(pack, mappings) │
    │                             │──────────────────────────────►│
    │                             │  ◄── pack_hash ──────────────│
    │                             │                               │
    │  2. Grant consent           │                               │
    │──────────────────────────►  │                               │
    │                             │  grantConsent(...)            │
    │                             │──────────────────────────────►│
    │                             │  ◄── consent_hash ───────────│
    │                             │                               │

Employer                     HRKey Adapter                    AOC Vault
    │                             │                               │
    │  3. Request candidate data  │                               │
    │──────────────────────────►  │                               │
    │                             │  mintCapability(...)          │
    │                             │──────────────────────────────►│
    │                             │  ◄── capability token ───────│
    │                             │                               │
    │                             │  requestAccess(token, paths)  │
    │                             │──────────────────────────────►│
    │                             │  ◄── ALLOW + resolved fields │
    │  ◄── reference data ────────│                               │
    │                             │                               │
```

## Future-Proofing Notes

### 1. Vault execution in a user wallet

The adapter accepts a `Vault` instance via constructor injection:

```typescript
const adapter = createHRKeyAdapter(vault);
```

Today, `vault` is `createInMemoryVault()`. To move Vault execution to a
user's wallet (e.g., a WASM module, a local enclave, or a remote agent):

- Implement the `Vault` type interface in the wallet runtime.
- Pass that implementation to `createHRKeyAdapter()`.
- No adapter code changes required.

The `Vault` type is a plain object with function properties — no classes,
no inheritance, no platform coupling.

### 2. Multiple market makers

The adapter is stateless relative to HRKey identity. Multiple market makers
can each instantiate their own adapter against the same or different Vault:

```typescript
const hrkey   = createHRKeyAdapter(sharedVault);
const otherMM = createHRKeyAdapter(sharedVault);
```

AOC enforces authorization at the consent/capability level, not at the
adapter level. Two market makers cannot escalate each other's tokens
because derivation invariants bind tokens to specific consent chains.

No changes to AOC are required to support this.
