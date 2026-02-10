# AOC Protocol — Error & Decision Object Specification

**Version:** 0.1
**Status:** Draft
**Layer:** Normative Specification
**Parent Documents:** [SDL spec](sdl/README.md), [consent-object-spec.md](consent/consent-object-spec.md), [capability-token-spec.md](consent/capability-token-spec.md), [pack-object-spec.md](pack/pack-object-spec.md)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Conventions](#2-conventions)
3. [SDL Parse Error Object](#3-sdl-parse-error-object)
4. [Resolver Unresolved Field Object](#4-resolver-unresolved-field-object)
5. [Vault Access Decision Object](#5-vault-access-decision-object)
6. [Cross-Object Invariants](#6-cross-object-invariants)

---

## 1. Introduction

### 1.1 Purpose

This document defines the **normative shape, semantics, and constraints** for the three error/decision objects produced by the AOC Protocol pipeline:

| Object | Producer | Consumer |
|--------|----------|----------|
| **SDLParseError** | SDL parser / validator | Any module accepting raw SDL path strings |
| **UnresolvedField** (resolver) | SDL-to-Field resolver | Pack assembly, consent scoping |
| **VaultAccessResult** | Vault policy engine | Requesting application / wallet |

These definitions constitute the **source of truth** for implementors. Any implementation that emits or accepts these objects MUST conform to the shapes defined here.

### 1.2 Scope

This specification covers:

- The exact set of permitted keys for each object
- Which keys are required vs. optional
- Which keys are explicitly prohibited
- The semantic meaning and constraints of every field
- Valid and invalid JSON examples

This specification does **NOT** cover:

- Wire-format encoding (CBOR, Protobuf, etc.)
- Transport-layer concerns (HTTP status codes, headers)
- Internal implementation data structures not exposed at protocol boundaries

---

## 2. Conventions

### 2.1 Terminology

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### 2.2 Type Notation

| Notation | Meaning |
|----------|---------|
| `string` | UTF-8 encoded string |
| `string<enum>` | String constrained to an enumerated set |
| `string[]` | Array of strings |
| `integer` | Non-negative whole number (JSON number with no fractional part) |
| `object` | JSON object |
| `object?` | Optional field; key MAY be absent from the object |

### 2.3 Determinism Guarantee

All objects defined in this specification MUST be **deterministic**: given identical inputs, any conforming implementation MUST produce a byte-identical JSON representation when serialised using the canonical encoding rules defined in the AOC Protocol (RFC 8785 — JSON Canonicalization Scheme).

---

## 3. SDL Parse Error Object

### 3.1 Overview

An **SDLParseError** is emitted when a raw input string fails SDL path parsing or validation. It appears in two protocol contexts:

1. As the `error` field in a failed `SDLParseResult` (`{ ok: false, error: SDLParseError }`).
2. As elements of the `errors` array in a failed `SDLValidationResult` (`{ valid: false, errors: SDLParseError[] }`).

### 3.2 Shape Definition

```
SDLParseError := {
  input:   string,              -- REQUIRED
  code:    string<SDLErrorCode>, -- REQUIRED
  message: string               -- REQUIRED
}
```

### 3.3 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `input` | `string` | MUST be present. MUST be a string (including the empty string `""`). | The raw input value that triggered the error. If the original input was not a string (e.g. `null`, `undefined`, a number), the value MUST be coerced to the empty string `""`. Whitespace trimming MUST NOT be applied to this field; it records the original input as received (except in the non-string case above). |
| `code` | `string<SDLErrorCode>` | MUST be present. MUST be one of the enumerated values in §3.4. | A machine-readable, deterministic error code. Consumers MUST use this field — not `message` — for programmatic branching. |
| `message` | `string` | MUST be present. MUST be a non-empty string. | A human-readable explanation of the error. The exact wording is implementation-defined but MUST be non-empty and SHOULD be a complete English sentence. Consumers MUST NOT parse this field for programmatic logic. |

### 3.4 SDLErrorCode Enumeration

An SDLErrorCode MUST be exactly one of the following string literals:

| Code | Trigger Condition |
|------|-------------------|
| `"EMPTY_INPUT"` | The input string is empty or contains only whitespace, or the input is not a string type. |
| `"INVALID_TYPE"` | The input is not of type `string` (alternative to `EMPTY_INPUT` when an implementation distinguishes type errors from emptiness). |
| `"LEADING_DOT"` | The trimmed input begins with a `.` character. |
| `"TRAILING_DOT"` | The trimmed input ends with a `.` character. |
| `"EMPTY_SEGMENT"` | The path contains an empty segment (consecutive dots `..` after leading/trailing dot checks). |
| `"TOO_FEW_SEGMENTS"` | The path contains fewer than 2 dot-separated segments (minimum: domain + attribute). |
| `"INVALID_SEGMENT"` | One or more segments do not match the pattern `[a-z][a-z0-9-]*`. |

Implementations MUST NOT emit any error code not listed above. Future codes MAY be added in a minor version bump; consumers SHOULD treat unknown codes as opaque errors.

### 3.5 Prohibited Keys

An SDLParseError object MUST NOT contain any key other than `input`, `code`, and `message`. Specifically, the following are **prohibited**:

- `details`, `context`, `metadata`, `stack`, `trace`
- `path` (this key belongs to the Vault error domain; see §5)
- Any implementation-internal debugging field

An implementation that adds extra keys is **non-conforming**.

### 3.6 Parse Result Envelope

The SDLParseError appears inside one of two tagged-union envelopes:

**SDLParseResult** (single-path parsing):

```
SDLParseResult :=
  | { ok: true,  path: SDLPath }
  | { ok: false, error: SDLParseError }
```

- The `ok` field MUST be a boolean.
- When `ok` is `true`, the `error` key MUST NOT be present and `path` MUST be present.
- When `ok` is `false`, the `path` key MUST NOT be present and `error` MUST be present.

**SDLValidationResult** (multi-error validation):

```
SDLValidationResult :=
  | { valid: true,  normalized: SDLPath }
  | { valid: false, errors: SDLParseError[] }
```

- The `valid` field MUST be a boolean.
- When `valid` is `true`, the `errors` key MUST NOT be present and `normalized` MUST be present.
- When `valid` is `false`, the `normalized` key MUST NOT be present, `errors` MUST be present, and `errors` MUST be a non-empty array.

### 3.7 Valid Example

```json
{
  "input": "person..name",
  "code": "EMPTY_SEGMENT",
  "message": "SDL path contains an empty segment at position 1."
}
```

### 3.8 Invalid Examples

**Extra key (`details`) — prohibited:**

```json
{
  "input": "person..name",
  "code": "EMPTY_SEGMENT",
  "message": "SDL path contains an empty segment at position 1.",
  "details": { "position": 1 }
}
```

> Violation: `details` is not a permitted key (§3.5).

**Missing required key (`input`):**

```json
{
  "code": "EMPTY_SEGMENT",
  "message": "SDL path contains an empty segment at position 1."
}
```

> Violation: `input` is REQUIRED (§3.3).

**Invalid error code:**

```json
{
  "input": "person..name",
  "code": "DOUBLE_DOT",
  "message": "Path contains double dots."
}
```

> Violation: `"DOUBLE_DOT"` is not a member of `SDLErrorCode` (§3.4).

---

## 4. Resolver Unresolved Field Object

### 4.1 Overview

An **UnresolvedField** (resolver context) is emitted by the SDL-to-Field Manifest resolver when a parsed SDL path cannot be mapped to a `FieldManifestV1` entry. It appears within the `unresolved_fields` array of an `SDLResolutionResult`.

This object is distinct from the Vault-layer `UnresolvedField` defined in §5. The two share a name but have different shapes and operate at different protocol layers.

### 4.2 Shape Definition

```
UnresolvedField (resolver) := {
  path:    SDLPath,                    -- REQUIRED
  code:    "FIELD_NOT_FOUND",          -- REQUIRED (literal)
  message: string                      -- REQUIRED
}
```

### 4.3 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `path` | `SDLPath` | MUST be present. MUST be a fully parsed, valid `SDLPath` object (as defined in the SDL spec). | The SDL path that could not be resolved. This is the structured AST representation, not a raw string. The `path.raw` field contains the original string. |
| `code` | `string` | MUST be present. MUST be exactly `"FIELD_NOT_FOUND"`. | Machine-readable error code. In the resolver layer, the only valid code is the literal string `"FIELD_NOT_FOUND"`. No other code is permitted. |
| `message` | `string` | MUST be present. MUST be a non-empty string. | Human-readable error message. The exact wording is implementation-defined. SHOULD include the raw SDL path string for debuggability. Consumers MUST NOT parse this field for programmatic logic. |

### 4.4 Prohibited Keys

An UnresolvedField (resolver) MUST NOT contain any key other than `path`, `code`, and `message`. Specifically, the following are **prohibited**:

- `error` (this key belongs to the Vault-layer UnresolvedField; see §5)
- `sdl_path` (this key belongs to the Vault-layer UnresolvedField; see §5)
- `details`, `context`, `metadata`, `stack`, `trace`
- `field_id` (if the field were found, it would be in `ResolvedField`, not here)

### 4.5 The SDLResolutionResult Envelope

```
SDLResolutionResult := {
  resolved_fields:   ResolvedField[],   -- REQUIRED (may be empty)
  unresolved_fields: UnresolvedField[]  -- REQUIRED (may be empty)
}
```

- Both arrays MUST be present, even when empty.
- Both arrays MUST be sorted **alphabetically by SDL path raw string** (Unicode code-point order via `localeCompare`). This guarantees deterministic output regardless of input ordering.
- If all paths resolve, `unresolved_fields` MUST be an empty array `[]`.
- If no paths resolve, `resolved_fields` MUST be an empty array `[]`.

### 4.6 SDLPath Shape Reference

For completeness, the `path` field in an UnresolvedField carries the following structure:

```
SDLPath := {
  raw:       string,              -- the original dot-separated string
  segments:  SDLScopeSegment[],   -- ordered array of parsed segments
  domain:    string,              -- first segment value
  attribute: string               -- last segment value
}

SDLScopeSegment := {
  value: string,   -- the text of this segment
  index: integer   -- zero-based position within the path
}
```

### 4.7 Valid Example

```json
{
  "path": {
    "raw": "person.email.primary",
    "segments": [
      { "value": "person", "index": 0 },
      { "value": "email", "index": 1 },
      { "value": "primary", "index": 2 }
    ],
    "domain": "person",
    "attribute": "primary"
  },
  "code": "FIELD_NOT_FOUND",
  "message": "No field manifest found for SDL path \"person.email.primary\"."
}
```

### 4.8 Invalid Examples

**Wrong code value:**

```json
{
  "path": { "raw": "person.email.primary", "segments": [{"value":"person","index":0},{"value":"email","index":1},{"value":"primary","index":2}], "domain": "person", "attribute": "primary" },
  "code": "NOT_FOUND",
  "message": "No field manifest found."
}
```

> Violation: `code` MUST be exactly `"FIELD_NOT_FOUND"`, not `"NOT_FOUND"` (§4.3).

**Extra key (`error`) from Vault layer:**

```json
{
  "path": { "raw": "person.email.primary", "segments": [{"value":"person","index":0},{"value":"email","index":1},{"value":"primary","index":2}], "domain": "person", "attribute": "primary" },
  "code": "FIELD_NOT_FOUND",
  "message": "No field manifest found.",
  "error": { "code": "UNRESOLVED_FIELD", "message": "..." }
}
```

> Violation: `error` is a prohibited key at the resolver layer (§4.4).

**Path as raw string instead of SDLPath object:**

```json
{
  "path": "person.email.primary",
  "code": "FIELD_NOT_FOUND",
  "message": "No field manifest found."
}
```

> Violation: `path` MUST be a structured `SDLPath` object, not a plain string (§4.3).

---

## 5. Vault Access Decision Object

### 5.1 Overview

The Vault produces a **VaultAccessResult** in response to a **VaultAccessRequest**. This result encapsulates a binary policy decision (`ALLOW` / `DENY`) together with field resolution outcomes. The Vault operates at a higher protocol layer than the SDL parser or resolver: it incorporates capability verification, consent lookup, scope containment, and replay detection.

This section defines four interrelated objects:

| Object | Role |
|--------|------|
| `VaultAccessResult` | Top-level response envelope |
| `VaultPolicyDecision` | Binary decision with machine-readable reason codes |
| `VaultError` | Structured error attached to unresolved fields |
| `UnresolvedField` (vault) | An SDL path that could not be fully resolved in the vault context |

### 5.2 VaultAccessResult Shape

```
VaultAccessResult := {
  policy:            VaultPolicyDecision,       -- REQUIRED
  resolved_fields:   ResolvedField[],           -- REQUIRED (may be empty)
  unresolved_fields: UnresolvedField (vault)[]  -- REQUIRED (may be empty)
}
```

#### 5.2.1 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `policy` | `VaultPolicyDecision` | MUST be present. | The binary authorization decision and its reason codes. See §5.3. |
| `resolved_fields` | `ResolvedField[]` | MUST be present. MAY be empty. | The set of SDL paths that successfully resolved to field + content references within the requested pack. Entries MUST be sorted alphabetically by `sdl_path`. |
| `unresolved_fields` | `UnresolvedField (vault)[]` | MUST be present. MAY be empty. | The set of SDL paths that could not be resolved, each carrying a structured `VaultError`. Entries MUST be sorted alphabetically by `sdl_path`. |

#### 5.2.2 Prohibited Keys

A VaultAccessResult MUST NOT contain any key other than `policy`, `resolved_fields`, and `unresolved_fields`. Specifically prohibited:

- `status`, `success`, `ok`, `error` (top-level)
- `metadata`, `timestamp`, `request_id`

#### 5.2.3 Behavioural Invariants

| Condition | `policy.decision` | `resolved_fields` | `unresolved_fields` |
|-----------|--------------------|--------------------|----------------------|
| Capability invalid (expired, revoked, replay, malformed) | `"DENY"` | MUST be `[]` | MUST be `[]` |
| Consent not found for capability | `"DENY"` | MUST be `[]` | MUST be `[]` |
| Pack not found | `"DENY"` | MUST be `[]` | MUST be `[]` |
| Scope escalation detected | `"DENY"` | MUST be `[]` | MUST be `[]` |
| All paths valid and in scope | `"ALLOW"` | Non-empty | MAY be empty |
| Mix of resolvable and unresolvable paths, no scope escalation | `"ALLOW"` | MAY be non-empty | MAY be non-empty |
| All paths invalid or unresolvable, no scope escalation | `"ALLOW"` | MUST be `[]` | Non-empty |
| Empty `sdl_paths` in request | `"ALLOW"` | MUST be `[]` | MUST be `[]` |

Critical invariant: **unresolved fields alone do NOT cause a DENY**. Only capability-level failures and scope escalation produce a `"DENY"` decision.

When the decision is `"DENY"`, both `resolved_fields` and `unresolved_fields` MUST be empty arrays. The Vault MUST NOT leak partial resolution data on a denied request.

### 5.3 VaultPolicyDecision Shape

```
VaultPolicyDecision := {
  decision:     string<"ALLOW" | "DENY">,  -- REQUIRED
  reason_codes: VaultErrorCode[]           -- REQUIRED (may be empty)
}
```

#### 5.3.1 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `decision` | `string` | MUST be present. MUST be exactly `"ALLOW"` or `"DENY"`. | The binary authorization decision. |
| `reason_codes` | `VaultErrorCode[]` | MUST be present. MUST be an array. | When `decision` is `"ALLOW"`, this array MUST be empty (`[]`). When `decision` is `"DENY"`, this array MUST contain at least one `VaultErrorCode` identifying the denial reason(s). |

#### 5.3.2 Prohibited Keys

A VaultPolicyDecision MUST NOT contain any key other than `decision` and `reason_codes`. Specifically prohibited:

- `reason`, `message`, `description` (human-readable text belongs in `VaultError`, not here)
- `errors`, `details`, `metadata`

#### 5.3.3 VaultErrorCode Enumeration

A VaultErrorCode MUST be exactly one of the following string literals:

| Code | Trigger Condition | Severity |
|------|-------------------|----------|
| `"EXPIRED"` | The capability token's `expires_at` timestamp is in the past relative to the evaluation clock. | DENY — terminal |
| `"REPLAY"` | The capability token's nonce/jti has been seen in a previous access request (replay attack). | DENY — terminal |
| `"REVOKED"` | The capability token has been explicitly revoked via the revocation registry. | DENY — terminal |
| `"SCOPE_ESCALATION"` | A resolved field's content is not covered by the capability token's scope entries (neither by pack-level nor content-level coverage). | DENY — terminal |
| `"INVALID_CAPABILITY"` | The capability token is structurally invalid, its parent consent is not found, or it fails derivation verification. | DENY — terminal |
| `"INVALID_SDL_PATH"` | An SDL path string in the request does not conform to SDL syntax rules. | Field-level — unresolved entry |
| `"UNRESOLVED_FIELD"` | An SDL path is syntactically valid but cannot be mapped to a field_id (no SDL mapping registered), or the mapped field_id is not present in the referenced pack. | Field-level — unresolved entry |
| `"PACK_NOT_FOUND"` | The `pack_ref` in the access request does not match any stored pack. | DENY — terminal |
| `"CONSENT_NOT_FOUND"` | The consent referenced by the capability token is not found in the vault store. | DENY — terminal (surfaced as thrown error during minting; surfaced as `INVALID_CAPABILITY` during access) |

Implementations MUST NOT emit any error code not listed above.

Codes with severity **"DENY — terminal"** appear in `VaultPolicyDecision.reason_codes` and cause immediate denial. Codes with severity **"Field-level"** appear inside `VaultError` objects attached to individual unresolved fields and do NOT cause denial by themselves.

### 5.4 VaultError Shape

```
VaultError := {
  code:    string<VaultErrorCode>,  -- REQUIRED
  message: string,                  -- REQUIRED
  path:    string?                  -- OPTIONAL
}
```

#### 5.4.1 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `code` | `string<VaultErrorCode>` | MUST be present. MUST be one of the values in §5.3.3. | Machine-readable error code identifying the failure reason. In the context of vault unresolved fields, MUST be either `"INVALID_SDL_PATH"` or `"UNRESOLVED_FIELD"`. |
| `message` | `string` | MUST be present. MUST be a non-empty string. | Human-readable error description. Implementation-defined wording. Consumers MUST NOT parse this field for programmatic logic. |

#### 5.4.2 Optional Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `path` | `string` | MAY be present. When present, MUST be a string. | The SDL path string that triggered this error. When present, it MUST match the `sdl_path` value of the parent `UnresolvedField` object. Implementations SHOULD include this field for debuggability. |

#### 5.4.3 Prohibited Keys

A VaultError MUST NOT contain any key other than `code`, `message`, and `path`. Specifically prohibited:

- `details`, `context`, `metadata`, `stack`, `trace`
- `input` (this key belongs to `SDLParseError`; see §3)
- `field_id`, `content_id`, `pack_ref` (resolved data MUST NOT appear in error objects)

### 5.5 UnresolvedField (Vault) Shape

```
UnresolvedField (vault) := {
  sdl_path: string,      -- REQUIRED
  error:    VaultError   -- REQUIRED
}
```

> **Note:** This is a different object from the resolver-layer `UnresolvedField` in §4. The key differences are: (1) the path is a raw `string`, not a structured `SDLPath` object, and (2) the error is a nested `VaultError` object rather than inline `code` + `message` fields.

#### 5.5.1 Required Keys

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `sdl_path` | `string` | MUST be present. MUST be a string. | The raw SDL path string from the original `VaultAccessRequest.sdl_paths` array. This is the unprocessed input, not a normalized or parsed form. |
| `error` | `VaultError` | MUST be present. MUST conform to the VaultError shape (§5.4). | The structured error describing why this path could not be resolved. The `error.code` MUST be either `"INVALID_SDL_PATH"` or `"UNRESOLVED_FIELD"`. |

#### 5.5.2 Prohibited Keys

A Vault UnresolvedField MUST NOT contain any key other than `sdl_path` and `error`. Specifically prohibited:

- `code`, `message` (these belong inline in the resolver-layer UnresolvedField; at the vault layer they are nested inside `error`)
- `path` (the structured `SDLPath` belongs to the resolver-layer object)
- `details`, `context`, `metadata`
- `field_id`, `content_id` (resolved data MUST NOT appear here)

### 5.6 ResolvedField (Vault) Shape

For completeness, the vault-layer `ResolvedField` is defined as:

```
ResolvedField (vault) := {
  sdl_path:   string,   -- REQUIRED
  field_id:   string,   -- REQUIRED
  content_id: string    -- REQUIRED
}
```

| Key | Type | Constraint | Semantics |
|-----|------|------------|-----------|
| `sdl_path` | `string` | MUST be present. | The raw SDL path string that was resolved. |
| `field_id` | `string` | MUST be present. MUST match `^[a-z][a-z0-9_-]*$`. | The field manifest identifier the SDL path maps to. |
| `content_id` | `string` | MUST be present. MUST be a 64-character lowercase hexadecimal string. | The content object hash associated with this field in the referenced pack. |

A vault ResolvedField MUST NOT contain any key other than `sdl_path`, `field_id`, and `content_id`.

### 5.7 VaultAccessRequest Shape (Reference)

For context, the request that triggers a `VaultAccessResult`:

```
VaultAccessRequest := {
  capability_token: CapabilityTokenV1,  -- REQUIRED
  sdl_paths:        string[],           -- REQUIRED (may be empty)
  pack_ref:         string              -- REQUIRED
}
```

A VaultAccessRequest MUST NOT contain any key other than `capability_token`, `sdl_paths`, and `pack_ref`.

### 5.8 Valid Example — ALLOW with Mixed Resolution

```json
{
  "policy": {
    "decision": "ALLOW",
    "reason_codes": []
  },
  "resolved_fields": [
    {
      "sdl_path": "person.birth.date",
      "field_id": "birth-date",
      "content_id": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    },
    {
      "sdl_path": "person.name.legal.full",
      "field_id": "full-name",
      "content_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    }
  ],
  "unresolved_fields": [
    {
      "sdl_path": "person.email.primary",
      "error": {
        "code": "UNRESOLVED_FIELD",
        "message": "No SDL mapping registered for path: \"person.email.primary\"",
        "path": "person.email.primary"
      }
    }
  ]
}
```

### 5.9 Valid Example — DENY (Expired Token)

```json
{
  "policy": {
    "decision": "DENY",
    "reason_codes": ["EXPIRED"]
  },
  "resolved_fields": [],
  "unresolved_fields": []
}
```

### 5.10 Valid Example — DENY (Scope Escalation)

```json
{
  "policy": {
    "decision": "DENY",
    "reason_codes": ["SCOPE_ESCALATION"]
  },
  "resolved_fields": [],
  "unresolved_fields": []
}
```

### 5.11 Invalid Examples

**Reason codes non-empty on ALLOW:**

```json
{
  "policy": {
    "decision": "ALLOW",
    "reason_codes": ["EXPIRED"]
  },
  "resolved_fields": [],
  "unresolved_fields": []
}
```

> Violation: When `decision` is `"ALLOW"`, `reason_codes` MUST be empty (§5.3.1).

**Resolved fields present on DENY:**

```json
{
  "policy": {
    "decision": "DENY",
    "reason_codes": ["SCOPE_ESCALATION"]
  },
  "resolved_fields": [
    {
      "sdl_path": "person.name.legal.full",
      "field_id": "full-name",
      "content_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    }
  ],
  "unresolved_fields": []
}
```

> Violation: When `decision` is `"DENY"`, both `resolved_fields` and `unresolved_fields` MUST be empty arrays (§5.2.3).

**VaultError with prohibited `details` key:**

```json
{
  "sdl_path": "BAD_PATH",
  "error": {
    "code": "INVALID_SDL_PATH",
    "message": "Invalid SDL path: \"BAD_PATH\".",
    "path": "BAD_PATH",
    "details": { "pattern": "expected [a-z]..." }
  }
}
```

> Violation: `details` is a prohibited key on VaultError (§5.4.3).

**Vault UnresolvedField using inline code/message instead of nested error:**

```json
{
  "sdl_path": "person.email.primary",
  "code": "UNRESOLVED_FIELD",
  "message": "Not found."
}
```

> Violation: Vault-layer UnresolvedField MUST use the nested `error` object, not inline `code`/`message` (§5.5.1). Inline `code`/`message` belongs to the resolver-layer object (§4).

**Empty reason_codes on DENY:**

```json
{
  "policy": {
    "decision": "DENY",
    "reason_codes": []
  },
  "resolved_fields": [],
  "unresolved_fields": []
}
```

> Violation: When `decision` is `"DENY"`, `reason_codes` MUST contain at least one code (§5.3.1).

---

## 6. Cross-Object Invariants

### 6.1 Layer Separation

The three object families operate at distinct protocol layers. Implementations MUST NOT mix shapes across layers:

| Layer | Error Object | Path Representation | Error Structure |
|-------|-------------|---------------------|-----------------|
| **SDL (parsing)** | `SDLParseError` | `string` (raw input via `input` key) | Flat: `code` + `message` inline |
| **Resolver (resolution)** | `UnresolvedField` (resolver) | `SDLPath` (structured AST via `path` key) | Flat: `code` + `message` inline |
| **Vault (access control)** | `UnresolvedField` (vault) | `string` (raw path via `sdl_path` key) | Nested: `error: VaultError` object |

### 6.2 Deterministic Ordering

All array outputs at every layer MUST be sorted alphabetically by the SDL path raw string:

- `SDLResolutionResult.resolved_fields` — sorted by `ref.path.raw`
- `SDLResolutionResult.unresolved_fields` — sorted by `path.raw`
- `VaultAccessResult.resolved_fields` — sorted by `sdl_path`
- `VaultAccessResult.unresolved_fields` — sorted by `sdl_path`

This guarantees that identical inputs produce byte-identical outputs regardless of the order in which the implementation processes paths internally.

### 6.3 No Leaking Across Denial Boundaries

When the Vault issues a `DENY` decision:

- `resolved_fields` MUST be `[]`
- `unresolved_fields` MUST be `[]`

This prevents information leakage about which paths exist or resolve within a pack that the requester is not authorized to access.

### 6.4 Error Code Disjointness

The `SDLErrorCode` and `VaultErrorCode` enumerations are **disjoint namespaces**. No code appears in both enumerations. Implementations MUST NOT use an `SDLErrorCode` where a `VaultErrorCode` is expected, or vice versa.

| Namespace | Codes |
|-----------|-------|
| `SDLErrorCode` | `EMPTY_INPUT`, `INVALID_TYPE`, `LEADING_DOT`, `TRAILING_DOT`, `EMPTY_SEGMENT`, `TOO_FEW_SEGMENTS`, `INVALID_SEGMENT` |
| `VaultErrorCode` | `EXPIRED`, `REPLAY`, `REVOKED`, `SCOPE_ESCALATION`, `INVALID_CAPABILITY`, `INVALID_SDL_PATH`, `UNRESOLVED_FIELD`, `PACK_NOT_FOUND`, `CONSENT_NOT_FOUND` |
| Resolver code (literal) | `FIELD_NOT_FOUND` |

### 6.5 Duplicate Path Handling

When duplicate SDL paths appear in a request:

- The **resolver** MUST process each occurrence independently and include each in the output arrays. Deduplication is NOT performed.
- The **vault** MUST process each occurrence independently and include each in the output arrays. Deduplication is NOT performed.
- Deterministic ordering MUST still hold; duplicates appear adjacent in sorted output.

---

*End of specification.*
