# Constitutional Amendment Procedure

**Constitution Version:** v1.0

## Purpose

This procedure governs changes to the AOC Constitution, architectural laws, constitutional policy, ownership domains, authorities, enforcement matrix, and violation catalog.

## Amendment types

### Type A — Clarification Amendment

May modify documentation, examples, terminology, and scanner implementation details.

Must not modify laws, ownership models, dependency models, or constitutional authorities.

### Type B — Ownership Amendment

May modify ownership domains, authorized roots, compatibility authorities, transitional authorities, and composition authorities.

Requires an impact assessment describing affected packages, scanner behavior, migration risk, and release risk.

### Type C — Constitutional Amendment

May modify `LAW-001+`, the violation catalog, enforcement matrix, constitutional boundary policy, constitutional versioning, or the amendment procedure itself.

Requires a version increment, migration plan, amendment catalog entry, version history entry, and ratification before release.

## Amendment record requirements

Every amendment record must contain:

- Amendment ID
- Title
- Author
- Date
- Type
- Version
- Affected Laws
- Affected Authorities
- Rationale
- Risk Assessment
- Migration Impact
- Ratification Status

## Version rules

Minor version increments are used for Type A amendments and scanner implementation details that preserve constitutional meaning.

Major version increments are used for Type B ownership model changes and Type C constitutional changes that alter laws, dependency direction, constitutional authorities, or enforcement obligations.

## Release rule

No law may be changed unless an amendment exists, the version exists, history is updated, the catalog is updated, and ratification is complete.
