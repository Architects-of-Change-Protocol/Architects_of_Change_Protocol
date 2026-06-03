# Canonical Semantic Vocabulary

The canonical semantic vocabulary layer gives RFC-005 contracts a shared language for concepts, meanings, labels, classifications, and semantic references.

## What vocabulary is

Vocabulary is a portable set of named terms and descriptive groupings. It lets protocol contracts say, "this artifact references this concept," without embedding the full term definition everywhere.

Public vocabulary contracts define:

- semantic identifiers
- semantic terms
- semantic categories
- semantic vocabularies
- semantic references
- descriptive vocabulary profiles for claims, evidence, proofs, credentials, and registries

## What vocabulary is not

Vocabulary is not an execution system. It does not:

- reason or infer
- verify or validate truth
- score or rank
- authorize or deny
- derive standing, capability, or authority
- make decisions
- classify artifacts at runtime
- resolve entities, taxonomies, or ontologies
- perform graph traversal, semantic search, vector search, embeddings, or LLM interpretation

## Vocabulary, taxonomy, ontology, trust evaluation, authority, and decision

| Layer | Meaning | Public vocabulary boundary |
| --- | --- | --- |
| Vocabulary | Named terms and descriptions. | Public Main owns this layer. |
| Taxonomy | Hierarchical arrangement or resolution of categories. | Enterprise-owned when resolution behavior is required. |
| Ontology | Formal relationships, constraints, and reasoning over concepts. | Enterprise-owned when relationship semantics or inference are required. |
| Trust evaluation | Verification, scoring, standing, or confidence determination. | Out of scope for vocabulary. |
| Authority | Governed ability to act or decide in context. | Out of scope for vocabulary. |
| Decision | Action or determination taken under authority. | Out of scope for vocabulary. |

## Public / private boundary

Public Main owns semantic terms, semantic categories, semantic references, semantic vocabularies, and semantic profiles.

Enterprise owns semantic search, semantic reasoning, knowledge graphs, trust graphs, entity resolution, taxonomy resolution, ontology engines, relationship scoring, semantic ranking, semantic inference, AI classification, vector search, and LLM semantic interpretation.
