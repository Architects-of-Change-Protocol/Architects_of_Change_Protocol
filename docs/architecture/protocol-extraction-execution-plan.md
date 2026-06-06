# Protocol Extraction Execution Plan

## Objective

Produce the complete execution roadmap for extracting protocol, assurance, governance, and operational runtime concerns while preserving existing behavior. This document is planning-only: no source code, runtime modules, packages, migrations, or import paths are moved by this plan.

## Source inputs and assumptions

- Intended source inputs: `docs/architecture/protocol-enterprise-boundary-v1.md` and `docs/architecture/extraction-ownership-matrix.md`.
- Repository cross-check: those two intended source files are not present in this checkout. This plan therefore normalizes the requested boundary and ownership intent against the currently available extraction artifacts, especially `docs/architecture/aoc-multi-repo-extraction-plan.md`, `docs/architecture/aoc-layering.md`, `FUTURE_PACKAGE_EXTRACTION_MAP.md`, `PACKAGE_SURFACE_MAP.md`, and the current package/runtime tree.
- P0 means extraction work that is required before protocol and enterprise boundaries can be treated as enforceable, publishable, or safe for downstream consumption.
- Target locations are logical target paths. A later implementation PR may adjust exact filenames after package maintainers approve API names.
- Copy-first is the default. Delete/move actions are deferred until shims, import rewrites, and consumer validation have passed for a stability window.

## Boundary principles

1. `@aoc/protocol` owns semantic contracts, canonical claim/credential/proof/registry vocabulary, public error contracts, SDK-safe type surfaces, and adapter interfaces.
2. Enterprise/runtime packages own execution behavior, persistence, policy evaluation, governance sessions, attestation construction, verification workflows, distributed trust coordination, and API/client implementations.
3. Protocol must not import runtime, enterprise, PM/product, persistence, transport, environment, telemetry, or SDK implementation modules.
4. Runtime and enterprise packages may import protocol contracts but must not mutate protocol-owned schema shapes in place.
5. Temporary compatibility shims must remain explicit, documented, and removable only after consumer imports are rewritten and release validation is green.
6. Boundary enforcement lands after extraction seams are established, not before, to avoid blocking copy-first stabilization.

## P0 candidate extraction matrix

### Phase A — Assurance extraction

