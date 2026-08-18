import type { CanonicalSemanticCategory, CanonicalSemanticNamespace, CanonicalSemanticTerm, CanonicalSemanticVocabulary, CanonicalSemanticVocabularyId } from '../claims/vocabulary';
/**
 * The Protocol-owned licensing semantic vocabulary.
 *
 * ## Why a separate namespace
 *
 * `aoc.sovereignty` (SM-07) states what the concepts in a sovereign
 * *representation* mean — subject, identity, content commitment, assertion,
 * standing, portable representation. Licensing concepts are a different family
 * with a different lifecycle, and appending them to
 * `AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY` would change the SM-07 core
 * vocabulary — and by extension what the interoperability profile advertises —
 * because a *later* mineral shipped. `aoc.licensing` is therefore its own
 * namespace, discovered generically by the existing SM-07 machinery through
 * ordinary claim `semanticRefs`. The interoperability descriptor schema and
 * the profile are untouched by SM-09.
 *
 * ## What it is built from
 *
 * `CanonicalSemanticTerm`, `CanonicalSemanticCategory` and
 * `CanonicalSemanticVocabulary` — the same claims-layer contracts SM-07
 * reuses. There is no `LicenseTerm`, no `LicensingVocabulary` and no second
 * semantic framework.
 *
 * ## What it deliberately is not
 *
 * A dictionary, not a rulebook. A term states what a concept means; it grants
 * nothing, forbids nothing, and triggers no behaviour anywhere in Protocol.
 * The action terms below are **not exhaustive** and are not privileged at
 * runtime: `aoc.licensing:commercial-use` and
 * `example.real-estate:lease` travel through byte-identical code paths, and no
 * production branch anywhere reads an action id to decide what to do.
 *
 * It is also not a ninth Sovereignty Capability. The canonical inventory stays
 * at eight; this vocabulary is an artifact supporting AOC.LICENSING_TERMS the
 * way the portability bundle supports AOC.PORTABILITY.
 *
 * ## Identifiers
 *
 * Every id is an explicit, stable Protocol constant. Nothing is minted at
 * import time: a vocabulary whose ids changed per process could never be
 * referenced from a claim or a compatibility report.
 */
export declare const AOC_LICENSING_SEMANTIC_NAMESPACE: CanonicalSemanticNamespace;
/**
 * The concepts describing the licensing declaration itself and the three
 * clause effects it can carry.
 */
export declare const AOC_LICENSING_DECLARATION_TERM_IDS: Readonly<{
    readonly licenseTermsDeclaration: "aoc.licensing:license-terms-declaration";
    readonly permissionRule: "aoc.licensing:permission-rule";
    readonly restrictionRule: "aoc.licensing:restriction-rule";
    readonly obligationRule: "aoc.licensing:obligation-rule";
}>;
export type AocLicensingDeclarationTermId = (typeof AOC_LICENSING_DECLARATION_TERM_IDS)[keyof typeof AOC_LICENSING_DECLARATION_TERM_IDS];
/**
 * The Protocol-owned *action* concepts a rule may be about.
 *
 * A starting core, never a ceiling. External namespaces remain first-class:
 * `example.real-estate:lease`, `example.api:invoke`, `example.ai:fine-tune`,
 * `example.token:transfer` and `future-system:quantum-copy` are all valid
 * actions that Protocol preserves exactly and never claims to understand.
 */
