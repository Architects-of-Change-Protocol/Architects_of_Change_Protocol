# Economic Settlement Policy

**Constitution Version:** v1.0

## Settlement types

- **Internal Settlement** — Settlement between authorities within the same sovereign system.
- **Federated Settlement** — Settlement between authorities across federated sovereign systems.
- **Consumption Settlement** — Settlement confirming that consumption obligations are satisfied.
- **Treasury Settlement** — Settlement confirming that treasury obligations are satisfied.
- **Governance Settlement** — Settlement confirming that governance economics obligations are satisfied.

## Settlement states

- **Pending** — Settlement initiated but not confirmed.
- **Confirmed** — Settlement confirmed by all required parties.
- **Disputed** — Settlement disputed by an authorized challenger.
- **Resolved** — Settlement dispute resolved.
- **Expired** — Settlement expired without confirmation.
- **Revoked** — Settlement revoked by an authorized authority.

## Settlement policy catalog

| Settlement Policy ID | Settlement Type | Authority Class | Parties Required | Evidence Required | Dispute Allowed | Revocation Allowed | Amendment | Status |
|---|---|---|---|---|---|---|---|---|
| ESP-0001 | Internal Settlement | Constitutional | Both parties | Yes | Yes | Yes | AOC-AMD-0016 | Canonical |
| ESP-0002 | Federated Settlement | Governance | Both sovereign parties | Yes | Yes | Yes | AOC-AMD-0016 | Canonical |
| ESP-0003 | Consumption Settlement | Runtime | Consuming authority | Yes | Yes | Yes | AOC-AMD-0016 | Canonical |
| ESP-0004 | Treasury Settlement | Constitutional | Treasury authority | Yes | Yes | Yes | AOC-AMD-0016 | Canonical |
| ESP-0005 | Governance Settlement | Governance | Governance authority | Yes | Yes | Yes | AOC-AMD-0016 | Canonical |

## Settlement registry

| Settlement ID | Settlement Type | Settlement Policy | Initiating Authority | Counterparty Authority | GCU Amount | SCU Amount | Evidence | Decision Reference | Amendment | Status |
|---|---|---|---|---|---|---|---|---|---|---|