| P0 candidate | Current location | Target location | Dependencies | Required contracts to preserve | Migration strategy | Import changes | Risk level | Rollback strategy |
|---|---|---|---|---|---|---|---|---|
| Capability claim contract surface | `src/contracts/capability-claims.ts`; legacy source mapped from `src/aoc/protocol/contracts/capability-claims.ts` | `packages/protocol/src/contracts/capability-claims.ts` and, where canonicalized, `packages/protocol/src/claims/capability.ts` | Claim issuer/subject/authority/constraint/lineage/proof primitives; adapters for verification key lookup, revocation lookup, and event emission | `CAPABILITY_CLAIM_VERSION`, `CapabilityClaim`, issuer/subject/authority/constraints/lineage/proof field names, schema-version semantics | Copy into protocol first; remove runtime imports by replacing them with adapter interfaces; leave legacy path as re-export shim | Internal consumers import `@aoc/protocol/contracts`; runtime consumers pass adapters instead of importing protocol helpers with runtime side effects | High | Revert only import rewires to shim path; keep copied protocol file isolated; restore runtime-local helper invocation through compatibility facade |
| Attestation contracts and runtime split | `runtime/attestations/*`; related canonical proof/attestation contracts in `packages/protocol/src/claims/*` | Contracts: `packages/protocol/src/claims/attestation.ts`, `packages/protocol/src/claims/proofs/*`; runtime: `packages/attestation-runtime/src/index.ts` or `packages/audit-runtime` if scope stays narrow | Proof envelope, claim references, audit proof, integrity proof, signature proof, runtime key material, chain evaluation | Attestation envelope shape, attester identity reference, issued-at semantics, proof reference semantics, chain proof compatibility | Extract declarative types first; keep runtime construction/evaluation in runtime package; add golden fixtures before changing imports | `runtime/attestations/*` imports protocol claim/proof types; public callers import protocol types or runtime builder APIs, never runtime internals | High | Keep `runtime/attestations/index.ts` as facade; revert package import rewires; validate golden fixtures against previous output |
| Audit event contract and audit runtime | `runtime/audit/*`, `packages/audit-runtime/src/index.ts`, `packages/audit-sdk/src/contracts.ts`, `src/audit/types.ts` | Contracts: `packages/protocol/src/contracts/audit.ts` or `packages/audit-sdk/src/contracts.ts`; runtime: `packages/audit-runtime/src/index.ts` | Runtime event sinks, trace context, actor/principal references, transport metadata | `AuditEventEnvelope`, event id/type/emitted-at/actor/payload semantics, traceability fields, append-only audit expectations | Promote shared event envelope to contract package; make runtime audit service depend on contract; avoid persistence schema changes in this phase | Replace duplicate local audit type imports with protocol/audit-contract imports; keep SDK barrel stable | Medium | Revert to local audit types through adapter alias; preserve event serialization snapshots |
| Trust registry/runtime boundary | `runtime/trust/*`, `packages/trust-registry-runtime/src/index.ts`, trust-domain concepts mapped from `src/lib/security/trust-domains.ts` | Contracts: `packages/protocol/src/claims/registries/*`; runtime: `packages/trust-registry-runtime/src/index.ts` | Registry entry/reference/lookup contracts, principal references, federation trust-domain types, persistence adapters | Registry reference identity, lookup status semantics, trust-domain identifiers, revocation reference compatibility | Contract-first extraction; runtime registry adapters implement lookup interfaces; defer storage moves | Runtime imports `@aoc/protocol/claims` registry contracts; external callers import registry reference contracts from protocol | High | Switch runtime back to local trust types; keep protocol registry contracts unused but published behind non-breaking export |
| Deterministic verification and independent verifier runtime | Legacy mapped sources `src/lib/security/deterministic-verification.ts`, `src/lib/security/independent-verifier.ts`; current concepts in `runtime/attestations/*` and proof contracts | Runtime: `packages/verification-runtime/src/index.ts` or consolidated `packages/attestation-runtime/src/verification.ts`; contracts remain in `packages/protocol/src/claims/verification.ts` and proofs | Proof envelope, verification result, trust registry lookup, revocation registry, deterministic replay inputs | Verification result shape, proof reference semantics, receipt/snapshot identity, no mutation of canonical claim payload | Introduce verification adapter interfaces in protocol; copy runtime implementation into verification runtime; keep old import paths as facades | Runtime callers import verifier from runtime package; protocol callers only depend on verification contracts/interfaces | High | Revert verifier import rewires; retain existing runtime verifier modules; disable new package export while fixtures remain |
| Governance/audit attestation bridge | `runtime/attestations/governance-attestation.ts`, `runtime/governance/*`, audit runtime packages | Runtime bridge: `packages/governance-runtime/src/attestation.ts` or `packages/attestation-runtime/src/governance.ts`; contracts in protocol claims/proofs | Governance decisions, reason codes, audit event envelopes, proof envelopes | Governance decision attestation semantics, reason-code references, audit correlation references | Extract after base attestation and governance contracts are stable; introduce bridge package module without replacing old path immediately | `runtime/governance` imports bridge from package; old `runtime/attestations` module re-exports during transition | Medium | Remove bridge export and route governance attestation creation through existing module |

### Phase B — Governance extraction