export declare const AOC_LICENSING_ACTION_TERM_IDS: Readonly<{
    readonly access: "aoc.licensing:access";
    readonly use: "aoc.licensing:use";
    readonly reproduce: "aoc.licensing:reproduce";
    readonly distribute: "aoc.licensing:distribute";
    readonly display: "aoc.licensing:display";
    readonly perform: "aoc.licensing:perform";
    readonly modify: "aoc.licensing:modify";
    readonly derive: "aoc.licensing:derive";
    readonly commercialUse: "aoc.licensing:commercial-use";
    readonly sublicense: "aoc.licensing:sublicense";
    readonly attribute: "aoc.licensing:attribute";
}>;
export type AocLicensingActionTermId = (typeof AOC_LICENSING_ACTION_TERM_IDS)[keyof typeof AOC_LICENSING_ACTION_TERM_IDS];
/** Every canonical `aoc.licensing` term id, declaration concepts first, in stable order. */
export declare const AOC_LICENSING_SEMANTIC_TERM_IDS: Readonly<{
    readonly access: "aoc.licensing:access";
    readonly use: "aoc.licensing:use";
    readonly reproduce: "aoc.licensing:reproduce";
    readonly distribute: "aoc.licensing:distribute";
    readonly display: "aoc.licensing:display";
    readonly perform: "aoc.licensing:perform";
    readonly modify: "aoc.licensing:modify";
    readonly derive: "aoc.licensing:derive";
    readonly commercialUse: "aoc.licensing:commercial-use";
    readonly sublicense: "aoc.licensing:sublicense";
    readonly attribute: "aoc.licensing:attribute";
    readonly licenseTermsDeclaration: "aoc.licensing:license-terms-declaration";
    readonly permissionRule: "aoc.licensing:permission-rule";
    readonly restrictionRule: "aoc.licensing:restriction-rule";
    readonly obligationRule: "aoc.licensing:obligation-rule";
}>;
export type AocLicensingSemanticTermId = AocLicensingDeclarationTermId | AocLicensingActionTermId;
/**
 * The fifteen concepts SM-09 publishes.
 *
 * Descriptions state what each concept *is* and, where the distinction is
 * load-bearing, what it is not. None of them draws a legal conclusion, asserts
 * that a declaration is true or authorized, or implies that understanding a
 * concept means acting on it.
 */
export declare const AOC_LICENSING_SEMANTIC_TERMS: readonly CanonicalSemanticTerm[];
export declare const AOC_LICENSING_SEMANTIC_CATEGORY_IDS: Readonly<{
    readonly declaration: "aoc.licensing:declaration-semantics";
    readonly effect: "aoc.licensing:effect-semantics";
    readonly action: "aoc.licensing:action-semantics";
}>;
/**
 * Terms grouped by the part of a declaration they describe.
 *
 * Grouping is documentation, not machinery: a category holds term references
 * and a description, resolves no taxonomy and is never consulted to decide
 * anything.
 */
export declare const AOC_LICENSING_SEMANTIC_CATEGORIES: readonly CanonicalSemanticCategory[];
export declare const AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID: CanonicalSemanticVocabularyId;
/**
 * The frozen canonical licensing vocabulary SM-09 publishes.
 *
 * Deterministic and immutable: the same value on every import, in every
 * process, with no clock, no environment lookup and no generated identifier
 * anywhere inside it.
 */
export declare const AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY: CanonicalSemanticVocabulary;
/**
 * Looks up one canonical licensing term by id. Total with `undefined` for an
 * unknown id: a lookup over a closed constant set, never a resolver that would
 * go looking for a definition somewhere else.
 */
export declare function getAocLicensingSemanticTerm(id: string): CanonicalSemanticTerm | undefined;
/**
 * Whether an id is one of this version's canonical `aoc.licensing` **action**
 * concepts.
 *
 * This is the closed half of the open-world action model. Inside the
 * Protocol-owned namespace a misspelled concept — `aoc.licensing:comercial-use`
 * — is a mistake worth rejecting rather than silently accepting as a new
 * concept that nothing defines. Outside it, any structurally valid term is
 * accepted opaquely.
 *
 * The declaration/effect concepts (`license-terms-declaration`,
 * `permission-rule`, …) are deliberately *not* members: they describe the
 * document and its clause kinds, and naming one as the action a clause is
 * *about* is a category error the Protocol can catch for free. They remain
 * fully available as claim-level `semanticRefs`, which is where they belong.
 */
export declare function isAocLicensingActionTermId(value: unknown): value is AocLicensingActionTermId;
//# sourceMappingURL=vocabulary.d.ts.map