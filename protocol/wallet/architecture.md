# AOC Sovereign Wallet — System Architecture

**Version:** 0.1
**Status:** Draft
**Layer:** Protocol Infrastructure

---

## 1. Component Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT ENVIRONMENT                                    │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                         AOC SOVEREIGN WALLET                                │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │ │
│  │  │   KEY MANAGER   │    │  IDENTITY CORE  │    │    CONSENT ENGINE       │ │ │
│  │  │                 │    │                 │    │                         │ │ │
│  │  │ • Key Generation│◄──►│ • DID Resolver  │◄──►│ • Policy Evaluator      │ │ │
│  │  │ • Key Derivation│    │ • DID Document  │    │ • Token Generator       │ │ │
│  │  │ • Signing       │    │ • Key Binding   │    │ • Consent Registry      │ │ │
│  │  │ • Hardware Intf │    │ • Rotation      │    │ • Revocation Handler    │ │ │
│  │  └────────┬────────┘    └────────┬────────┘    └───────────┬─────────────┘ │ │
│  │           │                      │                         │               │ │
│  │           ▼                      ▼                         ▼               │ │
│  │  ┌───────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                         VAULT CONTROLLER                               │ │ │
│  │  │                                                                        │ │ │
│  │  │  • Encryption/Decryption    • Field CRUD    • Proof Storage           │ │ │
│  │  │  • Access Control           • Metadata Mgmt • Blob Handler            │ │ │
│  │  └───────────────────────────────────┬───────────────────────────────────┘ │ │
│  │                                      │                                     │ │
│  │  ┌───────────────────────────────────┼───────────────────────────────────┐ │ │
│  │  │                         PROTOCOL LAYER                                 │ │ │
│  │  │                                   │                                    │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┴──────────────┐  ┌───────────────┐ │ │ │
│  │  │  │ SDL Engine   │  │    Object Resolver          │  │ Connection    │ │ │ │
│  │  │  │              │  │                             │  │ Manager       │ │ │ │
│  │  │  │ • Parser     │  │ • aoc:// URI Handler        │  │               │ │ │ │
│  │  │  │ • Validator  │  │ • Pack Assembler            │  │ • Peers       │ │ │ │
│  │  │  │ • Serializer │  │ • Reference Resolver        │  │ • Markets     │ │ │ │
│  │  │  │ • Schema Reg │  │ • Proof Bundler             │  │ • Issuers     │ │ │ │
│  │  │  └──────────────┘  └─────────────────────────────┘  └───────────────┘ │ │ │
│  │  └───────────────────────────────────────────────────────────────────────┘ │ │
│  │                                      │                                     │ │
│  │  ┌───────────────────────────────────┼───────────────────────────────────┐ │ │
│  │  │                      ADAPTER LAYER                                     │ │ │
│  │  │                                   │                                    │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┴───────────────┐  ┌──────────────┐ │ │ │
│  │  │  │ Storage      │  │   Chain Adapter              │  │ Transport    │ │ │ │
│  │  │  │ Adapter      │  │                              │  │ Adapter      │ │ │ │
│  │  │  │              │  │ • EOA Signer                 │  │              │ │ │ │
│  │  │  │ • Local      │  │ • Smart Wallet Interface     │  │ • HTTP/S     │ │ │ │
│  │  │  │ • Cloud      │  │ • Transaction Builder        │  │ • WebSocket  │ │ │ │
│  │  │  │ • IPFS       │  │ • Gas Abstraction            │  │ • P2P        │ │ │ │
│  │  │  │ • Ceramic    │  │ • Base L2 Native             │  │ • QR/NFC     │ │ │ │
│  │  │  └──────────────┘  └──────────────────────────────┘  └──────────────┘ │ │ │
│  │  └───────────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Encrypted / Signed
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SYSTEMS                                       │
│                                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
│  │  Storage Layer  │    │   Chain Layer   │    │      Market Layer           │  │
│  │                 │    │                 │    │                             │  │
│  │ • Private Cloud │    │ • Base L2       │    │ • Market Makers             │  │
│  │ • IPFS/Filecoin │    │ • DID Registry  │    │ • Issuer Endpoints          │  │
│  │ • Ceramic       │    │ • Consent Anchors│   │ • Verifier Services         │  │
│  │ • Arweave       │    │ • Smart Wallet  │    │ • Peer Wallets              │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Major Subsystems

