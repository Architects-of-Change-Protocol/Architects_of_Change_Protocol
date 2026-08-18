import type {
  CanonicalSemanticCategory,
  CanonicalSemanticCategoryId,
  CanonicalSemanticNamespace,
  CanonicalSemanticTerm,
  CanonicalSemanticTermId,
  CanonicalSemanticVocabulary,
  CanonicalSemanticVocabularyId,
} from '../claims/vocabulary';

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
export const AOC_LICENSING_SEMANTIC_NAMESPACE: CanonicalSemanticNamespace = 'aoc.licensing';

const term = (
  id: CanonicalSemanticTermId,
  name: string,
  description: string,
): CanonicalSemanticTerm =>
  Object.freeze({
    id,
    name,
    description,
    namespace: AOC_LICENSING_SEMANTIC_NAMESPACE,
  });

/**
 * The concepts describing the licensing declaration itself and the three
 * clause effects it can carry.
 */
export const AOC_LICENSING_DECLARATION_TERM_IDS = Object.freeze({
  licenseTermsDeclaration: 'aoc.licensing:license-terms-declaration',
  permissionRule: 'aoc.licensing:permission-rule',
  restrictionRule: 'aoc.licensing:restriction-rule',
  obligationRule: 'aoc.licensing:obligation-rule',
} as const);

export type AocLicensingDeclarationTermId =
  (typeof AOC_LICENSING_DECLARATION_TERM_IDS)[keyof typeof AOC_LICENSING_DECLARATION_TERM_IDS];

/**
 * The Protocol-owned *action* concepts a rule may be about.
 *
 * A starting core, never a ceiling. External namespaces remain first-class:
 * `example.real-estate:lease`, `example.api:invoke`, `example.ai:fine-tune`,
 * `example.token:transfer` and `future-system:quantum-copy` are all valid
 * actions that Protocol preserves exactly and never claims to understand.
 */
export const AOC_LICENSING_ACTION_TERM_IDS = Object.freeze({
  access: 'aoc.licensing:access',
  use: 'aoc.licensing:use',
  reproduce: 'aoc.licensing:reproduce',
  distribute: 'aoc.licensing:distribute',
  display: 'aoc.licensing:display',
  perform: 'aoc.licensing:perform',
  modify: 'aoc.licensing:modify',
  derive: 'aoc.licensing:derive',
  commercialUse: 'aoc.licensing:commercial-use',
  sublicense: 'aoc.licensing:sublicense',
  attribute: 'aoc.licensing:attribute',
} as const);

export type AocLicensingActionTermId =
  (typeof AOC_LICENSING_ACTION_TERM_IDS)[keyof typeof AOC_LICENSING_ACTION_TERM_IDS];

/** Every canonical `aoc.licensing` term id, declaration concepts first, in stable order. */
export const AOC_LICENSING_SEMANTIC_TERM_IDS = Object.freeze({
  ...AOC_LICENSING_DECLARATION_TERM_IDS,
  ...AOC_LICENSING_ACTION_TERM_IDS,
} as const);

export type AocLicensingSemanticTermId = AocLicensingDeclarationTermId | AocLicensingActionTermId;

const TERM_IDS = AOC_LICENSING_SEMANTIC_TERM_IDS;

/**
 * The fifteen concepts SM-09 publishes.
 *
 * Descriptions state what each concept *is* and, where the distinction is
 * load-bearing, what it is not. None of them draws a legal conclusion, asserts
 * that a declaration is true or authorized, or implies that understanding a
 * concept means acting on it.
 */
export const AOC_LICENSING_SEMANTIC_TERMS: readonly CanonicalSemanticTerm[] = Object.freeze([
  term(
    TERM_IDS.licenseTermsDeclaration,
    'License Terms Declaration',
    'An attributable, structured statement of the permissions, restrictions and obligations an issuer '
      + 'declares over a sovereign subject. It records what was declared and by whom; it establishes no '
      + 'legal ownership, grants no access, and is not a decision about whether any action is allowed.',
  ),
  term(
    TERM_IDS.permissionRule,
    'Permission Rule',
    'A clause declaring an action permitted under the terms. It is a declaration, not a runtime grant: '
      + 'it issues no capability, token, credential or access, and produces no authorization result.',
  ),
  term(
    TERM_IDS.restrictionRule,
    'Restriction Rule',
    'A clause declaring an action restricted under the terms. It is a declaration, not an enforced '
      + 'denial: nothing is blocked, revoked, disabled or prevented by its presence.',
  ),
  term(
    TERM_IDS.obligationRule,
    'Obligation Rule',
    'A clause declaring an action required under the terms. It is a declaration, not evidence of '
      + 'compliance: it does not establish that the required action was ever performed.',
  ),
  term(TERM_IDS.access, 'Access', 'Obtaining access to the subject or its representation.'),
  term(TERM_IDS.use, 'Use', 'Using the subject for its ordinary purpose.'),
  term(TERM_IDS.reproduce, 'Reproduce', 'Making copies of the subject or its representation.'),
  term(TERM_IDS.distribute, 'Distribute', 'Providing the subject or its representation to others.'),
  term(TERM_IDS.display, 'Display', 'Presenting the subject visually to an audience.'),
  term(TERM_IDS.perform, 'Perform', 'Presenting the subject as a performance to an audience.'),
  term(TERM_IDS.modify, 'Modify', 'Altering the subject or its representation.'),
  term(
    TERM_IDS.derive,
    'Derive',
    'Producing a new subject from this one. A declaration about deriving says nothing about what terms '
      + 'the resulting subject carries: nothing is inherited along a derivation edge.',
  ),
  term(
    TERM_IDS.commercialUse,
    'Commercial Use',
    'Using the subject in a commercial context. Protocol assigns no price, computes no royalty and '
      + 'settles no payment for it.',
  ),
  term(
    TERM_IDS.sublicense,
    'Sublicense',
    'Declaring further terms over the subject to a further audience. Protocol neither performs nor '
      + 'validates a sublicensing chain.',
  ),
  term(
    TERM_IDS.attribute,
    'Attribute',
    'Crediting an asserted author or source. Protocol records the concept; it never checks that '
      + 'attribution happened.',
  ),
]);

