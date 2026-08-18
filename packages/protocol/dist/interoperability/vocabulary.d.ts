import type { CanonicalSemanticCategory, CanonicalSemanticNamespace, CanonicalSemanticTerm, CanonicalSemanticVocabulary, CanonicalSemanticVocabularyId } from '../claims/vocabulary';
/**
 * The canonical AOC sovereignty semantic vocabulary.
 *
 * ## Why this exists
 *
 * A receiving system holding an AOC portability bundle can read its field names
 * — `sovereignAssetId`, `contentIdentity`, `assertedOrigin` — and still not know
 * what any of them *mean*, or which of them it is safe to treat as equivalent
 * to something it already models. Field names are not semantics. This
 * vocabulary is the Protocol-owned statement of what the concepts in a
 * sovereign representation mean, written so another developer or another system
 * can read it without ever opening AOC source code.
 *
 * ## What it is built from
 *
 * `CanonicalSemanticTerm`, `CanonicalSemanticCategory` and
 * `CanonicalSemanticVocabulary` — the existing contracts from
 * `@aoc/protocol/claims`, which were designed for exactly this and are reused
 * rather than mirrored. There is no `InteropSemanticTerm`, no
 * `InteropVocabulary` and no parallel semantic model: two semantic models for
 * one Protocol is how two descriptions of one concept start to disagree.
 *
 * ## What it deliberately does not do
 *
 * It describes meaning and nothing else, preserving the behaviour-free
 * philosophy the claims-layer vocabulary contracts were written under. Nothing
 * here classifies runtime data, resolves an ontology, walks a graph, scores
 * confidence, derives authority, evaluates a rule or reaches a conclusion. A
 * term states what a concept means; what a consuming system *does* about that
 * meaning is the consuming system's business.
 *
 * It is also not a ninth Sovereignty Capability. The canonical inventory stays
 * at eight; this vocabulary is an artifact that supports AOC.INTEROPERABILITY,
 * the same way the portability bundle is an artifact that supports
 * AOC.PORTABILITY.
 *
 * ## Identifiers
 *
 * Every id is an explicit, stable Protocol constant. Nothing is minted at
 * import time: a vocabulary whose term ids changed per process could never be
 * referenced from a claim, a support declaration or a compatibility report, and
 * a `randomUUID()` here would silently break every consumer on every restart.
 */
export declare const AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE: CanonicalSemanticNamespace;
/**
 * Canonical term ids, exported so a consumer can name a concept without
 * string-matching a display name.
 */
export declare const AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS: Readonly<{
    readonly sovereignSubject: "aoc.sovereignty:sovereign-subject";
    readonly sovereignAssetIdentity: "aoc.sovereignty:sovereign-asset-identity";
    readonly externalReference: "aoc.sovereignty:external-reference";
    readonly contentIdentity: "aoc.sovereignty:content-identity";
    readonly sovereignManifest: "aoc.sovereignty:sovereign-manifest";
    readonly originAssertion: "aoc.sovereignty:origin-assertion";
    readonly authorshipAssertion: "aoc.sovereignty:authorship-assertion";
    readonly derivationAssertion: "aoc.sovereignty:derivation-assertion";
    readonly claimStanding: "aoc.sovereignty:claim-standing";
    readonly portableSovereignRepresentation: "aoc.sovereignty:portable-sovereign-representation";
}>;
export type AocSovereigntySemanticTermId = (typeof AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS)[keyof typeof AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS];
/**
 * The ten concepts needed to understand the first four production
 * representation layers.
 *
 * Descriptions state what each concept *is* inside AOC and, where the
 * distinction matters most, what it is not. They are factual and
 * mineral-boundary-safe: none of them draws a legal conclusion, asserts that an
 * assertion is true, or implies that understanding a concept means trusting it.
 */
export declare const AOC_SOVEREIGNTY_SEMANTIC_TERMS: readonly CanonicalSemanticTerm[];
export declare const AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS: Readonly<{
    readonly identity: "aoc.sovereignty:identity-semantics";
    readonly integrity: "aoc.sovereignty:integrity-semantics";
    readonly provenance: "aoc.sovereignty:provenance-semantics";
    readonly portability: "aoc.sovereignty:portability-semantics";
}>;
/**
 * Terms grouped by the mineral whose contract they belong to.
 *
 * Grouping is documentation, not machinery. A category holds term references
 * and a description; it resolves no taxonomy, implies no hierarchy between
 * minerals, and is never consulted to decide anything.
 */
export declare const AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES: readonly CanonicalSemanticCategory[];
export declare const AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID: CanonicalSemanticVocabularyId;
/**
 * The frozen canonical vocabulary AOC.INTEROPERABILITY publishes.
 *
 * Deterministic and immutable: the same value on every import, in every
 * process, with no clock, no environment lookup and no generated identifier
 * anywhere inside it.
 */
export declare const AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY: CanonicalSemanticVocabulary;
/**
 * Looks up one canonical term by id. Total with `undefined` for an unknown id:
 * this is a lookup over a closed constant set, never a resolver that would go
 * looking for a definition somewhere else.
 */
export declare function getAocSovereigntySemanticTerm(id: string): CanonicalSemanticTerm | undefined;
//# sourceMappingURL=vocabulary.d.ts.map