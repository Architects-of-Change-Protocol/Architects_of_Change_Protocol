# Relationship Core Primitive

## Why relationships are infrastructure primitives

Relationships are durable protocol objects that express *who can interact with whom, under what boundaries, and for how long*. This is infrastructure because policy, consent, capability checks, and auditing need a stable relationship anchor.

## Relationship vs follows/subscriptions

A follow/subscription is a product interaction signal. A relationship in AOC is a governance and authorization primitive:

- explicit lifecycle state
- policy binding surface
- temporal validity window
- audit references and transition trail
- optional AI delegation boundaries

## Lifecycle semantics

Relationship states are:

- proposed
- pending
- active
- suspended
- expired
- revoked
- disputed

Core transition integrity in this phase:

- revoked relationships cannot reactivate
- expired relationships cannot transition to active
- suspended relationships require an explicit restore path (not implemented yet)
- every relationship must include at least one `subject` actor

## Policy bindings

Relationships can attach one or more PDP policy references. Attach/detach are local object transformations for now (no persistence layer).

## Relationship vs consent vs capability

- Relationship: the durable context and boundaries between actors.
- Consent: a subject authorization artifact within that relationship context.
- Capability: a scoped executable token derived from policy + consent + relationship validity.

## Future MediaLab integration

MediaLab can bind content and communication flows to relationship objects so distribution and monetization decisions evaluate against relationship scope and validity windows.

## Future AI-agent integration

Relationship scope includes optional AI delegation boundaries:

- delegated AI actor IDs
- allowed purposes
- blocked categories
- human review requirement

This creates a governance envelope for future AI orchestration without introducing orchestration complexity in this phase.
