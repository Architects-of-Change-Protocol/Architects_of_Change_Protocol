# AOC Core Identity Kernel

## Why identity is infrastructure
Identity in AOC Core is protocol infrastructure, not application UX. The kernel defines *who can hold authority* and *how that authority is delegated and bounded* across policy decisions.

## Actors are not users
AOC actor identity models multiple authority-bearing entities:
- humans
- organizations
- brands
- applications
- AI agents
- delegates
- system actors

This avoids collapsing machine and organizational authority into user profile semantics.

## Delegation philosophy
Delegation is explicit and bounded. Every grant has a delegator, a delegate, allowed actions, allowed scopes, and validity windows. Revocation and expiration are first-class state.

## Trust chains
Trust chains are deterministic paths from a root authority to a delegated actor. Chain validation ensures links are contiguous and delegation depth can be bounded.

## AI governance implications
AI actors are first-class actors with explicit authority boundaries and optional human-review requirements. AI restrictions can block scopes, disallow autonomous redelegation, and require escalation for sensitive actions.

## Identity vs authentication
This module is not authentication. It does not implement login, OAuth, wallets, external IAM, or identity proofing UX. It provides typed identity semantics that authentication systems can bind to later.

## Enterprise governance role
The kernel provides protocol seams for future enterprise governance: adapter-backed registries, delegation-aware PDP normalization, and portable trust-chain evaluation across organizations and machine actors.
