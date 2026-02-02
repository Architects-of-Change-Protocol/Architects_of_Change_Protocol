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

#### 3.3.1 Formal Consent Definition

A **Consent** is a cryptographically signed authorization object that satisfies the following formal properties:

**Definition:**
```
Consent := {
  id:          UUID,
  subject:     DID,           -- wallet granting consent
  recipient:   DID,           -- entity receiving consent
  scope:       Set<FieldID>,  -- authorized field identifiers
  purpose:     PurposeCode,   -- declared usage intent
  constraints: Constraints,   -- additional restrictions
  validity:    TimeRange,     -- [issued_at, expires_at]
  signature:   Signature      -- subject's cryptographic signature
}
```

**Required Properties:**

| Property | Formal Requirement |
|----------|-------------------|
| **Explicit** | Consent MUST be actively granted; silence or inaction never implies consent |
| **Informed** | Subject MUST be presented with scope, recipient, and purpose before signing |
| **Granular** | Consent applies to specific fields; no implicit field inclusion |
| **Purpose-Bound** | Data use MUST NOT exceed declared purpose |
| **Time-Bound** | Every consent MUST have finite validity; perpetual consent is prohibited |
| **Revocable** | Subject MAY revoke at any time; revocation takes immediate effect |
| **Non-Transferable** | Recipient MUST NOT delegate consent to third parties |
| **Auditable** | All consent operations MUST be logged with timestamps |

**Consent Lifecycle States:**

```
┌──────────┐    grant()    ┌──────────┐    expire()    ┌─────────┐
│ PENDING  │──────────────►│  ACTIVE  │───────────────►│ EXPIRED │
└──────────┘               └──────────┘                └─────────┘
     │                          │
     │ reject()                 │ revoke()
     ▼                          ▼
┌──────────┐               ┌─────────┐
│ REJECTED │               │ REVOKED │
└──────────┘               └─────────┘
```

**State Transition Rules:**

| Transition | Trigger | Effect |
|------------|---------|--------|
| PENDING → ACTIVE | User signs consent | Token issued, access granted |
| PENDING → REJECTED | User declines | Request discarded, no token |
| ACTIVE → REVOKED | User revokes | Token invalidated, access terminated |
| ACTIVE → EXPIRED | Time exceeds `expires_at` | Token invalidated automatically |

**Consent Constraints Schema:**

```
Constraints := {
  max_access_count:  Option<uint>,    -- maximum resolution attempts
  ip_allowlist:      Option<[CIDR]>,  -- network restrictions
  geo_fence:         Option<Region>,  -- geographic restrictions
  time_window:       Option<TimeWindow>, -- daily/weekly access windows
  delegation:        false,           -- always false (non-transferable)
  proof_required:    Option<ProofType>   -- require ZKP for resolution
}
```

**Invariants:**

1. `∀ consent: consent.expires_at > consent.issued_at`
2. `∀ consent: consent.scope ≠ ∅` (empty scope is invalid)
3. `∀ consent: verify(consent.signature, consent.subject) = true`
4. `∀ field_access: ∃ active_consent where field ∈ consent.scope`

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

## 4. Module Interface Contracts

This section defines the formal interfaces between subsystems. Implementations MUST conform to these contracts.

### 4.1 IKeyManager

```
interface IKeyManager {
  // Key lifecycle
  generateKeyPair(curve: Curve) → KeyPair
  deriveChild(path: DerivationPath) → KeyPair
  rotateKey(keyId: KeyID) → KeyPair

  // Signing operations
  sign(keyId: KeyID, message: Bytes) → Signature
  signTypedData(keyId: KeyID, domain: EIP712Domain, data: Object) → Signature

  // Key access (public only)
  getPublicKey(keyId: KeyID) → PublicKey
  getAddress(keyId: KeyID) → Address

  // Recovery
  exportSeed() → EncryptedSeed  // requires user authentication
  importSeed(seed: EncryptedSeed) → void
}

// Invariant: No method returns private key material
// Invariant: sign() requires user authentication for sensitive operations
```

---

### 4.2 IIdentityCore

