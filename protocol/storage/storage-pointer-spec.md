# AOC Protocol — Storage Pointer Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](../wallet/architecture.md), [crypto-spec.md](../wallet/crypto-spec.md), [content-object-spec.md](../content/content-object-spec.md)

---

## Table of Contents

1. [Storage Pointer Definition](#1-storage-pointer-definition)
2. [Storage Pointer Fields](#2-storage-pointer-fields)
3. [Field Semantics](#3-field-semantics)
4. [Canonical Payload Boundary](#4-canonical-payload-boundary)
5. [Deterministic Encoding Rules](#5-deterministic-encoding-rules)
6. [URI Form](#6-uri-form)
7. [Backend Registry](#7-backend-registry)
8. [Validation Rules](#8-validation-rules)
9. [Example Storage Pointers](#9-example-storage-pointers)
10. [Security Invariants](#10-security-invariants)
11. [Versioning Strategy](#11-versioning-strategy)

---

## 1. Storage Pointer Definition

### 1.1 Overview

A **Storage Pointer** is an immutable, backend-agnostic reference to stored bytes within the AOC Protocol. The Storage Pointer binds a storage backend identifier to a content hash, providing a deterministic and verifiable way to locate and validate data across heterogeneous storage systems.

**Formal Definition:**

```
StoragePointer := {
  backend: BackendIdentifier,  -- storage system type
  hash:    ContentHash,        -- SHA-256 of stored bytes
  uri:     URI                 -- canonical URI form
}
```

### 1.2 What a Storage Pointer Represents

A Storage Pointer represents:

| Aspect | Description |
|--------|-------------|
| **Location Binding** | A deterministic reference to where bytes are stored |
| **Integrity Binding** | A cryptographic commitment to the stored content |
| **Backend Abstraction** | A uniform interface across storage technologies |
| **Offline Verifiability** | A structure that can be validated without network access |

### 1.3 What a Storage Pointer Does NOT Represent

A Storage Pointer explicitly does NOT represent:

| Excluded Aspect | Rationale |
|-----------------|-----------|
| **Retrieval Protocol** | How to fetch bytes is implementation-specific |
| **Access Control** | Permissions are handled at higher protocol layers |
| **Encryption State** | Encryption is orthogonal to storage addressing |
| **Data Semantics** | The meaning of stored bytes is application-level |
| **Availability Guarantees** | Backend uptime is not part of the pointer contract |
| **Mutable References** | Storage Pointers are strictly immutable |

### 1.4 Design Principles

| Principle | Description |
|-----------|-------------|
| **Backend Agnosticism** | Storage Pointers work with any conforming storage system |
| **Determinism** | Identical inputs MUST produce identical Storage Pointers |
| **Canonicalizability** | Every Storage Pointer has exactly one canonical form |
| **Content Addressing** | The hash field provides content-based identification |
| **Offline Validation** | Structural validity requires no network access |
| **Immutability** | Once created, a Storage Pointer MUST NOT be modified |

### 1.5 Relationship to Protocol Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Content Object                            │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Storage Pointer                     │   │
│   │                                                      │   │
│   │   backend ──► identifies storage system type        │   │
│   │   hash    ──► binds to stored bytes                 │   │
│   │   uri     ──► provides canonical address form       │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Pack Manifest                             │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                  Storage Pointer                     │   │
│   │                                                      │   │
│   │   (Same structure, same semantics)                  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Backends                          │
│                                                              │
│   local │ s3 │ ipfs │ arweave │ http │ x-vendor-*          │
└─────────────────────────────────────────────────────────────┘
```

Storage Pointers are used by Content Objects and Pack Manifests to reference stored data. The pointer itself is storage-system agnostic; the `backend` field determines which retrieval implementation to invoke.

---

## 2. Storage Pointer Fields

### 2.1 Field Summary

| Field | Type | Required | Mutable | Description |
|-------|------|----------|---------|-------------|
| `backend` | string | REQUIRED | No | Storage backend type identifier |
| `hash` | string | REQUIRED | No | SHA-256 hash of stored bytes (lowercase hex) |
| `uri` | string | REQUIRED | No | Canonical URI form of the pointer |

### 2.2 Field Definitions

#### 2.2.1 backend

| Property | Value |
|----------|-------|
| **Name** | `backend` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase alphanumeric token with optional hyphens |
| **Constraints** | MUST match pattern `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| **Min Length** | 1 character |
| **Max Length** | 64 characters |

**Description:** Identifies the storage backend type. This field determines which storage adapter an implementation uses to retrieve the referenced bytes. The value MUST be a registered backend identifier or a valid vendor extension.

#### 2.2.2 hash

| Property | Value |
|----------|-------|
| **Name** | `hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase `[a-f0-9]` |
| **Algorithm** | SHA-256 |

**Description:** The SHA-256 hash of the raw bytes stored at the referenced location. This field provides content addressing and integrity verification. Upon retrieval, the hash of the fetched bytes MUST match this value.

#### 2.2.3 uri

| Property | Value |
|----------|-------|
| **Name** | `uri` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | AOC Storage URI (see [Section 6](#6-uri-form)) |
| **Constraints** | MUST match pattern `^aoc://storage/[a-z][a-z0-9]*(-[a-z0-9]+)*/0x[a-f0-9]{64}$` |
| **Min Length** | 83 characters (minimum valid URI) |
| **Max Length** | 148 characters (maximum with 64-char backend) |

**Description:** The canonical URI representation of the Storage Pointer. This field MUST be derived deterministically from the `backend` and `hash` fields. It provides a stable, human-readable, and URL-safe identifier for the pointer.

---

## 3. Field Semantics

### 3.1 backend

The `backend` field identifies the storage system type where the referenced bytes reside.

**Semantic Rules:**

1. The backend value MUST be either a registered backend or a valid vendor extension
2. Unknown backends MUST NOT cause parsing failure; structural validation MUST still apply
3. Implementations SHOULD fail gracefully when encountering unsupported backends
4. Backend identifiers are case-sensitive; only lowercase is valid
5. The backend does not imply a retrieval protocol; that mapping is implementation-specific

**Backend Resolution:**

```
function resolve_backend(backend):
  IF backend ∈ RegisteredBackends THEN
    RETURN registered_adapter(backend)
  ELSE IF backend matches "^x-[a-z0-9]+(-[a-z0-9]+)*$" THEN
    RETURN vendor_adapter(backend) OR (UNSUPPORTED, backend)
  ELSE IF backend matches "^[a-z][a-z0-9]*(-[a-z0-9]+)*$" THEN
    RETURN (UNKNOWN_BACKEND, backend)
  ELSE
    RETURN (INVALID, "malformed_backend")
```

### 3.2 hash

The `hash` field provides content-based addressing and integrity binding.

**Semantic Rules:**

1. The hash MUST be the SHA-256 digest of the exact bytes stored
2. Hash comparison is case-sensitive; only lowercase is valid
3. Hash mismatch upon retrieval indicates corruption or tampering
4. The hash uniquely identifies the content regardless of storage location
5. Two Storage Pointers with identical hashes reference semantically identical bytes

**Hash Verification:**

```
function verify_hash(storage_pointer, retrieved_bytes):
  computed := lowercase_hex(SHA256(retrieved_bytes))
  IF computed != storage_pointer.hash THEN
    RETURN (INVALID, "hash_mismatch", expected=storage_pointer.hash, actual=computed)
  RETURN (VALID)
```

### 3.3 uri

The `uri` field provides a canonical, deterministic representation of the Storage Pointer.

**Semantic Rules:**

1. The URI MUST be derived from `backend` and `hash` using the canonical formula
2. The URI is NOT an opaque identifier; it encodes structured data
3. Parsing the URI MUST yield the original `backend` and `hash` values
4. The URI provides a stable reference suitable for logging, indexing, and display
5. URI comparison is case-sensitive; the canonical form is always lowercase

**URI Derivation:**

```
uri := "aoc://storage/" || backend || "/0x" || hash
```

**URI Parsing:**

```
function parse_uri(uri):
  match := regex_match(uri, "^aoc://storage/([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/0x([a-f0-9]{64})$")
  IF match = null THEN
    RETURN (INVALID, "malformed_uri")
  RETURN {
    backend: match.group(1),
    hash:    match.group(2)
  }
```

---

## 4. Canonical Payload Boundary

### 4.1 Definition

The **canonical payload** specifies which fields contribute to deterministic encoding and equality comparison. For Storage Pointers, all fields participate in the canonical form.

### 4.2 Canonical Fields

| Field | Included | Rationale |
|-------|----------|-----------|
| `backend` | Yes | Backend type is identity-defining |
| `hash` | Yes | Content hash is identity-defining |
| `uri` | Yes | Derived field; included for completeness |

### 4.3 Storage Pointer Hash

**Storage Pointers do NOT define their own hash field for self-identification.**

The Storage Pointer's identity is fully determined by its `backend` and `hash` fields. The `uri` field is derived and therefore redundant for identity purposes. Parent objects (Content Objects, Pack Manifests) that embed Storage Pointers compute their own hashes over the embedded pointer.

**Rationale:**

1. The `hash` field already provides content addressing for the stored bytes
2. A separate pointer hash would be redundant and add complexity
3. Parent objects are responsible for binding the pointer into their hash computation
4. This design avoids hash-of-hash indirection

### 4.4 Equality Semantics

Two Storage Pointers are equal if and only if:

```
SP1 = SP2 ⟺ (SP1.backend = SP2.backend) ∧ (SP1.hash = SP2.hash)
```

The `uri` field need not be compared separately, as it is derived from `backend` and `hash`.

---

## 5. Deterministic Encoding Rules

### 5.1 Overview

Storage Pointers MUST be encoded deterministically to ensure consistent hashing by parent objects. This specification adopts canonical JSON encoding based on RFC 8785 (JSON Canonicalization Scheme).

### 5.2 Canonical JSON Rules

#### 5.2.1 Object Key Ordering

Object keys MUST be sorted in ascending order by Unicode code point value.

For Storage Pointers, the canonical key order is:

1. `backend`
2. `hash`
3. `uri`

```
CORRECT:   {"backend":"ipfs","hash":"a1b2...","uri":"aoc://storage/ipfs/0xa1b2..."}
INCORRECT: {"uri":"aoc://...","backend":"ipfs","hash":"a1b2..."}
```

#### 5.2.2 Whitespace

- No whitespace between tokens
- No trailing newline
- No leading whitespace

```
CORRECT:   {"backend":"local","hash":"abc...","uri":"aoc://storage/local/0xabc..."}
INCORRECT: { "backend": "local", "hash": "abc...", "uri": "aoc://..." }
```

#### 5.2.3 String Encoding

| Rule | Specification |
|------|---------------|
| Encoding | UTF-8 |
| Normalization | NFC |
| Escape sequences | `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t` |
| Control characters | U+0000 to U+001F MUST use `\uXXXX` escapes |
| Non-ASCII | Literal UTF-8 bytes, NOT `\uXXXX` escapes |
| Solidus | MUST NOT be escaped (use `/`, not `\/`) |

#### 5.2.4 Case Sensitivity

All string values in Storage Pointers (`backend`, `hash`, `uri`) MUST be lowercase. Implementations MUST reject Storage Pointers containing uppercase characters in these fields.

### 5.3 Encoding Algorithm

```
function canonical_encode(storage_pointer):
  // Validate URI derivation
  expected_uri := "aoc://storage/" || storage_pointer.backend || "/0x" || storage_pointer.hash
  IF storage_pointer.uri != expected_uri THEN
    RETURN (ERROR, "uri_mismatch")

  // Construct canonical object (keys in sorted order)
  canonical := {
    "backend": storage_pointer.backend,
    "hash":    storage_pointer.hash,
    "uri":     storage_pointer.uri
  }

  RETURN utf8_encode(json_serialize_sorted(canonical))
```

### 5.4 Encoding Verification

Implementations MUST verify that:

1. Re-encoding a parsed Storage Pointer produces identical bytes
2. The `uri` field matches the derived value from `backend` and `hash`
3. All string values are lowercase
4. No extraneous whitespace or formatting exists

---

## 6. URI Form

### 6.1 URI Specification

The canonical URI form for a Storage Pointer is:

```
aoc://storage/{backend}/0x{hash}
```

### 6.2 URI Components

| Component | Description | Constraints |
|-----------|-------------|-------------|
| Scheme | `aoc` | Fixed; case-sensitive |
| Authority | (empty) | No authority component |
| Path prefix | `/storage/` | Fixed; case-sensitive |
| Backend segment | `{backend}` | MUST match backend field exactly |
| Hash prefix | `/0x` | Fixed; lowercase x |
| Hash segment | `{hash}` | MUST match hash field exactly (64 lowercase hex chars) |

### 6.3 URI Grammar (ABNF)

```abnf
storage-uri    = "aoc://storage/" backend-token "/0x" hash-hex
backend-token  = LOWER 0*62(LOWER / DIGIT / "-" 1*(LOWER / DIGIT))
hash-hex       = 64HEXDIG-LOWER
LOWER          = %x61-7A                    ; a-z
DIGIT          = %x30-39                    ; 0-9
HEXDIG-LOWER   = DIGIT / %x61-66           ; 0-9 a-f
```

### 6.4 URI Construction

```
function construct_uri(backend, hash):
  // Validate backend format
  IF NOT matches(backend, "^[a-z][a-z0-9]*(-[a-z0-9]+)*$") THEN
    RETURN (ERROR, "invalid_backend")

  // Validate hash format
  IF NOT matches(hash, "^[a-f0-9]{64}$") THEN
    RETURN (ERROR, "invalid_hash")

  RETURN "aoc://storage/" || backend || "/0x" || hash
```

### 6.5 URI Parsing

```
function parse_storage_uri(uri):
  pattern := "^aoc://storage/([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/0x([a-f0-9]{64})$"
  match := regex_match(uri, pattern)

  IF match = null THEN
    RETURN (ERROR, "invalid_storage_uri")

  RETURN {
    backend: match.group(1),
    hash:    match.group(2),
    uri:     uri
  }
```

### 6.6 URI Normalization

Storage URIs are already in canonical form by construction. No normalization is required or permitted. Any URI that does not match the exact canonical pattern MUST be rejected.

**Invalid URI Examples:**

| URI | Reason |
|-----|--------|
| `AOC://storage/local/0xabc...` | Uppercase scheme |
| `aoc://storage/LOCAL/0xabc...` | Uppercase backend |
| `aoc://storage/local/0XABC...` | Uppercase hex prefix/digits |
| `aoc://storage/local/abc...` | Missing `0x` prefix |
| `aoc://storage//0xabc...` | Empty backend |
| `aoc://storage/local/0xabc` | Hash too short |
| `aoc:///storage/local/0xabc...` | Extra slash (authority) |

---

## 7. Backend Registry

### 7.1 Registry Model

The Backend Registry is a normative list of recognized storage backend identifiers. Backends are categorized as:

| Category | Description | Governance |
|----------|-------------|------------|
| **Reserved** | Protocol-defined backends | Specification authority |
| **Registered** | Community-accepted backends | Extension process |
| **Vendor** | Implementation-specific backends | Vendor namespace (`x-` prefix) |

### 7.2 Reserved Backends

The following backends are reserved by the AOC Protocol specification:

| Backend | Description | Typical URI Scheme |
|---------|-------------|-------------------|
| `local` | Local filesystem storage | `file://` |
| `s3` | S3-compatible object storage | `s3://` |
| `ipfs` | InterPlanetary File System | `ipfs://` |
| `arweave` | Arweave permanent storage | `ar://` |
| `http` | Generic HTTP(S) retrieval | `https://` |

#### 7.2.1 local

**Description:** References bytes stored on the local filesystem of the wallet or node.

**Characteristics:**
- Non-portable; valid only on the originating system
- Suitable for local wallet storage
- No network retrieval required

#### 7.2.2 s3

**Description:** References bytes stored in S3-compatible object storage (AWS S3, MinIO, etc.).

**Characteristics:**
- Requires bucket and key for retrieval
- Implementation maps hash to bucket/key via configuration
- Supports multiple S3-compatible providers

#### 7.2.3 ipfs

**Description:** References bytes stored on the InterPlanetary File System.

**Characteristics:**
- Content-addressed by design
- Hash may correspond to IPFS CID (implementation maps AOC hash to CID)
- Distributed retrieval via IPFS network

#### 7.2.4 arweave

**Description:** References bytes stored on the Arweave permanent storage network.

**Characteristics:**
- Permanent, immutable storage
- Hash maps to Arweave transaction ID
- Suitable for long-term archival

#### 7.2.5 http

**Description:** References bytes retrievable via HTTP(S) GET request.

**Characteristics:**
- Implementation maps hash to URL via configuration or registry
- MUST use HTTPS in production
- Simplest integration path for existing infrastructure

### 7.3 Vendor Extensions

Vendor-specific backends MUST use the `x-` prefix followed by a vendor identifier.

**Format:**

```
x-{vendor}[-{qualifier}]

Examples:
  x-acme
  x-acme-cold
  x-mycompany-archive
```

**Constraints:**

| Rule | Specification |
|------|---------------|
| Prefix | MUST start with `x-` |
| Vendor identifier | MUST be lowercase alphanumeric |
| Optional qualifier | MAY include hyphen-separated segments |
| Max length | 64 characters total |
| Pattern | `^x-[a-z0-9]+(-[a-z0-9]+)*$` |

**Vendor Extension Rules:**

1. Vendor backends MUST NOT conflict with reserved or registered backends
2. Vendors SHOULD document their backend semantics
3. Implementations MUST parse vendor backends without error
4. Implementations MAY reject unsupported vendor backends at retrieval time
5. Vendor backends MUST follow all structural validation rules

### 7.4 Backend Registration Process

New backends MAY be added to the registered category through the AOC Protocol extension process:

1. **Proposal**: Submit backend specification with rationale
2. **Review**: Technical review by protocol maintainers
3. **Consensus**: Community feedback period (minimum 30 days)
4. **Registration**: Addition to registered backend list
5. **Specification Update**: Minor version increment of this document

**Registration Requirements:**

| Requirement | Description |
|-------------|-------------|
| Uniqueness | Identifier MUST NOT conflict with existing backends |
| Stability | Backend semantics MUST be stable and documented |
| Interoperability | At least two independent implementations SHOULD exist |
| Non-vendor | MUST NOT use `x-` prefix |

### 7.5 Backend Deprecation

Reserved or registered backends MAY be deprecated through the following process:

| Phase | Duration | Behavior |
|-------|----------|----------|
| Active | Indefinite | Full support |
| Deprecated | 24 months | Validation succeeds; creation warns |
| Legacy | 12 months | Validation succeeds; creation fails |
| Removed | - | Validation fails; migration required |

---

## 8. Validation Rules

### 8.1 Structural Validation

Structural validation verifies that a Storage Pointer conforms to the specification without requiring network access.

#### 8.1.1 Validation Checklist

| # | Rule | Check |
|---|------|-------|
| V1 | `backend` present | Field exists and is non-null |
| V2 | `backend` type | Value is a string |
| V3 | `backend` format | Matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| V4 | `backend` length | 1 ≤ length ≤ 64 |
| V5 | `hash` present | Field exists and is non-null |
| V6 | `hash` type | Value is a string |
| V7 | `hash` format | Matches `^[a-f0-9]{64}$` |
| V8 | `hash` case | All characters are lowercase |
| V9 | `uri` present | Field exists and is non-null |
| V10 | `uri` type | Value is a string |
| V11 | `uri` format | Matches `^aoc://storage/[a-z][a-z0-9]*(-[a-z0-9]+)*/0x[a-f0-9]{64}$` |
| V12 | `uri` derivation | `uri` = `"aoc://storage/" + backend + "/0x" + hash` |
| V13 | No extra fields | Only `backend`, `hash`, `uri` present (SHOULD warn, MAY ignore) |

#### 8.1.2 Validation Algorithm

```
function validate_storage_pointer(sp):
  errors := []

  // V1-V4: backend validation
  IF sp.backend = null OR sp.backend = undefined THEN
    errors.append("backend_missing")
  ELSE IF typeof(sp.backend) != "string" THEN
    errors.append("backend_not_string")
  ELSE IF NOT matches(sp.backend, "^[a-z][a-z0-9]*(-[a-z0-9]+)*$") THEN
    errors.append("backend_invalid_format")
  ELSE IF length(sp.backend) > 64 THEN
    errors.append("backend_too_long")

  // V5-V8: hash validation
  IF sp.hash = null OR sp.hash = undefined THEN
    errors.append("hash_missing")
  ELSE IF typeof(sp.hash) != "string" THEN
    errors.append("hash_not_string")
  ELSE IF NOT matches(sp.hash, "^[a-f0-9]{64}$") THEN
    errors.append("hash_invalid_format")

  // V9-V12: uri validation
  IF sp.uri = null OR sp.uri = undefined THEN
    errors.append("uri_missing")
  ELSE IF typeof(sp.uri) != "string" THEN
    errors.append("uri_not_string")
  ELSE
    expected_uri := "aoc://storage/" || sp.backend || "/0x" || sp.hash
    IF sp.uri != expected_uri THEN
      errors.append("uri_derivation_mismatch")

  IF length(errors) > 0 THEN
    RETURN (INVALID, errors)
  RETURN (VALID)
```

### 8.2 Semantic Validation

Semantic validation verifies the relationship between the Storage Pointer and actual stored bytes. This requires network access or local storage access.

| # | Rule | Check |
|---|------|-------|
| S1 | Bytes exist | Retrieval succeeds |
| S2 | Hash matches | SHA-256(retrieved_bytes) = `hash` |
| S3 | Backend supported | Implementation can handle `backend` type |

### 8.3 Validation Error Codes

| Code | Description |
|------|-------------|
| `backend_missing` | The `backend` field is absent |
| `backend_not_string` | The `backend` field is not a string |
| `backend_invalid_format` | The `backend` does not match required pattern |
| `backend_too_long` | The `backend` exceeds 64 characters |
| `hash_missing` | The `hash` field is absent |
| `hash_not_string` | The `hash` field is not a string |
| `hash_invalid_format` | The `hash` is not 64 lowercase hex characters |
| `uri_missing` | The `uri` field is absent |
| `uri_not_string` | The `uri` field is not a string |
| `uri_derivation_mismatch` | The `uri` does not match derived value |
| `retrieval_failed` | Bytes could not be retrieved |
| `hash_mismatch` | Retrieved bytes hash does not match |
| `backend_unsupported` | Implementation cannot handle backend type |

---

## 9. Example Storage Pointers

### 9.1 Local Storage

```json
{
  "backend": "local",
  "hash": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  "uri": "aoc://storage/local/0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
}
```

**Canonical Encoding:**
```
{"backend":"local","hash":"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad","uri":"aoc://storage/local/0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"}
```

### 9.2 S3 Storage

```json
{
  "backend": "s3",
  "hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "uri": "aoc://storage/s3/0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}
```

### 9.3 IPFS Storage

```json
{
  "backend": "ipfs",
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "uri": "aoc://storage/ipfs/0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 9.4 Arweave Storage

```json
{
  "backend": "arweave",
  "hash": "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
  "uri": "aoc://storage/arweave/0xd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"
}
```

### 9.5 HTTP Storage

```json
{
  "backend": "http",
  "hash": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
  "uri": "aoc://storage/http/0x2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
}
```

### 9.6 Vendor Extension (x-acme-archive)

```json
{
  "backend": "x-acme-archive",
  "hash": "c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31ad9e51a",
  "uri": "aoc://storage/x-acme-archive/0xc0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7df31ad9e51a"
}
```

### 9.7 Vendor Extension (x-mycompany-cold)

```json
{
  "backend": "x-mycompany-cold",
  "hash": "a948904f2f0f479b8f8564cbf12dac6b47c1c6c2e1d1a9a0a1e8f8f8e8d8c8b8",
  "uri": "aoc://storage/x-mycompany-cold/0xa948904f2f0f479b8f8564cbf12dac6b47c1c6c2e1d1a9a0a1e8f8f8e8d8c8b8"
}
```

---

## 10. Security Invariants

### 10.1 Hash Invariants

```
INV-HASH-01: length(hash) = 64
  "Hash MUST be exactly 64 characters"

INV-HASH-02: ∀ char c ∈ hash: c ∈ [0-9a-f]
  "Hash MUST contain only lowercase hexadecimal characters"

INV-HASH-03: hash = lowercase_hex(SHA256(stored_bytes))
  "Hash MUST equal SHA-256 of the stored bytes"

INV-HASH-04: uppercase_chars(hash) = 0
  "Hash MUST NOT contain uppercase characters"

INV-HASH-05: hash ≠ "0000000000000000000000000000000000000000000000000000000000000000"
  "Hash SHOULD NOT be all zeros (indicates empty or null content)"
```

### 10.2 Backend Invariants

```
INV-BACK-01: backend matches ^[a-z][a-z0-9]*(-[a-z0-9]+)*$
  "Backend MUST match the required token pattern"

INV-BACK-02: length(backend) ≥ 1 ∧ length(backend) ≤ 64
  "Backend length MUST be between 1 and 64 characters"

INV-BACK-03: backend[0] ∈ [a-z]
  "Backend MUST start with a lowercase letter"

INV-BACK-04: uppercase_chars(backend) = 0
  "Backend MUST NOT contain uppercase characters"

INV-BACK-05: backend ∈ RegisteredBackends ∨ backend matches ^x-
  "Backend MUST be registered OR be a vendor extension"
```

### 10.3 URI Invariants

```
INV-URI-01: uri = "aoc://storage/" || backend || "/0x" || hash
  "URI MUST be derived exactly from backend and hash"

INV-URI-02: parse_uri(uri).backend = backend
  "Parsing URI MUST yield original backend"

INV-URI-03: parse_uri(uri).hash = hash
  "Parsing URI MUST yield original hash"

INV-URI-04: uri matches ^aoc://storage/[a-z][a-z0-9]*(-[a-z0-9]+)*/0x[a-f0-9]{64}$
  "URI MUST match the canonical pattern exactly"

INV-URI-05: uppercase_chars(uri) = 0
  "URI MUST be entirely lowercase"
```

### 10.4 Structural Invariants

```
INV-STRUCT-01: typeof(backend) = string ∧ typeof(hash) = string ∧ typeof(uri) = string
  "All fields MUST be strings"

INV-STRUCT-02: backend ≠ "" ∧ hash ≠ "" ∧ uri ≠ ""
  "No field MUST be empty"

INV-STRUCT-03: storage_pointer is immutable after creation
  "Storage Pointers MUST be treated as immutable references"

INV-STRUCT-04: canonical_encode(parse(canonical_encode(sp))) = canonical_encode(sp)
  "Canonical encoding MUST be idempotent"
```

### 10.5 Integrity Invariants

```
INV-INT-01: ∀ retrieval R of hash H: SHA256(R) = H ∨ retrieval_fails
  "Retrieved bytes MUST hash to the pointer hash or retrieval MUST fail"

INV-INT-02: unknown_backend(sp) → validate_structure(sp) succeeds
  "Unknown backends MUST still pass structural validation"

INV-INT-03: validation(sp) succeeds → sp is well-formed
  "Successful validation implies well-formed pointer"
```

### 10.6 Invariant Enforcement

All implementations MUST:

1. Validate all structural invariants before accepting a Storage Pointer
2. Validate hash invariant (INV-INT-01) upon byte retrieval
3. Reject Storage Pointers that violate any invariant
4. Log invariant violations with full context
5. Never silently accept or propagate invalid Storage Pointers
6. Verify URI derivation matches `backend` and `hash` values

---

## 11. Versioning Strategy

### 11.1 Specification Version

| Component | Current Version | Format |
|-----------|-----------------|--------|
| This specification | 0.1 | MAJOR.MINOR |

### 11.2 Version Semantics

#### 11.2.1 Major Version Changes

Major version increment indicates breaking changes:

- Changes to URI format
- Changes to required fields
- Changes to hash algorithm
- Changes to backend token syntax

**Migration:** Explicit transformation required; old and new versions are incompatible.

#### 11.2.2 Minor Version Changes

Minor version increment indicates backward-compatible additions:

- New reserved backends
- Clarifications to validation rules
- New vendor extension patterns

**Migration:** None required.

### 11.3 Backend Registry Versioning

The backend registry is versioned independently:

| Event | Version Impact |
|-------|----------------|
| New reserved backend | Minor increment |
| Backend deprecation initiated | Minor increment |
| Backend removed | Major increment |

---

## Appendix A: Test Vectors

### A.1 Valid Storage Pointers

**Test Vector 1: Minimal**
```json
{
  "backend": "a",
  "hash": "0000000000000000000000000000000000000000000000000000000000000001",
  "uri": "aoc://storage/a/0x0000000000000000000000000000000000000000000000000000000000000001"
}
```

**Test Vector 2: Maximum Backend Length**
```json
{
  "backend": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "hash": "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "uri": "aoc://storage/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
}
```

### A.2 Invalid Storage Pointers

| Input | Expected Error |
|-------|----------------|
| `{"backend":"Local",...}` | `backend_invalid_format` (uppercase) |
| `{"hash":"ABC...",...}` | `hash_invalid_format` (uppercase) |
| `{"uri":"AOC://...",...}` | `uri_derivation_mismatch` |
| `{"backend":"","hash":"..."}` | `backend_invalid_format` (empty) |
| `{"hash":"abc"}` | `hash_invalid_format` (too short) |

---

## Appendix B: JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aoc.protocol/schemas/storage-pointer/1.0",
  "title": "AOC Storage Pointer",
  "type": "object",
  "required": ["backend", "hash", "uri"],
  "properties": {
    "backend": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
      "minLength": 1,
      "maxLength": 64
    },
    "hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    },
    "uri": {
      "type": "string",
      "pattern": "^aoc://storage/[a-z][a-z0-9]*(-[a-z0-9]+)*/0x[a-f0-9]{64}$"
    }
  },
  "additionalProperties": false
}
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial Storage Pointer specification |

---

*This document is normative. Implementations MUST conform to produce interoperable results.*
