# Reason Code Naming Guide

Naming pattern: `CATEGORY_ACTION_QUALIFIER` in uppercase snake case.

Examples:
- `POLICY_DENY_OVERRIDES`
- `TRUST_INVALID`
- `CAPABILITY_EXPIRED`
- `TRANSPORT_VERSION_UNSUPPORTED`
- `SDK_RUNTIME_COMPATIBILITY_WARNING`
- `STARTUP_UNSAFE_CONFIGURATION`
- `TELEMETRY_REDACTION_APPLIED`

Rules:
- deterministic, stable identifier
- category inferable from prefix
- governance-safe wording
- no implementation leaks (stack names, DB tables, vendor IDs)
