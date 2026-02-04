# AOC Protocol — Pack Object Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](../wallet/architecture.md), [content-object-spec.md](../content/content-object-spec.md), [storage-pointer-spec.md](../storage/storage-pointer-spec.md)

---

## Table of Contents

1. [Pack Object Definition](#1-pack-object-definition)
2. [Pack Object Fields](#2-pack-object-fields)
3. [Field Reference Structure](#3-field-reference-structure)
4. [Field Semantics](#4-field-semantics)
5. [Canonical Payload Boundary](#5-canonical-payload-boundary)
6. [Deterministic Encoding Rules](#6-deterministic-encoding-rules)
7. [Pack Hash](#7-pack-hash)
8. [Extensibility Rules](#8-extensibility-rules)
9. [Example Pack Object](#9-example-pack-object)
10. [Security Invariants](#10-security-invariants)
11. [Versioning Strategy](#11-versioning-strategy)

---

## 1. Pack Object Definition

### 1.1 Overview

A **Pack Object** is a cryptographically verifiable, immutable manifest that binds multiple Content Object references into a single deterministic unit within the AOC Protocol. The Pack Object does not embed actual data; it serves as a content-addressed descriptor that aggregates field references for granting consent and transporting data bundles across wallets and systems.

**Formal Definition:**

```
PackObject := {
  version:    Version,          -- protocol version identifier
  subject:    DID,              -- data owner identifier
  created_at: Timestamp,        -- creation time (Unix seconds)
  fields:     [FieldReference], -- non-empty array of field references
  pack_hash:  Hash              -- canonical payload hash
}
```

### 1.2 What a Pack Object Represents

A Pack Object represents:

| Aspect | Description |
|--------|-------------|
| **Aggregation Binding** | A deterministic grouping of Content Object references |
| **Consent Unit** | An atomic unit for granting or revoking consent over multiple data fields |
| **Transport Manifest** | A portable descriptor for moving data bundles between systems |
| **Integrity Binding** | A cryptographic commitment to the exact set of referenced content |
| **Identity Binding** | A link between aggregated data and a specific subject identity |

### 1.3 What a Pack Object Does NOT Represent

A Pack Object explicitly does NOT represent:

| Excluded Aspect | Rationale |
|-----------------|-----------|
| **Embedded Data** | Pack Objects reference content; they do not contain it |
| **Access Control** | Permissions are handled at higher protocol layers |
| **Encryption State** | Encryption is orthogonal to pack structure |
| **Application Semantics** | The meaning of fields is application-level concern |
| **Retrieval Protocol** | How to fetch referenced content is implementation-specific |
| **Mutable Collections** | Pack Objects are strictly immutable |

### 1.4 Design Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Once created, a Pack Object MUST NOT be modified; changes require a new object |
| **Content Addressing** | The `pack_hash` field provides a unique, deterministic identifier |
| **Determinism** | Identical inputs MUST produce identical Pack Objects regardless of field input order |
| **Offline Verifiability** | All integrity checks MUST be computable without network access |
| **Minimal Surface** | Only essential fields are included; no application-specific data |
| **Reference-Only** | The Pack contains only references to Content Objects, not actual data |

### 1.5 Relationship to Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│              (Consumers of Pack Objects)                    │
│                                                             │
│   • Data sharing workflows                                  │
│   • Consent management interfaces                           │
│   • Bundle transport orchestration                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROTOCOL LAYER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Pack Object                        │  │
│  │                                                       │  │
│  │   • Aggregates Content Object references             │  │
│  │   • Provides pack_hash for content addressing        │  │
│  │   • Enables atomic consent operations                │  │
│  │   • Supports offline verification                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Content Objects                      │  │
│  │                                                       │  │
│  │   • Individual data unit descriptors                 │  │
│  │   • Storage pointer bindings                         │  │
│  │   • Content hash verification                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                            │
│         (Any backend: local, cloud, distributed)            │
└─────────────────────────────────────────────────────────────┘
```

Pack Objects are protocol-level constructs that aggregate Content Object references. Applications consume Pack Objects for consent and transport workflows; the Pack Object itself contains no application logic.

---

## 2. Pack Object Fields

### 2.1 Field Summary

| Field | Type | Required | Mutable | Description |
|-------|------|----------|---------|-------------|
| `version` | string | REQUIRED | No | Protocol version identifier |
| `subject` | string | REQUIRED | No | DID of the data owner |
| `created_at` | integer | REQUIRED | No | Unix timestamp of object creation |
| `fields` | array | REQUIRED | No | Non-empty array of Field References |
| `pack_hash` | string | REQUIRED | No | SHA-256 hash of canonical payload |

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

**Description:** Identifies the Pack Object specification version used to construct this object. Implementations MUST reject objects with unsupported major versions.

#### 2.2.2 subject

| Property | Value |
|----------|-------|
| **Name** | `subject` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Decentralized Identifier (DID) |
| **Constraints** | MUST be a valid DID per W3C DID Core specification; MUST NOT be empty |
| **Max Length** | 512 bytes (UTF-8 encoded) |

**Description:** The DID of the entity that owns and controls the referenced data bundle. This field establishes data sovereignty by binding the pack to a specific identity. The subject of the Pack Object MUST match the subject of all referenced Content Objects.

#### 2.2.3 created_at

| Property | Value |
|----------|-------|
| **Name** | `created_at` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Unix timestamp (seconds since 1970-01-01T00:00:00Z) |
| **Constraints** | MUST be > 0; MUST NOT be in the future relative to validation time |
| **Max Value** | 2^53 - 1 |

**Description:** The timestamp when this Pack Object was created. This field is set once at creation time and MUST NOT be modified.

#### 2.2.4 fields

| Property | Value |
|----------|-------|
| **Name** | `fields` |
| **Type** | array of FieldReference |
| **Required** | REQUIRED |
| **Format** | See [Section 3: Field Reference Structure](#3-field-reference-structure) |
| **Constraints** | MUST be non-empty; MUST contain at least one Field Reference |
| **Max Elements** | 65535 |

**Description:** An ordered array of Field Reference objects. Each Field Reference binds a logical field identifier to a Content Object reference. The array MUST contain at least one element; empty packs are invalid.

#### 2.2.5 pack_hash

| Property | Value |
|----------|-------|
| **Name** | `pack_hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase; MUST be the SHA-256 hash of the canonical payload |
| **Algorithm** | SHA-256 |

**Description:** The cryptographic hash of the canonical payload (see [Section 5](#5-canonical-payload-boundary)). This field enables content addressing and integrity verification for the entire pack.

---

## 3. Field Reference Structure

### 3.1 Overview

A **Field Reference** is a structured object that binds a logical field identifier to a Content Object reference within a Pack. Each Field Reference contains sufficient information to locate, retrieve, and verify the referenced content.

### 3.2 Field Reference Definition

```
FieldReference := {
  field_id:   FieldIdentifier,   -- logical field name
  content_id: ContentHash,       -- content object content_hash
  storage:    StoragePointer,    -- storage location and integrity binding
  bytes:      PositiveInt        -- exact size of referenced blob
}
```

### 3.3 Field Reference Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field_id` | string | REQUIRED | Logical identifier for the field |
| `content_id` | string | REQUIRED | Content hash of the referenced Content Object |
| `storage` | object | REQUIRED | Storage Pointer for the underlying data |
| `bytes` | integer | REQUIRED | Exact byte size of the referenced blob |

### 3.4 Field Reference Field Definitions

#### 3.4.1 field_id

| Property | Value |
|----------|-------|
| **Name** | `field_id` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase alphanumeric with underscores and hyphens |
| **Constraints** | MUST match pattern `^[a-z][a-z0-9_-]*$`; MUST NOT be empty |
| **Min Length** | 1 character |
| **Max Length** | 128 characters |

**Description:** A logical identifier for the field within the pack. Field identifiers provide semantic meaning to each Content Object reference. Field identifiers MUST be unique within a single Pack Object.

**Examples:**
- `full_name`
- `email-address`
- `profile_photo`
- `medical-record-2024`

#### 3.4.2 content_id

| Property | Value |
|----------|-------|
| **Name** | `content_id` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase; MUST be a valid Content Object content_hash |
| **Algorithm** | SHA-256 |

**Description:** The content_hash of the referenced Content Object. This field establishes a cryptographic binding between the Field Reference and a specific Content Object.

#### 3.4.3 storage

| Property | Value |
|----------|-------|
| **Name** | `storage` |
| **Type** | object (StoragePointer) |
| **Required** | REQUIRED |
| **Format** | See Storage Pointer Specification |
| **Constraints** | MUST contain valid `backend`, `uri`, and `hash` fields |

**Description:** A Storage Pointer that describes where the underlying data blob is stored and how to verify its integrity upon retrieval. This MUST match the storage pointer of the referenced Content Object.

#### 3.4.4 bytes

| Property | Value |
|----------|-------|
| **Name** | `bytes` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Unsigned 64-bit integer |
| **Constraints** | MUST be > 0; MUST exactly match the byte length of the referenced blob |
| **Max Value** | 2^53 - 1 (for JSON interoperability) |

**Description:** The exact size in bytes of the data blob referenced by the storage pointer. This value MUST match the `bytes` field of the referenced Content Object.

---

## 4. Field Semantics

### 4.1 version

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

### 4.2 subject

The `subject` field establishes data ownership and sovereignty over the entire pack.

**Semantic Rules:**

1. The subject DID MUST resolve to a valid DID Document (resolution may be deferred)
2. Only the subject (or authorized delegates) MAY create Pack Objects for their data
3. The subject of the Pack Object MUST match the subject of all referenced Content Objects
4. Subject binding is immutable; changing ownership requires a new Pack Object
5. A Pack Object MUST NOT reference Content Objects belonging to different subjects

**Identity Consistency:**

```
validate_subject_consistency(pack_object, content_objects):
  FOR EACH field_ref IN pack_object.fields:
    content_obj := lookup(field_ref.content_id, content_objects)
    IF content_obj.subject != pack_object.subject THEN
      RETURN (INVALID, "subject_mismatch", field_ref.field_id)
  RETURN (VALID)
```

### 4.3 created_at

The `created_at` field records the pack creation timestamp.

**Semantic Rules:**

1. Timestamp MUST be set at object creation time
2. Timestamp MUST NOT be backdated or forward-dated beyond reasonable clock skew
3. Implementations SHOULD allow ±300 seconds clock skew tolerance
4. Timestamp enables ordering and freshness verification
5. The Pack Object `created_at` MAY differ from the `created_at` of referenced Content Objects

**Clock Skew Handling:**

```
validate_timestamp(created_at, current_time, skew_tolerance):
  IF created_at > current_time + skew_tolerance THEN
    RETURN (INVALID, "future_timestamp")
  IF created_at <= 0 THEN
    RETURN (INVALID, "invalid_timestamp")
  RETURN (VALID)
```

### 4.4 fields

The `fields` array aggregates Content Object references into a deterministic collection.

**Semantic Rules:**

1. The `fields` array MUST contain at least one Field Reference
2. Field identifiers (`field_id`) MUST be unique within the pack
3. The order of fields is semantically significant; implementations MUST preserve order
4. For canonical hash computation, fields are sorted by `field_id` (see Section 6)
5. Duplicate `content_id` values are permitted (same content, different logical fields)
6. Maximum field count is 65535 to prevent resource exhaustion

**Field Uniqueness Validation:**

```
validate_field_uniqueness(pack_object):
  seen_ids := {}
  FOR EACH field_ref IN pack_object.fields:
    IF field_ref.field_id ∈ seen_ids THEN
      RETURN (INVALID, "duplicate_field_id", field_ref.field_id)
    seen_ids.add(field_ref.field_id)
  RETURN (VALID)
```

### 4.5 pack_hash

The `pack_hash` field provides content addressing and integrity for the entire pack.

**Semantic Rules:**

1. Hash MUST be computed over the canonical payload (see [Section 5](#5-canonical-payload-boundary))
2. Hash MUST use SHA-256 algorithm
3. Hash MUST be encoded as lowercase hexadecimal
4. Hash serves as the canonical identifier for the Pack Object
5. Two Pack Objects with identical `pack_hash` values are semantically identical
6. Any modification to any field (including field order for storage) changes the `pack_hash`

### 4.6 Field Reference Semantics

#### 4.6.1 field_id

**Semantic Rules:**

1. Field identifiers provide logical meaning within the pack context
2. Field identifiers are case-sensitive; only lowercase is valid
3. Field identifiers SHOULD be descriptive and follow consistent naming conventions
4. Applications define the semantic meaning of specific field identifiers
5. The protocol does not impose semantic requirements on field identifier values

#### 4.6.2 content_id

**Semantic Rules:**

1. The content_id MUST reference an existing, valid Content Object
2. The content_id is the authoritative reference; other Field Reference fields are for convenience
3. If the referenced Content Object cannot be found, the Field Reference is unresolvable
4. Content Objects may be referenced by multiple Field References (within same or different packs)

#### 4.6.3 storage

**Semantic Rules:**

1. The storage pointer MUST be identical to the storage field of the referenced Content Object
2. Inclusion in the Field Reference enables standalone verification without Content Object lookup
3. Storage pointer validation rules apply as specified in the Storage Pointer Specification

#### 4.6.4 bytes

**Semantic Rules:**

1. The bytes value MUST match the bytes field of the referenced Content Object
2. Inclusion enables size verification and pre-allocation without Content Object lookup
3. Sum of all bytes values indicates total pack size (for transport estimation)

---

## 5. Canonical Payload Boundary

### 5.1 Definition

The **canonical payload** is the subset of Pack Object fields included in the `pack_hash` computation. Only fields within the canonical payload boundary contribute to the hash.

### 5.2 Included Fields

The canonical payload MUST include exactly the following fields:

| Field | Included | Rationale |
|-------|----------|-----------|
| `version` | Yes | Hash is version-specific |
| `subject` | Yes | Owner identity is content-defining |
| `created_at` | Yes | Timestamp is content-defining |
| `fields` | Yes | Field references are content-defining |
| `pack_hash` | **No** | Self-referential; excluded by definition |

### 5.3 Canonical Payload Structure

```
CanonicalPayload := {
  created_at: <created_at>,
  fields:     <canonicalized_fields>,
  subject:    <subject>,
  version:    <version>
}
```

Note: Fields in the canonical payload are ordered alphabetically by key name.

### 5.4 Canonical Fields Array Structure

The `fields` array within the canonical payload MUST be sorted by `field_id` in ascending Unicode code point order. Each Field Reference within the array is encoded with keys in sorted order.

```
CanonicalFieldReference := {
  bytes:      <bytes>,
  content_id: <content_id>,
  field_id:   <field_id>,
  storage:    <canonical_storage_pointer>
}
```

### 5.5 Hash Computation

```
pack_hash := lowercase_hex(SHA-256(canonical_json(CanonicalPayload)))

where:
  canonical_json() applies deterministic encoding rules (Section 6)
  SHA-256() computes the SHA-256 hash
  lowercase_hex() encodes as lowercase hexadecimal string
```

### 5.6 Payload Boundary Invariants

```
INV-PB-01: pack_hash ∉ CanonicalPayload
  "pack_hash MUST NOT be included in canonical payload"

INV-PB-02: ∀ field F ∈ {version, subject, created_at, fields}:
           F ∈ CanonicalPayload
  "All specified fields MUST be included in canonical payload"

INV-PB-03: |CanonicalPayload.fields| = 4
  "Canonical payload contains exactly four top-level fields"

INV-PB-04: sorted(CanonicalPayload.fields, by=field_id)
  "Fields array MUST be sorted by field_id in canonical form"
```

---

## 6. Deterministic Encoding Rules

### 6.1 Overview

Pack Objects MUST be encoded deterministically to ensure identical objects produce identical byte representations. This specification adopts canonical JSON encoding based on RFC 8785 (JSON Canonicalization Scheme).

### 6.2 Canonical JSON Rules

#### 6.2.1 Object Key Ordering

Object keys MUST be sorted in ascending order by Unicode code point value.

For the Pack Object, the canonical top-level key order is:

1. `created_at`
2. `fields`
3. `subject`
4. `version`

(Note: `pack_hash` is excluded from canonical payload)

```
CORRECT:   {"created_at":1706745600,"fields":[...],"subject":"did:aoc:...","version":"1.0"}
INCORRECT: {"version":"1.0","subject":"did:aoc:...","created_at":1706745600,"fields":[...]}
```

#### 6.2.2 Fields Array Sorting

The `fields` array MUST be sorted by `field_id` in ascending Unicode code point order before encoding.

```
CORRECT:   "fields":[{"field_id":"email",...},{"field_id":"name",...}]
INCORRECT: "fields":[{"field_id":"name",...},{"field_id":"email",...}]
```

#### 6.2.3 Field Reference Key Ordering

Each Field Reference object MUST have keys in the following order:

1. `bytes`
2. `content_id`
3. `field_id`
4. `storage`

#### 6.2.4 Storage Pointer Key Ordering

The nested `storage` object MUST have keys in the following order:

1. `backend`
2. `hash`
3. `uri`

#### 6.2.5 Whitespace

- No whitespace between tokens
- No trailing newline
- No leading whitespace

```
CORRECT:   {"created_at":1706745600,"fields":[...],"subject":"did:aoc:...","version":"1.0"}
INCORRECT: { "created_at": 1706745600, "fields": [...], "subject": "did:aoc:...", "version": "1.0" }
INCORRECT: {"created_at":1706745600,...}\n
```

#### 6.2.6 String Encoding

| Rule | Specification |
|------|---------------|
| Encoding | UTF-8 |
| Normalization | NFC (Canonical Decomposition, followed by Canonical Composition) |
| Escape sequences | `\"`, `\\`, `\b`, `\f`, `\n`, `\r`, `\t` |
| Control characters | U+0000 to U+001F MUST use `\uXXXX` escapes |
| Non-ASCII | Literal UTF-8 bytes, NOT `\uXXXX` escapes |
| Solidus | MUST NOT be escaped (use `/`, not `\/`) |

#### 6.2.7 Integer Encoding

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

### 6.3 Encoding Algorithm

```
function canonical_encode(pack_object):
  // Step 1: Sort fields by field_id
  sorted_fields := sort(pack_object.fields, by=field_id, order=ascending)

  // Step 2: Construct canonical field references
  canonical_fields := []
  FOR EACH field_ref IN sorted_fields:
    canonical_field := {
      "bytes":      field_ref.bytes,
      "content_id": field_ref.content_id,
      "field_id":   field_ref.field_id,
      "storage":    {
        "backend": field_ref.storage.backend,
        "hash":    field_ref.storage.hash,
        "uri":     field_ref.storage.uri
      }
    }
    canonical_fields.append(canonical_field)

  // Step 3: Construct canonical payload (keys in sorted order)
  payload := {
    "created_at": pack_object.created_at,
    "fields":     canonical_fields,
    "subject":    pack_object.subject,
    "version":    pack_object.version
  }

  RETURN utf8_encode(json_serialize(payload))
```

### 6.4 Encoding Verification

Implementations MUST verify that:

1. Re-encoding a parsed object produces identical bytes
2. `pack_hash` matches the hash of the canonical encoding
3. No extraneous whitespace or formatting exists
4. Fields array is properly sorted by `field_id`

---

## 7. Pack Hash

### 7.1 Definition

The `pack_hash` is a cryptographic digest that uniquely identifies a Pack Object based on its canonical payload.

### 7.2 Algorithm Specification

| Property | Value |
|----------|-------|
| Algorithm | SHA-256 |
| Input | Canonical JSON encoding of payload (UTF-8 bytes) |
| Output | 256-bit digest |
| Encoding | Lowercase hexadecimal string (64 characters) |

### 7.3 Computation Procedure

```
function compute_pack_hash(pack_object):
  // Step 1: Sort fields by field_id
  sorted_fields := sort(pack_object.fields, by=field_id, order=ascending)

  // Step 2: Construct canonical payload
  payload := {
    created_at: pack_object.created_at,
    fields:     canonicalize_fields(sorted_fields),
    subject:    pack_object.subject,
    version:    pack_object.version
  }

  // Step 3: Apply deterministic encoding
  canonical_bytes := canonical_encode(payload)

  // Step 4: Compute SHA-256 hash
  hash_bytes := SHA256(canonical_bytes)

  // Step 5: Encode as lowercase hex
  hash_string := lowercase_hex_encode(hash_bytes)

  RETURN hash_string
```

### 7.4 Hash Properties

| Property | Requirement |
|----------|-------------|
| **Deterministic** | Identical inputs MUST produce identical hashes regardless of original field order |
| **Collision Resistant** | Computationally infeasible to find two distinct inputs with same hash |
| **Pre-image Resistant** | Computationally infeasible to derive input from hash |
| **Fixed Length** | Output is always exactly 64 hexadecimal characters |
| **Case Sensitivity** | MUST be lowercase; uppercase MUST be rejected |
| **Order Independent** | Same fields in different order produce same hash (due to sorting) |

### 7.5 Hash Verification

```
function verify_pack_hash(pack_object):
  computed := compute_pack_hash(pack_object)
  IF computed != pack_object.pack_hash THEN
    RETURN (INVALID, "hash_mismatch", expected=pack_object.pack_hash, actual=computed)
  RETURN (VALID)
```

### 7.6 Content Addressing

The `pack_hash` serves as a content address, enabling:

1. **Deduplication**: Identical packs (same content, any field order) produce identical hashes
2. **Integrity Verification**: Any modification changes the hash
3. **Canonical Reference**: Unambiguous identifier for the Pack Object
4. **Cache Keys**: Safe to cache by pack hash
5. **Consent Binding**: Consent grants can reference pack_hash for specificity

---

## 8. Extensibility Rules

### 8.1 Extension Principles

Pack Object extensibility follows these principles:

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

### 8.3 Field Reference Extensions

Field Reference objects follow the same extension rules:

1. New optional fields in Field References require minor version increment
2. New required fields in Field References require major version increment
3. Extended Field Reference fields are sorted alphabetically in canonical form

### 8.4 Reserved Field Names

The following field names are reserved for future use:

| Field | Intended Purpose |
|-------|------------------|
| `signature` | Cryptographic signature over pack |
| `metadata` | Application-specific metadata container |
| `label` | Human-readable pack label |
| `expires_at` | Optional expiration timestamp |
| `replaces` | Pack Object this supersedes |
| `schema` | Reference to field schema definition |

### 8.5 Reserved Field Reference Field Names

The following Field Reference field names are reserved:

| Field | Intended Purpose |
|-------|------------------|
| `content_type` | IANA media type (duplicated from Content Object) |
| `label` | Human-readable field label |
| `required` | Whether field is required for pack validity |
| `encrypted` | Encryption state indicator |

### 8.6 Vendor Extensions

Vendor-specific fields MUST use the `x-` prefix:

```json
{
  "version": "1.0",
  "subject": "did:aoc:example",
  "created_at": 1706745600,
  "fields": [...],
  "pack_hash": "abc123...",
  "x-vendor-field": "custom value"
}
```

Vendor extensions:
- MUST NOT be included in canonical payload
- MUST NOT conflict with registered field names
- SHOULD be documented by the vendor

---

## 9. Example Pack Object

### 9.1 Canonical Payload Example

The following shows the canonical payload (fields included in hash computation) with fields sorted by `field_id`:

```json
{"created_at":1706745600,"fields":[{"bytes":256,"content_id":"a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2","field_id":"email","storage":{"backend":"ipfs","hash":"b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3","uri":"aoc://storage/ipfs/0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"}},{"bytes":128,"content_id":"c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4","field_id":"full_name","storage":{"backend":"local","hash":"d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5","uri":"aoc://storage/local/0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5"}}],"subject":"did:aoc:7sHxtdZ9bE3F5kNmZM4vbU","version":"1.0"}
```

Note: No whitespace, keys sorted alphabetically, `fields` array sorted by `field_id`.

### 9.2 Full Pack Object Example

```json
{
  "version": "1.0",
  "subject": "did:aoc:7sHxtdZ9bE3F5kNmZM4vbU",
  "created_at": 1706745600,
  "fields": [
    {
      "field_id": "full_name",
      "content_id": "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      "storage": {
        "backend": "local",
        "hash": "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
        "uri": "aoc://storage/local/0xd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5"
      },
      "bytes": 128
    },
    {
      "field_id": "email",
      "content_id": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      "storage": {
        "backend": "ipfs",
        "hash": "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
        "uri": "aoc://storage/ipfs/0xb2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3"
      },
      "bytes": 256
    }
  ],
  "pack_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

Note: In the full object, fields MAY appear in any order; canonical encoding sorts them.

### 9.3 Single Field Pack Example

```json
{
  "version": "1.0",
  "subject": "did:aoc:9kLmNpQrStUvWxYz1234AB",
  "created_at": 1706832000,
  "fields": [
    {
      "field_id": "profile_photo",
      "content_id": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      "storage": {
        "backend": "s3",
        "hash": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        "uri": "aoc://storage/s3/0xca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
      },
      "bytes": 524288
    }
  ],
  "pack_hash": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
}
```

### 9.4 Multi-Field Pack Example (Medical Record Bundle)

```json
{
  "version": "1.0",
  "subject": "did:aoc:2DrjgbN7v5TJfQkX9BCXP4",
  "created_at": 1706918400,
  "fields": [
    {
      "field_id": "allergies",
      "content_id": "f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650",
      "storage": {
        "backend": "local",
        "hash": "252f10c83610ebca1a059c0bae8255eba2f95be4d1d7bcfa89d7248a82d9f111",
        "uri": "aoc://storage/local/0x252f10c83610ebca1a059c0bae8255eba2f95be4d1d7bcfa89d7248a82d9f111"
      },
      "bytes": 1024
    },
    {
      "field_id": "blood_type",
      "content_id": "d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2",
      "storage": {
        "backend": "local",
        "hash": "e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3",
        "uri": "aoc://storage/local/0xe3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3"
      },
      "bytes": 64
    },
    {
      "field_id": "medications",
      "content_id": "a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4",
      "storage": {
        "backend": "local",
        "hash": "b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5",
        "uri": "aoc://storage/local/0xb5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5"
      },
      "bytes": 2048
    },
    {
      "field_id": "primary_physician",
      "content_id": "c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6",
      "storage": {
        "backend": "local",
        "hash": "d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7",
        "uri": "aoc://storage/local/0xd7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7"
      },
      "bytes": 512
    }
  ],
  "pack_hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
}
```

---

## 10. Security Invariants

### 10.1 Hash Invariants

```
INV-HASH-01: pack_hash = lowercase_hex(SHA256(canonical_payload))
  "Pack hash MUST equal SHA-256 of canonical payload"

INV-HASH-02: ∀ char c ∈ pack_hash: c ∈ [0-9a-f]
  "Pack hash MUST be lowercase hexadecimal"

INV-HASH-03: length(pack_hash) = 64
  "Pack hash MUST be exactly 64 characters"

INV-HASH-04: ∀ field_ref ∈ fields: length(field_ref.content_id) = 64
  "All content_id values MUST be exactly 64 characters"

INV-HASH-05: ∀ field_ref ∈ fields: ∀ char c ∈ field_ref.content_id: c ∈ [0-9a-f]
  "All content_id values MUST be lowercase hexadecimal"
```

### 10.2 Field Invariants

```
INV-FIELD-01: length(fields) ≥ 1
  "Fields array MUST contain at least one element"

INV-FIELD-02: length(fields) ≤ 65535
  "Fields array MUST NOT exceed 65535 elements"

INV-FIELD-03: subject ≠ ""
  "Subject MUST NOT be empty"

INV-FIELD-04: version matches ^[0-9]+\.[0-9]+$
  "Version MUST be valid semantic version"

INV-FIELD-05: created_at > 0
  "Created timestamp MUST be positive"

INV-FIELD-06: created_at ≤ current_time + 300
  "Created timestamp MUST NOT be in the future (with 5-minute tolerance)"
```

### 10.3 Field Reference Invariants

```
INV-REF-01: ∀ field_ref ∈ fields: field_ref.field_id ≠ ""
  "Field identifier MUST NOT be empty"

INV-REF-02: ∀ field_ref ∈ fields: field_ref.field_id matches ^[a-z][a-z0-9_-]*$
  "Field identifier MUST match required pattern"

INV-REF-03: ∀ field_ref ∈ fields: field_ref.bytes > 0
  "Bytes MUST be a positive integer"

INV-REF-04: ∀ i,j ∈ [0,length(fields)): i ≠ j → fields[i].field_id ≠ fields[j].field_id
  "Field identifiers MUST be unique within a pack"

INV-REF-05: ∀ field_ref ∈ fields: length(field_ref.field_id) ≤ 128
  "Field identifier MUST NOT exceed 128 characters"
```

### 10.4 Storage Pointer Invariants

```
INV-STORE-01: ∀ field_ref ∈ fields: field_ref.storage.uri ≠ ""
  "Storage URI MUST NOT be empty"

INV-STORE-02: ∀ field_ref ∈ fields: field_ref.storage.backend matches ^[a-z][a-z0-9]*(-[a-z0-9]+)*$
  "Storage backend MUST be valid identifier"

INV-STORE-03: ∀ field_ref ∈ fields: length(field_ref.storage.hash) = 64
  "Storage hash MUST be exactly 64 characters"

INV-STORE-04: ∀ field_ref ∈ fields: field_ref.storage.uri = "aoc://storage/" || field_ref.storage.backend || "/0x" || field_ref.storage.hash
  "Storage URI MUST be derived from backend and hash"
```

### 10.5 Subject Consistency Invariants

```
INV-SUBJ-01: ∀ content_obj referenced by pack: content_obj.subject = pack.subject
  "All referenced Content Objects MUST have same subject as Pack"

INV-SUBJ-02: subject is valid DID
  "Subject MUST be a valid Decentralized Identifier"
```

### 10.6 Integrity Invariants

```
INV-INT-01: ∀ Pack Object PO: verify_pack_hash(PO) = VALID
  "Pack hash MUST verify against canonical payload"

INV-INT-02: ∀ field_ref ∈ fields: ∃ ContentObject CO: CO.content_hash = field_ref.content_id
  "Each field reference MUST correspond to a valid Content Object"

INV-INT-03: ∀ field_ref ∈ fields: field_ref.storage = lookup(field_ref.content_id).storage
  "Field reference storage MUST match referenced Content Object storage"

INV-INT-04: ∀ field_ref ∈ fields: field_ref.bytes = lookup(field_ref.content_id).bytes
  "Field reference bytes MUST match referenced Content Object bytes"

INV-INT-05: canonical_encode(parse(canonical_encode(PO))) = canonical_encode(PO)
  "Canonical encoding MUST be idempotent"
```

### 10.7 Determinism Invariants

```
INV-DET-01: ∀ Pack Objects P1, P2: (P1.version = P2.version ∧ P1.subject = P2.subject ∧
            P1.created_at = P2.created_at ∧ set(P1.fields) = set(P2.fields)) → P1.pack_hash = P2.pack_hash
  "Packs with same content MUST have same hash regardless of field order"

INV-DET-02: sort_by_field_id(fields) produces deterministic ordering
  "Field sorting MUST be deterministic"
```

### 10.8 Immutability Invariants

```
INV-IMM-01: ∀ field F ∈ PackObject: mutate(F) → new PackObject
  "Modifying any field MUST produce a new Pack Object"

INV-IMM-02: pack_hash serves as immutable identifier
  "Pack hash uniquely identifies the immutable Pack Object"
```

### 10.9 Invariant Enforcement

All implementations MUST:

1. Validate all invariants before accepting a Pack Object
2. Validate all invariants before persisting a Pack Object
3. Reject Pack Objects that violate any invariant
4. Log invariant violations with sufficient context for debugging
5. Never silently accept invalid Pack Objects
6. Verify field_id uniqueness before computing pack_hash
7. Verify storage pointer derivation for all field references

---

## 11. Versioning Strategy

### 11.1 Version Format

| Component | Format | Example |
|-----------|--------|---------|
| Specification Version | `MAJOR.MINOR` | `0.1` |
| Pack Object Version | `MAJOR.MINOR` | `1.0` |

### 11.2 Version Semantics

#### 11.2.1 Major Version

Major version increment indicates breaking changes:

- Changes to canonical payload boundary
- Field type changes
- Removal of required fields
- Hash algorithm changes
- Changes to field sorting rules

**Migration:** Explicit transformation required; old and new versions are incompatible.

#### 11.2.2 Minor Version

Minor version increment indicates backward-compatible additions:

- New optional fields (outside canonical payload)
- New optional Field Reference fields
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
3. Include version in all serialized Pack Objects
4. Reject Pack Objects with unsupported major versions

---

## Appendix A: Test Vectors

### A.1 Hash Computation

**Input (Canonical JSON):**
```
{"created_at":1706745600,"fields":[{"bytes":100,"content_id":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","field_id":"test","storage":{"backend":"local","hash":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","uri":"aoc://storage/local/0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}}],"subject":"did:aoc:test123","version":"1.0"}
```

**Expected SHA-256:**
```
[Computed per implementation]
```

### A.2 Canonical Encoding Verification

Given the Pack Object fields:
- version: `"1.0"`
- subject: `"did:aoc:example"`
- created_at: `1700000000`
- fields (unsorted):
  - field_id: `"zebra"`, ...
  - field_id: `"alpha"`, ...

The canonical encoding MUST produce fields in this order: `alpha`, `zebra`

### A.3 Field Order Independence

Two Pack Objects with identical fields in different order MUST produce identical `pack_hash` values.

**Pack A fields order:** `["name", "email", "phone"]`
**Pack B fields order:** `["phone", "name", "email"]`

**Result:** `pack_hash_A = pack_hash_B`

---

## Appendix B: JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aoc.protocol/schemas/pack-object/1.0",
  "title": "AOC Pack Object",
  "type": "object",
  "required": ["version", "subject", "created_at", "fields", "pack_hash"],
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
    "created_at": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "fields": {
      "type": "array",
      "minItems": 1,
      "maxItems": 65535,
      "items": {
        "$ref": "#/$defs/FieldReference"
      }
    },
    "pack_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$"
    }
  },
  "additionalProperties": true,
  "$defs": {
    "FieldReference": {
      "type": "object",
      "required": ["field_id", "content_id", "storage", "bytes"],
      "properties": {
        "field_id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9_-]*$",
          "minLength": 1,
          "maxLength": 128
        },
        "content_id": {
          "type": "string",
          "pattern": "^[a-f0-9]{64}$"
        },
        "storage": {
          "$ref": "#/$defs/StoragePointer"
        },
        "bytes": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        }
      },
      "additionalProperties": false
    },
    "StoragePointer": {
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
  }
}
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02 | Initial Pack Object specification |

---

*This document is normative. Implementations MUST conform to produce interoperable results.*
