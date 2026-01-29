# Sovereign Data Language (SDL)
1. Purpose

Sovereign Data Language (SDL) is an open, universal language for describing human data in a sovereign, portable, and interoperable way.

Its purpose is to allow:

Individuals to describe their data using neutral field identifiers.

Markets to request data using standardized semantic tags.

Wallets to map, store, and selectively disclose information.

Systems to interoperate without sharing raw databases.

SDL is not a database schema.

SDL is a semantic coordination layer.

2. Design Goals

SDL must be:

Human-readable

Machine-parsable

Deterministic

Extensible

Backwards-compatible

SDL must avoid:

Hardcoded industry schemas

Centralized registries

Corporate naming conventions

3. Core Concept: Field

The atomic unit of SDL is a Field.

A Field represents a single human-meaningful piece of information.

Examples:

Full legal name

Date of birth

Country of residence

Years of experience in JavaScript

Medical allergy: penicillin

Each field is self-describing.

4. Field Structure

Every SDL Field contains:

id
label
description
type
value
metadata (optional)


Example:

{
  "id": "person.name.legal.full",
  "label": "Full Legal Name",
  "description": "The person's full legal name as shown on government ID",
  "type": "string",
  "value": "Ana María Rodríguez"
}

5. Namespacing

SDL uses dot-separated namespaces.

General form:

domain.category.subcategory.attribute


Examples:

person.name.legal.full
person.birth.date
person.location.country
work.skill.javascript.years
health.allergy.penicillin
education.degree.level


Namespaces are:

Hierarchical

Extensible

Non-exclusive

No central authority owns namespaces.

6. Canonical Domains (Initial)

Initial recommended domains:

person
identity
contact
location
work
education
health
finance
legal
biometric
device
reputation
credential
preference
consent


Communities may introduce new domains.

7. Data Types

Recommended primitive types:

string
number
boolean
date
datetime
object
array
reference
proof


Type does not dictate storage format.

Type expresses semantic intent.

8. Value vs Proof

SDL distinguishes:

Value fields → raw data

Proof fields → claims about data

Example:

Value:

person.age = 32


Proof:

person.age.over.21 = true


Markets should prefer proofs when possible.

9. Field Identity

A field’s identity is its full path string.

Not numeric IDs.

This enables:

Human readability

Deterministic matching

Easy mapping

10. Extensibility Model

Anyone may define new fields.

If a field gains wide usage, it becomes de facto standard.

No approval process required.

Evolution happens through adoption.

11. Wallet Responsibilities

Wallets:

Store user-created fields

Index fields by SDL path

Allow user to edit labels/descriptions locally

Preserve canonical path

Wallets must never rename canonical paths.

12. Market Responsibilities

Markets:

Publish required field paths

Request only necessary fields

Respect user consent boundaries

Markets must not invent private hidden schemas.

13. Schema Bundles (Schematics)

Markets may define Schematics:

A schematic is a bundle of SDL fields.

Example:

employment.application.v1


Contains:

person.name.legal.full
contact.email.primary
work.skill.javascript.years
education.degree.level


Schematics do not redefine fields.

They reference existing ones.

14. Localization

Labels and descriptions may be localized.

Canonical path remains unchanged.

Example:

person.name.legal.full


Label (ES): Nombre legal completo
Label (EN): Full Legal Name

15. Compatibility

SDL is compatible with:

JSON

CBOR

MessagePack

Blockchain payloads

Traditional databases

SDL defines meaning, not transport.

16. Security Model

SDL itself stores no keys.

SDL relies on Sovereign Wallet cryptography.

Fields may be encrypted.

Paths may remain visible.

Values may be private.

17. Non-Goals

SDL is not:

A database

A blockchain

A form builder

A UI framework

SDL is a language.

18. Versioning

This document defines SDL v0.1.

Future versions may extend domains, types, or conventions.

Existing paths remain valid.
