# Canonical Registry Interface Contracts

The `claims/registries` surface defines implementation-neutral registry contracts for the RFC-005 trust model. A registry is a protocol-level directory declaration: it identifies where canonical claims, evidence, attestations, proofs, principals, policies, authorities, decisions, or related descriptors may be located and how those locations can be referenced without coupling consumers to storage.

## What a registry is

A registry is a portable reference and descriptor layer. It can identify:

- the registry responsible for a namespace;
- an entry inside that registry;
- a locator for the entry;
- the entry type and lifecycle status;
- portable manifests describing supported entry types; and
- attestations about registry recognition, currency, deprecation, or supersession.

Registries support explainability across the Evidence → Assertion → Claim → Attestation → Verification → Standing → Capability → Authority → Decision chain by making location explicit.

## What a registry is not

A registry contract is not a storage engine, database schema, network API, sync process, index, search facility, verification engine, standing engine, authority resolver, trust scoring model, or decision authorizer.

## Registry vs storage

Storage persists objects. A registry contract describes how an object or descriptor may be located. The canonical registry interfaces do not define tables, collections, persistence formats, indexes, retention policies, or replication behavior.

## Registry vs verification

Verification evaluates whether evidence, claims, attestations, or proofs satisfy verification criteria. Registry contracts only describe location and observed lookup results. A registry entry can carry proof references, but it does not validate those proofs.

## Registry vs standing

Standing represents the current recognized status of a claim. Registry status only describes the lifecycle of a registry entry, such as active, deprecated, revoked, superseded, archived, or unknown. Registry status does not confer standing.

## Registry vs authority

Authority is derived from standing and capabilities in the RFC-005 trust model. A registry may be described as authoritative for a namespace, but registry contracts do not derive, grant, or revoke authority.

## Registry vs decision

Decisions consume authority chains and produce outcomes. Registry contracts may locate decision records or decision registries, but they do not authorize or execute decisions.
