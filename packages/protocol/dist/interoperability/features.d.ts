import { StandingStatus } from '../claims/claim-enums';
import type { CanonicalSemanticNamespace, CanonicalSemanticRef, CanonicalSemanticTermId } from '../claims/vocabulary';
import { type PortableSovereignClaimArtifactKind, type PortableSovereignManifestArtifactKind } from '../portability';
/**
 * The artifact kinds an AOC sovereign representation can present to a receiving
 * system.
 *
 * The four wrapper kinds are the SM-06 constants themselves rather than
 * re-spelled copies, because a second spelling of `signed-manifest` living in
 * an interoperability contract is exactly how a wire vocabulary and the
 * representation it describes start to disagree.
 *
 * `standing` is added here and only here. A `CanonicalStanding` travels in the
 * SM-06 bundle as a bare record with no wrapper kind — it needs none, since a
 * standing is not signed or unsigned in the way a manifest or claim is — but a
 * receiving system still has to be able to say "I do not understand standing
 * records at all", which is an artifact-level statement and not a status-level
 * one. Extending the *interoperability* feature vocabulary is additive and
 * leaves the six-field SM-06 bundle contract untouched.
 */
export type SovereigntyInteroperabilityArtifactKind = PortableSovereignManifestArtifactKind | PortableSovereignClaimArtifactKind | 'standing';
export declare const SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS: readonly SovereigntyInteroperabilityArtifactKind[];
/**
 * The claim semantics the current representation profile can describe.
 *
 * Exactly the three `ClaimType` members `PortableSovereignClaim` transports, in
 * canonical (lexicographic) order. Deliberately not every `ClaimType`: the
 * bundle has no runtime validator for the other variants, so advertising them
 * would claim an understanding Protocol does not have — and `ClaimType.Custom`
 * is not used as a disguise for that gap. A future additive profile version can
 * widen this list once those validators exist.
 */
export declare const INTEROPERABLE_CLAIM_TYPES: readonly ["Authorship", "Derivation", "Origin"];
export type InteroperableClaimType = (typeof INTEROPERABLE_CLAIM_TYPES)[number];
/**
 * Every canonical `StandingStatus`, in canonical (lexicographic) order.
 *
 * The whole enum is interoperable because a standing record's status is an
 * ordinary closed vocabulary the SM-06 bundle validator already accepts in full
 * — unlike claims, there is no per-status validator gap to be honest about.
 */
export declare const INTEROPERABLE_STANDING_STATUSES: readonly StandingStatus[];
/**
 * One semantic concept a representation requires a consumer to understand.
 *
 * This is a *compatibility requirement extracted from* `CanonicalSemanticRef`,
 * never a replacement for it. The distinction is the whole point:
 * `CanonicalSemanticRef.id` identifies one *occurrence* of a reference — the
 * particular pointer sitting on one particular claim — while `namespace` +
 * `termRef` identify the *concept* being pointed at. Three claims referencing
 * the same concept through three differently-identified refs impose one
 * requirement, not three, so concept identity is what compatibility is computed
 * over. The refs themselves are never copied, mutated or resolved.
 */
export interface InteroperabilitySemanticRequirement {
    readonly namespace: CanonicalSemanticNamespace;
    readonly termRef: CanonicalSemanticTermId;
}
export declare function isSovereigntyInteroperabilityArtifactKind(value: unknown): value is SovereigntyInteroperabilityArtifactKind;
export declare function isInteroperableClaimType(value: unknown): value is InteroperableClaimType;
export declare function isInteroperableStandingStatus(value: unknown): value is StandingStatus;
export declare function isValidInteroperabilitySemanticRequirement(value: unknown): value is InteroperabilitySemanticRequirement;
/**
 * Total order over semantic requirements: namespace first, then term.
 *
 * Explicit rather than incidental. A `Set` insertion order or an object key
 * order would make the public output of a descriptor depend on the order a
 * caller happened to supply artifacts in, which is exactly the kind of
 * accidental non-determinism a wire contract cannot afford.
 */
export declare function compareInteroperabilitySemanticRequirements(a: InteroperabilitySemanticRequirement, b: InteroperabilitySemanticRequirement): number;
/** Stable key for concept identity, used only to deduplicate inside a builder. */
export declare function interoperabilitySemanticRequirementKey(requirement: InteroperabilitySemanticRequirement): string;
/**
 * Collects the distinct semantic *concepts* referenced by a set of refs.
 *
 * Read-only: the supplied refs are never sorted in place, rewritten or
 * resolved, and their `id` and `metadata` are deliberately dropped — carrying
 * an occurrence id into a compatibility requirement would make two consumers
 * that understand the very same concept disagree over an accident of labelling.
 *
 * A malformed ref is skipped rather than reported. Semantic refs are optional
 * decoration on artifacts the SM-06 validator has already accepted, and the
 * descriptor's job is to report the concepts a representation *does* require,
 * not to re-adjudicate the validity of artifacts Portability admitted.
 */
export declare function collectInteroperabilitySemanticRequirements(refs: readonly CanonicalSemanticRef[] | undefined, into: Map<string, InteroperabilitySemanticRequirement>): void;
//# sourceMappingURL=features.d.ts.map