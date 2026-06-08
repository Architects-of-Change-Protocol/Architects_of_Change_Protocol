# AOC Constitution

**Constitution Version:** v2.0

**Status:** Ratified

**Supreme authority:** This document is the canonical constitutional authority for the Architects of Change Protocol repository.

## 1. Constitutional authority

The AOC Constitution governs architectural laws, ownership domains, compatibility authorities, transitional authorities, enforcement scanners, CI gates, release gates, and amendment procedure. If another constitutional artifact conflicts with this document, this document controls until a ratified amendment updates it.

## 2. Referenced constitutional artifacts

The following documents are incorporated into the Constitution by reference:

- `docs/constitution/ARCHITECTURAL-LAWS.md`
- `docs/constitution/BOUNDARY-VIOLATION-CATALOG.md`
- `docs/constitution/BOUNDARY-ENFORCEMENT-MATRIX.md`
- `docs/constitution/CONSTITUTIONAL-BOUNDARY-POLICY.md`
- `docs/constitution/AMENDMENT-PROCEDURE.md`
- `docs/constitution/AMENDMENT-CATALOG.md`
- `docs/constitution/CONSTITUTIONAL-AUTHORITIES.md`
- `docs/constitution/CONSTITUTION-VERSION-HISTORY.md`
- `docs/constitution/CAPABILITY-CONSTITUTION.md`
- `docs/constitution/CAPABILITY-AUTHORITIES.md`
- `docs/constitution/CAPABILITY-LIFECYCLE.md`
- `docs/constitution/CAPABILITY-DELEGATION-POLICY.md`
- `docs/constitution/CAPABILITY-REVOCATION-POLICY.md`
- `docs/constitution/CAPABILITY-VIOLATION-CATALOG.md`

## 3. Constitutional principles

1. The Constitution is enforceable through scanners, tests, CI gates, and release gates.
2. The Constitution is versioned with explicit major and minor version semantics.
3. The Constitution is auditable through an amendment catalog and version history.
4. The Constitution is amendable only through the amendment procedure.
5. The Constitution is traceable from law, authority, ownership, policy, and capability changes to ratified amendment records.
6. Authority existence and capability possession are distinct; all runtime power is deny-by-default unless constitutionally cataloged and assigned.

## 4. Versioning model

Constitution versions use `vMAJOR.MINOR` format.

### Minor amendments

Minor amendments increment `v1.0` to `v1.1` and may cover clarifications, documentation corrections, additional examples, and scanner implementation details that do not alter laws, ownership models, dependency models, or constitutional authorities.

### Major amendments

Major amendments increment `v1.x` to `v2.0` and are required for new laws, removed laws, ownership model changes, dependency model changes, new constitutional authorities, or removed constitutional authorities.

## 5. Amendment authority

No law, authority, ownership domain, compatibility authority, composition authority, violation catalog entry, enforcement matrix entry, or constitutional policy may be changed unless:

1. an amendment record exists in `AMENDMENT-CATALOG.md`;
2. the Constitution version is updated when the amendment type requires it;
3. `CONSTITUTION-VERSION-HISTORY.md` records the version and amendment;
4. ratification status is recorded; and
5. amendments affecting `LAW-001+` are ratified before release.

## 6. Ratification statuses

Valid amendment statuses are:

- `Ratified`
- `Pending`
- `Rejected`
- `Superseded`

Only `Ratified` amendments may authorize release-impacting changes to `LAW-001+`, ownership domains, authorities, or boundary policy.

## 7. Authority lifecycle

Every constitutional authority must have an owner, purpose, creation amendment, retirement amendment, and status. Valid authority statuses are `Canonical`, `Transitional`, `Deprecated`, and `Retired`.

## 8. Transitional authority ceiling

Transitional authorities are temporary and closed. They may not be expanded by convention, code placement, scanner allowlists, package creation, or institutional memory. Creating or removing a transitional authority requires a ratified constitutional amendment.

## 9. Capability authority governance

Every capability authority must have a unique identifier, class, owner, delegation posture, revocation posture, creation amendment, retirement amendment, and status. Capability definitions and assignments may be created or changed only through Type B or Type C amendments as defined by the amendment procedure. Constitutional capabilities are non-delegable. Suspended, revoked, and retired assignments confer no active power.

## 10. Release governance

`validate:release` must run constitutional amendment validation before publishability validation. The aggregate AOC boundary gate must include amendment, version, authority, capability authority, capability delegation, capability governance, and capability revocation scanners. Capability governance validation must complete before publishability validation.
