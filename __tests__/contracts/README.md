# Protocol contract drift fixtures

These fixtures are the PR-02 extraction baseline. They snapshot the contract shapes that exist before any protocol extraction, facade creation, import rewrite, runtime movement, or behavior refactor occurs.

## Why these fixtures exist

The extraction plan requires a stable record of today's canonical contract shapes before later PRs copy or expose those contracts through new package seams. These tests are deliberately limited to fixtures and assertions over already-exported contracts, schemas, parsers, and helper surfaces. They do not move files, rewrite imports, create validators, or change runtime behavior.

## How they protect extraction

Future extraction PRs must be able to prove that moving a contract behind a facade did not change its serialized shape. The snapshots in this directory capture:

- typed valid examples for stable canonical exports;
- invalid examples only where an existing parser, validator, or helper already supports invalid cases;
- JSON serialization output for the current fixture set;
- round-trip/parser coverage where the repository already exposes that behavior.

If a later PR introduces a new facade, it should compare the old source path used in `fixture-manifest.md` against the new facade output with the same fixture input. The old-path and new-facade serialized JSON should match unless the PR explicitly documents an intentional contract change.

## How future extraction PRs must compare old path vs new facade output

1. Keep the fixture input stable.
2. Import the old canonical source and the new facade in the same contract test.
3. Serialize both outputs with the same JSON serializer used by these tests.
4. Assert old-path output equals new-facade output.
5. Only update snapshots after documenting why the canonical contract changed.

## What to update when a canonical contract intentionally changes

When an approved contract change is intentional, update all of the following in the same PR:

- the typed fixture in `contract-fixtures.ts`;
- the serialized Jest snapshot;
- `fixture-manifest.md` with the new import/source, schema/version, stability, and notes;
- this README if the comparison process or fixture policy changes;
- any old-path vs new-facade parity tests added by later extraction PRs.

Do not add a fake fixture for a concept without a stable canonical export. Document the gap in `fixture-manifest.md` until a later contract PR creates the canonical export.
