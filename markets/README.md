Market Makers (Vertical Engines) — Core Specification v0.1
1. Purpose

Market Makers are domain-specific engines that request, process, and respond to sovereign data.

They do not own user data.

They do not store user profiles.

They operate exclusively through wallet-mediated consent.

2. Definition

A Market Maker is a service that:

Defines schemas (schematics) of required data

Requests SDL fields

Receives authorized data

Executes domain logic

Returns value

3. Examples

HR Market (employment, skills, reputation)

Credit Market (income, risk, payment history)

Health Market (records, prescriptions)

Education Market

Housing Market

Insurance Market

Each market is independent.

4. What Market Makers Never Do

Create wallets

Store personal profiles

Issue identities

Bypass consent

Scrape data

5. Market Schematic

Each market publishes schematics:

Schematic = list of SDL tags + purpose


Example:

hr.job.matching.v1
Requires:
  person.name.display
  work.skill.javascript.years
  work.experience.total.years
  person.location.country

6. Query Flow

Market publishes schematic

Wallet evaluates schematic

User approves or rejects

Wallet returns consent token

Market requests fields using token

Wallet responds

Market never sees wallet internals.

7. Schematic Registry

Markets may host public schematic catalogs.

Wallets may cache schematics.

No central authority required.

8. Field Resolution

Wallet resolves:

schematic tag → stored SDL field


If missing:

Wallet reports unavailable

Market may adapt

9. Stateless by Design

Market Makers are stateless regarding identity.

They operate on sessions, not accounts.

Example:

Session:
  consent_token
  request_id


No permanent user profile.

10. Market Output

Market may output:

Score

Match result

Offer

Quote

Eligibility

Results may optionally be written back into wallet as new fields (with user consent).

11. Bidirectional Value

Markets may:

Pay user

Pay wallet

Charge user

Share revenue

Economic model is pluggable.

12. Trust Model

Markets trust:

Cryptographic signatures

Proof verifications

Markets do not trust platforms.

13. Compliance Layer

Markets may impose:

Jurisdictional rules

Thresholds

Filters

But cannot bypass wallet consent.

14. Competition

Multiple markets can exist per vertical.

Example:

HR Market A
HR Market B
HR Market C


Wallet chooses.

15. Composability

Markets can call other markets.

Example:

HR Market → Skill Verification Market

All via wallet-mediated consent.

16. Market Identity

Markets may have identifiers:

market:hr.matching
market:credit.scoring


Signed endpoints.

17. Failure Mode

If market disappears:

Wallet still holds data

No lock-in

18. Minimal Viable Market

Must support:

Publish schematic

Accept consent token

Request fields

Return output

19. Non-Goals

Market Makers are not:

Identity systems

Wallet providers

Custodians

Data warehouses