| P0 candidate | Current location | Target location | Dependencies | Required contracts to preserve | Migration strategy | Import changes | Risk level | Rollback strategy |
|---|---|---|---|---|---|---|---|---|
| Governance runtime | `runtime/governance/*`, `packages/governance-runtime/src/index.ts`; legacy mapped source `src/lib/security/governance-runtime.ts` | `packages/governance-runtime/src/index.ts` plus stable public submodules for sessions, obligations, escalation, human review, and state | Policy evaluation, reason codes, audit runtime, capability governance, principal references | Governance session lifecycle, obligation status, escalation semantics, human-review contract, runtime-state shape | Copy/normalize implementation into package; expose only stable APIs; keep `runtime/governance/index.ts` as facade | `runtime/*` imports `@aoc/governance-runtime`; external imports use package entry only | High | Revert callers to `runtime/governance/*`; package remains unpublished/private until parity passes |
| Policy evaluation runtime | `runtime/policy/*`; legacy mapped source `src/aoc/enterprise/runtime/policy-engine.ts` and shim `src/lib/security/policy-engine.ts` | `packages/policy-runtime/src/index.ts` or consolidated `packages/governance-runtime/src/policy.ts`; protocol decision contracts in `packages/protocol/src/contracts/index.ts` and `src/decisions/types.ts` | Policy decision contracts, reason codes, actor/principal/resource refs, audit events | `PolicyDecision` allow/deny/conditional semantics, evaluation order, conflict-resolution outputs, explainability traces | Extract contract types first; copy runtime evaluator; preserve local facade until all callers are package-based | Replace direct `runtime/policy/*` imports with package imports; keep `runtime/policy/index.ts` re-export | High | Revert import rewires; compare decision snapshots before/after; keep local evaluator authoritative |
| Authorization runtime | `packages/authorization-runtime/src/index.ts`, `runtime/enforcement/*`, `runtime/access/*`; legacy mapped `src/lib/security/access-guards.ts`, `server-authorization.ts`, `privileged-access.ts` | Runtime: `packages/authorization-runtime/src/index.ts`; PM/product-only access guards remain local to product repo | Capability tokens, policy decisions, principal/tenant boundaries, service-role access | Authorization decision semantics, deny reason payloads, service-role boundary, tenant/actor isolation | Separate pure authorization engine from product route guards; keep PM/product response shaping out of runtime | Product and runtime callers import package authorization APIs; route guards remain local adapters | High | Revert route and runtime imports to local guards; keep package extraction unused until tenant fixtures pass |
| Delegated capabilities runtime | `runtime/capabilities/*`, `runtime/distributed/distributed-capabilities.ts`; legacy mapped `src/aoc/enterprise/runtime/delegated-capabilities.ts` and shim `src/lib/security/delegated-capabilities.ts` | `packages/capability-runtime/src/delegation.ts` or `packages/capability-runtime/src/index.ts`; protocol delegation contracts under `src/delegations/types.ts` and `packages/protocol` | Capability claims/tokens, delegation chain, revocation, distributed governance, audit | Delegation chain depth, max-depth, redelegation, lineage, revocation behavior | Extract delegation types into protocol if missing; move runtime evaluation into capability runtime; keep shim | Replace `runtime/capabilities` delegation imports with `@aoc/capability-runtime`; protocol imports only delegation types | High | Revert to runtime-local delegation implementation; keep shims and data unchanged |
| Capability governance and lifecycle | `runtime/capabilities/capability-governance.ts`, `capability-lifecycle.ts`, `capability-revocation.ts`, `capability-session.ts`, `capability-audit.ts` | `packages/capability-runtime/src/index.ts` with stable lifecycle/governance APIs | Capability token contract, revocation registries, governance runtime, audit runtime | Capability lifecycle state, session state, revocation semantics, audit emission | Copy-first package consolidation; add compatibility exports from `runtime/capabilities/index.ts` | Runtime callers import `@aoc/capability-runtime`; old runtime paths re-export for one release | High | Revert package import rewires; compare capability lifecycle and revocation tests/snapshots |
| Reason-code governance | `runtime/governance/reason-codes.ts`, docs root reason-code governance files, `scripts/check-reason-code-governance.mjs` | Contracts: `packages/protocol/src/errors` or `packages/protocol/src/contracts/reason-codes.ts`; runtime taxonomy validation remains in governance runtime | Error contracts, explainability traces, policy decisions, audience/severity models | Reason-code identifiers, severity/audience semantics, legacy mappings | Promote stable taxonomy to protocol; keep runtime mapping/validation checks where they are | Consumers import reason-code constants/types from protocol; runtime imports protocol taxonomy | Medium | Keep runtime reason-code module authoritative; postpone protocol export until taxonomy is approved |
| Distributed governance isolation | `runtime/distributed/governance-isolation.ts`, `distributed-governance.test.ts`, `remote-governance.ts` | `packages/federation-runtime/src/governance.ts` or `packages/runtime-distributed/src/index.ts` | Governance runtime, trust domain, remote audit, federation semantics | Isolation boundary behavior, remote decision reference, trust-domain scoping | Extract after local governance runtime stabilizes; keep remote governance as package-private initially | Distributed modules import governance package; public exports remain minimal | High | Revert distributed imports to runtime-local modules; disable package export for distributed governance |