```
interface IIdentityCore {
  // DID management
  createDID() → DID
  resolveDID(did: DID) → DIDDocument
  updateDIDDocument(updates: DIDDocumentPatch) → void

  // Key binding
  bindKey(keyId: KeyID, purpose: VerificationRelationship) → void
  unbindKey(keyId: KeyID) → void

  // Rotation
  rotateVerificationMethod(oldKeyId: KeyID, newKeyId: KeyID) → void

  // Queries
  getActiveDID() → DID
  getVerificationMethods() → VerificationMethod[]
}

// Invariant: DID remains stable across key rotations
// Invariant: At least one verification method must exist
```

---

### 4.3 IConsentEngine

```
interface IConsentEngine {
  // Consent lifecycle
  requestConsent(request: ConsentRequest) → PendingConsent
  grantConsent(pendingId: UUID, approval: UserApproval) → ConsentToken
  rejectConsent(pendingId: UUID, reason: Option<String>) → void
  revokeConsent(consentId: UUID) → RevocationReceipt

  // Validation
  validateToken(token: ConsentToken) → ValidationResult
  checkScope(token: ConsentToken, field: FieldID) → bool

  // Queries
  getActiveConsents() → Consent[]
  getConsentHistory(filter: ConsentFilter) → Consent[]
  getConsentById(id: UUID) → Option<Consent>

  // Policy
  setDefaultPolicy(policy: ConsentPolicy) → void
  addTrustedRecipient(did: DID, trustLevel: TrustLevel) → void
}

// Invariant: No field access without valid consent token
// Invariant: Revocation is synchronous and immediate
```

---

### 4.4 IVaultController

```
interface IVaultController {
  // Field operations
  storeField(field: SDLField, metadata: FieldMetadata) → FieldID
  getField(id: FieldID, consent: ConsentToken) → DecryptedField
  updateField(id: FieldID, value: FieldValue) → void
  deleteField(id: FieldID) → void

  // Batch operations
  getFields(ids: FieldID[], consent: ConsentToken) → DecryptedField[]

  // Proof operations
  storeProof(proof: Proof) → ProofID
  getProof(id: ProofID) → Proof

  // Queries
  listFields(filter: FieldFilter) → FieldMetadata[]
  searchFields(query: SearchQuery) → FieldMetadata[]

  // Blob handling
  storeBlob(data: Bytes, metadata: BlobMetadata) → BlobID
  getBlob(id: BlobID, consent: ConsentToken) → Bytes
}

// Invariant: All stored data is encrypted at rest
// Invariant: getField/getBlob requires valid consent token
// Invariant: Field deletion is logical (tombstone), not physical
```

---

### 4.5 ISDLEngine

```
interface ISDLEngine {
  // Parsing
  parse(input: Bytes, format: SerializationFormat) → SDLField
  parseSchematic(input: Bytes) → Schematic

  // Validation
  validate(field: SDLField) → ValidationResult
  validateAgainstSchematic(fields: SDLField[], schematic: Schematic) → ValidationResult

  // Serialization
  serialize(field: SDLField, format: SerializationFormat) → Bytes
  serializePack(pack: Pack) → Bytes

  // Schema registry
  registerSchematic(schematic: Schematic) → void
  getSchematic(id: SchematicID) → Option<Schematic>

  // Namespace
  resolveNamespace(fieldId: String) → NamespaceInfo
}

// Supported formats: JSON, CBOR, MessagePack
// Invariant: parse(serialize(field)) = field
```

---

### 4.6 IObjectResolver

```
interface IObjectResolver {
  // Resolution
  resolve(uri: AOC_URI, consent: ConsentToken) → ResolvedObject
  resolveReference(ref: FieldReference) → SDLField

  // Pack operations
  createPack(fields: FieldID[], options: PackOptions) → Pack
  unpackPack(pack: Pack) → SDLField[]

  // Verification
  verifyPackSignature(pack: Pack) → bool
  verifyPackIntegrity(pack: Pack) → bool

  // URI handling
  parseURI(uri: String) → AOC_URI
  buildURI(type: URIType, id: String) → AOC_URI
}

// URI format: aoc://<type>/<identifier>
// Invariant: All packs are signed by wallet
```

