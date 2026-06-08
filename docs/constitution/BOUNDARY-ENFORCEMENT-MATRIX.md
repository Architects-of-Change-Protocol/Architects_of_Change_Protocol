# Boundary Enforcement Matrix

| Law | Constitutional scanner | Ownership scanner | Export scanner | Composition scanner | Test coverage | CI gate | Release gate |
|---|---:|---:|---:|---:|---:|---:|---:|
| LAW-001 | Yes | Supporting | — | Supporting | Yes | Yes | Yes |
| LAW-002 | Yes | Yes | Supporting | Supporting | Yes | Yes | Yes |
| LAW-003 | Yes | Yes | — | — | Yes | Yes | Yes |
| LAW-004 | Yes | — | Yes | — | Yes | Yes | Yes |
| LAW-005 | Yes | — | Supporting | — | Yes | Yes | Yes |
| LAW-006 | — | Supporting | — | Yes | Yes | Yes | Yes |
| LAW-007 | — | — | — | Yes | Yes | Yes | Yes |
| LAW-008 | Aggregate gate | Aggregate gate | Aggregate gate | Aggregate gate | Yes | Yes | Yes |

## Scanner-to-command mapping

| Scanner | Command | Primary laws |
|---|---|---|
| Constitutional boundary scanner | `npm run check:constitutional-boundaries` | LAW-001, LAW-003, LAW-004, LAW-005 |
| Ownership boundary scanner | `npm run check:ownership-boundaries` | LAW-002, LAW-003 |
| Public export governance scanner | `npm run check:public-export-governance` | LAW-004 |
| Composition boundary scanner | `npm run check:composition-boundaries` | LAW-006, LAW-007 |
| Aggregate architecture gate | `npm run check:aoc-boundaries` | LAW-001 through LAW-008 |

“Supporting” means the scanner detects a related failure mode while another scanner is the primary authority. A dash means that scanner is not responsible for the law; the law remains release-gated through the aggregate command.