| Subsystem | Layer | Primary Responsibility |
|-----------|-------|----------------------|
| Key Manager | Core | Cryptographic key lifecycle |
| Identity Core | Core | DID management and resolution |
| Consent Engine | Core | Consent policy enforcement |
| Vault Controller | Core | Encrypted data management |
| SDL Engine | Protocol | Field parsing and validation |
| Object Resolver | Protocol | AOC URI resolution and pack assembly |
| Connection Manager | Protocol | External entity relationships |
| Storage Adapter | Adapter | Pluggable persistence backends |
| Chain Adapter | Adapter | Blockchain interactions |
| Transport Adapter | Adapter | Communication protocols |

### Subsystem Connections

```
Key Manager ◄────► Identity Core ◄────► Consent Engine
     │                   │                    │
     └───────────────────┼────────────────────┘
                         │
                         ▼
                  Vault Controller
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
SDL Engine      Object Resolver     Connection Manager
     │                   │                   │
     └───────────────────┼───────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
Storage Adapter   Chain Adapter     Transport Adapter
```

---

## 3. Module Responsibilities

### 3.1 Key Manager

**Purpose:** Secure generation, storage, and use of cryptographic keys.

| Function | Description |
|----------|-------------|
| Key Generation | Create secp256k1 keypairs (EVM-compatible) |
| HD Derivation | BIP-32/44 derivation for key hierarchy |
| Signing | Sign messages, transactions, consent tokens |
| Key Rotation | Replace keys while preserving identity continuity |
| Hardware Interface | Abstract HSM, Secure Enclave, hardware wallet access |
| Recovery Seed | Generate and validate BIP-39 mnemonic phrases |

**Invariant:** Private keys never leave this module unencrypted.

---

### 3.2 Identity Core

**Purpose:** Manage the wallet's self-sovereign identity.

| Function | Description |
|----------|-------------|
| DID Generation | Create `did:sovereign:<fingerprint>` identifier |
| DID Document | Maintain verification methods, service endpoints |
| Key Binding | Associate keys with DID verification methods |
| Rotation Handling | Update DID document on key rotation |
| Resolution | Resolve local and remote DIDs |

**Identifier Format:**
```
did:sovereign:<base58(sha256(initial_public_key)[0:20])>
```

---

### 3.3 Consent Engine

**Purpose:** Enforce all data access through explicit consent.

| Function | Description |
|----------|-------------|
| Policy Evaluator | Evaluate incoming requests against stored policies |
| Token Generator | Issue cryptographically signed consent tokens |
| Consent Registry | Store active and historical consent grants |
| Revocation Handler | Invalidate consent tokens and propagate revocations |
| Purpose Binding | Ensure data use matches declared purpose |
| Expiration Enforcer | Automatically expire time-bound consents |

**Consent Token Structure:**
```
{
  consent_id: <uuid>,
  issuer_did: <wallet_did>,
  recipient_did: <market_did>,
  fields: [<sdl_field_ids>],
  purpose: <purpose_code>,
  expires_at: <timestamp>,
  constraints: {...},
  signature: <wallet_signature>
}
```

---

### 3.4 Vault Controller

**Purpose:** Encrypted storage and retrieval of sovereign data.

| Function | Description |
|----------|-------------|
| Encryption | Encrypt fields with wallet-derived keys |
| Decryption | Decrypt fields for authorized access |
| Field CRUD | Create, read, update, delete SDL fields |
| Metadata Management | Track field provenance, timestamps, issuer info |
| Proof Storage | Store and index proof objects (credentials) |
| Blob Handler | Manage large binary objects (documents, images) |
| Access Control | Enforce internal access policies |