---

### 4.7 IStorageAdapter

```
interface IStorageAdapter {
  // CRUD operations
  put(key: StorageKey, blob: EncryptedBlob) → ContentID
  get(id: ContentID) → Option<EncryptedBlob>
  delete(id: ContentID) → bool
  exists(id: ContentID) → bool

  // Batch operations
  putBatch(entries: (StorageKey, EncryptedBlob)[]) → ContentID[]
  getBatch(ids: ContentID[]) → Option<EncryptedBlob>[]

  // Listing
  list(prefix: Option<String>, pagination: Pagination) → ContentID[]

  // Sync (optional)
  sync() → SyncResult
  getLastSyncTime() → Option<Timestamp>
}

// Invariant: Adapter never sees plaintext data
// Invariant: ContentID is deterministic (content-addressed where possible)
```

---

### 4.8 IChainAdapter

```
interface IChainAdapter {
  // Account operations
  getAddress() → Address
  getBalance() → BigInt
  getNonce() → uint64

  // Transaction operations
  signTransaction(tx: Transaction) → SignedTransaction
  sendTransaction(signedTx: SignedTransaction) → TxHash
  waitForConfirmation(txHash: TxHash, confirmations: uint) → TxReceipt

  // Smart wallet operations (ERC-4337)
  buildUserOperation(intent: UserIntent) → UserOperation
  sendUserOperation(userOp: UserOperation) → UserOpHash

  // Anchoring
  anchorHash(hash: Bytes32, category: AnchorCategory) → TxHash
  verifyAnchor(hash: Bytes32, txHash: TxHash) → bool

  // DID registry
  registerDID(did: DID, document: DIDDocument) → TxHash
  resolveDIDOnChain(did: DID) → Option<DIDDocument>

  // Revocation
  publishRevocation(consentId: UUID) → TxHash
  checkRevocation(consentId: UUID) → bool
}

// Chain: Base L2 (initial)
// Invariant: All on-chain operations are idempotent
```

---

### 4.9 ITransportAdapter

```
interface ITransportAdapter {
  // Request/Response
  send(endpoint: Endpoint, request: SignedRequest) → SignedResponse

  // Streaming
  openChannel(endpoint: Endpoint) → Channel
  closeChannel(channel: Channel) → void

  // P2P
  connectPeer(did: DID) → PeerConnection
  broadcastToPeers(message: SignedMessage) → void

  // Listeners
  onRequest(handler: RequestHandler) → Subscription
  onMessage(handler: MessageHandler) → Subscription

  // Discovery
  resolveEndpoint(did: DID) → Endpoint[]
}

// Invariant: All transmitted data is signed
// Invariant: TLS required for HTTP/WebSocket
```

---

### 4.10 Cross-Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY MATRIX                               │
├──────────────────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┤
│                  │ KM │ IC │ CE │ VC │ SDL│ OR │ CM │ SA │ CA │ TA │
├──────────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ KeyManager (KM)  │ ── │    │    │    │    │    │    │    │    │    │
│ IdentityCore (IC)│ ●  │ ── │    │    │    │    │    │    │    │    │
│ ConsentEngine(CE)│ ●  │ ●  │ ── │    │    │    │    │    │    │    │
│ VaultCtrl (VC)   │ ●  │    │ ●  │ ── │    │    │    │    │    │    │
│ SDLEngine (SDL)  │    │    │    │    │ ── │    │    │    │    │    │
│ ObjResolver (OR) │    │    │ ●  │ ●  │ ●  │ ── │    │    │    │    │
│ ConnManager (CM) │    │ ●  │ ●  │    │    │    │ ── │    │    │    │
│ StorageAdapt(SA) │    │    │    │    │    │    │    │ ── │    │    │
│ ChainAdapter(CA) │ ●  │ ●  │    │    │    │    │    │    │ ── │    │
│ TransportAd (TA) │    │    │    │    │    │    │ ●  │    │    │ ── │
└──────────────────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

