# Sovereign Wallet — Core Specification
1. Purpose

The Sovereign Wallet is a personal data vault controlled by an individual.

Its purpose is to:

Store sovereign data fields (SDL)

Hold cryptographic keys

Enforce consent

Mediate all data sharing

The wallet is not merely a crypto wallet.

It is a personal data operating system.

2. Fundamental Principle

The individual is the root of trust.

No platform, government, or corporation is trusted by default.

All permissions originate from the wallet.

3. What the Wallet Stores

The wallet stores:

Private keys

Public keys

SDL fields

Field metadata

Consent records

Capability tokens

Optional encrypted blobs

It does NOT store:

Centralized user accounts

Platform identifiers

Password-based identities

4. Internal Structure

Conceptually:

Wallet
 ├── Keys
 ├── Identity
 ├── Fields (SDL)
 ├── Consents
 ├── Connections
 └── Logs

5. Keys

Each wallet generates:

Master root key

Derived subkeys

Keys may be:

Device-held

Hardware-backed

Multi-sig

Social-recovery protected

Key management is implementation-specific.

6. Identity Layer

The wallet creates a self-sovereign identifier (SSI).

Example:

did:sovereign:abcd1234...


This identifier:

Is generated locally

Never issued by a platform

Can rotate keys

Remains logically continuous

7. Fields (SDL Storage)

Each field:

Has canonical SDL path

Has encrypted value

Has optional proofs

Has timestamp

Has owner signature

Example:

person.name.legal.full


Wallets may store fields as encrypted records.

8. Field Creation

Fields are created by:

User manually

Imported from another wallet

Received from trusted issuer

Derived locally

Wallet does not validate truth by default.

Wallet validates signatures.

9. Proof Objects

Wallet may store proofs:

Government credential

Employer attestation

Doctor signature

Institution certificate

Proofs bind:

field → issuer → signature


Wallet verifies cryptographically.

10. Consent Engine

All data sharing flows through consent.

Consent specifies:

Which fields

Which recipient

For what purpose

For what duration

Example:

Allow:
  person.name.legal.full
  work.skill.javascript.years
To:
  market:hr.recruiting
Purpose:
  job_matching
Duration:
  30 days

11. Consent Token

When user approves:

Wallet issues a consent token.

Token contains:

Field list

Recipient

Expiration

Signature

Market presents token when requesting data.

12. Selective Disclosure

Wallet may:

Share exact values

Share derived proofs

Share boolean claims

Example:

Instead of age:

age.over.21 = true

13. Zero Knowledge Friendly

Wallet architecture supports:

Hash commitments

Merkle proofs

ZK proofs

Optional, not mandatory.

14. Local-First Storage

Primary storage is local to the wallet.

Optional:

Encrypted backup

Encrypted shards

User-chosen cloud

No mandatory central server.

15. Interoperability

Wallet speaks:

SDL

Consent tokens

DID

Any market supporting these can interoperate.

16. Revocation

User may revoke:

Consents

Connections

Issuers

Revocation updates wallet state.

Future requests fail.

17. Recovery

Wallet supports:

Seed phrase

Social recovery

Hardware recovery

Multi-device sync

No custodian required.

18. Minimal Viable Wallet

MVP wallet must support:

Key generation

SDL field storage

Consent approvals

Field export

Everything else is layered.

19. Non-Goals

Wallet is not:

Social network

Marketplace

Identity provider

Data broker

Wallet is infrastructure.

20. Versioning

This document defines Sovereign Wallet v0.1.
