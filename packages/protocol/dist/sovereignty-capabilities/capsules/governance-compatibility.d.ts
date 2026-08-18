import type { CanonicalId } from '../../contracts';
import { type SovereignGovernanceCompatibilityReasonCode, type SovereignGovernanceHandoffV1 } from '../../governance-compatibility';
import { type SovereigntyPortabilityBundleV1 } from '../../portability';
import type { SovereigntyCapabilityImplementation } from '../implementation';
/**
 * AOC.GOVERNANCE_COMPATIBILITY — the production Sovereignty Capability capsule
 * that answers:
 *
 *   "What does an external governance system need in order to address and
 *    interpret this sovereign subject — and how does the Protocol supply it
 *    without becoming that governance system?"
 *
 * It is the eighth and last of the canonical eight to become a real
 * implementation of the SM-03 socket, and it is the mineral that defines where
 * the Protocol ends. The handoff data contracts — the generic sovereign
 * resource kind, the `ResourceRef` projection, `SovereignGovernanceHandoffV1`,
 * its builder and its validator — live in
 * `@aoc/protocol/governance-compatibility`; this capsule is what makes
 * preparing and validating a handoff ordinary capability invocations producing
 * capability-attributed evidence.
 *
 * ## Two operations, deliberately
 *
 *   prepare-governance-handoff    representation (+ tenant) -> handoff
 *   validate-governance-handoff   candidate document        -> validation report
 *
 * That is the whole surface. There is deliberately no `evaluate`, `authorize`,
 * `decide`, `approve`, `grant` or `enforce` operation, because each of those is
 * a governance act rather than a projection of sovereign state, and adding one
 * would put the Protocol on the far side of the boundary this mineral exists to
 * draw.
 *
 * ## What a successful prepare means
 *
 * That a structurally valid handoff exists — no more. It does not mean allow,
 * deny, approved, complete, sufficient, ready or governable. There is no
 * readiness flag in the output for the same reason there is no completeness
 * flag: the Protocol cannot know what artifacts exist beyond the ones it was
 * handed, and cannot know what a policy it has never seen requires.
 *
 * ## What this capsule never does
 *
 * - **Invoke another mineral.** `invokeSovereigntyCapability` is not called
 *   here at all. The SM-06 bundle validator and the SM-07 descriptor helper are
 *   reused as *pure libraries*, which is why preparing a handoff produces
 *   exactly one evidence record rather than a hidden chain of them. A caller
 *   who wants Verifiability run over the artifacts inside a representation
 *   invokes AOC.VERIFIABILITY itself, and that invocation appears in the
 *   caller's own evidence where it belongs.
 * - **Verify.** No signature is checked, no key is resolved, no issuer is
 *   bound. A representation carrying a structurally intact but cryptographically
 *   tampered proof prepares successfully, and AOC.VERIFIABILITY independently
 *   reports `valid: false` for the same artifact. Those two facts are supposed
 *   to be able to coexist: conflating them would make "handed to governance"
 *   silently read as "cryptographically sound".
 * - **Adjudicate.** A `Contested` standing travels through unchanged. So does a
 *   `Permission` and a `Restriction` over the same action. There is no winner,
 *   no precedence, no `resolvedTerms`, no allow and no deny — a governance
 *   engine may need to decide *precisely because* something is contested or
 *   contradictory, and resolving it here would destroy the input it needs.
 * - **Translate terms into policy.** A declared `Permission` does not become a
 *   grant or a scope, a `Restriction` does not become a deny, and an
 *   `Obligation` does not acquire a pending/fulfilled/violated status. SM-09
 *   declares; governance interprets.
 * - **Produce authority.** No `CanonicalCapability`, `CanonicalAuthority` or
 *   `CanonicalDecision` is constructed, and none is inferred from a registrant,
 *   a claim issuer, a license issuer or a valid signature. The trust chain runs
 *   evidence -> assertion -> claim -> attestation -> verification -> standing ->
 *   capability -> authority -> decision, and this mineral must not jump from
 *   its left half to its right half.
 * - **Grant or request access.** No `PolicyDecision`, `ScopedAccessRequest`,
 *   `CapabilityToken`, `CapabilityGrant`, `ConsentGrant` or `Delegation` is
 *   created. A handoff is object/state context; an access request is an
 *   actor/action event; they are different concepts and neither implies the
 *   other.
 * - **Mint, hash, or assert.** No `mintSovereignAssetId`, no content bytes, no
 *   digest computation, no origin, authorship or derivation claim.
 * - **Reach outside.** No network, filesystem, database, cache, registry,
 *   provider SDK or blockchain. No global mutable state and no import-time side
 *   effect. The handoff is returned, never persisted.
 * - **Branch on the subject.** No namespace, asset type or business domain is
 *   read, and `subject.externalReference.namespace` is opaque. A byte document,
 *   a physical painting, a plot of land, an external token, an autonomous
 *   agent, an API resource and a subject from a system nobody has heard of all
 *   project through exactly the same code, onto exactly the same resource kind.
 */
