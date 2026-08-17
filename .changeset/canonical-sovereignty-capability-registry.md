---
'@aoc/protocol': minor
---

Add the canonical Sovereignty Capability registry as a new
`@aoc/protocol/sovereignty-capabilities` subpath. Protocol now owns the
identities, versions and discovery of the eight Sovereignty Capabilities —
Identity, Integrity, Provenance, Portability, Interoperability, Verifiability,
Licensing & Terms and Governance Compatibility — as stable
`aoc:sovereignty-capability:<slug>` ids with explicit capability versions and a
read-only, deterministic enumeration, plus `isSovereigntyCapabilityVersion` as the
authoritative structural rule for a capability version. Additive only: no existing export changed,
and the legacy capability grant/token models are untouched.