● = depends on (calls interface methods)
```

**Dependency Rules:**

1. Core modules (KM, IC, CE, VC) MUST NOT depend on Adapter modules
2. Adapter modules MAY depend on Core modules
3. Protocol modules (SDL, OR, CM) bridge Core and Adapter layers
4. No circular dependencies permitted
5. SDL Engine has zero dependencies (pure logic)

---

## 5. Primary Data Flows

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

### 8.3 Metadata Leakage Analysis

**Critical Warning:** Even with encrypted payloads, metadata can reveal sensitive information. This section explicitly documents metadata leakage vectors and required mitigations.

#### 8.3.1 Leakage Vectors

| Vector | Leaked Metadata | Risk Level | Mitigation |
|--------|-----------------|------------|------------|
| **Storage Backend** | Object count, sizes, access patterns, timestamps | High | Padding, dummy objects, access obfuscation |
| **On-Chain Anchors** | Consent frequency, revocation patterns, DID activity | High | Batching, delayed anchoring, stealth addresses |
| **Transport Layer** | Request timing, endpoint correlations, session duration | Medium | Tor/mixnet, request padding, timing jitter |
| **Market Interactions** | Which markets accessed, when, how often | Medium | Aggregated requests, proxy markets |
| **Field Identifiers** | SDL namespace reveals data categories held | Medium | Encrypted field IDs, generic container types |
| **Consent Tokens** | Scope size, purpose codes, expiration patterns | Low-Medium | Minimal token metadata, encrypted constraints |

#### 8.3.2 Storage Metadata Protections

**Problem:** Storage backends see encrypted blobs but can infer:
- Number of fields stored
- Approximate data volume
- Access frequency per object
- Creation/modification timestamps

**Mitigations:**

| Technique | Description |
|-----------|-------------|
| **Padding** | All encrypted blobs padded to fixed size buckets (1KB, 4KB, 16KB, 64KB) |
| **Dummy Objects** | Periodic creation of indistinguishable dummy entries |
| **Batched Writes** | Aggregate multiple operations into single storage calls |
| **Access Obfuscation** | Read decoy objects alongside real requests |
| **Timestamp Quantization** | Round timestamps to reduce temporal precision |

#### 8.3.3 On-Chain Metadata Protections

**Problem:** Public blockchain reveals:
- When consents are anchored
- Revocation patterns (frequent revoker = privacy-conscious or problem user?)
- DID activity levels
- Correlation between wallet addresses and DIDs

**Mitigations:**

| Technique | Description |
|-----------|-------------|
| **Batched Anchoring** | Aggregate multiple consent hashes into Merkle tree, anchor root only |
| **Delayed Anchoring** | Random delays (hours to days) before on-chain publication |
| **Stealth Addresses** | Derive one-time addresses for each anchor transaction |
| **Anchor Proxies** | Use relayers to break wallet-to-anchor correlation |
| **Optional Anchoring** | Make on-chain anchoring opt-in, not default |

#### 8.3.4 Traffic Analysis Protections

**Problem:** Network observers can correlate:
- Wallet-to-market communication patterns
- Session timing with real-world events
- Geographic location from IP addresses

**Mitigations:**

| Technique | Description |
|-----------|-------------|
| **Padding** | Fixed-size request/response envelopes |
| **Timing Jitter** | Random delays on all network operations |
| **Decoy Traffic** | Background noise requests to various endpoints |
| **Onion Routing** | Optional Tor/mixnet transport layer |
| **P2P Mixing** | Route through peer wallet network |

#### 8.3.5 Consent Token Metadata

**Problem:** Even without field values, consent tokens reveal:
- Number of fields shared
- Purpose categories
- Temporal patterns of consent activity

**Mitigations:**

| Technique | Description |
|-----------|-------------|
| **Encrypted Scope** | Field list encrypted to recipient, validator sees commitment only |
| **Generic Purpose Codes** | Coarse-grained purpose taxonomy |
| **Token Unlinkability** | No correlation between tokens to same recipient |
| **Minimal Token Size** | Fixed-size tokens regardless of scope |

#### 8.3.6 Metadata Leakage Threat Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    METADATA ADVERSARIES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Storage Provider          Chain Observer         Network ISP    │
│  ┌─────────────┐          ┌─────────────┐       ┌─────────────┐ │
│  │ Sees:       │          │ Sees:       │       │ Sees:       │ │
│  │ • Blob count│          │ • Tx timing │       │ • IP addrs  │ │
│  │ • Sizes     │          │ • Addresses │       │ • Endpoints │ │
│  │ • Timestamps│          │ • Gas usage │       │ • Timing    │ │
│  │ • Access pat│          │ • Revocations│      │ • Volume    │ │
│  └─────────────┘          └─────────────┘       └─────────────┘ │
│         │                        │                     │        │
│         └────────────────────────┼─────────────────────┘        │
│                                  ▼                               │
│                    ┌─────────────────────────┐                  │
│                    │   Correlation Attack    │                  │
│                    │   (metadata fusion)     │                  │
│                    └─────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Design Principle:** Assume all metadata is observed. Design mitigations assuming adversaries can correlate across all channels.

#### 8.3.7 Implementation Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Blob padding to size classes | P0 | Required for MVP |
| Timestamp quantization | P0 | Required for MVP |
| Batched storage operations | P1 | First release |
| On-chain anchor batching | P1 | First release |
| Dummy object generation | P2 | Post-launch |
| Tor transport option | P2 | Post-launch |
| Stealth addresses | P2 | Post-launch |
| Decoy traffic | P3 | Future |

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

### A

| Term | Definition |
|------|------------|
| **AES-256-GCM** | Symmetric encryption algorithm used for field-level encryption; provides confidentiality and authenticity |
| **Anchor** | Cryptographic commitment (hash) published on-chain for non-repudiation and timestamping |
| **AOC** | Architects of Change Protocol; the overarching protocol for sovereign data management |
| **AOC URI** | Uniform Resource Identifier for AOC objects; format: `aoc://<type>/<identifier>` |

