# Protocol Consent Core (Extraction Baseline)

## Purpose

This module is the **protocol-level reusable Consent Engine baseline** for AOC.
It centralizes fail-closed consent parsing, normalization, validation, state evaluation,
and scope checks so market makers (including HRKey) consume one canonical core.

## What was extracted into protocol core

The following reusable concerns are now defined in `protocol/consent/*.ts`:

- `parseConsent(...)`: strict parsing gate for critical consent identity fields.
- `normalizeConsent(...)`: deterministic normalization (trimming, lowercasing refs/hashes, ordered scope/permissions).
- `validateConsent(...)`: structural/semantic verification using canonical consent invariants.
- `evaluateConsentState(...)`: state classification (`active`, `expired`, `revoked`, `inactive`, `invalid`).
- `isConsentActive(...)` and `isConsentRevoked(...)`: narrow state predicates.
- `doesConsentAllowScope(...)`: fail-closed scope containment check for active consents.

## What remains HR-specific (not extracted)

The following stays in `integration/hrkey/*` because it is market-maker domain logic:

- Candidate/employer nomenclature and HR entity assumptions.
- HR-specific SDL mapping flows (`work.reference.score`, etc.).
- Product orchestration (`registerPack`, `grantConsent`, `mintCapability`, `requestAccess`).
- Route/UI/business workflow concerns.

## Fail-closed guarantees in this layer

- Missing critical consent fields fail in `parseConsent`.
- Invalid consent schema/hash/timestamps fail in `validateConsent` / `evaluateConsentState`.
- Non-active states (`expired`, `revoked`, `inactive`, `invalid`) deny scope by default.
- Empty or ambiguous scope requests are denied.

## Hardening updates (critical)

- `protocol/consent` is now **self-contained** for consent validation logic (no validator dependency on legacy `../../consent`).
- `parseConsent(...)` now hard-fails on incomplete objects:
  - missing/empty `subject` or `grantee`
  - invalid `action`
  - missing/empty `scope`
  - malformed scope entries
  - missing/empty `permissions`
  - non-parseable `issued_at`
  - missing/empty `consent_hash`
- `normalizeConsent(...)` does not silently repair invalid payloads (no fallback defaults for required arrays).
- `doesConsentAllowScope(...)` enforces:
  - requested scope subset
  - requested permissions subset
  - optional binding checks (`subject`, `grantee`, `marketMakerId`) when provided
- `evaluateConsentState(...)` explicitly rejects non-`grant` actions for active-state evaluation and fails closed as `invalid`.

## Transitional adoption status

HRKey adapter now runs protocol consent parse/normalize/validate before persistence.
This is an intermediate integration bridge so HRKey can migrate to full AOC protocol-core consumption without breaking current flow.

## Not included in this extraction

- Capability token lifecycle end-to-end orchestration.
- Final enforcement interfaces.
- Full HRKey refactor removing all duplication.
- Final audit model.