const category = (
  id: CanonicalSemanticCategoryId,
  name: string,
  description: string,
  termRefs: readonly CanonicalSemanticTermId[],
): CanonicalSemanticCategory =>
  Object.freeze({
    id,
    name,
    description,
    namespace: AOC_LICENSING_SEMANTIC_NAMESPACE,
    termRefs: Object.freeze([...termRefs]),
  });

export const AOC_LICENSING_SEMANTIC_CATEGORY_IDS = Object.freeze({
  declaration: 'aoc.licensing:declaration-semantics',
  effect: 'aoc.licensing:effect-semantics',
  action: 'aoc.licensing:action-semantics',
} as const);

const CATEGORY_IDS = AOC_LICENSING_SEMANTIC_CATEGORY_IDS;

/**
 * Terms grouped by the part of a declaration they describe.
 *
 * Grouping is documentation, not machinery: a category holds term references
 * and a description, resolves no taxonomy and is never consulted to decide
 * anything.
 */
export const AOC_LICENSING_SEMANTIC_CATEGORIES: readonly CanonicalSemanticCategory[] = Object.freeze([
  category(
    CATEGORY_IDS.declaration,
    'Licensing Declaration Semantics',
    'What a structured terms declaration over a sovereign subject is, and what it does not establish.',
    [TERM_IDS.licenseTermsDeclaration],
  ),
  category(
    CATEGORY_IDS.effect,
    'Licensing Effect Semantics',
    'What each clause effect declares — and, in every case, what it deliberately does not do.',
    [TERM_IDS.permissionRule, TERM_IDS.restrictionRule, TERM_IDS.obligationRule],
  ),
  category(
    CATEGORY_IDS.action,
    'Licensing Action Semantics',
    'The Protocol-owned core action concepts a clause may be about. Not exhaustive: external '
      + 'namespaces are equally valid and are preserved without being understood.',
    [
      TERM_IDS.access,
      TERM_IDS.use,
      TERM_IDS.reproduce,
      TERM_IDS.distribute,
      TERM_IDS.display,
      TERM_IDS.perform,
      TERM_IDS.modify,
      TERM_IDS.derive,
      TERM_IDS.commercialUse,
      TERM_IDS.sublicense,
      TERM_IDS.attribute,
    ],
  ),
]);

export const AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID: CanonicalSemanticVocabularyId =
  'aoc.licensing:license-terms-vocabulary';

/**
 * The frozen canonical licensing vocabulary SM-09 publishes.
 *
 * Deterministic and immutable: the same value on every import, in every
 * process, with no clock, no environment lookup and no generated identifier
 * anywhere inside it.
 */
export const AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY: CanonicalSemanticVocabulary = Object.freeze({
  id: AOC_LICENSE_TERMS_SEMANTIC_VOCABULARY_ID,
  name: 'AOC Licensing & Terms Vocabulary',
  description:
    'The Protocol-owned meanings of the concepts that appear in a structured sovereign license terms '
    + 'declaration: what such a declaration is, what a permission, restriction and obligation clause '
    + 'each declare, and a non-exhaustive core of action concepts a clause may be about. Descriptive '
    + 'only: it states meanings, and evaluates, decides and enforces nothing.',
  namespace: AOC_LICENSING_SEMANTIC_NAMESPACE,
  categories: AOC_LICENSING_SEMANTIC_CATEGORIES,
});

const TERMS_BY_ID: ReadonlyMap<string, CanonicalSemanticTerm> = new Map(
  AOC_LICENSING_SEMANTIC_TERMS.map((entry) => [entry.id, entry]),
);

const ACTION_TERM_IDS: ReadonlySet<string> = new Set<string>(Object.values(AOC_LICENSING_ACTION_TERM_IDS));

/**
 * Looks up one canonical licensing term by id. Total with `undefined` for an
 * unknown id: a lookup over a closed constant set, never a resolver that would
 * go looking for a definition somewhere else.
 */
export function getAocLicensingSemanticTerm(id: string): CanonicalSemanticTerm | undefined {
  return TERMS_BY_ID.get(id);
}

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
export function isAocLicensingActionTermId(value: unknown): value is AocLicensingActionTermId {
  return typeof value === 'string' && ACTION_TERM_IDS.has(value);
}