**Storage Encryption:**
- AES-256-GCM for field encryption
- Per-field encryption keys derived from master key
- Metadata encrypted separately from values

---

### 3.5 SDL Engine

**Purpose:** Parse, validate, and serialize Sovereign Data Language fields.

| Function | Description |
|----------|-------------|
| Parser | Deserialize SDL from JSON/CBOR/MessagePack |
| Validator | Validate field structure and type constraints |
| Serializer | Serialize fields for storage or transmission |
| Schema Registry | Cache known schematics from Markets |
| Namespace Resolver | Resolve field namespace hierarchies |
| Type Coercion | Handle type conversions where permitted |

---

### 3.6 Object Resolver

**Purpose:** Resolve `aoc://` URIs and assemble data packs.

| Function | Description |
|----------|-------------|
| URI Parser | Parse `aoc://<type>/<id>` URIs |
| Pack Assembler | Bundle fields into shareable packs |
| Reference Resolver | Follow field references to linked objects |
| Proof Bundler | Attach relevant proofs to field packs |
| Integrity Checker | Verify pack signatures and hashes |

**URI Scheme:**
```
aoc://field/<field_id>
aoc://pack/<pack_id>
aoc://consent/<consent_id>
aoc://proof/<proof_id>
aoc://did/<did>
```

---

### 3.7 Connection Manager

**Purpose:** Manage relationships with external entities.

| Function | Description |
|----------|-------------|
| Peer Registry | Track known peer wallets |
| Market Registry | Track connected Market Makers |
| Issuer Registry | Track trusted credential issuers |
| Trust Scoring | Maintain trust metadata per connection |
| Session Management | Handle ephemeral market sessions |

---

### 3.8 Storage Adapter

**Purpose:** Abstract storage backends with pluggable implementations.

| Implementation | Characteristics |
|----------------|-----------------|
| Local | SQLite/LevelDB on device |
| Private Cloud | Encrypted sync to user-controlled cloud |
| IPFS | Content-addressed decentralized storage |
| Ceramic | Mutable streams on IPFS |
| Arweave | Permanent archival storage |

**Interface Contract:**
```
put(key, encrypted_blob) → content_id
get(content_id) → encrypted_blob
delete(content_id) → void
list(prefix) → content_id[]
```

---

### 3.9 Chain Adapter

**Purpose:** Blockchain interactions for anchoring and smart wallet operations.

| Function | Description |
|----------|-------------|
| EOA Signer | Sign transactions with EOA key |
| Smart Wallet Interface | ERC-4337 Account Abstraction compatibility |
| Transaction Builder | Construct and estimate transactions |
| Gas Abstraction | Handle gas sponsorship, paymasters |
| Anchor Operations | Anchor consent hashes, revocations on-chain |
| DID Registry | Interact with on-chain DID registry |

**Chain:** Base L2 (initial target)

**Smart Wallet Readiness:**
- Wallet address derivable from EOA initially
- Migration path to ERC-4337 smart account
- Signature abstraction layer for future key schemes

---

### 3.10 Transport Adapter

**Purpose:** Communication protocol abstraction.

| Protocol | Use Case |
|----------|----------|
| HTTPS | Market Maker API calls |
| WebSocket | Real-time consent requests |
| P2P (libp2p) | Direct wallet-to-wallet |
| QR Code | Offline consent initiation |
| NFC | Proximity-based sharing |

---

## 4. Primary Data Flows

### 4.1 Store Object

**Trigger:** User or application stores a new SDL field.

```
┌────────┐      ┌────────────┐      ┌──────────────┐      ┌─────────────┐
│ Input  │─────►│ SDL Engine │─────►│    Vault     │─────►│   Storage   │
│        │      │ (validate) │      │ (encrypt)    │      │   Adapter   │
└────────┘      └────────────┘      └──────────────┘      └─────────────┘
                     │                     │
                     ▼                     ▼
              Field validated       Encryption key
              & normalized          derived from
                                    Key Manager
```

