"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY = exports.AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID = exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES = exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_TERMS = exports.AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE = void 0;
exports.getAocSovereigntySemanticTerm = getAocSovereigntySemanticTerm;
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
exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE = 'aoc.sovereignty';
const term = (id, name, description) => Object.freeze({
    id,
    name,
    description,
    namespace: exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE,
});
/**
 * Canonical term ids, exported so a consumer can name a concept without
 * string-matching a display name.
 */
exports.AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS = Object.freeze({
    sovereignSubject: 'aoc.sovereignty:sovereign-subject',
    sovereignAssetIdentity: 'aoc.sovereignty:sovereign-asset-identity',
    externalReference: 'aoc.sovereignty:external-reference',
    contentIdentity: 'aoc.sovereignty:content-identity',
    sovereignManifest: 'aoc.sovereignty:sovereign-manifest',
    originAssertion: 'aoc.sovereignty:origin-assertion',
    authorshipAssertion: 'aoc.sovereignty:authorship-assertion',
    derivationAssertion: 'aoc.sovereignty:derivation-assertion',
    claimStanding: 'aoc.sovereignty:claim-standing',
    portableSovereignRepresentation: 'aoc.sovereignty:portable-sovereign-representation',
});
const TERM_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_TERM_IDS;
/**
 * The ten concepts needed to understand the first four production
 * representation layers.
 *
 * Descriptions state what each concept *is* inside AOC and, where the
 * distinction matters most, what it is not. They are factual and
 * mineral-boundary-safe: none of them draws a legal conclusion, asserts that an
 * assertion is true, or implies that understanding a concept means trusting it.
 */
exports.AOC_SOVEREIGNTY_SEMANTIC_TERMS = Object.freeze([
    term(TERM_IDS.sovereignSubject, 'Sovereign Subject', 'The single thing a sovereign representation is about. A subject may be a file, a building, an '
        + 'external system resource, an autonomous agent or anything else; the Protocol places no '
        + 'restriction on what kind of thing it is, and reads no meaning from the namespace it came from.'),
    term(TERM_IDS.sovereignAssetIdentity, 'Sovereign Asset Identity', 'A Protocol-stable identity for the sovereign subject, independent of provider, locator and '
        + 'content digest. It is minted once and never changes when the subject moves, when its bytes '
        + 'change, or when a new representation of it is produced somewhere else.'),
    term(TERM_IDS.externalReference, 'External Reference', 'How some other namespace refers to the same sovereign subject, carried as opaque data. It is '
        + 'preserved exactly, never dereferenced, and is never the subject identity — two systems naming '
        + 'one subject differently does not make it two subjects.'),
    term(TERM_IDS.contentIdentity, 'Content Identity', 'An integrity commitment to one particular byte representation of a subject. It is not the '
        + 'sovereign identity: a subject whose bytes change keeps its identity and gains a different '
        + 'content commitment, and a subject with no bytes at all has an identity and no commitment.'),
    term(TERM_IDS.sovereignManifest, 'Sovereign Manifest', 'The versioned record describing one state of a sovereign subject: its identity, the registrant '
        + 'that recorded it, any content commitment, and any assertions embedded at that version. A '
        + 'manifest may be presented unsigned or wrapped with a proof.'),
    term(TERM_IDS.originAssertion, 'Origin Assertion', 'An attributable statement about where or how a sovereign subject came to exist. It records that '
        + 'an issuer asserted the origin; it does not establish that the asserted origin is historically '
        + 'or legally accurate.'),
    term(TERM_IDS.authorshipAssertion, 'Authorship Assertion', 'An attributable statement of authorship or other non-governance standing over a sovereign '
        + 'subject. It records what an issuer asserted, and on its own establishes no legal title and no '
        + 'permission to act.'),
    term(TERM_IDS.derivationAssertion, 'Derivation Assertion', 'An attributable statement that one sovereign subject derives from one or more other sovereign '
        + 'subjects. It records the asserted relationship only: nothing travels along the edge, and it '
        + 'establishes no legal authorization and no licence to have performed the derivation.'),
    term(TERM_IDS.claimStanding, 'Claim Standing', 'A status record about a claim, including the case where a competing assertion exists against it. '
        + 'Standing preserves the claim and its evidence as history: it neither removes the claim nor '
        + 'settles the dispute it describes.'),
    term(TERM_IDS.portableSovereignRepresentation, 'Portable Sovereign Representation', 'A deterministic representation of the sovereign artifacts a caller supplied for one subject, '
        + 'able to be reconstructed in another environment as the same representation without reminting '
        + 'the subject. It carries what was supplied, and never claims to be a complete history.'),
]);
const category = (id, name, description, termRefs) => Object.freeze({
    id,
    name,
    description,
    namespace: exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE,
    termRefs: Object.freeze([...termRefs]),
});
exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS = Object.freeze({
    identity: 'aoc.sovereignty:identity-semantics',
    integrity: 'aoc.sovereignty:integrity-semantics',
    provenance: 'aoc.sovereignty:provenance-semantics',
    portability: 'aoc.sovereignty:portability-semantics',
});
const CATEGORY_IDS = exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORY_IDS;
/**
 * Terms grouped by the mineral whose contract they belong to.
 *
 * Grouping is documentation, not machinery. A category holds term references
 * and a description; it resolves no taxonomy, implies no hierarchy between
 * minerals, and is never consulted to decide anything.
 */
exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES = Object.freeze([
    category(CATEGORY_IDS.identity, 'Identity Semantics', 'Concepts describing what a sovereign subject is and how it is named, independent of its bytes.', [
        TERM_IDS.sovereignSubject,
        TERM_IDS.sovereignAssetIdentity,
        TERM_IDS.externalReference,
        TERM_IDS.sovereignManifest,
    ]),
    category(CATEGORY_IDS.integrity, 'Integrity Semantics', 'Concepts describing commitments to an exact byte representation of a subject.', [TERM_IDS.contentIdentity]),
    category(CATEGORY_IDS.provenance, 'Provenance Semantics', 'Concepts describing attributable assertions about a subject and the recorded status of those '
        + 'assertions.', [
        TERM_IDS.originAssertion,
        TERM_IDS.authorshipAssertion,
        TERM_IDS.derivationAssertion,
        TERM_IDS.claimStanding,
    ]),
    category(CATEGORY_IDS.portability, 'Portability Semantics', 'Concepts describing how a sovereign representation travels between environments intact.', [TERM_IDS.portableSovereignRepresentation]),
]);
exports.AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID = 'aoc.sovereignty:core-vocabulary';
/**
 * The frozen canonical vocabulary AOC.INTEROPERABILITY publishes.
 *
 * Deterministic and immutable: the same value on every import, in every
 * process, with no clock, no environment lookup and no generated identifier
 * anywhere inside it.
 */
exports.AOC_SOVEREIGNTY_CORE_SEMANTIC_VOCABULARY = Object.freeze({
    id: exports.AOC_SOVEREIGNTY_SEMANTIC_VOCABULARY_ID,
    name: 'AOC Sovereignty Core Vocabulary',
    description: 'The Protocol-owned meanings of the concepts that appear in an AOC sovereign representation: '
        + 'what a sovereign subject and its identity are, what a content commitment does and does not '
        + 'say, what an attributable assertion records, what a standing record preserves, and what a '
        + 'portable representation carries. Descriptive only: it states meanings and takes no action on '
        + 'them.',
    namespace: exports.AOC_SOVEREIGNTY_SEMANTIC_NAMESPACE,
    categories: exports.AOC_SOVEREIGNTY_SEMANTIC_CATEGORIES,
});
const TERMS_BY_ID = new Map(exports.AOC_SOVEREIGNTY_SEMANTIC_TERMS.map((entry) => [entry.id, entry]));
/**
 * Looks up one canonical term by id. Total with `undefined` for an unknown id:
 * this is a lookup over a closed constant set, never a resolver that would go
 * looking for a definition somewhere else.
 */
function getAocSovereigntySemanticTerm(id) {
    return TERMS_BY_ID.get(id);
}
