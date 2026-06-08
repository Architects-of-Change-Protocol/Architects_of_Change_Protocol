# Constitutional Amendment Procedure

**Constitution Version:** v3.0

## Purpose

This procedure governs changes to the AOC Constitution, architectural laws, constitutional policy, ownership domains, authorities, enforcement matrix, and violation catalog.

## Amendment types

### Type A — Clarification Amendment

May modify documentation, examples, terminology, and scanner implementation details.

Must not modify laws, ownership models, dependency models, or constitutional authorities.

### Type B — Ownership, Capability Assignment, and Policy Administration Amendment

May modify ownership domains, authorized roots, compatibility authorities, transitional authorities, composition authorities, capability ownership, and assignments of delegable Governance, Runtime, or Operational capabilities without changing constitutional semantics; and policy ownership, application, delegation, or activation assignments that do not weaken or alter policy meaning.

Requires an impact assessment describing affected packages, scanner behavior, migration risk, and release risk.

### Type C — Constitutional Amendment

May modify `LAW-001+`, the violation catalog, enforcement matrix, constitutional boundary policy, constitutional versioning, the amendment procedure, capability classes, Constitutional capabilities, capability definitions, lifecycle semantics, delegation semantics, revocation semantics, capability enforcement obligations, policy creation or retirement, policy semantics, policy weakening, hierarchy semantics, conflict resolution, or exception authority.

Requires a version increment, migration plan, amendment catalog entry, version history entry, and ratification before release.

## Amendment record requirements

No capability or policy authority may be created outside amendment governance. Capability or policy creation and retirement are Type C. Delegable capability assignments and non-semantic policy ownership, application, delegation, or activation changes are Type B unless they alter constitutional meaning or weaken a constraint, in which case they are Type C.

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
