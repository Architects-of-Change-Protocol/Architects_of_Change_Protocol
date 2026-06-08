# Capability Constitution

**Constitution Version:** v6.0

**Status:** Ratified

## 1. Constitutional purpose

This Constitution makes runtime power explicit. A **Capability Authority** is a constitutional right to perform a specific category of runtime action. An authority's existence does not imply any capability; power exists only when this Constitution catalogs it and a valid capability assignment grants it.

This framework governs capability authority, ownership, delegation, restriction, suspension, revocation, retirement, and evolution. It does not implement runtime authorization, permissions, execution, policy, federation, standing, or governance engines.

## 2. Supreme rules

1. Capabilities are deny-by-default: an action not represented by a ratified capability is not constitutionally authorized.
2. Every capability has one unique `CAP-####` identifier and one class, owner, delegation posture, revocation posture, creation amendment, retirement amendment, and status.
3. Capability ownership and capability possession are distinct. The owner governs the definition; a holder receives only the power recorded by an assignment.
4. No owner may grant a power broader than the capability it owns, and no delegate may grant a power broader than it received.
5. Constitutional capabilities are not delegable.
6. Suspended, revoked, and retired capability assignments confer no active power.
7. A capability definition, class, owner, delegation rule, revocation rule, or assignment authority may change only through a ratified Type B or Type C amendment.
8. Capability governance records are auditable, versioned, fail-closed, and enforced before release.

## 3. Capability classes

| Class | Constitutional meaning | Delegation rule |
|---|---|---|
| Constitutional | Changes constitutional law, authorities, or enforcement. | Not Delegable |
| Governance | Creates or changes governance records and decisions. | Delegable only with ratified authority |
| Runtime | Creates protocol runtime records or assertions. | Delegable |
| Operational | Performs bounded technical operations. | Delegable |

No additional capability class may be recognized without a ratified Type C amendment, catalog update, and Constitution version update.

## 4. Constitutional records

The canonical records are:

- `CAPABILITY-AUTHORITIES.md`: capability definitions, assignments, and transition ledger.
- `CAPABILITY-LIFECYCLE.md`: lifecycle states and transition rules.
- `CAPABILITY-DELEGATION-POLICY.md`: delegation eligibility and restrictions.
- `CAPABILITY-REVOCATION-POLICY.md`: suspension and revocation authority.
- `CAPABILITY-VIOLATION-CATALOG.md`: violation identifiers and severities.

## 5. Restrictions

A capability may be constrained by holder, scope, duration, environment, resource, tenant, action, or delegation depth. Restrictions may only narrow authority. A restriction must never expand a capability, reactivate an inactive assignment, or bypass a non-delegable classification.

## 6. Evolution and amendment governance

- **Type B** amendments govern capability ownership, holder assignments, delegable Governance, Runtime, or Operational authority, and revocation authority where constitutional meaning does not change.
- **Type C** amendments govern capability classes, Constitutional capabilities, lifecycle semantics, delegation semantics, revocation semantics, enforcement obligations, and creation or retirement of capability definitions.

Every capability change must identify affected capability IDs in `Affected Authorities`, include migration and risk assessments, update the catalog, and update constitutional version history when required. No capability authority may be created by code, convention, documentation outside this directory, or an unratified amendment.

## 7. Enforcement

The aggregate boundary and release gates must execute capability authority, delegation, governance, and revocation scanners. Scanners fail closed when required records are missing, malformed, inconsistent, unauthorized, or inactive while still assigned or delegated.
