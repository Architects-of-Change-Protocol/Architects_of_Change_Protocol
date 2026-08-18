/**
 * `@aoc/protocol/governance-compatibility` — the sovereign governance handoff:
 * the deterministic, provider-neutral boundary object an external governance
 * system receives, and the point at which AOC Protocol stops.
 *
 * SM-09 answered "what does the issuer declare about this subject?". This
 * subpath answers a different question: what does an external governance system
 * need in order to *address* and *interpret* a sovereign subject — and what
 * must the Protocol refuse to do on its behalf?
 *
 * ## The boundary this module exists to hold
 *
 *     governance compatible != governed
 *     handoff               != decision
 *     resource reference    != grant
 *     license terms         != policy
 *     claim                 != authority
 *     signature             != authority
 *     registrant            != owner
 *     issuer                != owner
 *     authority             != decision
 *     decision              != enforcement
 *
 * The Protocol creates that boundary. It must never cross it. There is no
 * policy evaluation here, no allow/deny, no authority resolution, no decision,
 * no obligation status, no grant, no consent, no delegation, no scope
 * derivation, no precedence between contradictory declarations, no approval
 * workflow, no provider enforcement, no revocation, no payment, no tokenization
 * and no legal or ownership conclusion. Every one of those is something an
 * external governance system — AOC Enterprise, an OPA or Cedar deployment, a
 * cloud IAM, a DAO, an engine nobody has written yet — may do *after* reading a
 * handoff, using its own authority.
 *
 * ## What travels, and where it comes from
 *
 *     subject         SM-02 SovereignSubjectRef, from the representation
 *     resource        canonical Protocol ResourceRef, projected from the subject
 *     representation  SM-06 SovereigntyPortabilityBundleV1, unchanged
 *     semantics       SM-07 SovereigntyInteroperabilityDescriptorV1, derived
 *
 * Nothing on this list is a new model. Governance Compatibility introduces
 * exactly one new document — the handoff envelope — plus one generic resource
 * kind, and reuses every other contract it needs.
 *
 * The handoff *data contracts* live here; the production
 * AOC.GOVERNANCE_COMPATIBILITY capsule that runs
 * `prepare-governance-handoff` and `validate-governance-handoff` through the
 * common SM-03 invocation and evidence spine lives in
 * `@aoc/protocol/sovereignty-capabilities`. This mirrors the existing split
 * between `@aoc/protocol/portability`, `@aoc/protocol/interoperability`,
 * `@aoc/protocol/licensing` and their capsules, so the projection, the builder
 * and the validators stay usable on their own and no contract is defined twice.
 *
 * Importing this module has no side effects: nothing is minted, no clock is
 * read, no file is opened, no connection is made, nothing is registered and
 * nothing is written.
 */
export { SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES } from './reason-codes';
export type { SovereignGovernanceCompatibilityReasonCode } from './reason-codes';
export { SOVEREIGN_GOVERNED_RESOURCE_KIND, buildSovereignGovernanceResourceRef } from './resource';
export type { BuildSovereignGovernanceResourceRefOptions, SovereignGovernedResourceKind, } from './resource';
export { SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION } from './handoff';
export type { BuildSovereignGovernanceHandoffInput, SovereignGovernanceHandoffBuildResult, SovereignGovernanceHandoffSchemaVersion, SovereignGovernanceHandoffV1, SovereignGovernanceHandoffValidationResult, } from './handoff';
export { buildSovereignGovernanceHandoffV1, tryBuildSovereignGovernanceHandoffV1 } from './builder';
export { isValidSovereignGovernanceHandoffV1, sovereignGovernanceSubjectsEqual, validateSovereignGovernanceHandoffV1, } from './validation';
//# sourceMappingURL=index.d.ts.map