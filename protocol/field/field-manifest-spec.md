# AOC Protocol — Field Manifest Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [architecture.md](../wallet/architecture.md), [crypto-spec.md](../wallet/crypto-spec.md)

---

## Table of Contents

1. [Field Manifest Definition](#1-field-manifest-definition)
2. [Field Manifest Fields](#2-field-manifest-fields)
3. [Field Semantics](#3-field-semantics)
4. [Canonical Payload Boundary](#4-canonical-payload-boundary)
5. [Deterministic Encoding Rules](#5-deterministic-encoding-rules)
6. [Field Hash](#6-field-hash)
7. [Field Identifier](#7-field-identifier)
8. [Extensibility Rules](#8-extensibility-rules)
9. [Example Field Manifest](#9-example-field-manifest)
10. [Security Invariants](#10-security-invariants)
11. [Versioning Strategy](#11-versioning-strategy)

---

## 1. Field Manifest Definition

### 1.1 Overview

A **Field Manifest** is a cryptographically verifiable, immutable descriptor that defines the stable identity, meaning, and deterministic addressing of a conceptual field definition within the AOC Protocol. The Field Manifest establishes a canonical reference for field types that can be used by Pack Objects and other protocol constructs to ensure semantic consistency across systems.

**Formal Definition:**

```
FieldManifest := {
  version:    Version,      -- protocol version identifier
  field_id:   FieldName,    -- canonical field name
  data_type:  DataType,     -- data type specification
  semantics:  Semantics,    -- semantic description
  created_at: Timestamp,    -- creation time (Unix seconds)
  field_hash: Hash          -- canonical payload hash
}
```

### 1.2 What a Field Manifest Represents

A Field Manifest represents:

| Aspect | Description |
|--------|-------------|
| **Field Identity** | A stable, deterministic identifier for a conceptual field type |
| **Semantic Definition** | A formal description of what the field means and how it should be interpreted |
| **Type Specification** | A declaration of the expected data type for field values |
| **Content Addressing** | A cryptographic commitment enabling offline verification |
| **Interoperability Contract** | A shared definition that ensures consistent field usage across systems |

### 1.3 What a Field Manifest Does NOT Represent

A Field Manifest explicitly does NOT represent:

| Excluded Aspect | Rationale |
|-----------------|-----------|
| **Field Values** | Field Manifests define structure, not content |
| **Access Control** | Permissions are handled at higher protocol layers |
| **Storage Location** | Storage is orthogonal to field definition |
| **Application Logic** | Business rules are application-level concerns |
| **Validation Rules** | Complex validation is beyond scope of the manifest |
| **Mutable Schema** | Field Manifests are strictly immutable |

### 1.4 Design Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Once created, a Field Manifest MUST NOT be modified; changes require a new manifest |
| **Content Addressing** | The `field_hash` field provides a unique, deterministic identifier |
| **Determinism** | Identical inputs MUST produce identical Field Manifests |
| **Offline Verifiability** | All integrity checks MUST be computable without network access |
| **Backend Agnosticism** | Field Manifests do not depend on any specific storage or blockchain system |
| **Minimal Surface** | Only essential fields are included; no application-specific data |

### 1.5 Relationship to Protocol Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│              (Consumers of Field Manifests)                 │
│                                                             │
│   • Schema management interfaces                            │
│   • Field type registries                                   │
│   • Data validation workflows                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROTOCOL LAYER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Field Manifest                       │  │
│  │                                                       │  │
│  │   • Defines canonical field identity                 │  │
│  │   • Provides field_hash for content addressing       │  │
│  │   • Establishes semantic meaning                     │  │
│  │   • Enables offline verification                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Pack Objects                        │  │
│  │                                                       │  │
│  │   • Reference field definitions                      │  │
│  │   • Aggregate content by field type                  │  │
│  │   • Enable consent operations                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    WALLET LAYER                             │
│         (Field Manifest storage and resolution)             │
└─────────────────────────────────────────────────────────────┘
```

Field Manifests are protocol-level constructs that define field semantics. Applications consume Field Manifests to ensure consistent field interpretation; the Field Manifest itself contains no application logic.

---

## 2. Field Manifest Fields

### 2.1 Field Summary

| Field | Type | Required | Mutable | Description |
|-------|------|----------|---------|-------------|
| `version` | integer | REQUIRED | No | Protocol version identifier |
| `field_id` | string | REQUIRED | No | Canonical field name identifier |
| `data_type` | string | REQUIRED | No | Data type specification |
| `semantics` | string | REQUIRED | No | Semantic description of the field |
| `created_at` | integer | REQUIRED | No | Unix timestamp of manifest creation |
| `field_hash` | string | REQUIRED | No | SHA-256 hash of canonical payload |

### 2.2 Field Definitions

#### 2.2.1 version

| Property | Value |
|----------|-------|
| **Name** | `version` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Positive integer |
| **Constraints** | MUST be exactly `1` for specification version 0.1 |
| **Current Value** | `1` |

**Description:** Identifies the Field Manifest specification version used to construct this object. Implementations MUST reject manifests with unsupported version numbers. The integer format ensures deterministic encoding without ambiguity.

#### 2.2.2 field_id

| Property | Value |
|----------|-------|
| **Name** | `field_id` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase alphanumeric with underscores and hyphens |
| **Constraints** | MUST match pattern `^[a-z][a-z0-9_-]*$`; MUST NOT be empty after trimming whitespace |
| **Min Length** | 1 character |
| **Max Length** | 128 characters |

**Description:** The canonical identifier for the field type. This value provides a human-readable name for the field definition that MUST be unique within a given context. Field identifiers are case-sensitive; only lowercase is valid.

**Examples:**
- `full_name`
- `email-address`
- `date_of_birth`
- `medical-record-id`

#### 2.2.3 data_type

| Property | Value |
|----------|-------|
| **Name** | `data_type` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Type specification string |
| **Constraints** | MUST NOT be empty after trimming whitespace |
| **Min Length** | 1 character |
| **Max Length** | 256 characters |

**Description:** Specifies the expected data type for values associated with this field. The data type provides guidance for parsing, validation, and display of field values.

**Common Data Types:**

| Data Type | Description |
|-----------|-------------|
| `string` | UTF-8 encoded text |
| `integer` | Signed integer value |
| `number` | Floating-point numeric value |
| `boolean` | True or false value |
| `date` | ISO 8601 date (YYYY-MM-DD) |
| `datetime` | ISO 8601 datetime |
| `binary` | Base64-encoded binary data |
| `uri` | RFC 3986 URI |
| `email` | RFC 5322 email address |
| `phone` | E.164 phone number |

#### 2.2.4 semantics

| Property | Value |
|----------|-------|
| **Name** | `semantics` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Human-readable description |
| **Constraints** | MUST NOT be empty after trimming whitespace |
| **Min Length** | 1 character |
| **Max Length** | 4096 characters |
| **Encoding** | UTF-8, NFC normalized |

**Description:** A human-readable description of the field's meaning, purpose, and intended usage. The semantics field provides context for interpreting field values and ensures consistent understanding across implementations.

#### 2.2.5 created_at

| Property | Value |
|----------|-------|
| **Name** | `created_at` |
| **Type** | integer |
| **Required** | REQUIRED |
| **Format** | Unix timestamp (seconds since 1970-01-01T00:00:00Z) |
| **Constraints** | MUST be > 0; MUST NOT be in the future relative to validation time |
| **Max Value** | 2^53 - 1 |

**Description:** The timestamp when this Field Manifest was created. This field is set once at creation time and MUST NOT be modified.

#### 2.2.6 field_hash

| Property | Value |
|----------|-------|
| **Name** | `field_hash` |
| **Type** | string |
| **Required** | REQUIRED |
| **Format** | Lowercase hexadecimal string |
| **Constraints** | MUST be exactly 64 characters; MUST be lowercase; MUST be the SHA-256 hash of the canonical payload |
| **Algorithm** | SHA-256 |

**Description:** The cryptographic hash of the canonical payload (see [Section 4](#4-canonical-payload-boundary)). This field enables content addressing and integrity verification for the Field Manifest.

---

## 3. Field Semantics

### 3.1 version

The `version` field declares the specification version governing the manifest's structure and semantics.

**Semantic Rules:**

1. Implementations MUST reject manifests where the version does not equal a supported version number
2. Version `1` corresponds to specification version 0.1
3. Future specification versions MAY increment this value
4. The integer format ensures unambiguous representation in canonical JSON

**Version Mapping:**

| Manifest version | Specification Version |
|------------------|----------------------|
| 1 | 0.1 |

### 3.2 field_id

The `field_id` field provides a canonical name for the field definition.

**Semantic Rules:**

1. Field identifiers MUST be lowercase alphanumeric with underscores and hyphens
2. Field identifiers MUST start with a lowercase letter
3. Field identifiers are case-sensitive; only lowercase is valid
4. Field identifiers SHOULD be descriptive and follow consistent naming conventions
5. The same `field_id` with different content produces a different `field_hash`
6. Field identifiers MUST NOT contain leading or trailing whitespace

**Naming Conventions:**

| Convention | Example | Description |
|------------|---------|-------------|
| Snake case | `full_name` | Words separated by underscores |
| Kebab case | `full-name` | Words separated by hyphens |
| Single word | `email` | Simple single-word identifier |

### 3.3 data_type

The `data_type` field specifies the expected value type for the field.

**Semantic Rules:**

1. Data types are advisory; actual validation is application-specific
2. Unknown data types MUST NOT cause parsing failure
3. Data types SHOULD correspond to well-known type systems where possible
4. Data types MUST NOT contain leading or trailing whitespace
5. Applications MAY define custom data types for domain-specific needs

**Type Categories:**

| Category | Examples | Description |
|----------|----------|-------------|
| Primitive | `string`, `integer`, `boolean` | Basic scalar types |
| Temporal | `date`, `datetime`, `time` | Date and time types |
| Structured | `uri`, `email`, `phone` | Formatted string types |
| Binary | `binary`, `base64` | Binary data types |

### 3.4 semantics

The `semantics` field provides human-readable meaning for the field.

**Semantic Rules:**

1. Semantics MUST be non-empty after trimming whitespace
2. Semantics SHOULD be written in clear, unambiguous language
3. Semantics MAY include usage examples or constraints
4. Semantics MUST be UTF-8 encoded and NFC normalized
5. Semantics SHOULD avoid implementation-specific terminology
6. Changes to semantics produce a new Field Manifest with different hash

### 3.5 created_at

The `created_at` field records the manifest creation timestamp.

**Semantic Rules:**

1. Timestamp MUST be set at manifest creation time
2. Timestamp MUST NOT be backdated or forward-dated beyond reasonable clock skew
3. Implementations SHOULD allow ±300 seconds clock skew tolerance
4. Timestamp enables ordering and freshness verification
5. The same logical field created at different times produces different manifests

**Validation:**

```
validate_timestamp(created_at, current_time, skew_tolerance):
  IF created_at > current_time + skew_tolerance THEN
    RETURN (INVALID, "future_timestamp")
  IF created_at <= 0 THEN
    RETURN (INVALID, "invalid_timestamp")
  RETURN (VALID)
```

### 3.6 field_hash

The `field_hash` field provides content addressing and integrity.

**Semantic Rules:**

1. Hash MUST be computed over the canonical payload (see [Section 4](#4-canonical-payload-boundary))
2. Hash MUST use SHA-256 algorithm
3. Hash MUST be encoded as lowercase hexadecimal
4. Hash serves as the canonical identifier for the Field Manifest
5. Two Field Manifests with identical `field_hash` values are semantically identical
6. The `field_hash` enables deduplication and integrity verification

---

## 4. Canonical Payload Boundary

### 4.1 Definition

The **canonical payload** is the subset of Field Manifest fields included in the `field_hash` computation. Only fields within the canonical payload boundary contribute to the hash.

### 4.2 Included Fields

The canonical payload MUST include exactly the following fields:

| Field | Included | Rationale |
|-------|----------|-----------|
| `version` | Yes | Hash is version-specific |
| `field_id` | Yes | Field identity is content-defining |
| `data_type` | Yes | Type specification is content-defining |
| `semantics` | Yes | Semantic meaning is content-defining |
| `created_at` | Yes | Timestamp is content-defining |
| `field_hash` | **No** | Self-referential; excluded by definition |

### 4.3 Canonical Payload Structure

```
CanonicalPayload := {
  created_at: <created_at>,
  data_type:  <data_type>,
  field_id:   <field_id>,
  semantics:  <semantics>,
  version:    <version>
}
```

Note: Fields in the canonical payload are ordered alphabetically by key name.

### 4.4 Hash Computation

```
field_hash := lowercase_hex(SHA-256(canonical_json(CanonicalPayload)))

where:
  canonical_json() applies deterministic encoding rules (Section 5)
  SHA-256() computes the SHA-256 hash
  lowercase_hex() encodes as lowercase hexadecimal string
```

### 4.5 Payload Boundary Invariants

```
INV-PB-01: field_hash ∉ CanonicalPayload
  "field_hash MUST NOT be included in canonical payload"

INV-PB-02: ∀ field F ∈ {version, field_id, data_type, semantics, created_at}:
           F ∈ CanonicalPayload
  "All specified fields MUST be included in canonical payload"

INV-PB-03: |CanonicalPayload.fields| = 5
  "Canonical payload contains exactly five fields"
```

---

## 5. Deterministic Encoding Rules

### 5.1 Overview

Field Manifests MUST be encoded deterministically to ensure identical manifests produce identical byte representations. This specification adopts canonical JSON encoding based on RFC 8785 (JSON Canonicalization Scheme).

### 5.2 Canonical JSON Rules

#### 5.2.1 Object Key Ordering

Object keys MUST be sorted in ascending order by Unicode code point value.

For the Field Manifest canonical payload, the key order is:

1. `created_at`
2. `data_type`
3. `field_id`
4. `semantics`
5. `version`

```
CORRECT:   {"created_at":1706702400,"data_type":"string","field_id":"full_name","semantics":"...","version":1}
INCORRECT: {"version":1,"field_id":"full_name","data_type":"string","semantics":"...","created_at":1706702400}
```

#### 5.2.2 Whitespace

- No whitespace between tokens
- No trailing newline
- No leading whitespace

```
CORRECT:   {"created_at":1706702400,"data_type":"string",...}
INCORRECT: { "created_at": 1706702400, "data_type": "string", ... }
INCORRECT: {"created_at":1706702400,...}\n
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

```
CORRECT:   {"version":1}
INCORRECT: {"version":01}
INCORRECT: {"version":1.0}
INCORRECT: {"version":1e0}
```

#### 5.2.5 Literal Values

| Value | Encoding |
|-------|----------|
| true | `true` (lowercase) |
| false | `false` (lowercase) |
| null | `null` (lowercase) |

### 5.3 Encoding Algorithm

```
function canonical_encode(field_manifest):
  // Construct canonical payload (keys in sorted order)
  payload := {
    "created_at": field_manifest.created_at,
    "data_type":  field_manifest.data_type,
    "field_id":   field_manifest.field_id,
    "semantics":  field_manifest.semantics,
    "version":    field_manifest.version
  }

  RETURN utf8_encode(json_serialize_sorted(payload))
```

### 5.4 Encoding Verification

Implementations MUST verify that:

1. Re-encoding a parsed manifest produces identical bytes
2. `field_hash` matches the hash of the canonical encoding
3. No extraneous whitespace or formatting exists
4. All string values are NFC normalized

---

## 6. Field Hash

### 6.1 Definition

The `field_hash` is a cryptographic digest that uniquely identifies a Field Manifest based on its canonical payload.

### 6.2 Algorithm Specification

| Property | Value |
|----------|-------|
| Algorithm | SHA-256 |
| Input | Canonical JSON encoding of payload (UTF-8 bytes) |
| Output | 256-bit digest |
| Encoding | Lowercase hexadecimal string (64 characters) |

### 6.3 Computation Procedure

```
function compute_field_hash(field_manifest):
  // Step 1: Construct canonical payload
  payload := {
    created_at: field_manifest.created_at,
    data_type:  field_manifest.data_type,
    field_id:   field_manifest.field_id,
    semantics:  field_manifest.semantics,
    version:    field_manifest.version
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
function verify_field_hash(field_manifest):
  computed := compute_field_hash(field_manifest)
  IF computed != field_manifest.field_hash THEN
    RETURN (INVALID, "hash_mismatch", expected=field_manifest.field_hash, actual=computed)
  RETURN (VALID)
```

### 6.6 Content Addressing

The `field_hash` serves as a content address, enabling:

1. **Deduplication**: Identical field definitions produce identical hashes
2. **Integrity Verification**: Any modification changes the hash
3. **Canonical Reference**: Unambiguous identifier for the Field Manifest
4. **Cache Keys**: Safe to cache by field hash
5. **Cross-System Consistency**: Same field definition produces same hash everywhere

---

## 7. Field Identifier

### 7.1 Definition

A **Field Identifier** is the canonical AOC URI form for referencing a Field Manifest. The identifier provides a stable, unique, and verifiable reference to a specific field definition.

### 7.2 URI Specification

The canonical URI form for a Field Manifest is:

```
aoc://field/definition/v1/0/0x{field_hash}
```

### 7.3 URI Components

| Component | Description | Constraints |
|-----------|-------------|-------------|
| Scheme | `aoc` | Fixed; case-sensitive |
| Authority | (empty) | No authority component |
| Path prefix | `/field/definition/` | Fixed; case-sensitive |
| Version segment | `v1` | Protocol version indicator |
| Reserved segment | `0` | Reserved for future use; MUST be `0` |
| Hash prefix | `/0x` | Fixed; lowercase x |
| Hash segment | `{field_hash}` | MUST match field_hash field exactly (64 lowercase hex chars) |

### 7.4 URI Grammar (ABNF)

```abnf
field-uri      = "aoc://field/definition/v1/0/0x" hash-hex
hash-hex       = 64HEXDIG-LOWER
HEXDIG-LOWER   = DIGIT / %x61-66           ; 0-9 a-f
DIGIT          = %x30-39                    ; 0-9
```

### 7.5 URI Construction

```
function construct_field_uri(field_hash):
  // Validate hash format
  IF NOT matches(field_hash, "^[a-f0-9]{64}$") THEN
    RETURN (ERROR, "invalid_hash")

  RETURN "aoc://field/definition/v1/0/0x" || field_hash
```

### 7.6 URI Parsing

```
function parse_field_uri(uri):
  pattern := "^aoc://field/definition/v1/0/0x([a-f0-9]{64})$"
  match := regex_match(uri, pattern)

  IF match = null THEN
    RETURN (ERROR, "invalid_field_uri")

  RETURN {
    field_hash: match.group(1),
    uri:        uri
  }
```

### 7.7 URI Normalization

Field URIs are in canonical form by construction. No normalization is required or permitted. Any URI that does not match the exact canonical pattern MUST be rejected.

**Invalid URI Examples:**

| URI | Reason |
|-----|--------|
| `AOC://field/definition/v1/0/0xabc...` | Uppercase scheme |
| `aoc://field/definition/v1/0/0XABC...` | Uppercase hex prefix/digits |
| `aoc://field/definition/v1/0/abc...` | Missing `0x` prefix |
| `aoc://field/definition/v2/0/0xabc...` | Wrong version segment |
| `aoc://field/definition/v1/1/0xabc...` | Non-zero reserved segment |
| `aoc://field/definition/v1/0/0xabc` | Hash too short |

---

## 8. Extensibility Rules

### 8.1 Extension Principles

Field Manifest extensibility follows these principles:

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
| Version increment | Manifest `version` field MUST increase |
| URI version | URI version segment MUST change (e.g., v2) |
| Migration path | MUST be documented |
| Backward reading | Previous major version SHOULD be supported for deprecation period |

### 8.3 Reserved Field Names

The following field names are reserved for future use:

| Field | Intended Purpose |
|-------|------------------|
| `signature` | Cryptographic signature over manifest |
| `deprecated_by` | Reference to superseding Field Manifest |
| `aliases` | Alternative field identifiers |
| `constraints` | Validation constraints specification |
| `examples` | Example values for the field |
| `metadata` | Application-specific metadata container |

### 8.4 Vendor Extensions

Vendor-specific fields MUST use the `x-` prefix:

```json
{
  "version": 1,
  "field_id": "custom_field",
  "data_type": "string",
  "semantics": "A custom field definition",
  "created_at": "2024-01-31T12:00:00Z",
  "field_hash": "abc123...",
  "x-vendor-field": "custom value"
}
```

Vendor extensions:
- MUST NOT be included in canonical payload
- MUST NOT conflict with registered field names
- SHOULD be documented by the vendor

---

## 9. Example Field Manifest

### 9.1 Canonical Payload Example

The following shows the canonical payload (fields included in hash computation):

```json
{"created_at":1706702400,"data_type":"string","field_id":"full_name","semantics":"The complete legal name of a person, including all given names and family names, as it appears on official identity documents.","version":1}
```

Note: No whitespace, keys sorted alphabetically.

### 9.2 Full Field Manifest Example (Personal Name)

```json
{
  "version": 1,
  "field_id": "full_name",
  "data_type": "string",
  "semantics": "The complete legal name of a person, including all given names and family names, as it appears on official identity documents.",
  "created_at": 1706702400,
  "field_hash": "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730"
}
```

### 9.3 Field Manifest Example (Email Address)

```json
{
  "version": 1,
  "field_id": "email-address",
  "data_type": "email",
  "semantics": "A valid email address conforming to RFC 5322, used as the primary contact method for electronic communications.",
  "created_at": 1706702400,
  "field_hash": "b3a8e0e1f9c2d4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9"
}
```

### 9.4 Field Manifest Example (Date of Birth)

```json
{
  "version": 1,
  "field_id": "date_of_birth",
  "data_type": "date",
  "semantics": "The calendar date on which a person was born, expressed in ISO 8601 format (YYYY-MM-DD). This field is used for age verification and identity confirmation.",
  "created_at": 1708000200,
  "field_hash": "c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5"
}
```

### 9.5 Field Manifest Example (Medical Record ID)

```json
{
  "version": 1,
  "field_id": "medical-record-id",
  "data_type": "string",
  "semantics": "A unique identifier assigned to a patient's medical record within a healthcare system. This identifier is used to link all medical documentation and history for a specific individual.",
  "created_at": 1709304300,
  "field_hash": "d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6"
}
```

### 9.6 Field Identifier URI Example

For a Field Manifest with `field_hash` value `7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730`, the canonical Field Identifier URI is:

```
aoc://field/definition/v1/0/0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730
```

---

## 10. Security Invariants

### 10.1 Hash Invariants

```
INV-HASH-01: field_hash = lowercase_hex(SHA256(canonical_payload))
  "Field hash MUST equal SHA-256 of canonical payload"

INV-HASH-02: ∀ char c ∈ field_hash: c ∈ [0-9a-f]
  "Field hash MUST contain only lowercase hexadecimal characters"

INV-HASH-03: length(field_hash) = 64
  "Field hash MUST be exactly 64 characters"

INV-HASH-04: uppercase_chars(field_hash) = 0
  "Field hash MUST NOT contain uppercase characters"
```

### 10.2 Version Invariants

```
INV-VER-01: version = 1 (for specification version 0.1)
  "Version MUST be integer 1 for specification version 0.1"

INV-VER-02: typeof(version) = integer
  "Version MUST be an integer type, not a string"

INV-VER-03: version > 0
  "Version MUST be a positive integer"
```

### 10.3 Field Identifier Invariants

```
INV-FID-01: field_id matches ^[a-z][a-z0-9_-]*$
  "Field identifier MUST match the required pattern"

INV-FID-02: trim(field_id) = field_id
  "Field identifier MUST NOT have leading or trailing whitespace"

INV-FID-03: length(field_id) ≥ 1 ∧ length(field_id) ≤ 128
  "Field identifier length MUST be between 1 and 128 characters"

INV-FID-04: field_id[0] ∈ [a-z]
  "Field identifier MUST start with a lowercase letter"

INV-FID-05: trim(field_id) ≠ ""
  "Field identifier MUST be non-empty after trimming whitespace"
```

### 10.4 Data Type Invariants

```
INV-DT-01: trim(data_type) ≠ ""
  "Data type MUST be non-empty after trimming whitespace"

INV-DT-02: length(data_type) ≤ 256
  "Data type MUST NOT exceed 256 characters"

INV-DT-03: trim(data_type) = data_type
  "Data type MUST NOT have leading or trailing whitespace in canonical form"
```

### 10.5 Semantics Invariants

```
INV-SEM-01: trim(semantics) ≠ ""
  "Semantics MUST be non-empty after trimming whitespace"

INV-SEM-02: length(semantics) ≤ 4096
  "Semantics MUST NOT exceed 4096 characters"

INV-SEM-03: nfc_normalize(semantics) = semantics
  "Semantics MUST be NFC normalized"
```

### 10.6 Timestamp Invariants

```
INV-TS-01: created_at > 0
  "Created timestamp MUST be positive"

INV-TS-02: created_at ≤ current_time + 300
  "Created timestamp MUST NOT be in the future (with 5-minute tolerance)"

INV-TS-03: typeof(created_at) = integer
  "Created timestamp MUST be an integer type"
```

### 10.7 Structural Invariants

```
INV-STRUCT-01: typeof(field_id) = string ∧ typeof(data_type) = string ∧
               typeof(semantics) = string ∧ typeof(field_hash) = string
  "All string fields MUST be string type"

INV-STRUCT-02: typeof(version) = integer ∧ typeof(created_at) = integer
  "Version and created_at MUST be integer type"

INV-STRUCT-03: field_manifest is immutable after creation
  "Field Manifests MUST be treated as immutable"
```

### 10.8 Integrity Invariants

```
INV-INT-01: ∀ Field Manifest FM: verify_field_hash(FM) = VALID
  "Field hash MUST verify against canonical payload"

INV-INT-02: canonical_encode(parse(canonical_encode(FM))) = canonical_encode(FM)
  "Canonical encoding MUST be idempotent"

INV-INT-03: field_hash uniquely identifies the Field Manifest
  "Two Field Manifests with identical field_hash are semantically identical"
```

### 10.9 URI Invariants

```
INV-URI-01: field_uri = "aoc://field/definition/v1/0/0x" || field_hash
  "Field URI MUST be derived exactly from field_hash"

INV-URI-02: parse_field_uri(field_uri).field_hash = field_hash
  "Parsing Field URI MUST yield original field_hash"

INV-URI-03: uppercase_chars(field_uri) = 0
  "Field URI MUST be entirely lowercase"
```

### 10.10 Invariant Enforcement

All implementations MUST:

1. Validate all invariants before accepting a Field Manifest
2. Validate all invariants before persisting a Field Manifest
3. Reject Field Manifests that violate any invariant
4. Log invariant violations with sufficient context for debugging
5. Never silently accept invalid Field Manifests
6. Verify field_hash derivation from canonical payload

---

## 11. Versioning Strategy

### 11.1 Version Format

| Component | Format | Example |
|-----------|--------|---------|
| Specification Version | `MAJOR.MINOR` | `0.1` |
| Manifest Version | Integer | `1` |
| URI Version | `vMAJOR` | `v1` |

### 11.2 Version Semantics

#### 11.2.1 Major Version

Major version increment indicates breaking changes:

- Changes to canonical payload boundary
- Field type changes
- Removal of required fields
- Hash algorithm changes
- URI format changes

**Migration:** Explicit transformation required; old and new versions are incompatible.

#### 11.2.2 Minor Version

Minor version increment indicates backward-compatible additions:

- New optional fields (outside canonical payload)
- Clarifications to existing behavior
- Additional data type definitions

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
3. Include version in all serialized Field Manifests
4. Reject Field Manifests with unsupported versions

---

## Appendix A: Test Vectors

### A.1 Hash Computation

**Input (Canonical JSON):**
```
{"created_at":1706702400,"data_type":"string","field_id":"test_field","semantics":"A test field for validation purposes.","version":1}
```

**Expected SHA-256:**
```
[Computed per implementation]
```

### A.2 Canonical Encoding Verification

Given the Field Manifest fields:
- version: `1`
- field_id: `"example"`
- data_type: `"string"`
- semantics: `"Example field for testing"`
- created_at: `1704067200`

The canonical encoding MUST produce keys in this order:
`created_at`, `data_type`, `field_id`, `semantics`, `version`

### A.3 URI Construction Verification

Given `field_hash` value `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`:

**Expected URI:**
```
aoc://field/definition/v1/0/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

---

## Appendix B: JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://aoc.protocol/schemas/field-manifest/1.0",
  "title": "AOC Field Manifest",
  "type": "object",
  "required": ["version", "field_id", "data_type", "semantics", "created_at", "field_hash"],
  "properties": {
    "version": {
      "type": "integer",
      "const": 1
    },
    "field_id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_-]*$",
      "minLength": 1,
      "maxLength": 128
    },
    "data_type": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256
    },
    "semantics": {
      "type": "string",
      "minLength": 1,
      "maxLength": 4096
    },
    "created_at": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "field_hash": {
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
| 0.1 | 2026-02 | Initial Field Manifest specification |

---

*This document is normative. Implementations MUST conform to produce interoperable results.*