### B

| Term | Definition |
|------|------------|
| **Base L2** | Layer 2 blockchain built on Ethereum; initial target chain for AOC wallet |
| **BIP-32** | Bitcoin Improvement Proposal for hierarchical deterministic key derivation |
| **BIP-39** | Bitcoin Improvement Proposal for mnemonic seed phrase generation |
| **BIP-44** | Bitcoin Improvement Proposal for multi-account key derivation paths |
| **Blob** | Binary large object; encrypted binary data stored in the vault |

### C

| Term | Definition |
|------|------------|
| **Chain Adapter** | Module abstracting blockchain interactions; supports EOA and smart wallet modes |
| **Consent** | Cryptographically signed authorization granting time-limited, purpose-bound access to specific fields |
| **Consent Engine** | Core module enforcing all consent policies and managing consent lifecycle |
| **Consent Token** | Portable proof of consent; contains scope, purpose, expiration, and wallet signature |
| **Content ID** | Content-addressed identifier for stored objects; typically a hash of the encrypted blob |

### D

| Term | Definition |
|------|------------|
| **Derivation Path** | Hierarchical path for HD key derivation; e.g., `m/44'/60'/0'/0/0` |
| **DID** | Decentralized Identifier; self-sovereign identifier not issued by any central authority |
| **DID Document** | JSON-LD document containing verification methods and service endpoints for a DID |

### E

| Term | Definition |
|------|------------|
| **ECDH** | Elliptic Curve Diffie-Hellman; key exchange protocol for establishing shared secrets |
| **ECDSA** | Elliptic Curve Digital Signature Algorithm; signing algorithm used for transactions and consents |
| **EOA** | Externally Owned Account; Ethereum account controlled by a private key (vs. smart contract) |
| **ERC-4337** | Ethereum standard for Account Abstraction; enables smart contract wallets with advanced features |
| **EIP-712** | Ethereum standard for typed structured data signing; used for human-readable consent signing |

### F

| Term | Definition |
|------|------------|
| **Field** | Atomic unit of sovereign data in SDL; self-describing with id, type, label, and value |
| **Field ID** | Namespaced identifier for an SDL field; e.g., `person.name.legal.full` |
| **Field Metadata** | Provenance information for a field: issuer, timestamp, signature, version |