/** The operations AOC.GOVERNANCE_COMPATIBILITY 1.0.0 supports. Closed for this version. */
export declare const GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS: readonly ["prepare-governance-handoff", "validate-governance-handoff"];
export type GovernanceCompatibilitySovereigntyCapabilityOperation = (typeof GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];
/**
 * The reason codes this capsule reports.
 *
 * The **same** frozen constant as the contract layer's, not a capsule-local
 * copy: Governance Compatibility's structural codes are meaningful on their own
 * — a caller can validate a handoff without ever constructing a capsule — so
 * both readers share one vocabulary instead of two spellings drifting apart.
 */
export declare const GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES: Readonly<{
    readonly invalidInput: "GOVERNANCE_COMPATIBILITY_INVALID_INPUT";
    readonly unsupportedOperation: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_OPERATION";
    readonly subjectMismatch: "GOVERNANCE_COMPATIBILITY_SUBJECT_MISMATCH";
    readonly invalidRepresentation: "GOVERNANCE_COMPATIBILITY_INVALID_REPRESENTATION";
    readonly invalidHandoff: "GOVERNANCE_COMPATIBILITY_INVALID_HANDOFF";
    readonly unsupportedHandoffSchema: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_HANDOFF_SCHEMA";
    readonly unsupportedCanonicalizationProfile: "GOVERNANCE_COMPATIBILITY_UNSUPPORTED_CANONICALIZATION_PROFILE";
    readonly invalidSubject: "GOVERNANCE_COMPATIBILITY_INVALID_SUBJECT";
    readonly invalidResource: "GOVERNANCE_COMPATIBILITY_INVALID_RESOURCE";
    readonly resourceKindMismatch: "GOVERNANCE_COMPATIBILITY_RESOURCE_KIND_MISMATCH";
    readonly resourceIdMismatch: "GOVERNANCE_COMPATIBILITY_RESOURCE_ID_MISMATCH";
    readonly resourceAttributesNotSupported: "GOVERNANCE_COMPATIBILITY_RESOURCE_ATTRIBUTES_NOT_SUPPORTED";
    readonly invalidTenantId: "GOVERNANCE_COMPATIBILITY_INVALID_TENANT_ID";
    readonly invalidSemantics: "GOVERNANCE_COMPATIBILITY_INVALID_SEMANTICS";
    readonly semanticsMismatch: "GOVERNANCE_COMPATIBILITY_SEMANTICS_MISMATCH";
}>;
export type GovernanceCompatibilitySovereigntyCapabilityReasonCode = SovereignGovernanceCompatibilityReasonCode;
/**
 * Capability-specific input for `prepare-governance-handoff`.
 *
 * There is deliberately no subject field: the representation already carries
 * the one subject it is about. Supplying `invocation.subject` is optional and
 * means "I expect this representation to be about exactly that reference",
 * which is checked for exact equality rather than reconciled.
 *
 * There is equally deliberately no `actor`, `principal`, `action`, `scope`,
 * `policy`, `authority`, `grant`, `decision`, `owner` or credential field. Each
 * of those would turn a projection of sovereign state into a request about a
 * particular actor, which is the first half of an access decision.
 */
