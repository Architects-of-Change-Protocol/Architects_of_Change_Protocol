import { ClaimType, StandingStatus } from '../claims/claim-enums';
import type {
  CanonicalSemanticNamespace,
  CanonicalSemanticRef,
  CanonicalSemanticTermId,
} from '../claims/vocabulary';
import {
  PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
  PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
  type PortableSovereignClaimArtifactKind,
  type PortableSovereignManifestArtifactKind,
} from '../portability';

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
export type SovereigntyInteroperabilityArtifactKind =
  | PortableSovereignManifestArtifactKind
  | PortableSovereignClaimArtifactKind
  | 'standing';

export const SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS: readonly SovereigntyInteroperabilityArtifactKind[] =
  Object.freeze(
    [
      ...PORTABLE_SOVEREIGN_MANIFEST_ARTIFACT_KINDS,
      ...PORTABLE_SOVEREIGN_CLAIM_ARTIFACT_KINDS,
      'standing' as const,
    ].sort(),
  );

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
export const INTEROPERABLE_CLAIM_TYPES = Object.freeze([
  ClaimType.Authorship,
  ClaimType.Derivation,
  ClaimType.Origin,
] as const);

export type InteroperableClaimType = (typeof INTEROPERABLE_CLAIM_TYPES)[number];

/**
 * Every canonical `StandingStatus`, in canonical (lexicographic) order.
 *
 * The whole enum is interoperable because a standing record's status is an
 * ordinary closed vocabulary the SM-06 bundle validator already accepts in full
 * — unlike claims, there is no per-status validator gap to be honest about.
 */
export const INTEROPERABLE_STANDING_STATUSES = Object.freeze(
  [...Object.values(StandingStatus)].sort() as readonly StandingStatus[],
);

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

const ARTIFACT_KINDS: ReadonlySet<string> = new Set<string>(SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS);
const CLAIM_TYPES: ReadonlySet<string> = new Set<string>(INTEROPERABLE_CLAIM_TYPES);
const STANDING_STATUSES: ReadonlySet<string> = new Set<string>(INTEROPERABLE_STANDING_STATUSES);

export function isSovereigntyInteroperabilityArtifactKind(
  value: unknown,
): value is SovereigntyInteroperabilityArtifactKind {
  return typeof value === 'string' && ARTIFACT_KINDS.has(value);
}

export function isInteroperableClaimType(value: unknown): value is InteroperableClaimType {
  return typeof value === 'string' && CLAIM_TYPES.has(value);
}

export function isInteroperableStandingStatus(value: unknown): value is StandingStatus {
  return typeof value === 'string' && STANDING_STATUSES.has(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

export function isValidInteroperabilitySemanticRequirement(
  value: unknown,
): value is InteroperabilitySemanticRequirement {
  return (
    isPlainObject(value)
    && hasExactKeys(value, ['namespace', 'termRef'])
    && isNonBlankString(value.namespace)
    && isNonBlankString(value.termRef)
  );
}

/**
 * Total order over semantic requirements: namespace first, then term.
 *
 * Explicit rather than incidental. A `Set` insertion order or an object key
 * order would make the public output of a descriptor depend on the order a
 * caller happened to supply artifacts in, which is exactly the kind of
 * accidental non-determinism a wire contract cannot afford.
 */
export function compareInteroperabilitySemanticRequirements(
  a: InteroperabilitySemanticRequirement,
  b: InteroperabilitySemanticRequirement,
): number {
  if (a.namespace !== b.namespace) return a.namespace < b.namespace ? -1 : 1;
  if (a.termRef !== b.termRef) return a.termRef < b.termRef ? -1 : 1;
  return 0;
}

/** Stable key for concept identity, used only to deduplicate inside a builder. */
export function interoperabilitySemanticRequirementKey(
  requirement: InteroperabilitySemanticRequirement,
): string {
  return JSON.stringify([requirement.namespace, requirement.termRef]);
}

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
export function collectInteroperabilitySemanticRequirements(
  refs: readonly CanonicalSemanticRef[] | undefined,
  into: Map<string, InteroperabilitySemanticRequirement>,
): void {
  if (!Array.isArray(refs)) return;
  for (const ref of Array.from(refs)) {
    if (!isPlainObject(ref) || !isNonBlankString(ref.namespace) || !isNonBlankString(ref.termRef)) continue;
    const requirement: InteroperabilitySemanticRequirement = {
      namespace: ref.namespace,
      termRef: ref.termRef,
    };
    into.set(interoperabilitySemanticRequirementKey(requirement), requirement);
  }
}
