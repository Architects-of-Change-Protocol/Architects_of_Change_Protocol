# Phase 2.4 Visual Capability Runtime UI

This module provides a reusable, typed runtime UI architecture for the AOC capability delegation domain.

## Included building blocks

- **Live Capability Runtime Panel** data model via `CapabilityRuntimeCard`
- **Capability Flow Visualizer** graph model via `GovernanceNode` / `GovernanceEdge`
- **Capability Lifecycle Replay** controls via `replayLifecycle(...)`
- **AI Agent Runtime Console** model via `RuntimeAgent`
- **Relationship Governance Graph** mock topology via `mockGraph`
- **Trust State Engine** via `deriveTrustPropagation(...)`
- **Runtime Event Stream** model via `RuntimeEvent`

## Integration approach (Next.js + shadcn/ui + Framer Motion)

1. Keep `types.ts` as runtime contract between backend adapters and React components.
2. Replace `mockRuntimeAdapter.ts` with websocket/SSE adapters while preserving stable interfaces.
3. Bind motion primitives to fields:
   - `activityLevel` -> card pulse speed
   - `trustHealth` -> trust badge transition color
   - `policyDriftAlerts` -> subtle warning shimmer
4. Use virtualization for event stream and graph layers for enterprise scale.

## Future scalability hooks

- Event fanout: shard by `relationshipId` and `capabilityId`.
- Graph layering: render static edges in canvas, interactive nodes in DOM.
- Runtime policy interception: side-channel updates to prevent UI lockstep lag.

## Suggested websocket architecture

- `ws://runtime/capabilities`: capability card deltas
- `ws://runtime/events`: append-only event stream
- `ws://runtime/trust`: trust-state recalculations
- `ws://runtime/graph`: graph mutation events
- Use sequence IDs + optimistic interpolation to avoid out-of-order trust transitions.

## Suggested marketplace runtime connectors

- CRM connector (read-only relationship metadata import)
- Support platform connector (ticket context capabilities)
- Data warehouse connector (attestation + audit mirror)
- AI provider connector (agent run attestations + policy traces)
- Policy engine connector (OPA/Cedar decision traces)
