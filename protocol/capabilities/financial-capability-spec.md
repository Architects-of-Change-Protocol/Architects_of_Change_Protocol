# Financial Capability Namespace Specification

## 1. Purpose

This document defines the canonical `financial.*` capability namespace for
financial data access within the Architects of Change Protocol. The namespace
is additive and does not modify the existing Consent Object, Capability Token,
or enforcement architecture.

## 2. Design Invariants

Implementations using this namespace MUST preserve the following invariants:

- Capability definitions are metadata that describe permitted financial access.
- A financial capability identifier MUST be represented as a canonical,
  lowercase, dot-separated string.
- Registration of a financial capability MUST NOT bypass existing consent,
  capability derivation, temporal containment, or revocation rules.
- A capability marked `requires_user_consent: true` MUST only be exercised
  through the protocol's existing consent and capability-token flow.
- Additional `financial.*` capabilities MAY be introduced later, provided they
  preserve canonical identifiers and do not redefine an existing id.

## 3. Canonical Schema

Each financial capability definition MUST expose the following fields:

- `id`
- `description`
- `resource_type` (`wallet` | `portfolio` | `insight`)
- `access_level` (`read` | `write`)
- `sensitivity_level` (`low` | `medium` | `high`)
- `requires_user_consent` (`boolean`)

## 4. Registered Financial Capabilities

| id | description | resource_type | access_level | sensitivity_level | requires_user_consent |
| --- | --- | --- | --- | --- | --- |
| `financial.wallet.balance.read` | Read the current balance exposed for a wallet account or sub-account. | `wallet` | `read` | `high` | `true` |
| `financial.wallet.tx.read` | Read wallet transaction history, including inflows, outflows, and transfers. | `wallet` | `read` | `high` | `true` |
| `financial.portfolio.snapshot.read` | Read point-in-time holdings and valuation snapshots for a portfolio. | `portfolio` | `read` | `high` | `true` |
| `financial.portfolio.aggregate.read` | Read portfolio-level aggregates such as total allocation, exposure, and summary metrics. | `portfolio` | `read` | `medium` | `true` |
| `financial.insight.read` | Read derived financial insights generated from wallet or portfolio data. | `insight` | `read` | `medium` | `true` |
| `financial.insight.write` | Write or attach derived financial insights back into an authorized insight resource. | `insight` | `write` | `high` | `true` |

## 5. Enforcement Guidance

This namespace is intended to be consumed alongside the existing protocol
permission and scope checks:

- Consent grants continue to define the authorizing subject, grantee, scope,
  permissions, and time bounds.
- Capability Tokens continue to attenuate from a parent consent and remain the
  redeemable enforcement artifact.
- Financial capability definitions provide canonical ids and metadata so
  downstream market makers can apply consistent policy, logging, and product
  interpretation without inventing incompatible capability names.