### Phase C — Operations extraction

| P0 candidate | Current location | Target location | Dependencies | Required contracts to preserve | Migration strategy | Import changes | Risk level | Rollback strategy |
|---|---|---|---|---|---|---|---|---|
| SDK contract surface | `src/sdk/types.ts`, `src/sdk/errors.ts`, `packages/aoc-sdk/src/contracts.ts`, `packages/audit-sdk/src/contracts.ts` | Protocol-safe SDK contracts in `packages/protocol/src/contracts/sdk.ts` or SDK package contracts; implementation remains runtime SDK | Protocol contracts, public errors, transport error semantics | SDK request/response type names, public error taxonomy, backwards-compatible package exports | Split contracts from client; leave package barrel stable; add contract-only import tests | SDK implementation imports protocol contracts; SDK consumers continue importing stable SDK barrel | Medium | Revert SDK barrel internals to local types; keep protocol contracts as duplicate until next major/minor |
| SDK client implementation | `runtime/sdk/client.ts`, `packages/aoc-sdk/src/index.ts`; legacy mapped `src/sdk/client.ts` | `packages/aoc-sdk/src/client.ts` or enterprise SDK implementation package | Transport types, auth/API keys, runtime API routes, error contracts | Client method names, auth header behavior, retry/error mapping, response envelopes | Extract implementation after contracts; keep old client import path re-exporting implementation | Runtime SDK imports contract types from protocol and implementation helpers from runtime SDK package | Medium | Revert client exports to `runtime/sdk/client.ts`; preserve package barrel aliases |
| API transport, validation, reliability | Legacy mapped `src/lib/api/http.ts`, `src/lib/api/reliability.ts`, `src/lib/api/validation.ts`; current `runtime/api/*`, `runtime/types/transport.ts` | `packages/api-runtime/src/http.ts`, `packages/api-runtime/src/reliability.ts`, `packages/api-runtime/src/validation.ts`; protocol owns transport contracts | Transport error semantics, API response envelopes, validation schemas, logging | HTTP response envelope shape, error-code mapping, retry/reliability behavior, validation failure payload | Extract utility modules behind API runtime package; keep route-level imports behind facade | Route handlers import package utilities through runtime API facade first, then direct package imports after parity | High | Revert route imports to local API utilities; keep package unpublished until route tests pass |
| Runtime API server/routes | `runtime/api/server.ts`, `runtime/api/routes.ts`, `runtime/api/middleware.ts`, `runtime/controlPlane.ts` | `packages/api-runtime/src/*` or enterprise API package; `runtime/controlPlane.ts` stays internal until stable | Control plane, auth, governance, trust, usage, monetization, transport | Route topology, middleware contract, control-plane internal status, public runtime entry constraints | Stabilize internal/public export map first; extract server shell without exporting control-plane internals | Public imports use runtime stable entry; internal routes may import package-private modules | High | Revert server/routes imports; ensure `runtime/controlPlane.ts` remains internal and callable |
| Execution fabric | `runtime/execution-fabric/*` | `packages/execution-runtime/src/index.ts` or `@aoc/runtime-execution-fabric` | Attestations, lifecycle, temporal consistency, replay/checkpoint semantics, capabilities | Execution plan/step/lease/failure/continuation shapes, replay compatibility, attestation links | Copy package with fixture coverage; keep `runtime/execution-fabric/index.ts` as facade | Runtime callers import execution package; external callers use stable facade until package export is approved | High | Revert imports to `runtime/execution-fabric/*`; keep copied package private |
| Execution grants and governed execution | Legacy mapped `src/aoc/enterprise/runtime/execution-grants.ts`, `src/lib/security/execution-grants.ts`; current capability/execution runtime concepts | `packages/capability-runtime/src/execution-grants.ts` or `packages/execution-runtime/src/grants.ts` | Capability tokens/claims, policy decisions, governance approvals, audit | Grant identity, scope, expiry, revocation, approval correlation | Extract after capability and policy runtime seams; preserve shim | Replace grant imports with package API; protocol remains contract-only | High | Revert import rewires; existing grants and schemas remain authoritative |
| Observability/logging and metrics | `runtime/observability.ts`, `runtime/logging/logger.ts`, governance docs/checks | `packages/observability-runtime/src/index.ts` or keep internal runtime package until public API approved | Audit runtime, trace context, operational metrics governance | Trace context propagation, logger API, metric event names | Extract as internal package first; do not publish API until event taxonomy is stable | Runtime imports observability package internally; public consumers use audit/SDK events | Medium | Revert to runtime-local logger/observability; keep metrics docs unchanged |
| Persistence and migrations ownership | Legacy mapped `supabase/migrations/202605*.sql`; current repo has no Supabase migration tree | Enterprise database migration stream, not protocol repo | Capability request flow, policy engine, delegation chain, governance approvals/audit, agent access, trust domains, verifier receipts | Migration IDs, table/column names, RLS/security semantics, audit history continuity | Copy migrations to enterprise migration stream; do not delete from source until enterprise deployment owns them; freeze duplicate PM/product migrations | Runtime packages consume through adapters; protocol has no database imports | High | Stop enterprise migration rollout; continue using original source migration stream; reconcile migration IDs before retry |

