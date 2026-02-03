# AOC Sovereign Wallet — Identity Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](./architecture.md), [crypto-spec.md](./crypto-spec.md)

---

## Table of Contents

1. [Identity Definition](#1-identity-definition)
2. [AOC DID Format](#2-aoc-did-format)
3. [Identity Document Structure](#3-identity-document-structure)
4. [Verification Method Types](#4-verification-method-types)
5. [Key Rotation](#5-key-rotation)
6. [Identity Recovery Hooks](#6-identity-recovery-hooks)
7. [Identity Resolution](#7-identity-resolution)
8. [Security Invariants](#8-security-invariants)

---

## 1. Identity Definition

### 1.1 What is an AOC Identity

An AOC Identity is a self-sovereign, cryptographically-anchored identifier that represents a single human principal within the Architects of Change Protocol. The identity exists independently of any central authority, registry, or service provider.

**Formal Definition:**

```
AOC_Identity := {
  did:             DID,                    -- Unique decentralized identifier
  document:        IdentityDocument,       -- Associated identity document
  controller:      DID,                    -- DID with authority over this identity
  created:         Timestamp,              -- Creation timestamp (Unix seconds)
  updated:         Timestamp,              -- Last modification timestamp
  status:          IdentityStatus          -- ACTIVE | DEACTIVATED
}
```

### 1.2 Identity Properties

| Property | Description |
|----------|-------------|
| **Self-Sovereign** | The identity is created, controlled, and owned solely by the holder |
| **Decentralized** | No central registry or authority is required for identity existence |
| **Cryptographically Bound** | Identity is anchored to cryptographic key material |
| **Persistent** | The identifier remains stable across key rotations |
| **Portable** | Identity can be used across any AOC-compatible system |
| **Verifiable** | Any party can cryptographically verify identity assertions |
| **Non-Custodial** | No third party holds or controls the identity |

### 1.3 Identity vs. Application Relationship

The AOC Identity exists at the protocol layer and is consumed by applications. Applications (HRKey, HealthKey, FinanceKey, etc.) are consumers of identity, not definers of it.

```
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│   ┌─────────┐   ┌───────────┐   ┌────────────┐              │
│   │  HRKey  │   │ HealthKey │   │ FinanceKey │   ...        │
│   └────┬────┘   └─────┬─────┘   └──────┬─────┘              │
│        │              │                │                     │
│        └──────────────┴────────────────┘                     │
│                       │ consumes                             │
└───────────────────────┼─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      PROTOCOL LAYER                          │
│                   ┌─────────────────┐                        │
│                   │  AOC Identity   │                        │
│                   │                 │                        │
│                   │  • DID          │                        │
│                   │  • Document     │                        │
│                   │  • Keys         │                        │
│                   └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Identity Lifecycle States

```
┌──────────┐    create()    ┌──────────┐   deactivate()   ┌─────────────┐
│ NASCENT  │───────────────►│  ACTIVE  │─────────────────►│ DEACTIVATED │
└──────────┘                └──────────┘                  └─────────────┘
                                 │
                                 │ rotate()
                                 ▼
                            ┌──────────┐
                            │  ACTIVE  │  (same DID, new keys)
                            └──────────┘
```

| State | Description |
|-------|-------------|
| **NASCENT** | Keys generated but identity document not yet published |
| **ACTIVE** | Identity document published and resolvable |
| **DEACTIVATED** | Identity explicitly deactivated; resolution returns deactivated status |

---

## 2. AOC DID Format

### 2.1 DID Syntax

```
did:aoc:<method>:<identifier>
```

**Components:**

| Component | Description | Constraints |
|-----------|-------------|-------------|
| `did` | DID scheme prefix | Literal string "did" |
| `aoc` | AOC method namespace | Literal string "aoc" |
| `<method>` | Resolution method specifier | One of: `key`, `anchor`, `peer` |
| `<identifier>` | Method-specific identifier | Base58-encoded, method-dependent |

### 2.2 Method Types

#### 2.2.1 `did:aoc:key` — Key-Derived Identity

The identifier is derived directly from the initial public key. This is the primary method for AOC identities.

**Identifier Derivation:**

```
identifier := Base58(SHA-256(PublicKey_compressed)[0:20])

where:
  PublicKey_compressed: 33-byte compressed secp256k1 public key
  SHA-256: FIPS 180-4 compliant hash
  [0:20]: First 20 bytes (160 bits) of hash
  Base58: Bitcoin-style Base58 encoding (no 0, O, I, l)
```

**Example:**

```
Public Key (compressed): 0x02b4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5
SHA-256: 0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7...
Truncated: 0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7
Base58: 9Kz2FMNxWJqR7sE4tYpV3m

DID: did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m
```

**Properties:**
- Deterministic from public key
- Self-certifying (key proves ownership)
- No on-chain registration required
- Survives key rotation (identifier bound to initial key)

#### 2.2.2 `did:aoc:anchor` — Chain-Anchored Identity

The identifier references an on-chain registration. Used when stronger non-repudiation is required.

**Identifier Derivation:**

```
identifier := Base58(SHA-256(chain_id || registry_address || registration_index)[0:20])

where:
  chain_id: 8-byte big-endian chain identifier (8453 for Base Mainnet)
  registry_address: 20-byte contract address
  registration_index: 8-byte big-endian registration sequence number
```

**Example:**

```
did:aoc:anchor:5vGhJ8kLmN2pQ4rS6tU9wX
```

**Properties:**
- Requires on-chain registration
- Publicly auditable creation timestamp
- Supports on-chain revocation
- Higher gas cost

#### 2.2.3 `did:aoc:peer` — Ephemeral Peer Identity

The identifier is a session-specific ephemeral identity for peer-to-peer interactions.

**Identifier Derivation:**

```
identifier := Base58(SHA-256(ephemeral_public_key || session_id)[0:20])

where:
  ephemeral_public_key: 33-byte compressed secp256k1 public key
  session_id: 16-byte random session identifier
```

**Example:**

```
did:aoc:peer:3nP7qR9sT2uV5wX8yZ1aB4
```

**Properties:**
- Single-session lifetime
- No persistence required
- Unlinkable across sessions
- Not suitable for long-term credentials

### 2.3 DID Syntax Validation

```
DID_REGEX := ^did:aoc:(key|anchor|peer):[1-9A-HJ-NP-Za-km-z]{20,25}$
```

**Validation Rules:**

1. MUST start with `did:aoc:`
2. Method MUST be one of: `key`, `anchor`, `peer`
3. Identifier MUST be valid Base58 (no 0, O, I, l)
4. Identifier MUST be 20-25 characters (encoding of 20 bytes)
5. Total DID length MUST NOT exceed 100 characters

### 2.4 DID Normalization

Before comparison or hashing, DIDs MUST be normalized:

1. Convert to lowercase
2. Remove any whitespace
3. Validate against DID_REGEX
4. Invalid DIDs MUST be rejected

```
normalize("did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m") = "did:aoc:key:9kz2fmnxwjqr7se4typv3m"
```

**Note:** Base58 encoding is case-sensitive. Normalization to lowercase is for comparison only; the canonical form preserves original case.

---

## 3. Identity Document Structure

### 3.1 Canonical Document Fields

```
IdentityDocument := {
  @context:              [URI],                    -- JSON-LD context
  id:                    DID,                      -- The DID this document describes
  controller:            DID | [DID],              -- DID(s) authorized to modify this document
  verificationMethod:    [VerificationMethod],     -- Cryptographic keys/methods
  authentication:        [DID | VerificationMethod], -- Methods for authentication
  assertionMethod:       [DID | VerificationMethod], -- Methods for issuing assertions
  keyAgreement:          [DID | VerificationMethod], -- Methods for key agreement
  capabilityInvocation:  [DID | VerificationMethod], -- Methods for capability invocation
  capabilityDelegation:  [DID | VerificationMethod], -- Methods for capability delegation
  service:               [ServiceEndpoint],        -- Service endpoints
  created:               DateTime,                 -- Document creation timestamp
  updated:               DateTime,                 -- Last update timestamp
  versionId:             uint64,                   -- Monotonic version counter
  proof:                 Proof                     -- Document signature
}
```

### 3.2 Field Definitions

#### 3.2.1 `@context`

JSON-LD context for semantic interpretation.

```
"@context": [
  "https://www.w3.org/ns/did/v1",
  "https://aoc.protocol/identity/v1"
]
```

**Requirements:**
- MUST include W3C DID context
- MUST include AOC identity context
- Additional contexts MAY be included

#### 3.2.2 `id`

The DID that this document describes.

```
"id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m"
```

**Requirements:**
- MUST be a valid AOC DID
- MUST match the DID used to request this document

#### 3.2.3 `controller`

The DID(s) authorized to make changes to this document.

```
"controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m"
```

Or for multi-controller scenarios:

```
"controller": [
  "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "did:aoc:key:7pQ3rS5tU8vW1xY4zA6bC9"
]
```

**Requirements:**
- MUST contain at least one DID
- For self-sovereign identity, controller SHOULD equal id
- Controller changes MUST be signed by current controller(s)

#### 3.2.4 `verificationMethod`

Array of verification methods (keys) associated with this DID.

```
"verificationMethod": [
  {
    "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "type": "EcdsaSecp256k1VerificationKey2019",
    "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
    "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur..."
  }
]
```

**Requirements:**
- MUST contain at least one verification method
- Each method MUST have unique id within document
- Method id MUST be DID + fragment (e.g., `#key-1`)

#### 3.2.5 `authentication`

Methods authorized for authentication (proving control of DID).

```
"authentication": [
  "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
]
```

**Requirements:**
- MUST contain at least one method
- Methods MUST reference verificationMethod entries or be inline

#### 3.2.6 `assertionMethod`

Methods authorized for issuing verifiable assertions.

```
"assertionMethod": [
  "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
]
```

**Requirements:**
- SHOULD contain at least one method for signing consent tokens
- Used for consent signing, pack signing, field attestations

#### 3.2.7 `keyAgreement`

Methods for establishing shared secrets (ECDH).

```
"keyAgreement": [
  {
    "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-agreement-1",
    "type": "X25519KeyAgreementKey2020",
    "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
    "publicKeyMultibase": "z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc"
  }
]
```

**Requirements:**
- SHOULD contain at least one method for encrypted communication
- Used for pack encryption, session establishment

#### 3.2.8 `service`

Service endpoints associated with this identity.

```
"service": [
  {
    "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#wallet",
    "type": "AOCWallet",
    "serviceEndpoint": "https://wallet.example.com/api/v1"
  },
  {
    "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#messaging",
    "type": "DIDCommMessaging",
    "serviceEndpoint": "https://msg.example.com/didcomm"
  }
]
```

**Requirements:**
- Service endpoints are OPTIONAL
- Each service MUST have unique id within document
- `serviceEndpoint` MUST be valid URI

#### 3.2.9 `proof`

Cryptographic proof of document integrity.

```
"proof": {
  "type": "EcdsaSecp256k1Signature2019",
  "created": "2026-02-01T12:00:00Z",
  "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
  "proofPurpose": "assertionMethod",
  "proofValue": "z3FXQjecWufY46yg7irA8mTCHQxHYqvNkQNXhYkh..."
}
```

**Requirements:**
- MUST be present on all published documents
- MUST be created by a controller of the document
- MUST cover all fields except `proof` itself

### 3.3 Minimal Identity Document

The minimal valid identity document:

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://aoc.protocol/identity/v1"
  ],
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur3XMDLBVoETqEsEaT..."
    }
  ],
  "authentication": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "assertionMethod": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "created": "2026-02-01T12:00:00Z",
  "updated": "2026-02-01T12:00:00Z",
  "versionId": 1,
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2026-02-01T12:00:00Z",
    "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3FXQjecWufY46..."
  }
}
```

### 3.4 Document Versioning

```
versionId: uint64 (monotonically increasing)
```

**Rules:**
- Initial document has `versionId: 1`
- Each update increments versionId by 1
- Version MUST NOT decrease
- Version gaps are invalid
- Resolution MAY request specific version

---

## 4. Verification Method Types

### 4.1 Allowed Verification Method Types

| Type | Curve/Algorithm | Purpose | Status |
|------|-----------------|---------|--------|
| `EcdsaSecp256k1VerificationKey2019` | secp256k1 | Signing, Authentication | REQUIRED |
| `EcdsaSecp256k1RecoveryMethod2020` | secp256k1 | EVM-compatible recovery | RECOMMENDED |
| `X25519KeyAgreementKey2020` | Curve25519 | Key Agreement (ECDH) | RECOMMENDED |

### 4.2 EcdsaSecp256k1VerificationKey2019

**Purpose:** Digital signatures and authentication.

**Rationale:**
- EVM-native for on-chain verification
- Widely supported in blockchain ecosystem
- Compatible with existing Ethereum tooling
- Required for consent token signing

**Structure:**

```json
{
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
  "type": "EcdsaSecp256k1VerificationKey2019",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur3XMDLBVoETqEsEaT..."
}
```

**Key Encoding:**
- `publicKeyMultibase`: Multibase-encoded compressed public key
- Prefix `z` indicates Base58btc encoding
- 33-byte compressed secp256k1 public key

**Signature Algorithm:**
- ECDSA with SHA-256 or Keccak-256 (context-dependent)
- Low-S normalization REQUIRED
- Recovery ID (v) REQUIRED for EVM compatibility

### 4.3 EcdsaSecp256k1RecoveryMethod2020

**Purpose:** EVM-compatible signatures with public key recovery.

**Rationale:**
- Enables on-chain signature verification without storing public keys
- Compatible with `ecrecover` precompile
- Reduces on-chain storage costs

**Structure:**

```json
{
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#recovery-1",
  "type": "EcdsaSecp256k1RecoveryMethod2020",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "blockchainAccountId": "eip155:8453:0x742d35Cc6634C0532925a3b844Bc9e7595f..."
}
```

**Key Encoding:**
- `blockchainAccountId`: CAIP-10 account identifier
- Format: `eip155:<chainId>:<address>`

### 4.4 X25519KeyAgreementKey2020

**Purpose:** Elliptic Curve Diffie-Hellman key agreement.

**Rationale:**
- Curve25519 provides strong security with efficient computation
- Widely adopted for key exchange (Signal, TLS 1.3)
- Separates signing keys from encryption keys (defense in depth)

**Structure:**

```json
{
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-agreement-1",
  "type": "X25519KeyAgreementKey2020",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "publicKeyMultibase": "z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2..."
}
```

**Key Encoding:**
- `publicKeyMultibase`: Multibase-encoded X25519 public key
- 32-byte public key

**Key Agreement Protocol:**

```
SharedSecret := X25519(privateKey_A, publicKey_B)
DerivedKey := HKDF-SHA256(
  IKM  = SharedSecret,
  salt = "aoc-key-agreement-v1",
  info = sorted(publicKey_A, publicKey_B),
  L    = 32
)
```

### 4.5 Disallowed Verification Method Types

| Type | Reason for Exclusion |
|------|---------------------|
| `Ed25519VerificationKey2018` | Not EVM-native; adds complexity without benefit for AOC use cases |
| `RsaVerificationKey2018` | Large key sizes; slow verification; not suitable for on-chain |
| `Bls12381G1Key2020` | Not yet widely supported; future consideration for aggregation |
| `JsonWebKey2020` | Requires JWK parsing; adds complexity; prefer native key types |

### 4.6 Verification Method Selection

**For Signing (authentication, assertionMethod):**
- Use `EcdsaSecp256k1VerificationKey2019`
- All AOC wallets MUST support this type

**For Key Agreement (keyAgreement):**
- Use `X25519KeyAgreementKey2020`
- RECOMMENDED for encrypted communication

**For On-Chain Verification:**
- Use `EcdsaSecp256k1RecoveryMethod2020`
- Links DID to blockchain address

---

## 5. Key Rotation

### 5.1 Rotation Principles

Key rotation allows updating cryptographic keys while preserving identity continuity.

**Invariants:**
- DID MUST remain stable across rotations
- Old keys MUST be deprecated, not deleted from history
- Rotation MUST be signed by current controller
- At least one active verification method MUST exist at all times

### 5.2 Rotation Process

```
┌─────────────────────────────────────────────────────────────────┐
│                      KEY ROTATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Generate New Key                                             │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ newKeyPair := KeyManager.generateKeyPair(secp256k1)     │ │
│     └─────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  2. Create Rotation Document                                     │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ Add new verificationMethod                              │ │
│     │ Mark old key with deprecation timestamp                 │ │
│     │ Increment versionId                                     │ │
│     │ Update 'updated' timestamp                              │ │
│     └─────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  3. Generate Continuity Proof                                    │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ContinuityProof := sign(oldKey, newKeyId || timestamp)  │ │
│     │ Proves old key holder authorized new key                │ │
│     └─────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  4. Sign Updated Document                                        │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ proof := sign(oldKey, canonicalize(document))           │ │
│     │ Document signed by CURRENT (old) controller key         │ │
│     └─────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  5. Publish & Anchor                                             │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ Publish updated document                                │ │
│     │ Optionally anchor rotation hash on-chain                │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Rotation Document Structure

**Before Rotation:**

```json
{
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnOLD..."
    }
  ],
  "authentication": ["did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"],
  "versionId": 1
}
```

**After Rotation:**

```json
{
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnOLD...",
      "deprecated": "2026-02-15T12:00:00Z",
      "deprecatedBy": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2"
    },
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnNEW...",
      "created": "2026-02-15T12:00:00Z",
      "rotatedFrom": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
    }
  ],
  "authentication": ["did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2"],
  "versionId": 2
}
```

### 5.4 Old Key Deprecation

Deprecated keys are marked but retained for historical verification.

**Deprecation Metadata:**

| Field | Description |
|-------|-------------|
| `deprecated` | ISO 8601 timestamp when key was deprecated |
| `deprecatedBy` | Reference to successor key |
| `revoked` | If true, key should never be accepted (compromise) |
| `revokedReason` | Optional reason for revocation |

**Deprecation vs. Revocation:**
- **Deprecated:** Key is no longer active; historical signatures remain valid
- **Revoked:** Key was compromised; ALL signatures (including historical) are suspect

### 5.5 Continuity Proofs

Continuity proofs establish cryptographic chain between key generations.

**Proof Structure:**

```
ContinuityProof := {
  type:           "KeyRotationProof",
  previousKey:    VerificationMethodId,
  newKey:         VerificationMethodId,
  timestamp:      DateTime,
  nonce:          bytes[32],
  signature:      Signature           -- Signed by previousKey
}
```

**Proof Generation:**

```
message := canonicalize({
  "@context": "https://aoc.protocol/rotation/v1",
  "type": "KeyRotationProof",
  "previousKey": "did:aoc:key:...#key-1",
  "newKey": "did:aoc:key:...#key-2",
  "timestamp": "2026-02-15T12:00:00Z",
  "nonce": "0x..."
})

signature := ECDSA.Sign(previousKey_private, SHA-256(message))
```

**Verification:**

```
VerifyContinuity(proof):
  1. Resolve DID to document at version before rotation
  2. Extract previousKey from verificationMethod
  3. Verify signature against previousKey
  4. Confirm newKey appears in current document
  5. Return: valid | invalid
```

### 5.6 Rotation Constraints

| Constraint | Description |
|------------|-------------|
| **Minimum Overlap** | New key MUST be added before old key is deprecated |
| **Continuity Chain** | Every rotation MUST have valid continuity proof |
| **Controller Preservation** | Rotation MUST NOT change controller without explicit authorization |
| **Version Monotonicity** | versionId MUST increment on each rotation |
| **Single Active Key** | At most one key SHOULD be active per purpose (RECOMMENDED) |

### 5.7 Emergency Rotation

For compromised keys:

1. Generate new key immediately
2. Mark old key as `revoked: true` with `revokedReason: "compromise"`
3. Sign rotation document with new key (exception to normal flow)
4. Publish revocation on-chain for maximum visibility
5. Notify relying parties of compromise

**Emergency Rotation Document:**

```json
{
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "revoked": true,
      "revokedReason": "key_compromise",
      "revokedAt": "2026-02-15T12:00:00Z"
    },
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnEMERGENCY...",
      "created": "2026-02-15T12:00:00Z",
      "emergencyRotation": true
    }
  ],
  "proof": {
    "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2",
    "emergencyRotation": true
  }
}
```

---

## 6. Identity Recovery Hooks

### 6.1 Recovery Architecture

Recovery hooks provide extensibility points for future social recovery mechanisms. This specification defines the interface; full social recovery implementation is deferred.

```
┌─────────────────────────────────────────────────────────────────┐
│                     RECOVERY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                             │
│  │  Identity Doc   │                                             │
│  │                 │                                             │
│  │  recoveryHooks: │──────────────────────┐                      │
│  │  - guardian_ref │                      │                      │
│  │  - threshold    │                      │                      │
│  │  - mechanism    │                      │                      │
│  └─────────────────┘                      │                      │
│                                           ▼                      │
│                              ┌────────────────────────┐          │
│                              │   Recovery Executor    │          │
│                              │   (Future Component)   │          │
│                              └────────────────────────┘          │
│                                           │                      │
│                      ┌────────────────────┼────────────────────┐ │
│                      ▼                    ▼                    ▼ │
│               ┌───────────┐        ┌───────────┐        ┌───────┐│
│               │ Guardian 1│        │ Guardian 2│        │  ...  ││
│               │   (DID)   │        │   (DID)   │        │       ││
│               └───────────┘        └───────────┘        └───────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Recovery Hook Schema

```
RecoveryHooks := {
  enabled:        bool,               -- Whether recovery is configured
  mechanism:      RecoveryMechanism,  -- Type of recovery mechanism
  guardians:      [GuardianReference],-- References to recovery guardians
  threshold:      uint8,              -- Minimum guardians required (m-of-n)
  timelock:       Duration,           -- Delay before recovery executes
  lastUpdated:    DateTime,           -- When recovery config was last changed
  configProof:    Proof               -- Signature over recovery configuration
}

RecoveryMechanism := "social_recovery" | "time_lock" | "dead_man_switch" | "reserved"

GuardianReference := {
  id:             string,             -- Unique guardian identifier
  did:            DID | null,         -- Guardian's DID (if known)
  publicKeyHash:  bytes[32],          -- Hash of guardian's public key
  weight:         uint8,              -- Guardian's voting weight (default: 1)
  relationship:   string,             -- Optional: "family", "friend", "institution"
}
```

### 6.3 Guardian References

Guardians are referenced but not embedded to preserve privacy.

**Reference Only (Privacy-Preserving):**

```json
"recoveryHooks": {
  "enabled": true,
  "mechanism": "social_recovery",
  "guardians": [
    {
      "id": "guardian-1",
      "publicKeyHash": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d...",
      "weight": 1
    },
    {
      "id": "guardian-2",
      "publicKeyHash": "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e...",
      "weight": 1
    },
    {
      "id": "guardian-3",
      "publicKeyHash": "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f...",
      "weight": 1
    }
  ],
  "threshold": 2,
  "timelock": "P7D"
}
```

**With Known DIDs (Reduced Privacy):**

```json
"recoveryHooks": {
  "enabled": true,
  "mechanism": "social_recovery",
  "guardians": [
    {
      "id": "guardian-1",
      "did": "did:aoc:key:5vGhJ8kLmN2pQ4rS6tU9wX",
      "publicKeyHash": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d...",
      "weight": 1,
      "relationship": "family"
    }
  ],
  "threshold": 2,
  "timelock": "P7D"
}
```

### 6.4 Threshold Configuration

```
Threshold(m, n): m-of-n guardians required

Constraints:
  m >= 1                    -- At least one guardian required
  m <= n                    -- Threshold cannot exceed guardian count
  n >= 2                    -- At least 2 guardians for meaningful recovery
  n <= 10                   -- Practical limit on guardian count
  RECOMMENDED: m >= n/2 + 1 -- Majority threshold
```

**Examples:**

| Configuration | Description |
|--------------|-------------|
| 2-of-3 | Any 2 of 3 guardians can recover |
| 3-of-5 | Majority required; tolerates 2 unavailable guardians |
| 2-of-2 | Both guardians required; no fault tolerance |

### 6.5 Future Extensibility

The recovery hooks schema reserves fields for future mechanisms:

| Field | Future Use |
|-------|------------|
| `mechanism: "time_lock"` | Recovery after inactivity period |
| `mechanism: "dead_man_switch"` | Automatic recovery if no activity |
| `mechanism: "reserved"` | Reserved for future standardization |
| `institutionalGuardian` | Third-party recovery service integration |
| `hardwareBackup` | Hardware-based recovery (HSM, hardware wallet) |
| `zkRecovery` | Zero-knowledge proof-based recovery |

### 6.6 Recovery Hooks Invariants

```
INV-RH-01: recoveryHooks.enabled = true → guardians.length >= 2
  "Enabled recovery MUST have at least 2 guardians"

INV-RH-02: threshold <= guardians.length
  "Threshold MUST NOT exceed guardian count"

INV-RH-03: configProof verifies against current controller
  "Recovery configuration MUST be signed by controller"

INV-RH-04: Guardian DIDs (if present) MUST resolve
  "Guardian DIDs MUST be resolvable when specified"

INV-RH-05: timelock >= P1D (1 day)
  "Recovery timelock MUST be at least 1 day"
```

### 6.7 Deferred Functionality

The following are explicitly deferred to future specifications:

| Feature | Status | Rationale |
|---------|--------|-----------|
| Guardian attestation protocol | Deferred | Requires off-band communication spec |
| Recovery transaction format | Deferred | Requires smart contract integration |
| Guardian key refresh | Deferred | Complex coordination problem |
| Inheritance/succession | Deferred | Legal and technical complexity |
| Cross-chain recovery | Deferred | Multi-chain coordination |

---

## 7. Identity Resolution

### 7.1 Resolution Overview

Identity resolution is the process of retrieving an identity document given a DID.

```
Resolution(DID) → IdentityDocument | ResolutionError
```

### 7.2 Resolution Sources

Resolution proceeds through multiple sources in order:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESOLUTION PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input: did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m                      │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. LOCAL CACHE                                              ││
│  │    Check local cache for unexpired document                 ││
│  │    TTL: 5 minutes (configurable)                            ││
│  └──────────────────────┬──────────────────────────────────────┘│
│                         │ miss                                   │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 2. ON-CHAIN ANCHOR (for did:aoc:anchor:*)                   ││
│  │    Query DID registry contract                              ││
│  │    Retrieve document hash and metadata                      ││
│  └──────────────────────┬──────────────────────────────────────┘│
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 3. OFF-CHAIN DOCUMENT                                       ││
│  │    Fetch document from service endpoint or IPFS             ││
│  │    Verify hash matches on-chain anchor                      ││
│  └──────────────────────┬──────────────────────────────────────┘│
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 4. VERIFICATION                                             ││
│  │    Verify document proof signature                          ││
│  │    Check for revocation status                              ││
│  │    Validate document structure                              ││
│  └──────────────────────┬──────────────────────────────────────┘│
│                         │                                        │
│                         ▼                                        │
│  Output: Verified IdentityDocument                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Local Cache

**Cache Structure:**

```
CacheEntry := {
  did:          DID,
  document:     IdentityDocument,
  fetchedAt:    Timestamp,
  expiresAt:    Timestamp,
  source:       ResolutionSource,
  verified:     bool
}
```

**Cache Policy:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Default TTL | 300 seconds (5 min) | Balance freshness vs. performance |
| Max TTL | 3600 seconds (1 hour) | Prevent stale data |
| Negative Cache TTL | 60 seconds | Prevent repeated failed lookups |
| Max Entries | 10,000 | Memory constraint |
| Eviction Policy | LRU | Prioritize frequently accessed DIDs |

**Cache Invalidation:**

- Explicit invalidation on known rotation
- TTL expiration
- Manual purge by user
- On verification failure

### 7.4 On-Chain Anchor

For `did:aoc:anchor:*` DIDs, the on-chain registry is authoritative.

**Registry Query:**

```
DIDRegistry.resolve(did) → {
  documentHash:    bytes32,      -- SHA-256 of canonical document
  owner:           address,      -- Current owner address
  created:         uint256,      -- Creation block number
  updated:         uint256,      -- Last update block number
  status:          uint8         -- 0=active, 1=deactivated
}
```

**Chain: Base L2 (Chain ID: 8453)**

**Verification:**
1. Query registry contract at trusted address
2. Verify `status == 0` (active)
3. Store `documentHash` for off-chain verification

### 7.5 Off-Chain Document

The full identity document is stored off-chain to minimize gas costs.

**Storage Options:**

| Storage | URI Scheme | Characteristics |
|---------|------------|-----------------|
| IPFS | `ipfs://<cid>` | Content-addressed, decentralized |
| HTTPS | `https://...` | Centralized, fast |
| Arweave | `ar://<tx_id>` | Permanent, decentralized |

**Document Retrieval:**

```
1. Extract serviceEndpoint from cached hint or registry
2. Fetch document from endpoint
3. Compute SHA-256 of canonical document
4. Compare with on-chain documentHash
5. If mismatch: REJECT document
```

### 7.6 Verification Steps

After retrieval, documents MUST be verified:

```
VerifyDocument(document, did):
  1. STRUCTURE: Validate JSON-LD structure against schema
  2. ID MATCH: Confirm document.id == requested DID
  3. PROOF: Verify document.proof signature
     - Extract verificationMethod from document
     - Verify signature using referenced key
     - Confirm proofPurpose is "assertionMethod"
  4. CONTROLLER: Verify proof signer is controller or delegated
  5. VERSION: Check versionId is monotonically increasing
  6. TIMESTAMP: Verify updated >= created
  7. KEYS: At least one active (non-deprecated) verificationMethod exists
  8. REVOCATION: Check on-chain revocation status (if anchored)

  Return: VALID | (INVALID, reason)
```

### 7.7 Resolution Errors

| Error Code | Description | Recovery |
|------------|-------------|----------|
| `ERR_NOT_FOUND` | DID does not exist | None; DID invalid |
| `ERR_DEACTIVATED` | Identity was deactivated | None; identity terminated |
| `ERR_DOCUMENT_UNAVAILABLE` | Off-chain document not accessible | Retry with backoff |
| `ERR_HASH_MISMATCH` | Document hash doesn't match anchor | Report; possible attack |
| `ERR_INVALID_PROOF` | Document signature invalid | Report; possible attack |
| `ERR_EXPIRED_CACHE` | Cache miss, need fresh resolution | Re-resolve |
| `ERR_CHAIN_UNAVAILABLE` | Cannot reach blockchain | Retry; use cached if fresh |
| `ERR_MALFORMED_DOCUMENT` | Document structure invalid | Report; issuer error |

### 7.8 Resolution Metadata

Resolution returns metadata alongside the document:

```
ResolutionResult := {
  document:           IdentityDocument,
  metadata: {
    resolved:         DateTime,        -- When resolution completed
    duration:         Milliseconds,    -- Resolution latency
    source:           ResolutionSource,-- cache | chain | network
    cached:           bool,            -- Whether from cache
    cacheExpires:     DateTime,        -- When cache entry expires
    documentVersion:  uint64,          -- Document versionId
    chainBlock:       uint64 | null,   -- Block number if anchored
  }
}
```

### 7.9 Resolution for Self

When wallet resolves its own DID:

```
ResolveSelf():
  1. Always use local authoritative document
  2. Skip cache (local is authoritative)
  3. Skip on-chain (may not be anchored yet)
  4. Return local document with source: "local"
```

---

## 8. Security Invariants

### 8.1 Document Integrity Invariants

```
INV-DOC-01: ∀ document D: D.proof verifies against D.controller
  "Every published document MUST have valid controller signature"

INV-DOC-02: ∀ document D: D.id matches requested DID
  "Document ID MUST match the DID being resolved"

INV-DOC-03: ∀ document D: |D.verificationMethod| >= 1
  "Document MUST have at least one verification method"

INV-DOC-04: ∀ document D: |D.authentication| >= 1
  "Document MUST have at least one authentication method"

INV-DOC-05: ∀ document D: D.versionId is monotonically increasing
  "Version MUST NOT decrease across document updates"

INV-DOC-06: ∀ document D: D.updated >= D.created
  "Update timestamp MUST NOT precede creation timestamp"
```

### 8.2 Key Rotation Invariants

```
INV-ROT-01: ∀ rotation R: R.continuityProof verifies
  "Every rotation MUST have valid continuity proof"

INV-ROT-02: ∀ rotation R: R preserves D.controller OR has explicit delegation
  "Rotation MUST NOT change controller without authorization"

INV-ROT-03: ∀ key K: deprecated(K) → ∃ successor(K)
  "Deprecated key MUST have a successor"

INV-ROT-04: ∀ rotation R: |active_authentication_methods| >= 1
  "At least one authentication method MUST remain active after rotation"

INV-ROT-05: ∀ key K: revoked(K) → on_chain_revocation_published(K)
  "Revoked keys MUST have on-chain revocation notice"
```

### 8.3 Resolution Invariants

```
INV-RES-01: ∀ resolution R: cached(R) → TTL(R) < MAX_TTL
  "Cached resolutions MUST respect maximum TTL"

INV-RES-02: ∀ resolution R over anchor: hash(R.document) == on_chain_hash
  "Anchored documents MUST match on-chain hash"

INV-RES-03: ∀ resolution R: R.document.proof.verificationMethod ∈ R.document.verificationMethod
  "Proof method MUST be listed in document"

INV-RES-04: ∀ resolution R: deactivated(R.did) → R fails with ERR_DEACTIVATED
  "Deactivated DIDs MUST fail resolution"
```

### 8.4 Controller Invariants

```
INV-CTL-01: ∀ document D: D.controller != ∅
  "Document MUST have at least one controller"

INV-CTL-02: ∀ self-sovereign identity I: I.controller == I.id
  "Self-sovereign identities MUST control themselves"

INV-CTL-03: ∀ document update U: U.proof signed by current controller
  "Updates MUST be signed by current controller"

INV-CTL-04: Controller cycles are forbidden
  "A → B → C → A controller chains are invalid"
```

### 8.5 Verification Method Invariants

```
INV-VM-01: ∀ method M: M.id is unique within document
  "Verification method IDs MUST be unique"

INV-VM-02: ∀ method M: M.id == D.id + "#" + fragment
  "Method ID MUST be DID with fragment"

INV-VM-03: ∀ method M: M.type ∈ allowed_types
  "Method type MUST be in allowed set"

INV-VM-04: ∀ method M: M.controller is resolvable DID
  "Method controller MUST be resolvable"

INV-VM-05: ∀ method M in keyAgreement: M.type supports ECDH
  "Key agreement methods MUST support key exchange"
```

### 8.6 Recovery Hook Invariants

```
INV-REC-01: recoveryHooks.enabled → |guardians| >= 2
  "Enabled recovery requires at least 2 guardians"

INV-REC-02: threshold <= |guardians|
  "Threshold MUST NOT exceed guardian count"

INV-REC-03: timelock >= P1D
  "Recovery timelock MUST be at least 1 day"

INV-REC-04: configProof verifies against controller
  "Recovery config MUST be signed by controller"
```

### 8.7 Invariant Enforcement

All implementations MUST:

1. **Validate on Creation:** Check all invariants when creating identity
2. **Validate on Update:** Re-check relevant invariants on any modification
3. **Validate on Resolution:** Verify retrieved documents against invariants
4. **Reject on Violation:** Refuse to process documents that violate invariants
5. **Log Violations:** Record invariant violations with full context
6. **Never Suppress:** Invariant violations MUST NOT be silently ignored

---

## Appendix A: Identity Document Examples

### A.1 Minimal Self-Sovereign Identity

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://aoc.protocol/identity/v1"
  ],
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur3XMDLBVoETqEsEaTVDc7qH6VrMZ"
    }
  ],
  "authentication": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "assertionMethod": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "created": "2026-02-01T12:00:00Z",
  "updated": "2026-02-01T12:00:00Z",
  "versionId": 1,
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2026-02-01T12:00:00Z",
    "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3FXQjecWufY46yg7irA8mTCHQxHYqvNkQNXhYkhjw4SZT8LfDqJKB1W"
  }
}
```

### A.2 Full-Featured Identity with Key Agreement and Recovery

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://aoc.protocol/identity/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur3XMDLBVoETqEsEaTVDc7qH6VrMZ"
    },
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#recovery-1",
      "type": "EcdsaSecp256k1RecoveryMethod2020",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "blockchainAccountId": "eip155:8453:0x742d35Cc6634C0532925a3b844Bc9e7595f2bC1A"
    },
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-agreement-1",
      "type": "X25519KeyAgreementKey2020",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc"
    }
  ],
  "authentication": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "assertionMethod": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "keyAgreement": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-agreement-1"
  ],
  "capabilityInvocation": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
  ],
  "service": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#wallet",
      "type": "AOCWallet",
      "serviceEndpoint": "https://wallet.example.com/api/v1"
    }
  ],
  "recoveryHooks": {
    "enabled": true,
    "mechanism": "social_recovery",
    "guardians": [
      {
        "id": "guardian-1",
        "publicKeyHash": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        "weight": 1
      },
      {
        "id": "guardian-2",
        "publicKeyHash": "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
        "weight": 1
      },
      {
        "id": "guardian-3",
        "publicKeyHash": "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
        "weight": 1
      }
    ],
    "threshold": 2,
    "timelock": "P7D"
  },
  "created": "2026-02-01T12:00:00Z",
  "updated": "2026-02-01T12:00:00Z",
  "versionId": 1,
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2026-02-01T12:00:00Z",
    "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3FXQjecWufY46yg7irA8mTCHQxHYqvNkQNXhYkhjw4SZT8LfDqJKB1W"
  }
}
```

