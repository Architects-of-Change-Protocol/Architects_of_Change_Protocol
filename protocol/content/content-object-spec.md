# AOC Protocol — Content Object Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](../wallet/architecture.md), [crypto-spec.md](../wallet/crypto-spec.md)

---

## Table of Contents

1. [Content Object Definition](#1-content-object-definition)
2. [Content Object Fields](#2-content-object-fields)
3. [Field Semantics](#3-field-semantics)
4. [Canonical Payload Boundary](#4-canonical-payload-boundary)
5. [Deterministic Encoding Rules](#5-deterministic-encoding-rules)
6. [Content Hash](#6-content-hash)
7. [Storage Pointer](#7-storage-pointer)
8. [Extensibility Rules](#8-extensibility-rules)
9. [Example Content Object](#9-example-content-object)
10. [Security Invariants](#10-security-invariants)
11. [Versioning Strategy](#11-versioning-strategy)

---

## 1. Content Object Definition

### 1.1 Overview

A **Content Object** is a cryptographically verifiable, immutable reference to a single unit of user data within the AOC Protocol. The Content Object does not embed the actual data; it serves as a deterministic descriptor that binds metadata to a storage location through content addressing.

**Formal Definition:**

```
ContentObject := {
  version:      Version,        -- protocol version identifier
  subject:      DID,            -- data owner identifier
  content_type: MediaType,      -- IANA media type
  bytes:        PositiveInt,    -- exact size of referenced blob
  storage:      StoragePointer, -- location and integrity binding
  created_at:   Timestamp,      -- creation time (Unix seconds)
  content_hash: Hash            -- canonical payload hash
}
```

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Once created, a Content Object MUST NOT be modified; changes require a new object |
| **Content Addressing** | The `content_hash` field provides a unique, deterministic identifier |
| **Storage Agnosticism** | The object describes *what* is stored, not *how* to retrieve it |
| **Offline Verifiability** | All integrity checks MUST be computable without network access |
| **Determinism** | Identical inputs MUST produce identical Content Objects |
| **Minimal Surface** | Only essential fields are included; no application-specific data |

### 1.3 Relationship to Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                          │
│              (Consumers of Content Objects)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROTOCOL LAYER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Content Object                        │  │
│  │                                                        │  │
│  │   • Describes data unit                               │  │
│  │   • Binds to storage pointer                          │  │
│  │   • Provides content hash                             │  │
│  │   • Enables offline verification                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                              │
│         (Any backend: local, cloud, distributed)             │
└─────────────────────────────────────────────────────────────┘
```

Content Objects are protocol-level constructs. Applications consume them; storage backends fulfill them. The Content Object itself is neither application logic nor storage implementation.

---

## 2. Content Object Fields

### 2.1 Field Summary

| Field | Type | Required | Mutable | Description |
|-------|------|----------|---------|-------------|
| `version` | string | REQUIRED | No | Protocol version identifier |
| `subject` | string | REQUIRED | No | DID of the data owner |
| `content_type` | string | REQUIRED | No | IANA media type of referenced data |
| `bytes` | integer | REQUIRED | No | Exact byte size of referenced blob |
| `storage` | object | REQUIRED | No | Storage pointer with backend and hash |
| `created_at` | integer | REQUIRED | No | Unix timestamp of object creation |
| `content_hash` | string | REQUIRED | No | SHA-256 hash of canonical payload |

### 2.2 Field Definitions

#### 2.2.1 version

| Property | Value |
|----------|-------|
| **Name** | `version` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Semantic version string: `MAJOR.MINOR` |
| **Constraints** | MUST match pattern `^[0-9]+\.[0-9]+$` |
| **Current Value** | `"1.0"` |

**Description:** Identifies the Content Object specification version used to construct this object. Implementations MUST reject objects with unsupported major versions.

#### 2.2.2 subject

| Property | Value |
|----------|-------|
| **Name** | `subject` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Decentralized Identifier (DID) |
| **Constraints** | MUST be a valid DID per W3C DID Core specification; MUST NOT be empty |
| **Max Length** | 512 bytes (UTF-8 encoded) |

**Description:** The DID of the entity that owns and controls the referenced data. This field establishes data sovereignty by binding content to a specific identity.

#### 2.2.3 content_type

| Property | Value |
|----------|-------|
| **Name** | `content_type` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | IANA Media Type (RFC 6838) |
| **Constraints** | MUST be a registered or valid custom media type; MUST NOT be empty |
| **Max Length** | 255 bytes (UTF-8 encoded) |

**Description:** The media type of the referenced blob. This field describes the format of the underlying data without revealing its contents.

**Examples:**
- `application/json`
- `application/octet-stream`
- `image/png`
- `application/x-aoc-encrypted`

#### 2.2.4 bytes

| Property | Value |
|----------|-------|
| **Name** | `bytes` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Unsigned 64-bit integer |
| **Constraints** | MUST be > 0; MUST exactly match the byte length of the referenced blob |
| **Max Value** | 2^53 - 1 (for JSON interoperability) |

**Description:** The exact size in bytes of the data blob referenced by the storage pointer. This value MUST match the actual blob size; any mismatch indicates corruption or tampering.

#### 2.2.5 storage

| Property | Value |
|----------|-------|
| **Name** | `storage` |
| **Type** | object (StoragePointer) |
| **Required** | REQUIRED |
| **Format** | See [Section 7: Storage Pointer](#7-storage-pointer) |
| **Constraints** | MUST contain valid `backend`, `uri`, and `hash` fields |

**Description:** A structured pointer describing where the data blob is stored and how to verify its integrity upon retrieval.

#### 2.2.6 created_at

| Property | Value |
|----------|-------|
| **Name** | `created_at` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Unix timestamp (seconds since 1970-01-01T00:00:00Z) |
| **Constraints** | MUST be > 0; MUST NOT be in the future relative to validation time |
| **Max Value** | 2^53 - 1 |

**Description:** The timestamp when this Content Object was created. This field is set once at creation time and MUST NOT be modified.

#### 2.2.7 content_hash

| Property | Value |
|----------|-------|
| **Name** | `content_hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase; MUST be the SHA-256 hash of the canonical payload |
| **Algorithm** | SHA-256 |

**Description:** The cryptographic hash of the canonical payload (see [Section 4](#4-canonical-payload-boundary)). This field enables content addressing and integrity verification.

---

## 3. Field Semantics

### 3.1 version

The `version` field declares the specification version governing the object's structure and semantics.

**Semantic Rules:**

1. Implementations MUST reject objects where the major version exceeds the highest supported major version
2. Implementations SHOULD accept objects with higher minor versions, ignoring unknown fields
3. Version comparison uses numeric ordering, not lexicographic ordering
4. Version `"1.0"` is the initial release version

**Version Compatibility Matrix:**

| Object Version | Implementation 1.0 | Implementation 1.1 | Implementation 2.0 |
|----------------|-------------------|-------------------|-------------------|
| 1.0 | Accept | Accept | Accept |
| 1.1 | Accept (ignore new) | Accept | Accept |
| 2.0 | Reject | Reject | Accept |

### 3.2 subject

The `subject` field establishes data ownership and sovereignty.

**Semantic Rules:**

1. The subject DID MUST resolve to a valid DID Document (resolution may be deferred)
2. Only the subject (or authorized delegates) MAY create Content Objects for their data
3. The subject field enables access control decisions at higher protocol layers
4. Subject binding is immutable; changing ownership requires a new Content Object

**Identity Binding:**

```
subject ─────────► DID Document ─────────► Verification Methods
                        │
                        └─────────────────► Service Endpoints
```

### 3.3 content_type

The `content_type` field describes the blob format without revealing contents.

**Semantic Rules:**

1. Content type MUST accurately describe the blob format
2. Encrypted blobs SHOULD use `application/octet-stream` or `application/x-aoc-encrypted`
3. Applications MUST NOT infer content semantics solely from content type
4. Content type is informational; the blob itself is authoritative

**Common Content Types:**

| Content Type | Usage |
|--------------|-------|
| `application/octet-stream` | Generic binary (default for encrypted) |
| `application/json` | JSON-structured data |
| `application/cbor` | CBOR-encoded data |
| `text/plain; charset=utf-8` | Plain text |
| `application/x-aoc-encrypted` | AOC-encrypted payload |

### 3.4 bytes

The `bytes` field provides exact size information for integrity verification.

**Semantic Rules:**

1. Retrieved blob size MUST exactly match the `bytes` value
2. Size mismatch MUST cause validation failure
3. Size information enables pre-allocation and progress indication
4. Size of zero is invalid; empty content MUST NOT be represented

**Verification Pseudocode:**

```
validate_size(content_object, blob):
  IF length(blob) != content_object.bytes THEN
    RETURN (INVALID, "size_mismatch")
  RETURN (VALID)
```

### 3.5 storage

The `storage` field provides retrieval location and integrity binding.

**Semantic Rules:**

1. Storage pointer MUST contain sufficient information to locate the blob
2. Storage hash MUST match the actual blob hash upon retrieval
3. Storage backend determines retrieval mechanism (implementation-specific)
4. Storage URI format depends on backend type

See [Section 7](#7-storage-pointer) for complete Storage Pointer specification.

### 3.6 created_at

The `created_at` field records the object creation timestamp.

**Semantic Rules:**

1. Timestamp MUST be set at object creation time
2. Timestamp MUST NOT be backdated or forward-dated beyond reasonable clock skew
3. Implementations SHOULD allow ±300 seconds clock skew tolerance
4. Timestamp enables ordering and freshness verification

**Clock Skew Handling:**

```
validate_timestamp(created_at, current_time, skew_tolerance):
  IF created_at > current_time + skew_tolerance THEN
    RETURN (INVALID, "future_timestamp")
  IF created_at <= 0 THEN
    RETURN (INVALID, "invalid_timestamp")
  RETURN (VALID)
```

### 3.7 content_hash

The `content_hash` field provides content addressing and integrity.

**Semantic Rules:**

1. Hash MUST be computed over the canonical payload (see [Section 4](#4-canonical-payload-boundary))
2. Hash MUST use SHA-256 algorithm
3. Hash MUST be encoded as lowercase hexadecimal
4. Hash serves as the canonical identifier for the Content Object
5. Two Content Objects with identical `content_hash` values are semantically identical

---

## 4. Canonical Payload Boundary

### 4.1 Definition

The **canonical payload** is the subset of Content Object fields included in the `content_hash` computation. Only fields within the canonical payload boundary contribute to the hash.

### 4.2 Included Fields

The canonical payload MUST include exactly the following fields:

| Field | Included | Rationale |
|-------|----------|-----------|
| `version` | Yes | Hash is version-specific |
| `subject` | Yes | Owner identity is content-defining |
| `content_type` | Yes | Format is content-defining |
| `bytes` | Yes | Size is content-defining |
| `storage` | Yes | Storage binding is content-defining |
| `created_at` | Yes | Timestamp is content-defining |
| `content_hash` | **No** | Self-referential; excluded by definition |

### 4.3 Canonical Payload Structure

```
CanonicalPayload := {
  version:      <version>,
  subject:      <subject>,
  content_type: <content_type>,
  bytes:        <bytes>,
  storage:      <storage>,
  created_at:   <created_at>
}
```

### 4.4 Hash Computation

```
content_hash := lowercase_hex(SHA-256(canonical_json(CanonicalPayload)))

where:
  canonical_json() applies deterministic encoding rules (Section 5)
  SHA-256() computes the SHA-256 hash
  lowercase_hex() encodes as lowercase hexadecimal string
```

### 4.5 Payload Boundary Invariants

```
INV-PB-01: content_hash ∉ CanonicalPayload
  "content_hash MUST NOT be included in canonical payload"

INV-PB-02: ∀ field F ∈ {version, subject, content_type, bytes, storage, created_at}:
           F ∈ CanonicalPayload
  "All specified fields MUST be included in canonical payload"

INV-PB-03: |CanonicalPayload.fields| = 6
  "Canonical payload contains exactly six fields"
```

---

## 5. Deterministic Encoding Rules

### 5.1 Overview

Content Objects MUST be encoded deterministically to ensure identical objects produce identical byte representations. This specification adopts canonical JSON encoding based on RFC 8785 (JSON Canonicalization Scheme).

### 5.2 Canonical JSON Rules

#### 5.2.1 Object Key Ordering

Object keys MUST be sorted in ascending order by Unicode code point value.

```
CORRECT:   {"bytes":1024,"content_type":"application/json","created_at":1706745600}
INCORRECT: {"created_at":1706745600,"bytes":1024,"content_type":"application/json"}
```

Sorting is applied recursively to nested objects.

#### 5.2.2 Whitespace

- No whitespace between tokens
- No trailing newline
- No leading whitespace

```
CORRECT:   {"key":"value","num":42}
INCORRECT: { "key" : "value", "num" : 42 }
INCORRECT: {"key":"value","num":42}\n
```

#### 5.2.3 String Encoding

| Rule | Specification |
|------|---------------|
| Encoding | UTF-8 |
| Normalization | NFC (Canonical Decomposition, followed by Canonical Composition) |
| Escape sequences | `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t` |
| Control characters | U+0000 to U+001F MUST use `\uXXXX` escapes |
| Non-ASCII | Literal UTF-8 bytes, NOT `\uXXXX` escapes |
| Solidus | MUST NOT be escaped (use `/`, not `\/`) |

#### 5.2.4 Integer Encoding

| Rule | Specification |
|------|---------------|
| Format | No leading zeros, no decimal point, no exponent |
| Negative zero | Encode as `0`, not `-0` |
| Range | Integers MUST be in range [-(2^53-1), 2^53-1] |
| Large integers | Values outside range MUST be encoded as strings |

```
CORRECT:   {"bytes":1024}
INCORRECT: {"bytes":01024}
INCORRECT: {"bytes":1024.0}
INCORRECT: {"bytes":1.024e3}
```

#### 5.2.5 Literal Values

| Value | Encoding |
|-------|----------|
| true | `true` (lowercase) |
| false | `false` (lowercase) |
| null | `null` (lowercase) |

#### 5.2.6 Array Ordering

Arrays maintain their original element order. Array contents are NOT sorted.

### 5.3 Storage Pointer Encoding

The `storage` object MUST be encoded with keys in the following order:

1. `backend`
2. `hash`
3. `uri`

### 5.4 Encoding Algorithm

```
function canonical_encode(content_object):
  payload := {
    "bytes":        content_object.bytes,
    "content_type": content_object.content_type,
    "created_at":   content_object.created_at,
    "storage":      {
      "backend": content_object.storage.backend,
      "hash":    content_object.storage.hash,
      "uri":     content_object.storage.uri
    },
    "subject":      content_object.subject,
    "version":      content_object.version
  }
  RETURN utf8_encode(json_serialize(payload))
```

Note: Keys appear in sorted order in the output.

### 5.5 Encoding Verification

Implementations MUST verify that:

1. Re-encoding a parsed object produces identical bytes
2. `content_hash` matches the hash of the canonical encoding
3. No extraneous whitespace or formatting exists

---

## 6. Content Hash

### 6.1 Definition

The `content_hash` is a cryptographic digest that uniquely identifies a Content Object based on its canonical payload.

### 6.2 Algorithm Specification

| Property | Value |
|----------|-------|
| Algorithm | SHA-256 |
| Input | Canonical JSON encoding of payload (UTF-8 bytes) |
| Output | 256-bit digest |
| Encoding | Lowercase hexadecimal string (64 characters) |

### 6.3 Computation Procedure

```
function compute_content_hash(content_object):
  // Step 1: Construct canonical payload
  payload := {
    bytes:        content_object.bytes,
    content_type: content_object.content_type,
    created_at:   content_object.created_at,
    storage:      content_object.storage,
    subject:      content_object.subject,
    version:      content_object.version
  }

  // Step 2: Apply deterministic encoding
  canonical_bytes := canonical_encode(payload)

  // Step 3: Compute SHA-256 hash
  hash_bytes := SHA256(canonical_bytes)

  // Step 4: Encode as lowercase hex
  hash_string := lowercase_hex_encode(hash_bytes)

  RETURN hash_string
```

### 6.4 Hash Properties

| Property | Requirement |
|----------|-------------|
| **Deterministic** | Identical inputs MUST produce identical hashes |
| **Collision Resistant** | Computationally infeasible to find two distinct inputs with same hash |
| **Pre-image Resistant** | Computationally infeasible to derive input from hash |
| **Fixed Length** | Output is always exactly 64 hexadecimal characters |
| **Case Sensitivity** | MUST be lowercase; uppercase MUST be rejected |

### 6.5 Hash Verification

```
function verify_content_hash(content_object):
  computed := compute_content_hash(content_object)
  IF computed != content_object.content_hash THEN
    RETURN (INVALID, "hash_mismatch")
  RETURN (VALID)
```

### 6.6 Content Addressing

The `content_hash` serves as a content address, enabling:

1. **Deduplication**: Identical content produces identical hashes
2. **Integrity Verification**: Any modification changes the hash
3. **Canonical Reference**: Unambiguous identifier for the Content Object
4. **Cache Keys**: Safe to cache by content hash

---

## 7. Storage Pointer

### 7.1 Definition

A **Storage Pointer** is a structured reference that binds a Content Object to a specific storage location and provides integrity verification for the stored blob.

### 7.2 Storage Pointer Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `backend` | string | REQUIRED | Storage backend type identifier |
| `uri` | string | REQUIRED | Backend-specific resource identifier |
| `hash` | string | REQUIRED | SHA-256 hash of the stored blob |

### 7.3 Field Definitions

#### 7.3.1 backend

| Property | Value |
|----------|-------|
| **Name** | `backend` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase alphanumeric with optional hyphens |
| **Constraints** | MUST match pattern `^[a-z][a-z0-9-]*$`; MUST NOT exceed 64 characters |

**Description:** Identifies the storage backend type. Implementations use this value to select the appropriate retrieval mechanism.

**Registered Backend Types:**

| Backend | Description |
|---------|-------------|
| `local` | Local filesystem storage |
| `s3` | S3-compatible object storage |
| `ipfs` | InterPlanetary File System |
| `arweave` | Arweave permanent storage |
| `http` | Generic HTTP(S) retrieval |
| `memory` | Ephemeral in-memory (testing only) |

Additional backend types MAY be registered through the AOC Protocol extension process.

#### 7.3.2 uri

| Property | Value |
|----------|-------|
| **Name** | `uri` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Backend-specific URI |
| **Constraints** | MUST NOT be empty; MUST NOT exceed 2048 characters |

**Description:** The backend-specific resource identifier. Format depends on the `backend` type.

**URI Format by Backend:**

| Backend | URI Format | Example |
|---------|------------|---------|
| `local` | `file://<absolute-path>` | `file:///data/blobs/abc123` |
| `s3` | `s3://<bucket>/<key>` | `s3://aoc-data/content/abc123` |
| `ipfs` | `ipfs://<cid>` | `ipfs://QmYwAPJzv5CZsnA...` |
| `arweave` | `ar://<transaction-id>` | `ar://aBcDeFgHiJkLmNoP...` |
| `http` | `https://<host>/<path>` | `https://cdn.example.com/blob/abc123` |

#### 7.3.3 hash

| Property | Value |
|----------|-------|
| **Name** | `hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase |
| **Algorithm** | SHA-256 |

**Description:** The SHA-256 hash of the raw blob bytes stored at the URI. This enables integrity verification independent of the Content Object hash.

### 7.4 Storage Pointer Structure

```
StoragePointer := {
  backend: string,   -- storage backend type
  uri:     string,   -- backend-specific resource identifier
  hash:    string    -- SHA-256 hash of stored blob
}
```

### 7.5 Integrity Verification

Upon blob retrieval, implementations MUST verify:

```
function verify_blob_integrity(storage_pointer, blob):
  computed_hash := lowercase_hex(SHA256(blob))
  IF computed_hash != storage_pointer.hash THEN
    RETURN (INVALID, "blob_hash_mismatch")
  RETURN (VALID)
```

### 7.6 Storage Pointer Invariants

```
INV-SP-01: storage.hash = lowercase_hex(SHA256(blob))
  "Storage hash MUST equal SHA-256 of the blob"

INV-SP-02: storage.backend ∈ RegisteredBackends
  "Backend MUST be a registered type"

INV-SP-03: storage.uri ≠ ""
  "URI MUST NOT be empty"

INV-SP-04: backend_scheme(storage.uri) matches storage.backend
  "URI scheme MUST be consistent with backend type"
```

---

## 8. Extensibility Rules

### 8.1 Extension Principles

Content Object extensibility follows these principles:

1. **Backward Compatibility**: New minor versions MUST NOT break existing parsers
2. **Forward Compatibility**: Parsers MUST ignore unknown fields in minor version updates
3. **Explicit Versioning**: All extensions require version increment
4. **Canonical Stability**: Canonical payload fields are fixed per major version

### 8.2 Adding Fields

#### 8.2.1 Minor Version Extensions

New OPTIONAL fields MAY be added in minor version updates:

| Rule | Specification |
|------|---------------|
| Field placement | Outside canonical payload boundary |
| Default value | MUST have implicit default |
| Parser behavior | Unknown fields MUST be preserved but ignored |
| Hash impact | None (excluded from canonical payload) |

#### 8.2.2 Major Version Extensions

New REQUIRED fields or canonical payload changes require major version increment:

| Rule | Specification |
|------|---------------|
| Version increment | Major version MUST increase |
| Migration path | MUST be documented |
| Backward reading | Previous major version SHOULD be supported for deprecation period |

### 8.3 Reserved Field Names

The following field names are reserved for future use:

| Field | Intended Purpose |
|-------|------------------|
| `signature` | Cryptographic signature over content |
| `metadata` | Application-specific metadata container |
| `references` | Links to related Content Objects |
| `expires_at` | Optional expiration timestamp |
| `replaces` | Content Object this supersedes |

### 8.4 Extension Registration

Extensions MUST be registered in the AOC Protocol extension registry. Registration includes:

1. Field name and type
2. Version introduced
3. Canonical payload inclusion (yes/no)
4. Semantic specification

### 8.5 Vendor Extensions

Vendor-specific fields MUST use the `x-` prefix:

```json
{
  "version": "1.0",
  "subject": "did:aoc:example",
  "content_type": "application/json",
  "bytes": 1024,
  "storage": { ... },
  "created_at": 1706745600,
  "content_hash": "abc123...",
  "x-vendor-field": "custom value"
}
```

Vendor extensions:
- MUST NOT be included in canonical payload
- MUST NOT conflict with registered field names
- SHOULD be documented by the vendor

---

## 9. Example Content Object

### 9.1 Canonical Payload Example

The following shows the canonical payload (fields included in hash computation):

```json
{"bytes":2048,"content_type":"application/json","created_at":1706745600,"storage":{"backend":"ipfs","hash":"9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08","uri":"ipfs://QmYwAPJzv5CZsnAzt8auVZRn5rNnTB1Y7npFrkg5e7h9KP"},"subject":"did:aoc:7sHxtdZ9bE3F5kNmZM4vbU","version":"1.0"}
```

Note: No whitespace, keys sorted alphabetically, nested `storage` object also sorted.

### 9.2 Full Content Object Example

```json
{
  "version": "1.0",
  "subject": "did:aoc:7sHxtdZ9bE3F5kNmZM4vbU",
  "content_type": "application/json",
  "bytes": 2048,
  "storage": {
    "backend": "ipfs",
    "uri": "ipfs://QmYwAPJzv5CZsnAzt8auVZRn5rNnTB1Y7npFrkg5e7h9KP",
    "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  },
  "created_at": 1706745600,
  "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 9.3 Content Object with Local Storage

```json
{
  "version": "1.0",
  "subject": "did:aoc:9kLmNpQrStUvWxYz1234AB",
  "content_type": "application/octet-stream",
  "bytes": 65536,
  "storage": {
    "backend": "local",
    "uri": "file:///var/aoc/blobs/a1b2c3d4e5f6",
    "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
  },
  "created_at": 1706832000,
  "content_hash": "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"
}
```

### 9.4 Content Object with S3 Storage

```json
{
  "version": "1.0",
  "subject": "did:aoc:2DrjgbN7v5TJfQkX9BCXP4",
  "content_type": "image/png",
  "bytes": 524288,
  "storage": {
    "backend": "s3",
    "uri": "s3://user-vault-bucket/content/img-20240201-001.enc",
    "hash": "c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31ad9e51a"
  },
  "created_at": 1706918400,
  "content_hash": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
}
```

---

## 10. Security Invariants

### 10.1 Hash Invariants

```
INV-HASH-01: content_hash = lowercase_hex(SHA256(canonical_payload))
  "Content hash MUST equal SHA-256 of canonical payload"

INV-HASH-02: ∀ char c ∈ content_hash: c ∈ [0-9a-f]
  "Content hash MUST be lowercase hexadecimal"

INV-HASH-03: length(content_hash) = 64
  "Content hash MUST be exactly 64 characters"

INV-HASH-04: storage.hash = lowercase_hex(SHA256(blob))
  "Storage hash MUST equal SHA-256 of the blob"

INV-HASH-05: ∀ char c ∈ storage.hash: c ∈ [0-9a-f]
  "Storage hash MUST be lowercase hexadecimal"
```

### 10.2 Field Invariants

```
INV-FIELD-01: bytes > 0
  "Bytes MUST be a positive integer"

INV-FIELD-02: subject ≠ ""
  "Subject MUST NOT be empty"

INV-FIELD-03: content_type ≠ ""
  "Content type MUST NOT be empty"

INV-FIELD-04: version matches ^[0-9]+\.[0-9]+$
  "Version MUST be valid semantic version"

INV-FIELD-05: created_at > 0
  "Created timestamp MUST be positive"

INV-FIELD-06: created_at ≤ current_time + 300
  "Created timestamp MUST NOT be in the future (with 5-minute tolerance)"
```

### 10.3 Storage Pointer Invariants

```
INV-STORE-01: storage.uri ≠ ""
  "Storage URI MUST NOT be empty"

INV-STORE-02: storage.backend matches ^[a-z][a-z0-9-]*$
  "Storage backend MUST be valid identifier"

INV-STORE-03: length(storage.hash) = 64
  "Storage hash MUST be exactly 64 characters"

INV-STORE-04: uri_scheme(storage.uri) consistent_with storage.backend
  "Storage URI scheme MUST match backend type"
```

### 10.4 Integrity Invariants

```
INV-INT-01: ∀ Content Object CO: verify_content_hash(CO) = VALID
  "Content hash MUST verify against canonical payload"

INV-INT-02: ∀ blob B retrieved via storage: length(B) = bytes
  "Retrieved blob size MUST match bytes field"

INV-INT-03: ∀ blob B retrieved via storage: SHA256(B) = storage.hash
  "Retrieved blob hash MUST match storage hash"

INV-INT-04: canonical_encode(parse(canonical_encode(CO))) = canonical_encode(CO)
  "Canonical encoding MUST be idempotent"
```

### 10.5 Immutability Invariants

```
INV-IMM-01: ∀ field F ∈ ContentObject: mutate(F) → new ContentObject
  "Modifying any field MUST produce a new Content Object"

INV-IMM-02: content_hash serves as immutable identifier
  "Content hash uniquely identifies the immutable Content Object"
```

### 10.6 Invariant Enforcement

All implementations MUST:

1. Validate all invariants before accepting a Content Object
2. Validate all invariants before persisting a Content Object
3. Reject Content Objects that violate any invariant
4. Log invariant violations with sufficient context for debugging
5. Never silently accept invalid Content Objects

---

## 11. Versioning Strategy

### 11.1 Version Format

| Component | Format | Example |
|-----------|--------|---------|
| Specification Version | `MAJOR.MINOR` | `0.1` |
| Content Object Version | `MAJOR.MINOR` | `1.0` |

### 11.2 Version Semantics

#### 11.2.1 Major Version

Major version increment indicates breaking changes:

- Changes to canonical payload boundary
- Field type changes
- Removal of required fields
- Hash algorithm changes

**Migration:** Explicit transformation required; old and new versions are incompatible.

#### 11.2.2 Minor Version

Minor version increment indicates backward-compatible additions:

- New optional fields (outside canonical payload)
- New registered backend types
- Clarifications to existing behavior

**Migration:** None required; parsers SHOULD ignore unknown fields.

### 11.3 Deprecation Process

| Phase | Duration | Behavior |
|-------|----------|----------|
| Active | Indefinite | Full support for creation and validation |
| Deprecated | 12 months | Validation only; creation SHOULD warn |
| Legacy | 12 months | Validation only; creation MUST fail |
| Removed | - | Validation and creation MUST fail |

### 11.4 Version Negotiation

When multiple versions are supported:

1. Prefer highest mutually supported major version
2. Within major version, use highest minor version
3. Include version in all serialized Content Objects
4. Reject Content Objects with unsupported major versions

---

## Appendix A: Test Vectors

### A.1 Hash Computation

**Input (Canonical JSON):**
```
{"bytes":1024,"content_type":"application/json","created_at":1706745600,"storage":{"backend":"local","hash":"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad","uri":"file:///data/test"},"subject":"did:aoc:test123","version":"1.0"}
```

**Expected SHA-256:**
```
[Computed per implementation]
```

### A.2 Canonical Encoding Verification

Given the Content Object fields:
- version: `"1.0"`
- subject: `"did:aoc:example"`
- content_type: `"text/plain"`
- bytes: `100`
- storage.backend: `"local"`
- storage.uri: `"file:///test"`
- storage.hash: `"abc..."`
- created_at: `1700000000`

The canonical encoding MUST produce keys in this order:
`bytes`, `content_type`, `created_at`, `storage` (with nested keys: `backend`, `hash`, `uri`), `subject`, `version`

---

## Appendix B: JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aoc.protocol/schemas/content-object/1.0",
  "title": "AOC Content Object",
  "type": "object",
  "required": ["version", "subject", "content_type", "bytes", "storage", "created_at", "content_hash"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+$"
    },
    "subject": {
      "type": "string",
      "minLength": 1,
      "maxLength": 512
    },
    "content_type": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "bytes": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "storage": {
      "type": "object",
      "required": ["backend", "uri", "hash"],
      "properties": {
        "backend": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$",
          "maxLength": 64
        },
        "uri": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2048
        },
        "hash": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        }
      },
      "additionalProperties": false
    },
    "created_at": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "content_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    }
  },
  "additionalProperties": true
}
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial Content Object specification |

---

*This document is normative. Implementations MUST conform to produce interoperable results.*