### Phase D — Protocol hardening

| P0 candidate | Current location | Target location | Dependencies | Required contracts to preserve | Migration strategy | Import changes | Risk level | Rollback strategy |
|---|---|---|---|---|---|---|---|---|
| Protocol package contract barrel | `packages/protocol/src/contracts/index.ts`, `packages/protocol/package.json` exports | Stable `@aoc/protocol/contracts`, `@aoc/protocol/claims`, `@aoc/protocol/errors` exports | All promoted protocol contracts, package export map, TypeScript declarations | Existing export names and `CapabilityToken`, `ConsentGrant`, `PolicyDecision`, `AuditEventEnvelope`, registry/claims exports | Add contracts behind explicit exports; avoid default/root export churn; validate build declarations | Runtime/package imports use explicit subpath exports; no deep imports into `packages/protocol/src/*` | Medium | Revert export-map additions; keep files internal until typecheck passes |
| Adapter interface seam | `src/adapters/interfaces.ts`, protocol contract gaps, runtime service dependencies | `packages/protocol/src/contracts/adapters.ts` or `packages/protocol/src/contracts/index.ts` if small | Verification key resolver, revocation registry reader, audit/security event sink, registry lookup | Interface method signatures, readonly contract objects, no runtime implementations | Define interfaces before moving implementations; runtime packages implement adapters | Protocol imports adapter interfaces only; runtime imports protocol contracts and provides implementations | High | Keep adapters in source-local module; defer protocol publication |
| Public/internal export annotations | Root docs and scripts: `INTERNAL_VS_PUBLIC_EXPORTS.md`, `PACKAGE_SURFACE_MAP.md`, `scripts/check-runtime-boundaries.mjs` | Package-level export maps, docs, lint rules | Package manifests, runtime barrels, SDK packages | Public surface stability and internal module invisibility | Document stable/unstable/internal modules; then enforce through package exports | Replace deep imports with public subpath imports | Medium | Relax lint rule to warning; restore deep import temporarily through facade |
| Contract drift fixtures | Existing tests under `__tests__`, `runtime/**/__tests__`, docs audit files | `__tests__/contracts/*` and package-local fixture tests | Canonicalization, claim/proof/credential/registry snapshots, runtime decision outputs | Serialized contract shapes and canonical IDs | Add golden fixtures before import rewires; compare old/new outputs | Tests import both old facade and new package API during transition | Medium | Remove fixture gate if false-positive; retain snapshots for manual comparison |

### Phase E — Boundary enforcement

