# Governance Language Guidance

This repository now uses canonical reason-code semantics for decision normalization, policy traces, route decision envelopes, and trust/access mapping.

Alignment posture:
- policy: normalized deny precedence code (`POLICY_DENY_OVERRIDES`).
- telemetry/audit: deterministic classification fields on registry entries.
- sdk/public boundaries: `isSdkSafeReasonCode` and `sdkExposurePolicy` for curation.
- internal boundaries: `internal-only` lifecycle and `visibility: internal`.

This is intentionally lightweight: in-memory static registry, deterministic lookup, no plugin loading, no external governance dependency.
