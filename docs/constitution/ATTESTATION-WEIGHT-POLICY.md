# Attestation Weight Policy

**Constitution Version:** v16.0

## Constitutional rule

Attestation weight governs how much influence an active attestation may contribute to decision inputs, consensus inputs, and governance inputs. Weight does not create authority. Weight is a governed input property only.

## Valid weight levels

| Weight Level | Description | Decision Influence |
|---|---|---|
| No Weight | Attestation is recorded but carries no governance influence | None |
| Advisory Weight | Attestation may be considered but is not required by decision authority | Informational only |
| Constitutional Weight | Attestation is a required input for constitutional decisions | Required for constitutional decisions |
| Governance Weight | Attestation is a required input for governance decisions | Required for governance decisions |
| Consensus Weight | Attestation aggregates toward consensus thresholds | Counted toward consensus quorum |

## Weight policy registry

| Weight Policy ID | Attestation Class | Default Weight Level | Maximum Weight Level | Aggregation Rule | Decision Influence Rule | Amendment | Status |
|---|---|---|---|---|---|---|---|
| AWP-0001 | Constitutional | Constitutional Weight | Constitutional Weight | Single attestation sufficient for constitutional decisions | Required input for constitutional decisions; never a bypass | AOC-AMD-0010 | Active |
| AWP-0002 | Governance | Governance Weight | Governance Weight | Multiple attestations may be aggregated | Required input for governance decisions where cataloged; never a bypass | AOC-AMD-0010 | Active |
| AWP-0003 | Runtime | Advisory Weight | Consensus Weight | Aggregation per consensus threshold | Advisory unless cataloged as required; never a bypass | AOC-AMD-0010 | Active |
| AWP-0004 | Operational | Advisory Weight | Advisory Weight | Advisory aggregation only | Informational only; never a bypass | AOC-AMD-0010 | Active |

## Weight invariants

Weight may not exceed the maximum weight level cataloged for the attestation class. An attestation may not escalate its own weight after issuance. Weight escalation is a constitutional violation (ATT-V-011). Weight influences decision inputs; it never replaces required standing, evidence, policy coverage, trust evaluation, verification requirements, or reputation signals.