| P0 candidate | Current location | Target location | Dependencies | Required contracts to preserve | Migration strategy | Import changes | Risk level | Rollback strategy |
|---|---|---|---|---|---|---|---|---|
| Dependency boundary lint | `scripts/check-runtime-boundaries.mjs`, `scripts/check-sdk-import-boundary.mjs`, `scripts/lint-semantic-ownership.mjs`, `package.json` scripts | Dedicated boundary checks for protocol, SDK, runtime, and package exports | Package export maps, source tree ownership metadata, CI | No protocol imports from runtime/product; no SDK deep runtime imports; runtime public barrel integrity | Start in report mode; turn on blocking mode after phases A-C facades are green | Imports must resolve through package public entries or documented facades | High | Downgrade enforcement to report-only; keep failing patterns visible in CI artifacts |
| Shim lifecycle enforcement | Legacy shim paths listed in extraction plan; runtime facade barrels | Shim manifest and deprecation ledger in docs/architecture or package metadata | Import rewires, release calendar, consumer readiness | Shim module names, deprecation dates, replacement import paths | Add shim inventory; require owner/removal PR for each shim | Consumers move from shim path to package path by phase | Medium | Extend shim deprecation window; do not delete facades |
| CI release validation matrix | `package.json` scripts, `.github/workflows/*`, package builds/tests | Release workflow matrix for protocol-only, runtime-only, SDK consumer, fixture import tests | TypeScript build, Jest, package checks, npm pack, boundary lint | Current release validation behavior plus package-level checks | Add checks incrementally; gate publishing on protocol and runtime package packability | No import changes except test fixtures importing public exports | Medium | Remove new matrix jobs or mark non-blocking until build issues are isolated |
| Consumer compatibility validation | SDK examples, package tests, runtime hosted tests | External-consumer fixture project importing only public packages | Published/private package tarballs, examples, API contracts | SDK public import paths, runtime facade behavior, error envelopes | Add fixture before deleting shims; run against local packages and prerelease tarballs | Example imports use `@aoc/protocol`, runtime/SDK package public entries | Medium | Revert fixtures to informational; keep shims and old imports authoritative |

## Epic list

1. **Epic A1 — Assurance contract separation**: isolate capability claims, attestation/proof, audit envelope, trust registry, and verification contracts from runtime implementations.
2. **Epic A2 — Assurance runtime packaging**: package attestation, verification, audit, and trust registry runtimes behind stable facades.
3. **Epic B1 — Governance runtime packaging**: consolidate governance sessions, obligations, escalation, reason codes, policy evaluation, and authorization boundaries.
4. **Epic B2 — Capability governance packaging**: extract delegated capabilities, lifecycle, revocation, sessions, execution grants, and governance audit behavior.
5. **Epic C1 — Operations API/SDK split**: separate SDK contracts from SDK implementation and extract API transport/validation/reliability utilities.
6. **Epic C2 — Execution and persistence operations**: package execution fabric and governed execution while assigning migration ownership to enterprise runtime streams.
7. **Epic D1 — Protocol hardening**: stabilize protocol exports, adapter interfaces, public/internal annotations, and contract drift fixtures.
8. **Epic E1 — Boundary enforcement**: enforce import direction, shim lifecycle, release matrix validation, and consumer compatibility gates.

## Story list

### Phase A stories — Assurance extraction

- **A-01**: Add capability claim contract to protocol package with no runtime imports.
- **A-02**: Define verification key resolver, revocation lookup, registry lookup, and audit event sink adapter interfaces.
- **A-03**: Normalize attestation and proof contracts to protocol-owned claim/proof modules.
- **A-04**: Package attestation runtime construction/evaluation behind a runtime API.
- **A-05**: Promote audit event envelope contract and align audit runtime to consume it.
- **A-06**: Align trust registry runtime with protocol registry contracts.
- **A-07**: Package deterministic verification and independent verifier runtime behind adapters.
- **A-08**: Add assurance golden fixtures for claim, proof, attestation, audit, registry lookup, and verification output shapes.

### Phase B stories — Governance extraction

- **B-01**: Package governance session, obligation, escalation, human review, and runtime-state APIs.
- **B-02**: Split policy decision contracts from policy evaluation runtime.
- **B-03**: Extract authorization runtime from product route guards and service-role implementation details.
- **B-04**: Extract delegated capability chain evaluation and revocation behavior into capability runtime.
- **B-05**: Extract capability lifecycle/session/governance audit APIs.
- **B-06**: Promote reason-code taxonomy contracts and keep runtime validation rules intact.
- **B-07**: Extract distributed governance isolation only after local governance runtime parity is proven.
- **B-08**: Add governance parity fixtures for decisions, reason codes, obligations, escalation, delegation chains, and revocation.

### Phase C stories — Operations extraction

- **C-01**: Split SDK contracts/errors from SDK client implementation.
- **C-02**: Package SDK client implementation while preserving existing SDK barrel imports.
- **C-03**: Package API transport, validation, reliability, and transport error helpers.
- **C-04**: Keep runtime API server/routes behind stable public/internal export boundaries.
- **C-05**: Package execution fabric contracts and runtime implementation behind a stable facade.
- **C-06**: Extract governed execution grants after capability and policy seams are stable.
- **C-07**: Keep observability/logging internal until taxonomy and public API are approved.
- **C-08**: Assign persistence/migration authority to enterprise runtime streams with no protocol database imports.