export interface PrepareGovernanceHandoffInput {
    readonly operation: 'prepare-governance-handoff';
    readonly representation: SovereigntyPortabilityBundleV1;
    /** Explicit governance context, preserved verbatim. Optional, and never inferred. */
    readonly tenantId?: CanonicalId;
}
/**
 * Capability-specific input for `validate-governance-handoff`.
 *
 * `unknown` is intentional: a candidate handoff is exactly the kind of document
 * that has crossed an external trust boundary, and accepting `value as
 * SovereignGovernanceHandoffV1` would let a malformed document become
 * authoritative by assertion.
 */
export interface ValidateGovernanceHandoffInput {
    readonly operation: 'validate-governance-handoff';
    readonly handoff: unknown;
}
export type GovernanceCompatibilitySovereigntyCapabilityInput = PrepareGovernanceHandoffInput | ValidateGovernanceHandoffInput;
/**
 * The handoff, and nothing else.
 *
 * No `ready`, `governable`, `complete` or `sufficient` companion flag: the
 * existence of a structurally valid handoff is the only statement this
 * operation makes.
 */
export interface PrepareGovernanceHandoffOutput {
    readonly operation: 'prepare-governance-handoff';
    readonly handoff: SovereignGovernanceHandoffV1;
}
export interface ValidateGovernanceHandoffOutput {
    readonly operation: 'validate-governance-handoff';
    readonly validation: {
        readonly valid: boolean;
        readonly reasons: readonly SovereignGovernanceCompatibilityReasonCode[];
    };
}
export type GovernanceCompatibilitySovereigntyCapabilityOutput = PrepareGovernanceHandoffOutput | ValidateGovernanceHandoffOutput;
export interface GovernanceCompatibilitySovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly SovereignGovernanceCompatibilityReasonCode[];
}
export interface GovernanceCompatibilitySovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<GovernanceCompatibilitySovereigntyCapabilityInput, GovernanceCompatibilitySovereigntyCapabilityOutput> {
}
/**
 * Validates the capability-specific Governance Compatibility input.
 *
 * This checks the *operation envelope* only — that the operation is one this
 * capability version supports, and that the document it names is present as an
 * object. It deliberately does not restate the representation or handoff rules:
 * those belong to the real validators in
 * `@aoc/protocol/governance-compatibility` and `@aoc/protocol/portability`, a
 * second copy of them here would be a drift source, and the capsule applies
 * them by running those validators and reporting their reasons verbatim.
 *
 * `handoff` is deliberately *not* required to be an object: validating a
 * malformed candidate is the whole point of that operation, and `null`, a
 * string or an array is a perfectly ordinary thing to be asked about.
 */
export declare function validateGovernanceCompatibilitySovereigntyCapabilityInput(value: unknown): GovernanceCompatibilitySovereigntyCapabilityInputValidationResult;
export declare function isValidGovernanceCompatibilitySovereigntyCapabilityInput(value: unknown): value is GovernanceCompatibilitySovereigntyCapabilityInput;
/**
 * Builds the production AOC.GOVERNANCE_COMPATIBILITY capsule.
 *
 * A factory, so importing this module performs no work: no registry is touched,
 * no global is written, no clock is read and no id is generated at import time.
 * There is no implementation registry, no governed-resource registry and no
 * handoff registry — the capsule is passed explicitly to
 * `invokeSovereigntyCapability`, and a handoff is returned to its caller rather
 * than stored anywhere.
 *
 * No options are needed because neither operation reads the clock or reaches
 * outside: both are deterministic functions of their inputs, and *when* a
 * projection or a validation happened is recorded truthfully in the invocation
 * evidence instead. There is likewise no retry policy, because there is no
 * external dependency that could fail.
 */
export declare function createGovernanceCompatibilitySovereigntyCapabilityImplementation(): GovernanceCompatibilitySovereigntyCapabilityImplementation;
//# sourceMappingURL=governance-compatibility.d.ts.map