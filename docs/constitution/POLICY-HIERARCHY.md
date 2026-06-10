# Policy Hierarchy

**Constitution Version:** v16.0

## Constitutional order

```text
Constitution
↓
Constitutional Policies
↓
Governance Policies
↓
Runtime Policies
↓
Operational Policies
```

Lower policy classes may narrow higher rules. They may not expand authority, remove a parent condition, authorize a forbidden action, reduce the parent's constraint strength, or apply beyond the parent capability scope when an inheritance relationship is declared.

## Inheritance registry

| Inheritance ID | Parent Policy | Child Policy | Relationship | Amendment | Status |
|---|---|---|---|---|---|
| PIN-0001 | POL-0001 | POL-0002 | Narrows | AOC-AMD-0003 | Active |
| PIN-0002 | POL-0001 | POL-0003 | Narrows | AOC-AMD-0003 | Active |
| PIN-0003 | POL-0001 | POL-0004 | Narrows | AOC-AMD-0003 | Active |
| PIN-0004 | POL-0004 | POL-0005 | Narrows | AOC-AMD-0003 | Active |
| PIN-0005 | POL-0004 | POL-0006 | Narrows | AOC-AMD-0003 | Active |
| PIN-0006 | POL-0004 | POL-0007 | Narrows | AOC-AMD-0003 | Active |
| PIN-0007 | POL-0004 | POL-0008 | Narrows | AOC-AMD-0003 | Active |
| PIN-0008 | POL-0004 | POL-0009 | Narrows | AOC-AMD-0003 | Active |
| PIN-0009 | POL-0004 | POL-0010 | Narrows | AOC-AMD-0003 | Active |
| PIN-0010 | POL-0004 | POL-0011 | Narrows | AOC-AMD-0003 | Active |
| PIN-0011 | POL-0001 | POL-0012 | Narrows | AOC-AMD-0003 | Active |

## Inheritance evaluation

A valid child has a class at or below its parent, an applicable capability set contained by its parent, equal or greater constraint strength, and `Relationship: Narrows`. Cycles, self-parenting, unknown policies, inactive links, and widening relationships are hierarchy violations. Ambiguity fails closed.