### Phase D stories — Protocol hardening

- **D-01**: Freeze protocol package subpath exports for contracts, claims, and errors.
- **D-02**: Add adapter interface documentation and implementation obligations.
- **D-03**: Encode public/internal/experimental surface annotations in package manifests and docs.
- **D-04**: Add contract drift fixtures and fixture import tests.
- **D-05**: Update architecture docs to reflect exact package ownership and facade lifecycles.

### Phase E stories — Boundary enforcement

- **E-01**: Add protocol import-boundary lint that fails on runtime/product imports.
- **E-02**: Add SDK import-boundary lint that fails on runtime internals and deep imports.
- **E-03**: Add runtime barrel/export drift checks for all extracted packages.
- **E-04**: Add shim manifest with owner, replacement path, deprecation date, and deletion criteria.
- **E-05**: Add release validation matrix for protocol, runtime, SDK, fixture consumers, and package tarballs.
- **E-06**: Turn boundary checks from report-only to blocking after all P0 candidate facades are validated.

## Commit sequence

1. `docs: add protocol extraction execution plan` — this planning document only.
2. `test: add protocol contract drift fixtures` — fixtures/golden snapshots; no import rewires.
3. `feat(protocol): add adapter contract seams` — adapter interfaces only.
4. `feat(protocol): promote assurance contracts` — claim, attestation, proof, audit, registry, verification contract exports.
5. `feat(assurance-runtime): package attestation audit trust verification facades` — copy-first runtime facades.
6. `test(assurance): add parity tests for assurance facades` — old path vs new package output parity.
7. `feat(governance-runtime): package governance and policy facades` — copy-first runtime facades.
8. `feat(capability-runtime): package delegation lifecycle and grants facades` — copy-first runtime facades.
9. `test(governance): add decision delegation and revocation parity fixtures`.
10. `feat(sdk): split contracts from client implementation`.
11. `feat(api-runtime): package transport validation reliability facades`.
12. `feat(execution-runtime): package execution fabric and grants facades`.
13. `docs: add shim manifest and deprecation ledger`.
14. `chore(boundaries): add report-only import boundary checks`.
15. `chore(ci): add package and consumer validation matrix`.
16. `refactor(imports): migrate internal imports to package facades`.
17. `chore(boundaries): make P0 boundary checks blocking`.
18. `chore(shims): remove expired compatibility shims` — only after release-window approval.

## Pull request sequence

1. **PR-01 — Planning and ownership alignment**
   - Adds this execution plan and confirms P0 scope.
   - No code moves.
2. **PR-02 — Contract fixture baseline**
   - Adds golden fixtures for public contract and runtime outputs.
   - No package extraction yet.
3. **PR-03 — Protocol seam hardening**
   - Adds adapter interfaces and protocol contract exports.
   - Must prove protocol has no runtime imports.
4. **PR-04 — Assurance runtime copy-first extraction**
   - Copies attestation, audit, trust registry, and verification runtime facades.
   - Keeps existing runtime paths as shims.
5. **PR-05 — Governance runtime copy-first extraction**
   - Copies governance, policy, authorization, reason-code, and distributed governance facades.
   - Adds parity tests.
6. **PR-06 — Capability and execution runtime copy-first extraction**
   - Copies delegated capabilities, lifecycle, revocation, sessions, execution grants, and execution fabric facades.
7. **PR-07 — Operations API/SDK extraction**
   - Splits SDK contracts/client and packages API transport/validation/reliability utilities.
8. **PR-08 — Enterprise persistence ownership**
   - Copies applicable migrations to enterprise stream and documents freeze/ownership rules.
   - Protocol repo remains database-free.
9. **PR-09 — Import rewrite wave 1**
   - Rewrites internal imports to new facades while retaining old shims.
10. **PR-10 — Boundary checks report-only**
    - Adds lint/reporting for protocol, SDK, runtime, and shim boundaries.
11. **PR-11 — Consumer validation and prerelease packaging**
    - Adds fixture consumer project and package tarball validation.
