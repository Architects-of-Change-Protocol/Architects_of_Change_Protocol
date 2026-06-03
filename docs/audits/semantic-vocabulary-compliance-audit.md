# Semantic Vocabulary Compliance Audit

Date: 2026-06-03

## Compliance finding

The canonical semantic vocabulary layer is compliant with the RFC-005 public trust model because it adds only descriptive contracts for semantic terms, categories, references, vocabularies, and profiles. It does not add runtime behavior, graph behavior, search behavior, scoring, verification, authority derivation, standing evaluation, or decision logic.

## Why vocabulary is not ontology

Vocabulary names concepts and provides portable descriptions. Ontology defines formal relationships, constraints, and reasoning rules between concepts. The implemented vocabulary contracts contain no relationship logic, no inference rules, no graph traversal, and no ontology resolution engine.

## Why vocabulary is not trust evaluation

Trust evaluation determines whether evidence, claims, attestations, verifications, standing, capabilities, or authority should be accepted in context. The vocabulary contracts only attach optional semantic references and descriptive profiles. They do not verify evidence, compute confidence, evaluate standing, rank artifacts, or produce trust scores.

## Why vocabulary is not authority

Authority is the recognized ability to act or decide in a defined context. The semantic vocabulary layer can name authority-related concepts, but it does not issue authority, resolve authority, derive authority from capabilities, evaluate policy, or authorize actions.

## Why vocabulary is not decision

Decisions are determinations taken under authority. The semantic vocabulary layer contains no decision engine, no approval workflow, no policy evaluation order, and no outcome calculation. It can reference decision concepts for explainability only.

## Why vocabulary is not standing

Standing describes a claim's accepted state in a context. Vocabulary does not determine whether standing is active, expired, suspended, revoked, superseded, invalid, or not yet active. It only provides a shared language that other layers may reference.

## Why vocabulary improves explainability

Vocabulary improves explainability by giving independent systems shared identifiers and labels for concepts. A claim, proof, credential, evidence artifact, or registry entry can point at semantic references without embedding private logic. This makes portable artifacts easier to read, audit, document, and interoperate across implementations while preserving the boundary between public contracts and Enterprise behavior.

## Public / private boundary

Public Main owns:

- semantic terms
- semantic categories
- semantic references
- semantic vocabularies
- semantic profiles

Enterprise owns:

- semantic search
- semantic reasoning
- knowledge graphs
- trust graphs
- entity resolution
- taxonomy resolution
- ontology engines
- relationship scoring
- semantic ranking
- semantic inference
- AI classification
- vector search
- LLM semantic interpretation

## Boundary review

The implemented public contracts are TypeScript type/interface declarations only. They include optional `semanticRefs` on selected canonical contracts and profile contracts that describe common associations. They do not include generators, functions, classes, resolvers, evaluators, indexes, embeddings, model integrations, scoring fields, authority resolvers, standing evaluators, decision engines, or taxonomy engines.

## Compliance conclusion

The semantic vocabulary layer increases RFC-005 interoperability and explainability while preserving the public/private boundary. Public Main now owns the portable language for semantic reference. Enterprise remains the owner of semantic interpretation, inference, search, graphs, ranking, and runtime classification.