### G-H

| Term | Definition |
|------|------------|
| **Gas Abstraction** | Mechanism allowing transaction fees to be paid by third parties (paymasters) |
| **HD Wallet** | Hierarchical Deterministic wallet; derives unlimited keys from single seed |
| **HSM** | Hardware Security Module; dedicated hardware for secure key storage and signing |

### I-K

| Term | Definition |
|------|------------|
| **Identity Core** | Module managing wallet's DID and verification methods |
| **Issuer** | Entity that attests to the validity of a field value; e.g., government, employer |
| **Key Manager** | Core module handling all cryptographic key operations |
| **Key Rotation** | Process of replacing keys while maintaining identity continuity |

### L-M

| Term | Definition |
|------|------------|
| **Local-First** | Architecture principle: full functionality without network connectivity |
| **Market Maker** | Domain-specific service that requests SDL fields and provides domain logic |
| **Metadata Leakage** | Unintended information disclosure through patterns, timing, or metadata (not payload content) |
| **Mnemonic** | Human-readable seed phrase (typically 12-24 words) for key recovery |

### N-O

| Term | Definition |
|------|------------|
| **Namespace** | Hierarchical categorization for SDL fields; e.g., `person.`, `work.`, `health.` |
| **Object Resolver** | Module handling `aoc://` URI resolution and pack assembly |

### P

| Term | Definition |
|------|------------|
| **Pack** | Signed bundle of SDL fields prepared for sharing; includes proofs and metadata |
| **Padding** | Technique of expanding data to fixed sizes to prevent size-based inference |
| **Paymaster** | ERC-4337 contract that sponsors gas fees for user operations |
| **Proof** | Cryptographic attestation about a field; may be signature, ZKP, or credential |
| **Purpose Binding** | Restriction ensuring data use matches the declared purpose in consent |

### R-S

| Term | Definition |
|------|------------|
| **Revocation** | Act of invalidating a previously granted consent; takes immediate effect |
| **Schematic** | Market-defined bundle specifying which SDL fields are required for a use case |
| **SDL** | Sovereign Data Language; universal vocabulary for describing human data |
| **Secure Enclave** | Hardware-isolated execution environment for sensitive operations (e.g., Apple Secure Enclave) |
| **Selective Disclosure** | Sharing derived facts (e.g., "age > 21") without revealing underlying values |
| **secp256k1** | Elliptic curve used by Ethereum and Bitcoin for cryptographic operations |
| **Smart Wallet** | Contract-based wallet (ERC-4337) enabling advanced features: multi-sig, recovery, gas abstraction |
| **Sovereign Wallet** | User-controlled cryptographic container for identity, keys, data, and consents |
| **SSI** | Self-Sovereign Identity; identity paradigm where individuals control their own identifiers |
| **Stealth Address** | One-time address derived for each transaction to prevent linkability |
| **Storage Adapter** | Module abstracting persistence backends (local, cloud, IPFS, etc.) |

### T-U

| Term | Definition |
|------|------------|
| **Timestamp Quantization** | Rounding timestamps to reduce precision and prevent timing analysis |
| **Token** | In AOC context: Consent Token (not cryptocurrency); signed authorization object |
| **Transport Adapter** | Module abstracting communication protocols (HTTP, WebSocket, P2P) |
| **Trust Boundary** | Logical separation between trusted (client) and untrusted (server, chain) environments |
| **User Operation** | ERC-4337 transaction structure for account abstraction |

### V-Z

| Term | Definition |
|------|------------|
| **Vault** | Encrypted storage container within the wallet holding all sovereign data |
| **Vault Controller** | Module managing encrypted storage, field CRUD, and access control |
| **Verification Method** | Public key or other mechanism in DID Document for verifying signatures |
| **Zero-Knowledge** | Property where a party learns nothing beyond the validity of a statement |
| **ZKP** | Zero-Knowledge Proof; cryptographic proof revealing nothing beyond claim validity |

---

## 11. Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial system architecture specification |

---

*This document defines the system architecture. Implementation specifications follow in separate documents.*
