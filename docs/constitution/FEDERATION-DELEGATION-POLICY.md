# Federation Delegation Policy

**Constitution Version:** v15.0

## Purpose

Delegation governs the transfer of authority scope between sovereign constitutional systems within a federation relationship. Delegation grants authority within defined scope boundaries. Delegation never transfers sovereignty.

## Valid delegation states

A delegation record may occupy one of the following states: Draft, Proposed, Active, Expired, Revoked, Retired.

## Valid delegation state transitions

| From | To |
|---|---|
| Draft | Proposed |
| Proposed | Active; Revoked |
| Active | Expired; Revoked |
| Expired | Retired |
| Revoked | Retired |
| Retired | (terminal) |

## Delegation policy catalog

| Delegation Policy ID | Federation Class | Delegation Allowed | Maximum Scope | Expiration Required | Revocation Allowed | Evidence Required | Amendment | Status |
|---|---|---|---|---|---|---|---|---|
| FDP-0001 | Constitutional | No | N/A | N/A | N/A | N/A | AOC-AMD-0015 | Active |
| FDP-0002 | Governance | Yes | Governance scope only | Yes | Yes | Required | AOC-AMD-0015 | Active |
| FDP-0003 | Runtime | Yes | Runtime scope only | Yes | Yes | Required | AOC-AMD-0015 | Active |
| FDP-0004 | Operational | Yes | Operational scope only | Yes | Yes | Required | AOC-AMD-0015 | Active |

## Delegation registry

| Delegation ID | Source Constitution | Target Constitution | Delegated Authority | Scope | Expiration | Revocation Rule | Amendment | Status |
|---|---|---|---|---|---|---|---|---|
