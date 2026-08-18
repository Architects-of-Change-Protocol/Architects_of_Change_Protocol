import type { CANONICAL_JSON_PROFILE } from '../canonical';
import type { CanonicalId, ResourceRef } from '../contracts';
import type { SovereignSubjectRef } from '../identity';
import type { SovereigntyInteroperabilityDescriptorV1 } from '../interoperability';
import type { SovereigntyPortabilityBundleV1 } from '../portability';
import type { SovereignGovernanceCompatibilityReasonCode } from './reason-codes';

/**
 * The canonical sovereign governance handoff — the deterministic boundary
 * object AOC Protocol hands to an external governance system, and the last
 * thing the Protocol produces before governance begins.
 *
 * ## Where this sits
 *
 *     SOVEREIGN SUBJECT
 *            |
 *     CANONICAL SOVEREIGN REPRESENTATION      (AOC.PORTABILITY)
 *            |
 *     MACHINE-READABLE SEMANTICS              (AOC.INTEROPERABILITY)
 *            |
 *     STABLE GOVERNANCE RESOURCE HANDLE       (this module)
 *            |
 *     SOVEREIGN GOVERNANCE HANDOFF            (this document)
 *     ========================================== AOC PROTOCOL ENDS HERE
 *            |
 *     EXTERNAL GOVERNANCE / AOC ENTERPRISE
 *            |
 *     POLICY -> DECISION -> OBLIGATIONS -> GRANTS -> ENFORCEMENT
 *
 * ## What a valid handoff asserts
 *
 * Exactly this:
 *
 *     "This stable governance resource refers to this sovereign subject, and
 *      this is the sovereign representation supplied together with the
 *      canonical machine-readable description of the semantics present in it."
 *
 * Nothing further. Governance *compatible* is not governed, a handoff is not a
 * decision, a resource reference is not a grant, declared terms are not policy,
 * a claim is not authority, a signature is not authority, a registrant is not
 * an owner, authority is not a decision and a decision is not enforcement. This
 * document creates that boundary; it must never cross it.
 *
 * ## Structural validity is not policy sufficiency
 *
 * A structurally valid handoff may carry zero claims, zero license terms,
 * unsigned artifacts, contested standings, contradictory permissions and
 * restrictions over the same action, cryptographic proofs that do not hold, and
 * semantic requirements nobody in the receiving system has ever seen. It is
 * still valid, because every one of those is a legitimate sovereign state that
 * governance may need to see *in order to* decide. Whether a particular policy
 * has enough information is a governance question with a governance answer, and
 * the Protocol does not pre-empt it in either direction.
 *
 * ## Fields deliberately absent, and why
 *
 * - **`handoffId` / `governanceId` / `requestId`** — the handoff is a
 *   deterministic projection of an existing subject, not a new sovereign
 *   object, an access request, a workflow or a case. Minting an id for it would
 *   create an identity with no owner and no lifecycle, and would make the same
 *   sovereign state project differently every time. The *execution* already has
 *   an identity: the SM-03 `invocationId`.
 * - **`generatedAt` / `preparedAt`** — the same determinism requirement. Same
 *   inputs, byte-identical canonical handoff. *When* a projection happened is
 *   recorded truthfully in the SM-03 invocation evidence.
 * - **`handoffDigest` / `handoffHash`** — Integrity is a different mineral,
 *   reached by explicit composition: canonicalize this document, then hand the
 *   bytes to AOC.INTEGRITY. Absorbing it here would give the handoff a second,
 *   drifting integrity story.
 * - **`signature` / `proof`** — likewise Verifiability. A consumer that wants
 *   proof signs the canonical serialization with the existing
 *   `signSovereignPayload`. No private key belongs in this mineral.
 * - **`ready` / `governanceReady` / `sufficient` / `complete`** — the Protocol
 *   cannot know whether every possible claim exists, and cannot know what a
 *   policy it has never seen requires. The existence of a structurally valid
 *   handoff is the only statement made here.
 * - **`policy` / `decision` / `authority` / `grant` / `approval` / `owner` /
 *   `status` / `resolvedTerms`** — every one of these is on the far side of the
 *   boundary.
 * - **`consumerType` / `engine` / `vendor` / `governanceProvider`** — the
 *   handoff knows nothing about who consumes it. There is no consumer enum,
 *   because the set of governance systems is open.
 */
export const SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION = 'aoc-sovereign-governance-handoff/1' as const;

export type SovereignGovernanceHandoffSchemaVersion = typeof SOVEREIGN_GOVERNANCE_HANDOFF_SCHEMA_VERSION;

/**
 * SovereignGovernanceHandoffV1 — exactly six fields, and the reason each one
 * has to be there:
 *
 *   `schemaVersion`           what handoff contract this is
 *   `canonicalizationProfile` how its JSON representation is canonicalized
 *   `subject`                 which sovereign thing is involved
 *   `resource`                what stable handle an external system addresses
 *   `representation`          what sovereign artifacts travelled with it
 *   `semantics`               what concepts are present in that representation
 *
 * That is sufficient for a governance engine to *start*. It is deliberately not
 * sufficient for the Protocol itself to *decide*.
 */
export interface SovereignGovernanceHandoffV1 {
  readonly schemaVersion: SovereignGovernanceHandoffSchemaVersion;
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
  /**
   * The canonical SM-02 subject reference itself, passed through unchanged.
   * There is no `GovernedSubject`, `GovernanceSubject` or `PolicySubject`: a
   * second subject model is exactly how two representations of one subject
   * start to disagree. Nothing is minted and no alias identity is created.
   */
  readonly subject: SovereignSubjectRef;
  /**
   * The canonical Protocol `ResourceRef`, reused rather than re-declared, so a
   * governance engine that already speaks `ResourceRef` needs no adapter and no
   * second structurally identical interface exists to drift from the first.
   */
  readonly resource: ResourceRef;
  /**
   * The SM-06 portability bundle, unchanged and unwrapped. Governance
   * Compatibility *wraps* Portability; it does not redefine it, and no
   * `governance-handoff` artifact kind exists inside the bundle, so a handoff
   * can never contain a representation that contains a handoff.
   */
  readonly representation: SovereigntyPortabilityBundleV1;
  /**
   * The SM-07 descriptor for exactly this representation, derived rather than
   * supplied. A descriptor that is individually well-formed but describes some
   * *other* bundle is not a valid part of this document — see the validator.
   */
  readonly semantics: SovereigntyInteroperabilityDescriptorV1;
}

/**
 * Input for the handoff builder.
 *
 * `subject`, `resource` and `semantics` are deliberately *not* accepted. All
 * three are derivable from the representation, and a contract that accepted
 * duplicated inputs would be inviting a caller to supply a subject, a resource
 * or a descriptor that disagrees with the representation it travels with.
 * Derive rather than trust.
 */
export interface BuildSovereignGovernanceHandoffInput {
  readonly representation: SovereigntyPortabilityBundleV1;
  /** Explicit governance context, preserved verbatim; never inferred. */
  readonly tenantId?: CanonicalId;
}

/**
 * The result of checking *structural handoff validity*.
 *
 * The field is `valid`, never `governable`, `ready` or `approved`. Nothing on
 * this surface establishes a governance property, and a result claiming one
 * would be answering a question the Protocol was never asked.
 */
export interface SovereignGovernanceHandoffValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly SovereignGovernanceCompatibilityReasonCode[];
}

export type SovereignGovernanceHandoffBuildResult =
  | { readonly valid: true; readonly handoff: SovereignGovernanceHandoffV1 }
  | { readonly valid: false; readonly reasons: readonly SovereignGovernanceCompatibilityReasonCode[] };
