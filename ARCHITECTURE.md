# AOC Protocol Package Architecture

## What belongs in this repository

This package defines protocol contracts only:
- capability request/grant models
- policy models and decision contracts
- delegation models
- consent grants
- agent identity/scope contracts
- audit event contracts
- protocol error contracts
- adapter interfaces for runtime integrations

## What does not belong in this repository

Do not place runtime or infrastructure implementations here, including:
- database clients or ORM models (Supabase/Prisma/etc.)
- HTTP handlers, server actions, API routes
- framework/UI code (React/Next.js)
- key management, signing runtime, telemetry pipelines
- logging infrastructure, network client calls, SDK execution logic

## What should live in AOC-Enterprise

AOC-Enterprise should own concrete implementations for:
- policy evaluation engines and enforcement runtimes
- persistence adapters (capability/delegation/audit stores)
- identity resolution services
- cryptographic key retrieval, signing, and verification workflows
- production audit/event delivery infrastructure

## What vertical apps such as PMFreak should consume from here

Vertical applications should import protocol types and adapter interfaces from this package,
then bind them to app-specific implementations in their own repositories.