**Steps:**
1. Input received (manual entry, import, issuer attestation)
2. SDL Engine validates structure and types
3. Vault Controller derives field encryption key
4. Field encrypted with AES-256-GCM
5. Metadata (provenance, timestamp, issuer) attached
6. Storage Adapter persists encrypted blob
7. Index updated for field lookup

---

### 4.2 Create Pack

**Trigger:** User bundles fields for sharing.

```
┌────────┐      ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│ Field  │─────►│   Object    │─────►│    Vault     │─────►│    Pack     │
│ Select │      │  Resolver   │      │ (decrypt)    │      │  (signed)   │
└────────┘      └─────────────┘      └──────────────┘      └─────────────┘
                     │                     │                      │
                     ▼                     ▼                      ▼
              Reference fields      Selective fields       Signed by
              resolved              decrypted              Key Manager
```

**Steps:**
1. User selects fields to include
2. Object Resolver resolves any field references
3. Vault Controller decrypts selected fields
4. Proof Bundler attaches relevant proofs
5. Pack assembled with metadata
6. Key Manager signs pack
7. Pack ID generated (`aoc://pack/<id>`)

---

### 4.3 Request Consent

**Trigger:** Market Maker requests access to wallet fields.

```
┌─────────┐      ┌───────────┐      ┌──────────────┐      ┌─────────────┐
│ Market  │─────►│ Transport │─────►│   Consent    │─────►│    User     │
│ Request │      │  Adapter  │      │   Engine     │      │   Prompt    │
└─────────┘      └───────────┘      └──────────────┘      └─────────────┘
                                          │
                                          ▼
                                    Policy check:
                                    - Known market?
                                    - Valid schematic?
                                    - Acceptable purpose?
```

**Steps:**
1. Market sends consent request with schematic
2. Transport Adapter receives and validates signature
3. Connection Manager verifies market identity
4. Consent Engine evaluates against policies
5. SDL Engine validates requested fields exist
6. User presented with clear consent prompt
7. Request queued pending user decision

**Request Structure:**
```
{
  market_did: <market_identifier>,
  schematic: "hr.job.matching.v1",
  fields: [
    "person.name.display",
    "work.skill.javascript.years"
  ],
  purpose: "job_matching",
  duration: "P30D",
  signature: <market_signature>
}
```

---

### 4.4 Grant Consent

**Trigger:** User approves a consent request.

```
┌────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│ User   │─────►│   Consent    │─────►│    Key      │─────►│  Transport  │
│Approval│      │   Engine     │      │  Manager    │      │   Adapter   │
└────────┘      └──────────────┘      └─────────────┘      └─────────────┘
                     │                      │
                     ▼                      ▼
              Token generated         Token signed
              and registered
```

**Steps:**
1. User confirms consent (fields, purpose, duration)
2. Consent Engine generates consent token
3. Key Manager signs token with wallet key
4. Consent registered in Consent Registry
5. Token sent to Market via Transport Adapter
6. Optional: Consent hash anchored on-chain
7. Audit log entry created

---

### 4.5 Resolve Object

**Trigger:** External request to resolve `aoc://` URI.

```
┌─────────┐      ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│ aoc://  │─────►│   Object    │─────►│   Consent    │─────►│    Vault    │
│  URI    │      │  Resolver   │      │   Engine     │      │ Controller  │
└─────────┘      └─────────────┘      └──────────────┘      └─────────────┘
                      │                     │                      │
                      ▼                     ▼                      ▼
                Parse URI type      Verify active          Decrypt if
                and identifier      consent token          authorized
```

**Steps:**
1. URI received with consent token
2. Object Resolver parses URI scheme and type
3. Consent Engine validates token (signature, expiration, scope)
4. Token scope checked against requested object
5. Vault Controller retrieves and decrypts object
6. Object returned with proof bundle if applicable
7. Access logged for audit