12. **PR-12 — Boundary checks blocking**
    - Turns P0 boundary checks into required CI gates.
13. **PR-13 — Shim removal**
    - Deletes compatibility shims only after the approved stability window and consumer sign-off.

## Testing strategy

### Baseline checks

- Typecheck all packages before extraction and after each import rewrite.
- Build all packages and verify declaration output for public subpath exports.
- Run existing Jest tests to establish behavioral baseline.
- Run existing boundary scripts before adding stricter enforcement.

### Contract and fixture checks

- Add golden serialization fixtures for capability claims, capability tokens, audit events, proof envelopes, registry references, policy decisions, reason codes, delegation chains, execution plans, and SDK errors.
- For each extracted runtime facade, run old path and new package path against the same fixture input and compare normalized outputs.
- Include negative fixtures for denied policy decisions, revoked capabilities, expired grants, invalid proof envelopes, invalid registry lookups, and cross-tenant/actor boundary attempts.

### Import and package checks

- Validate `@aoc/protocol` exports without runtime imports.
- Validate SDK examples import only public SDK/protocol exports.
- Validate runtime packages do not deep import protocol source files; they use subpath exports.
- Validate package tarballs include only intended public files and declarations.

### CI gates by phase

- **Phases A-C**: typecheck, build, Jest, old/new parity fixtures, report-only boundary checks.
- **Phase D**: typecheck, build, package declaration checks, contract drift fixtures, package tarball validation.
- **Phase E**: all checks above plus blocking boundary lint and external-consumer fixture import tests.

### Manual review gates

- Review every public export addition for semver risk.
- Review every shim for owner, replacement import path, deprecation date, and removal criteria.
- Review every migration copy for ID preservation, ordering, and rollback notes.
- Review every runtime package extraction for persistence, network, environment, telemetry, and product coupling.

## Rollback strategy

### Global rollback rules

1. Never delete original runtime/source modules in the same PR that introduces package facades.
2. Prefer reverting import rewires over reverting copied package code.
3. Keep old path shims authoritative until parity tests, package builds, and consumer fixtures pass.
4. If a boundary check blocks unexpectedly, downgrade that check to report-only instead of bypassing shims or weakening contracts.
5. Database migrations are copy-first and deployment-gated; protocol extraction must never require database rollback.

### Phase rollback

- **Phase A rollback**: revert assurance import rewires to runtime-local paths; leave protocol contracts unpublished or unreferenced until adapter gaps are fixed.
- **Phase B rollback**: revert governance/capability runtime consumers to existing runtime modules; keep package facades private and compare failed parity fixture outputs.
- **Phase C rollback**: revert SDK/API/execution imports to existing barrels; keep public SDK barrel stable; do not remove existing runtime API routes.
- **Phase D rollback**: revert export-map additions or mark exports internal; keep contract fixture baselines for future retry.
- **Phase E rollback**: set new lint/checks to report-only, extend shim deprecation windows, and leave package facades in place.

### Risk-specific rollback

- **Import graph breakage**: restore compatibility facade imports and run dependency graph report before attempting narrower rewrites.
- **Protocol contamination**: remove offending export from protocol package, move the runtime dependency behind an adapter interface, and add a lint regression test.
- **Behavioral drift**: block import rewrite, compare old/new fixture output, patch new package facade, and rerun parity tests.
- **SDK breakage**: revert SDK barrel internals to previous implementation while preserving new contract-only modules as non-default exports.
- **Migration divergence**: stop enterprise migration rollout, keep source migration stream authoritative, and reconcile migration IDs before retry.
- **Consumer failure**: extend shim lifecycle, publish a patch/prerelease with facade fix, and do not proceed to blocking boundary checks.

## Definition of done

- Every P0 candidate has an owner package, facade strategy, parity test, import rewrite plan, risk rating, and rollback path.
- `@aoc/protocol` can build and typecheck without importing runtime, enterprise, product, persistence, transport implementation, or SDK client code.
- Runtime and enterprise packages consume protocol through public subpath exports only.
- SDK consumers can use stable public imports without deep runtime dependencies.
- Boundary checks run in CI and are blocking after all copy-first facades and consumer fixtures are green.
- Compatibility shims have explicit replacement paths, owners, deprecation dates, and removal PRs.