### A.3 Post-Rotation Identity Document

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://aoc.protocol/identity/v1"
  ],
  "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
  "verificationMethod": [
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shbgnTGcgBpXPdBjDur3XMDLBVoETqEsEaTVDc7qH6VrMZ",
      "deprecated": "2026-02-15T12:00:00Z",
      "deprecatedBy": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2"
    },
    {
      "id": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m",
      "publicKeyMultibase": "zQ3shmNEWKEYAfterRotation123456789abcdefghijk",
      "created": "2026-02-15T12:00:00Z",
      "rotatedFrom": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1"
    }
  ],
  "authentication": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2"
  ],
  "assertionMethod": [
    "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2"
  ],
  "continuityProof": {
    "type": "KeyRotationProof",
    "previousKey": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "newKey": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-2",
    "timestamp": "2026-02-15T12:00:00Z",
    "nonce": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "proofValue": "z4Hk9jRsTuVwXyZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0s"
  },
  "created": "2026-02-01T12:00:00Z",
  "updated": "2026-02-15T12:00:00Z",
  "versionId": 2,
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "created": "2026-02-15T12:00:00Z",
    "verificationMethod": "did:aoc:key:9Kz2FMNxWJqR7sE4tYpV3m#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5JkLmNoP1qRsTuVwXyZ2aB3cD4eF5gH6iJ7kL8mN9oP0"
  }
}
```

---

## Appendix B: DID Method Comparison

| Aspect | did:aoc:key | did:aoc:anchor | did:aoc:peer |
|--------|-------------|----------------|--------------|
| **Creation Cost** | Free | Gas required | Free |
| **Resolution** | Local/Network | Chain + Network | Session only |
| **Persistence** | Permanent | Permanent | Ephemeral |
| **Non-Repudiation** | Via signature | Via chain | Limited |
| **Privacy** | High | Medium | Highest |
| **Use Case** | Primary identity | High-value ops | P2P sessions |
| **Key Rotation** | Supported | Supported | N/A |
| **Recovery** | Via social | Via contract | N/A |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial identity specification |

---

*This document is normative. Implementations MUST conform to produce interoperable AOC identities.*
