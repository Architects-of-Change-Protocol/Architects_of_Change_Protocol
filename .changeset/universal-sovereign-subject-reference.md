---
'@aoc/protocol': minor
---

Decouple sovereign identity from content integrity and add the universal
sovereign subject reference. `@aoc/protocol/identity` now exports
`SovereignSubjectRef` (`sovereignAssetId` plus an optional
`externalReference`) and `SovereignExternalReference`
(`namespace` + opaque `id` + optional passive `locator`), with minimal
open-world validation, `buildSovereignExternalReference`,
`isValidSovereignSubjectRef`, `sovereignExternalReferencesEqual` and
`toSovereignSubjectRef`. `SovereignManifestV1` now extends
`SovereignSubjectRef`, so `externalReference` is signed manifest material,
and `contentIdentity` became optional: a sovereign subject with no
byte-addressable representation — an AI agent, an API resource, an external
token, a physical-asset reference, an object in a namespace Protocol has
never heard of — is a first-class subject that no longer has to fabricate a
digest to be registered. Integrity is unchanged when declared (same sha256
semantics, wrong bytes still fail); a manifest that declares none reports
`contentDigest: 'not_performed'` rather than a fabricated result, even when
the caller supplies bytes. Additive under `aoc-sovereign-manifest/1`: every
existing content-backed manifest builds, signs, verifies and resolves
exactly as before, no existing export changed, and Protocol still performs
no network activity — locators are signed metadata, never dereferenced.