---

## 5. Trust Boundaries

### 5.1 Client-Side (User-Controlled Environment)

**All core wallet logic runs client-side:**

| Component | Trust Level |
|-----------|-------------|
| Key Manager | Highest — keys never leave |
| Identity Core | High — DID private operations |
| Consent Engine | High — consent decisions |
| Vault Controller | High — data encryption |
| SDL Engine | Medium — data processing |
| Object Resolver | Medium — URI handling |

**Client-side guarantees:**
- Private keys generated and stored locally
- Encryption/decryption happens locally
- Consent decisions made locally
- No plaintext data transmitted without consent

---

### 5.2 Server-Side (If Any)

**Principle:** Servers are optional, untrusted relays.

| Component | Role | Trust Level |
|-----------|------|-------------|
| Storage Backend | Encrypted blob storage | Zero-knowledge |
| Sync Server | Encrypted state sync | Zero-knowledge |
| Push Relay | Notification delivery | Untrusted |
| Market Endpoints | Receive consent tokens | Verified identity |

**Server-side constraints:**
- Servers never receive encryption keys
- Servers never see plaintext data
- Servers cannot forge consent tokens
- Servers cannot modify signed data

---

### 5.3 On-Chain (Base L2)

| Data | Purpose | Visibility |
|------|---------|------------|
| DID Document Hash | Identity anchoring | Public |
| Consent Anchors | Non-repudiation proofs | Public (hash only) |
| Revocation Registry | Consent invalidation | Public |
| Smart Wallet | Account abstraction | Public (address) |

**On-chain constraints:**
- No personal data on-chain
- Only hashes and public keys
- Revocations publicly verifiable
- Gas abstraction via paymasters

---

### 5.4 Trust Boundary Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    TRUSTED ENVIRONMENT                          │
│                    (User Device)                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CRITICAL TRUST ZONE                                      │  │
│  │  • Key Manager (keys never leave)                         │  │
│  │  • Vault Controller (plaintext only here)                 │  │
│  │  • Consent Engine (decisions made here)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PROCESSING ZONE                                          │  │
│  │  • SDL Engine, Object Resolver, Connection Manager        │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────────┘
                           │ Encrypted/Signed Only
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                    UNTRUSTED ENVIRONMENT                        │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐  │
│  │ Storage       │  │ Chain         │  │ Markets            │  │
│  │ (encrypted    │  │ (hashes,      │  │ (consent tokens,   │  │
│  │  blobs only)  │  │  public keys) │  │  signed data)      │  │
│  └───────────────┘  └───────────────┘  └────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## 6. Explicit Non-Goals

The AOC Sovereign Wallet **does NOT**:

| Non-Goal | Rationale |
|----------|-----------|
| Provide custodial key storage | Violates self-sovereignty principle |
| Store plaintext data on servers | Compromises privacy guarantees |
| Implement application UI/UX | Protocol layer, not presentation layer |
| Define business logic for verticals | Market Makers own domain logic |
| Create or manage user accounts | Identity is self-sovereign, not account-based |
| Operate as an identity provider | Wallet proves identity, doesn't issue it |
| Function as a data marketplace | Wallet mediates, Markets transact |
| Implement social features | Not a social network |
| Store data for third parties | Single-user sovereign container |
| Bypass consent for any reason | Consent is non-negotiable |
| Require blockchain for basic operation | Chain is optional enhancement |
| Lock users to specific storage providers | Storage is pluggable |
| Define token economics | Protocol-agnostic to incentive layers |
| Implement specific credential formats | Proof layer is extensible |

---

## 7. Design Principles

### Principle 1: Keys Never Leave

> Private keys exist only within the user-controlled environment. All signing operations happen locally. No key material is ever transmitted, even encrypted.

**Implication:** Remote signing services, cloud key management, and key escrow are architecturally excluded.

