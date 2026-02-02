# AOC Sovereign Wallet — Cryptographic Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](./architecture.md), [threat-model.md](./threat-model.md)

---

## Table of Contents

1. [Cryptographic Primitives](#1-cryptographic-primitives)
2. [Key Hierarchy](#2-key-hierarchy)
3. [Canonicalization Rules](#3-canonicalization-rules)
4. [AOC-ID Construction](#4-aoc-id-construction)
5. [Encryption Format](#5-encryption-format)
6. [Nonce Strategy](#6-nonce-strategy)
7. [Signature Formats](#7-signature-formats)
8. [Consent Token Format](#8-consent-token-format)
9. [Domain Separation](#9-domain-separation)
10. [Security Invariants](#10-security-invariants)
11. [Versioning Strategy](#11-versioning-strategy)

---

## 1. Cryptographic Primitives

### 1.1 Summary Table

| Function | Algorithm | Parameters | Security Level | Reference |
|----------|-----------|------------|----------------|-----------|
| Hash | SHA-256 | - | 128-bit collision | FIPS 180-4 |
| Hash (EVM) | Keccak-256 | - | 128-bit collision | FIPS 202 |
| Symmetric Encryption | AES-256-GCM | 256-bit key, 96-bit nonce | 256-bit | NIST SP 800-38D |
| Asymmetric Signature | ECDSA | secp256k1 | 128-bit | SEC 2 |
| Key Agreement | ECDH | secp256k1 | 128-bit | SEC 1 |
| Key Derivation | HKDF | SHA-256 | 256-bit | RFC 5869 |
| Password Derivation | Argon2id | t=3, m=64MB, p=4 | 128-bit | RFC 9106 |

### 1.2 Hash Functions

#### 1.2.1 SHA-256

**Usage:** Content addressing, key derivation, Merkle trees, general hashing.

```
H_sha256(m) := SHA-256(m)
Output: 32 bytes (256 bits)
```

**Rationale:** Widely audited, hardware acceleration available, sufficient security margin.

#### 1.2.2 Keccak-256

**Usage:** EVM-compatible operations, Ethereum address derivation, EIP-712 hashing.

```
H_keccak(m) := Keccak-256(m)
Output: 32 bytes (256 bits)
```

**Rationale:** Required for EVM compatibility; used by Ethereum for address derivation and typed data hashing.

### 1.3 Symmetric Encryption

#### 1.3.1 AES-256-GCM

**Usage:** Field encryption, blob encryption, backup encryption.

```
Encrypt(K, N, P, A) := AES-256-GCM.Encrypt(K, N, P, A)
  K: 256-bit key
  N: 96-bit nonce (12 bytes)
  P: plaintext (arbitrary length)
  A: additional authenticated data (may be empty)
  Output: (ciphertext, tag) where tag is 128 bits (16 bytes)

Decrypt(K, N, C, T, A) := AES-256-GCM.Decrypt(K, N, C, T, A)
  Returns: plaintext OR ⊥ (authentication failure)
```

**Parameters:**
- Key size: 256 bits
- Nonce size: 96 bits (REQUIRED)
- Tag size: 128 bits (REQUIRED, no truncation)
- Max plaintext per key: 2^32 - 2 blocks (64 GB)
- Max invocations per key: 2^32 (with random nonces) or 2^64 (with counter nonces)

**Rationale:** Authenticated encryption provides confidentiality and integrity. Hardware acceleration (AES-NI) widely available.

### 1.4 Asymmetric Signature

#### 1.4.1 ECDSA over secp256k1

**Usage:** Consent signing, pack signing, transaction signing.

```
Sign(sk, m) := ECDSA.Sign(sk, H_keccak(m))
  sk: 256-bit private key
  m: message (arbitrary length)
  Output: (r, s) where r, s are 256-bit integers

Verify(pk, m, σ) := ECDSA.Verify(pk, H_keccak(m), σ)
  pk: public key point on secp256k1
  Returns: true OR false
```

**Curve Parameters (secp256k1):**
```
p  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
n  = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
```

**Signature Canonicalization (Low-S):**
```
IF s > n/2 THEN s := n - s
```

All implementations MUST produce low-S signatures to prevent malleability.

**Rationale:** EVM-native, widely supported, enables on-chain verification.

### 1.5 Key Agreement

#### 1.5.1 ECDH over secp256k1

**Usage:** Deriving shared secrets for encrypted communication.

```
ECDH(sk_a, pk_b) := (sk_a * pk_b).x
  sk_a: private key of party A
  pk_b: public key of party B
  Output: 256-bit shared secret (x-coordinate only)
```

**Post-Processing:**
```
SharedKey := HKDF-SHA256(
  IKM = ECDH(sk_a, pk_b),
  salt = "aoc-ecdh-v1",
  info = pk_a || pk_b,
  L = 32
)
```

Public keys in `info` MUST be ordered lexicographically (compressed form).

### 1.6 Key Derivation

#### 1.6.1 HKDF-SHA256

**Usage:** Deriving subkeys from master key material.

```
HKDF-Extract(salt, IKM) := HMAC-SHA256(salt, IKM)
  Output: 32-byte PRK

HKDF-Expand(PRK, info, L) := T(1) || T(2) || ... || T(N) truncated to L bytes
  T(0) = ""
  T(i) = HMAC-SHA256(PRK, T(i-1) || info || i)

HKDF(salt, IKM, info, L) := HKDF-Expand(HKDF-Extract(salt, IKM), info, L)
```

**Parameters:**
- Hash: SHA-256
- Output length (L): As specified per derivation

#### 1.6.2 Argon2id

**Usage:** Deriving encryption key from user passphrase (seed encryption).

```
Argon2id(P, S, t, m, p, T) := Argon2(P, S, t, m, p, T, type=id)
  P: passphrase (UTF-8 encoded)
  S: salt (16 bytes, random)
  t: iterations = 3
  m: memory = 65536 KiB (64 MB)
  p: parallelism = 4
  T: tag length = 32 bytes
  Output: 32-byte derived key
```

**Rationale:** Memory-hard function resistant to GPU/ASIC attacks. Argon2id combines Argon2i (side-channel resistance) and Argon2d (GPU resistance).

---

## 2. Key Hierarchy

### 2.1 Overview

```
                    ┌─────────────────┐
                    │   Master Seed   │
                    │   (BIP-39)      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Master Key    │
                    │   (MK)          │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Identity Key│   │  Vault Key  │   │ Signing Key │
    │    (IK)     │   │    (VK)     │   │    (SK)     │
    └──────┬──────┘   └──────┬──────┘   └─────────────┘
           │                 │
           │          ┌──────┴──────┐
           │          │             │
           │   ┌──────▼──────┐ ┌────▼────┐
           │   │  Field Keys │ │Pack Keys│
           │   │    (FK_i)   │ │ (PK_j)  │
           │   └─────────────┘ └─────────┘
           │
    ┌──────▼──────┐
    │  DID Keys   │
    │  (BIP-44)   │
    └─────────────┘
```

### 2.2 Master Seed

**Generation:**
```
Entropy := CSPRNG(256 bits)  // 256 bits for 24-word mnemonic
Mnemonic := BIP39.ToMnemonic(Entropy)
Seed := PBKDF2-HMAC-SHA512(Mnemonic, "mnemonic" || Passphrase, 2048, 64)
```

**Parameters:**
- Entropy: 128, 160, 192, 224, or 256 bits (RECOMMENDED: 256 bits)
- Mnemonic: 12, 15, 18, 21, or 24 words (RECOMMENDED: 24 words)
- Passphrase: Optional, UTF-8 NFKD normalized

### 2.3 Master Key (MK)

**Derivation:**
```
MK := HKDF-SHA256(
  salt = "aoc-master-key-v1",
  IKM  = Seed,
  info = "master",
  L    = 32
)
```

**Usage:** Root key for all wallet derivations. NEVER used directly for encryption or signing.

### 2.4 Identity Key (IK)

**Derivation (BIP-44 Compatible):**
```
Path := m/44'/60'/0'/0/0  // Ethereum-compatible path
IK_private := BIP32.Derive(Seed, Path)
IK_public := secp256k1.PublicKey(IK_private)
```

**Usage:** Primary wallet identity, DID key binding, consent signing.

### 2.5 Vault Key (VK)

**Derivation:**
```
VK := HKDF-SHA256(
  salt = "aoc-vault-key-v1",
  IKM  = MK,
  info = "vault",
  L    = 32
)
```

**Usage:** Root key for field encryption. NEVER used directly.

### 2.6 Field Key (FK)

**Derivation:**
```
FK_i := HKDF-SHA256(
  salt = VK,
  IKM  = H_sha256(field_id),
  info = "field" || version_byte,
  L    = 32
)

where:
  field_id: UTF-8 encoded SDL field identifier (e.g., "person.name.legal.full")
  version_byte: 0x01 for v1
```

**Usage:** Encrypts individual SDL fields. Each field has a unique key.

### 2.7 Pack Key (PK)

**Derivation:**
```
PK_j := HKDF-SHA256(
  salt = VK,
  IKM  = pack_id || created_at,
  info = "pack" || version_byte,
  L    = 32
)

where:
  pack_id: 16-byte UUID
  created_at: 8-byte Unix timestamp (big-endian)
  version_byte: 0x01 for v1
```

**Usage:** Encrypts pack contents before sharing. Per-pack key derivation.

### 2.8 Session Key (SK)

**Derivation:**
```
SK := HKDF-SHA256(
  salt = ECDH(wallet_sk, market_pk),
  IKM  = session_id || timestamp,
  info = "session" || wallet_did || market_did,
  L    = 32
)

where:
  session_id: 16-byte random value
  timestamp: 8-byte Unix timestamp (big-endian)
```

**Usage:** Ephemeral key for market session encryption.

### 2.9 Backup Encryption Key (BK)

**Derivation from Passphrase:**
```
Salt := CSPRNG(16 bytes)
BK := Argon2id(Passphrase, Salt, t=3, m=65536, p=4, T=32)
```

**Usage:** Encrypts wallet backup bundles.

---

## 3. Canonicalization Rules

### 3.1 Canonical JSON

All JSON structures MUST be canonicalized before hashing or signing.

#### 3.1.1 Field Ordering

Keys MUST be sorted lexicographically by Unicode code point.

```
CORRECT:   {"a": 1, "b": 2, "z": 3}
INCORRECT: {"z": 3, "a": 1, "b": 2}
```

Nested objects are sorted recursively.

#### 3.1.2 Whitespace

- No whitespace between tokens
- No trailing newline

```
CORRECT:   {"key":"value","num":42}
INCORRECT: { "key" : "value", "num" : 42 }
```

#### 3.1.3 String Encoding

- Strings MUST be UTF-8 encoded
- Unicode MUST be NFC normalized before encoding
- Escape sequences: `\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`
- Non-ASCII characters: Use literal UTF-8, NOT `\uXXXX` escapes
- Control characters (U+0000 to U+001F): MUST use `\uXXXX` escapes

#### 3.1.4 Numeric Encoding

- Integers: No leading zeros, no decimal point
- Negative zero: Encode as `0`, not `-0`
- Floating point: Not permitted in canonical form; use strings
- Large integers (>2^53): Encode as strings

```
CORRECT:   {"amount": "12345678901234567890"}
INCORRECT: {"amount": 12345678901234567890}
```

#### 3.1.5 Boolean and Null

- Boolean: `true` or `false` (lowercase)
- Null: `null` (lowercase)

#### 3.1.6 Array Ordering

Arrays maintain their original order (no sorting).

### 3.2 Canonical Binary

For binary data in hash inputs:

#### 3.2.1 Integer Encoding

- Unsigned integers: Big-endian, fixed width
- Lengths: 4-byte big-endian unless specified
- Timestamps: 8-byte big-endian Unix seconds

#### 3.2.2 String Encoding

```
encode_string(s) := length(s) || UTF-8(s)
where length is 4-byte big-endian
```

#### 3.2.3 Byte Array Encoding

```
encode_bytes(b) := length(b) || b
where length is 4-byte big-endian
```

---

## 4. AOC-ID Construction

### 4.1 Field ID

SDL field identifiers are namespaced strings.

**Format:**
```
field_id := namespace "." category "." subcategory "." attribute
Example: "person.name.legal.full"
```

**Constraints:**
- Lowercase ASCII alphanumeric and dots only: `[a-z0-9.]+`
- Maximum length: 256 bytes
- Minimum depth: 2 components
- Maximum depth: 8 components

### 4.2 Content ID (CID)

Content-addressed identifier for encrypted objects.

**Construction:**
```
CID := "aoc:cid:" || Base58(H_sha256(encrypted_blob))
```

**Example:**
```
aoc:cid:QmYwAPJzv5CZsnAzt8auVZRn5rNnTB1Y7npFrkg5e7h9KP
```

### 4.3 Pack ID

Unique identifier for data packs.

**Construction:**
```
pack_id := UUIDv4()
Pack_URI := "aoc://pack/" || Base58(pack_id)
```

**Example:**
```
aoc://pack/2DrjgbN7v5TJfQkX9BCXP4
```

### 4.4 Consent ID

Unique identifier for consent tokens.

**Construction:**
```
consent_id := UUIDv4()
Consent_URI := "aoc://consent/" || Base58(consent_id)
```

### 4.5 DID Construction

Self-sovereign identifier derived from initial public key.

**Construction:**
```
DID := "did:aoc:" || Base58(H_sha256(IK_public_compressed)[0:20])
```

**Example:**
```
did:aoc:7sHxtdZ9bE3F5kNmZM4vbU
```

**Properties:**
- Deterministic from public key
- 20-byte truncated hash (160 bits)
- Base58 encoded (no ambiguous characters)

---

## 5. Encryption Format

### 5.1 Encrypted Object Structure

```
EncryptedObject := {
  version:      uint8,        // Protocol version (0x01)
  algorithm_id: uint8,        // Algorithm identifier
  key_id:       bytes[32],    // Key identifier (hash of derivation path)
  nonce:        bytes[12],    // 96-bit nonce
  ciphertext:   bytes[],      // Encrypted data
  auth_tag:     bytes[16]     // GCM authentication tag
}
```

### 5.2 Algorithm Identifiers

| ID | Algorithm | Key Size | Notes |
|----|-----------|----------|-------|
| 0x01 | AES-256-GCM | 256-bit | Default, REQUIRED |
| 0x02 | ChaCha20-Poly1305 | 256-bit | OPTIONAL, future |
| 0x00 | Reserved | - | Invalid |
| 0xFF | Reserved | - | Experimental |

### 5.3 Binary Encoding

```
Encoded := version || algorithm_id || key_id || nonce || length(ciphertext) || ciphertext || auth_tag

where:
  version:            1 byte
  algorithm_id:       1 byte
  key_id:            32 bytes
  nonce:             12 bytes
  length(ciphertext): 4 bytes (big-endian)
  ciphertext:        variable
  auth_tag:          16 bytes
```

**Total overhead:** 66 bytes + ciphertext length

### 5.4 Base64url Encoding

For JSON transport:
```
encoded_string := Base64url(Encoded)
```

Base64url per RFC 4648 Section 5 (no padding).

### 5.5 Additional Authenticated Data (AAD)

AAD for field encryption:
```
AAD := domain_tag || field_id || version
where:
  domain_tag: "aoc-field-encrypt-v1" (UTF-8)
  field_id:   UTF-8 encoded field identifier
  version:    1 byte (0x01)
```

AAD for pack encryption:
```
AAD := domain_tag || pack_id || created_at
where:
  domain_tag: "aoc-pack-encrypt-v1" (UTF-8)
  pack_id:    16 bytes
  created_at: 8 bytes (Unix timestamp, big-endian)
```

---

## 6. Nonce Strategy

### 6.1 Nonce Generation

#### 6.1.1 Counter-Based Nonces (RECOMMENDED for fields)

```
Nonce := counter[8] || random[4]
where:
  counter: 64-bit monotonic counter (big-endian)
  random:  32-bit random value
```

**Counter Management:**
- Counter MUST be persisted atomically with ciphertext
- Counter MUST NOT reset on restart
- Counter MUST be per-key
- Counter overflow: Derive new key

#### 6.1.2 Random Nonces (for packs and sessions)

```
Nonce := CSPRNG(12 bytes)
```

**Constraints:**
- Maximum 2^32 encryptions per key with random nonces
- Birthday bound: P(collision) = 1 - e^(-n²/2^97) ≈ n²/2^97

### 6.2 Nonce Persistence

**Requirements:**
1. Counter state MUST be written to stable storage BEFORE encryption output is written
2. On crash recovery: Counter MUST be incremented by safety margin (1000)
3. Counter state MUST be integrity-protected (MAC or signature)

**Counter State Format:**
```
CounterState := {
  key_id:    bytes[32],
  counter:   uint64,
  updated:   uint64,      // Unix timestamp
  hmac:      bytes[32]    // HMAC-SHA256(counter_key, key_id || counter || updated)
}
```

### 6.3 Failure Handling

| Failure | Action |
|---------|--------|
| Counter read fails | ABORT, do not encrypt |
| Counter write fails | ABORT, do not output ciphertext |
| Counter overflow | Derive new key, reset counter |
| Nonce collision detected | ABORT, alert user |

---

## 7. Signature Formats

### 7.1 Raw Message Signing

**Not recommended for structured data.** Use EIP-712 style signing instead.

```
signature := ECDSA.Sign(sk, H_keccak("\x19Ethereum Signed Message:\n" || len(m) || m))
```

### 7.2 Structured Data Signing (EIP-712 Style)

#### 7.2.1 Domain Separator

```
DomainSeparator := H_keccak(
  encode(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  ) ||
  H_keccak("AOC Sovereign Wallet") ||
  H_keccak("1") ||
  encode(chainId) ||
  encode(verifyingContract)
)
```

**AOC Domain Parameters:**
- name: "AOC Sovereign Wallet"
- version: "1"
- chainId: 8453 (Base Mainnet) or 84532 (Base Sepolia)
- verifyingContract: AOC registry contract address

#### 7.2.2 Type Hash

```
TypeHash := H_keccak(encode(TypeDefinition))
```

#### 7.2.3 Struct Hash

```
StructHash := H_keccak(TypeHash || encode(struct_values))
```

#### 7.2.4 Final Signature

```
digest := H_keccak("\x19\x01" || DomainSeparator || StructHash)
signature := ECDSA.Sign(sk, digest)
```

### 7.3 Signature Encoding

```
Signature := {
  r: bytes[32],     // Big-endian
  s: bytes[32],     // Big-endian, low-S normalized
  v: uint8          // Recovery ID (27 or 28)
}

Compact := r || s || v  // 65 bytes total
```

### 7.4 Signature Verification

```
Verify(pk, message, signature):
  1. Parse (r, s, v) from signature
  2. Check: 0 < r < n AND 0 < s < n/2 (low-S)
  3. Compute digest per signing scheme
  4. Recover public key from (digest, r, s, v)
  5. Compare recovered key with pk
  6. Return: match
```

---

## 8. Consent Token Format

### 8.1 Token Structure

```
ConsentToken := {
  version:      uint8,           // 0x01
  token_id:     bytes[16],       // UUIDv4
  subject_did:  string,          // Granting wallet DID
  grantee_did:  string,          // Receiving market DID
  scope:        string[],        // Array of field IDs
  purpose:      string,          // Purpose code
  constraints:  Constraints,     // Optional constraints
  issued_at:    uint64,          // Unix timestamp
  expires_at:   uint64,          // Unix timestamp
  nonce:        bytes[32],       // Random nonce
  signature:    bytes[65]        // ECDSA signature
}
```

### 8.2 Constraints Structure

```
Constraints := {
  max_access_count:  uint32 | null,   // Max resolutions
  ip_allowlist:      string[] | null, // CIDR ranges
  geo_fence:         string | null,   // ISO 3166-1 country code
  time_window:       TimeWindow | null
}

TimeWindow := {
  days:       uint8[],    // 0=Sun, 1=Mon, ..., 6=Sat
  start_hour: uint8,      // 0-23
  end_hour:   uint8       // 0-23
}
```

### 8.3 Token Signing

#### 8.3.1 Type Definition

```
ConsentToken(
  bytes16 tokenId,
  string subjectDid,
  string granteeDid,
  string[] scope,
  string purpose,
  uint64 issuedAt,
  uint64 expiresAt,
  bytes32 nonce,
  bytes32 constraintsHash
)
```

#### 8.3.2 Signing Process

```
1. constraintsHash := H_sha256(canonicalize(constraints))
2. typeHash := H_keccak(encode(ConsentToken type definition))
3. scopeHash := H_keccak(encode(scope array))
4. structHash := H_keccak(
     typeHash ||
     tokenId ||
     H_keccak(subjectDid) ||
     H_keccak(granteeDid) ||
     scopeHash ||
     H_keccak(purpose) ||
     encode(issuedAt) ||
     encode(expiresAt) ||
     nonce ||
     constraintsHash
   )
5. digest := H_keccak("\x19\x01" || DomainSeparator || structHash)
6. signature := ECDSA.Sign(subject_sk, digest)
```

### 8.4 Token Serialization

#### 8.4.1 JSON Format

```json
{
  "version": 1,
  "token_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_did": "did:aoc:7sHxtdZ9bE3F5kNmZM4vbU",
  "grantee_did": "did:aoc:market:hr.recruiting.v1",
  "scope": [
    "person.name.display",
    "work.skill.javascript.years"
  ],
  "purpose": "job_matching",
  "constraints": {
    "max_access_count": 10,
    "ip_allowlist": null,
    "geo_fence": null,
    "time_window": null
  },
  "issued_at": 1706745600,
  "expires_at": 1709424000,
  "nonce": "a1b2c3d4e5f6...",
  "signature": "0x1234..."
}
```

#### 8.4.2 Compact Binary Format

```
CompactToken :=
  version[1] ||
  token_id[16] ||
  subject_did_hash[20] ||
  grantee_did_hash[20] ||
  scope_count[2] ||
  scope_hashes[scope_count * 32] ||
  purpose_hash[32] ||
  constraints_hash[32] ||
  issued_at[8] ||
  expires_at[8] ||
  nonce[32] ||
  signature[65]
```

### 8.5 Token Validation

```
ValidateToken(token, current_time):
  1. Check version == 0x01
  2. Check token_id is valid UUIDv4
  3. Check issued_at < current_time < expires_at
  4. Check scope is non-empty
  5. Check nonce is unique (not replayed)
  6. Resolve subject_did to public key
  7. Verify signature against public key
  8. Check constraints if present
  9. Return: VALID or (INVALID, reason)
```

---

## 9. Domain Separation

### 9.1 Domain Tags

All cryptographic operations MUST use domain separation tags to prevent cross-protocol attacks.

| Operation | Domain Tag (UTF-8) |
|-----------|-------------------|
| Field Encryption | `aoc-field-encrypt-v1` |
| Pack Encryption | `aoc-pack-encrypt-v1` |
| Backup Encryption | `aoc-backup-encrypt-v1` |
| Session Encryption | `aoc-session-encrypt-v1` |
| Consent Signing | `aoc-consent-sign-v1` |
| Pack Signing | `aoc-pack-sign-v1` |
| Revocation Signing | `aoc-revocation-sign-v1` |
| DID Document Signing | `aoc-did-sign-v1` |
| Key Derivation | `aoc-kdf-v1` |
| Content Addressing | `aoc-content-id-v1` |

### 9.2 Tag Usage

#### 9.2.1 In HKDF

```
DerivedKey := HKDF-SHA256(
  salt = parent_key,
  IKM  = input_material,
  info = domain_tag || context,
  L    = key_length
)
```

#### 9.2.2 In AEAD AAD

```
AAD := domain_tag || object_id || metadata
```

#### 9.2.3 In Signatures

```
message_to_sign := domain_tag || canonical_data
```

### 9.3 Version Migration

When domain tag version changes:
1. Old tags remain valid for verification
2. New operations use new tag
3. Re-encryption/re-signing uses new tag
4. Old tag support removed after deprecation period

---

## 10. Security Invariants

### 10.1 Key Management Invariants

```
INV-KM-01: ∀ encryption E: nonce(E) unique for key(E)
  "Nonce MUST never be reused with the same key"

INV-KM-02: ∀ key K: exported(K) → encrypted(K)
  "Keys MUST never be exported in plaintext"

INV-KM-03: ∀ private_key SK: memory_location(SK) → secure_memory(SK)
  "Private keys MUST reside in secure memory"

INV-KM-04: ∀ key K: deleted(K) → zeroed(memory(K))
  "Deleted keys MUST be zeroized from memory"

INV-KM-05: ∀ signature S: low_s(S.s)
  "All signatures MUST use low-S form"
```

### 10.2 Encryption Invariants

```
INV-ENC-01: ∀ decryption D: ¬valid_auth_tag(D) → ⊥
  "Decryption MUST fail if authentication tag is invalid"

INV-ENC-02: ∀ ciphertext C: length(C) ∈ {1024, 4096, 16384, 65536, 262144}
  "Ciphertext MUST be padded to standard size classes"

INV-ENC-03: ∀ encryption E: AAD(E) includes domain_tag
  "All encryptions MUST include domain separation in AAD"

INV-ENC-04: ∀ nonce N: counter_persisted(N) → output_written(E(N))
  "Counter MUST be persisted before ciphertext is output"
```

### 10.3 Signature Invariants

```
INV-SIG-01: ∀ message M, signature S: process(M, S) → verified(M, S)
  "Signature MUST verify before message is processed"

INV-SIG-02: ∀ structured_data D: sign(D) → domain_separated(D)
  "Structured data signing MUST use domain separation"

INV-SIG-03: ∀ signature S: S.r ∈ (0, n) ∧ S.s ∈ (0, n/2]
  "Signature components MUST be in valid range"
```

### 10.4 Consent Invariants

```
INV-CON-01: ∀ field_access F: ∃ consent C: active(C) ∧ F ∈ scope(C)
  "Field access MUST have active consent covering that field"

INV-CON-02: ∀ consent C: expires_at(C) > issued_at(C)
  "Consent expiration MUST be after issuance"

INV-CON-03: ∀ consent C: scope(C) ≠ ∅
  "Consent scope MUST be non-empty"

INV-CON-04: ∀ consent C: revoked(C) → ∀t > revocation_time: ¬valid(C, t)
  "Revoked consent MUST be invalid immediately"

INV-CON-05: ∀ consent C: nonce(C) unique globally
  "Consent nonce MUST be globally unique"
```

### 10.5 Integrity Invariants

```
INV-INT-01: ∀ content_id CID, blob B: CID = hash(B)
  "Content ID MUST equal hash of content"

INV-INT-02: ∀ blob B, stored S: retrieve(CID(B)) ≠ B → ABORT
  "Hash mismatch MUST abort processing"

INV-INT-03: ∀ pack P: signature(P) covers hash(contents(P))
  "Pack signature MUST cover content hash"
```

### 10.6 Invariant Verification

All implementations MUST:
1. Check invariants at enforcement points
2. Log invariant violations with full context
3. Abort operation on any violation
4. Never silently ignore violations

---

## 11. Versioning Strategy

### 11.1 Version Fields

| Component | Version Field | Current | Format |
|-----------|---------------|---------|--------|
| Crypto Spec | spec_version | 0.1 | semver |
| EncryptedObject | version | 0x01 | uint8 |
| ConsentToken | version | 0x01 | uint8 |
| DID Method | did:aoc:v | 1 | uint |
| Domain Tags | suffix | v1 | string |

### 11.2 Version Semantics

#### 11.2.1 Major Version (X.0.0)

Breaking changes requiring migration:
- Algorithm changes
- Format changes
- Removed features

**Migration:** Explicit re-encryption/re-signing required.

#### 11.2.2 Minor Version (0.X.0)

Backward-compatible additions:
- New optional fields
- New algorithm options
- Extended constraints

**Migration:** None required; old data remains valid.

#### 11.2.3 Patch Version (0.0.X)

Bug fixes, clarifications:
- Spec clarifications
- Test vector additions
- Editorial changes

**Migration:** None required.

### 11.3 Backward Compatibility

#### 11.3.1 Reading Old Versions

Implementations MUST:
- Accept all previous minor versions
- Accept previous major version for 1 year after deprecation
- Clearly indicate when reading deprecated format

#### 11.3.2 Writing New Data

Implementations MUST:
- Always write latest version
- Never write deprecated formats
- Include version in all serialized structures

### 11.4 Algorithm Deprecation

| Phase | Duration | Actions |
|-------|----------|---------|
| Active | Unlimited | Full support |
| Deprecated | 1 year | Read-only, warn on use |
| Legacy | 1 year | Read-only, error on new data |
| Removed | - | Reject, migration required |

### 11.5 Deprecation Announcements

Deprecations MUST be announced:
- 6 months before deprecated phase
- In spec changelog
- In implementation release notes
- With migration guide

---

## Appendix A: Test Vectors

### A.1 Key Derivation

**Input:**
```
Mnemonic: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
Passphrase: ""
```

**Expected:**
```
Seed: 5eb00bbddcf069084889a8ab9155568165f5c453ccb85e70811aaed6f6da5fc19a5ac40b389cd370d086206dec8aa6c43daea6690f20ad3d8d48b2d2ce9e38e4
MK: [derived per spec]
VK: [derived per spec]
IK (m/44'/60'/0'/0/0): [derived per spec]
```

### A.2 Encryption

**Input:**
```
Key: 0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f
Nonce: 0x000000000000000000000001
Plaintext: "Hello, AOC!"
AAD: "aoc-field-encrypt-v1"
```

**Expected:**
```
Ciphertext: [computed per AES-256-GCM]
Tag: [computed per AES-256-GCM]
```

### A.3 Signature

**Input:**
```
Private Key: 0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
Message: "Test message"
```

**Expected:**
```
Digest: H_keccak("\x19Ethereum Signed Message:\n12Test message")
Signature (r, s, v): [computed per ECDSA]
```

---

## Appendix B: Reference Implementations

Conforming implementations SHOULD be tested against:
- Noble-secp256k1 (JavaScript)
- libsecp256k1 (C)
- ethers.js (JavaScript)
- Web Crypto API (JavaScript)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial cryptographic specification |

---

*This document is normative. Implementations MUST conform to produce interoperable results.*