---

### Principle 2: Encryption Before Exit

> All data leaving the wallet is encrypted with keys only the wallet controls. Storage backends, sync services, and relays are zero-knowledge by design.

**Implication:** Backend compromise reveals only encrypted blobs. Key compromise is the only path to data.

---

### Principle 3: Consent is Mandatory

> No data access path bypasses the Consent Engine. Every field read by an external party requires an active, valid consent token.

**Implication:** No "admin mode," no "emergency access," no backdoors. Consent revocation immediately terminates access.

---

### Principle 4: Protocol Over Product

> The wallet implements AOC protocol primitives. Applications consume the wallet; the wallet does not embed applications.

**Implication:** HRKey, HealthKey, FinanceKey are consumers. The wallet is agnostic to their existence.

---

### Principle 5: Pluggable Adapters

> Storage, chain, and transport layers are abstracted behind stable interfaces. Implementations are swappable without core changes.

**Implication:** Migrate from cloud to IPFS, Base to another EVM chain, HTTP to P2P—without wallet redesign.

---

### Principle 6: EOA-First, Smart-Wallet-Ready

> Initial deployment uses EOA signing for simplicity. Architecture supports migration to ERC-4337 smart accounts without identity discontinuity.

**Implication:** Same DID survives wallet upgrade. Key rotation and social recovery become possible post-migration.

---

### Principle 7: Local-First, Sync-Optional

> The wallet operates fully offline with local storage. Sync and backup are opt-in features using encrypted replication.

**Implication:** No internet required for basic operations. Connectivity enhances but doesn't enable functionality.

---

### Principle 8: Minimal On-Chain Footprint

> Blockchain stores only what requires public verifiability: identity anchors, consent proofs, revocation signals. Personal data never touches the chain.

**Implication:** Gas costs remain minimal. Privacy preserved. Chain is audit layer, not storage layer.

---

## 8. Security Considerations

### 8.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Key extraction | Hardware-backed keys, secure enclave |
| Storage breach | Client-side encryption, zero-knowledge backends |
| Consent forgery | Cryptographic signatures, chain anchoring |
| Replay attacks | Nonces, timestamps, single-use tokens |
| Man-in-the-middle | TLS, signature verification, DID authentication |
| Malicious Market | Consent scope enforcement, purpose binding |

### 8.2 Cryptographic Primitives

| Operation | Algorithm |
|-----------|-----------|
| Key generation | secp256k1 (EVM-compatible) |
| Key derivation | BIP-32, BIP-44 |
| Encryption | AES-256-GCM |
| Hashing | SHA-256, Keccak-256 |
| Signing | ECDSA (secp256k1) |
| Key exchange | ECDH |

---

## 9. Migration Paths

### 9.1 EOA to Smart Wallet

```
Phase 1: EOA Only
  └─► Single key signs all operations

Phase 2: Smart Wallet Deployment
  └─► Deploy ERC-4337 account
  └─► EOA becomes initial owner

Phase 3: Enhanced Security
  └─► Multi-sig, social recovery
  └─► Key rotation without DID change
```

### 9.2 Storage Migration

```
Phase 1: Local Only
  └─► SQLite on device

Phase 2: Encrypted Cloud Backup
  └─► User-controlled cloud sync

Phase 3: Decentralized Storage
  └─► IPFS/Ceramic/Arweave
  └─► Content-addressed, permanent
```

---

## 10. Appendix: Glossary

| Term | Definition |
|------|------------|
| AOC | Architects of Change Protocol |
| SDL | Sovereign Data Language |
| DID | Decentralized Identifier |
| EOA | Externally Owned Account |
| ERC-4337 | Account Abstraction standard |
| Pack | Bundled collection of signed SDL fields |
| Schematic | Market-defined bundle of required SDL fields |
| Consent Token | Signed authorization for field access |

---

*This document defines the system architecture. Implementation specifications follow in separate documents.*
