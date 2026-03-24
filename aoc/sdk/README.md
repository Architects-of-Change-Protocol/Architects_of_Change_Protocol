# AOC Capability SDK

A minimal developer entry layer for using Architects of Change (AOC) capabilities in external applications.

## 1) What is the AOC Capability Layer?

The AOC capability layer is a consent-first authorization system for sovereign data exchange.

- **Consent-based access**: access starts from an explicit consent grant.
- **Capability tokens**: scoped, signed protocol objects derived from consent.
- **Market maker binding**: capabilities can be bound to trusted market makers.
- **Sovereign data model**: access decisions are deterministic and portable across integrations.

## 2) Install / Usage

In this monorepo, import from the SDK entrypoint:

```ts
import {
  buildConsentObject,
  mintCapabilityToken,
  evaluateCapabilityAccess,
  consumeCapabilityAccess,
  MarketMakerRegistry
} from '../aoc/sdk';
```

If published externally, this surface is designed to map to:

```ts
import { ... } from 'aoc-sdk';
```

## 3) Minimal Flow

1. `buildConsentObject(...)`
2. `mintCapabilityToken(...)`
3. `evaluateCapabilityAccess(...)`
4. `consumeCapabilityAccess(...)`

## 4) Example snippet

```ts
import {
  buildConsentObject,
  mintCapabilityToken,
  evaluateCapabilityAccess,
  consumeCapabilityAccess
} from '../aoc/sdk';

const consent = buildConsentObject(
  'did:key:subject123',
  'did:key:marketmaker456',
  'grant',
  [{ type: 'content', ref: 'a'.repeat(64) }],
  ['read'],
  {
    now: new Date('2025-06-15T10:00:00Z'),
    expires_at: '2025-06-15T10:05:00Z',
    marketMakerId: 'hrkey-v1'
  }
);

const capability = mintCapabilityToken(
  consent,
  [{ type: 'content', ref: 'a'.repeat(64) }],
  ['read'],
  '2025-06-15T10:05:00Z',
  { now: new Date('2025-06-15T10:00:00Z') }
);

const access = evaluateCapabilityAccess({
  capability,
  consent,
  action: 'read',
  resource: { type: 'content', ref: 'a'.repeat(64) },
  marketMakerId: 'hrkey-v1',
  now: '2025-06-15T10:00:00Z'
});

const consumption = consumeCapabilityAccess({
  capability,
  consent,
  action: 'read',
  resource: { type: 'content', ref: 'a'.repeat(64) },
  marketMakerId: 'hrkey-v1',
  now: '2025-06-15T10:00:00Z'
});
```

## 5) Concepts

- **Consent**: user-authorized policy object defining who can do what and for how long.
- **Capability**: runtime token derived from consent with bounded scope and permissions.
- **Market Maker**: integration boundary that can be bound to consent/capability for trust enforcement.
- **Enforcement**: deterministic allow/deny decisions across evaluation and consumption boundaries.

### Market maker trust enforcement (MVP policy)

Market-maker enforcement is lifecycle-aware and deterministic:

- `active` → allowed (when other checks pass)
- `deprecated` → denied fail-closed
- `revoked` → denied fail-closed

This is an intentional MVP-safe runtime trust gate, not reputation scoring, governance, or pricing logic.
Existence and trust are distinct: a market maker can be registered and still denied due to status.

## Simplified Flow Wrapper

For the most common SDK usage, call `executeCapabilityFlow(...)`.
It orchestrates evaluation, consumption, and optional interpreter execution in one call while preserving the same enforcement behavior.

```ts
import {
  buildConsentObject,
  mintCapabilityToken,
  executeCapabilityFlow,
  MarketMakerRegistry
} from '../aoc/sdk';

const CONTENT_REF = 'a'.repeat(64);
const NOW = '2025-06-15T10:00:00Z';
const marketMakerRegistry = new MarketMakerRegistry();
marketMakerRegistry.register({
  id: 'hrkey-v1',
  name: 'HRKey',
  version: '1.0.0',
  capabilities: ['content.read'],
  status: 'active',
  created_at: NOW
});

const consent = buildConsentObject(
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
  'grant',
  [{ type: 'content', ref: CONTENT_REF }],
  ['read'],
  { now: new Date(NOW), expires_at: '2025-06-15T10:05:00Z', marketMakerId: 'hrkey-v1' }
);

const capability = mintCapabilityToken(
  consent,
  [{ type: 'content', ref: CONTENT_REF }],
  ['read'],
  '2025-06-15T10:05:00Z',
  { now: new Date(NOW) }
);

const result = executeCapabilityFlow({
  capability,
  consent,
  action: 'read',
  resource: { type: 'content', ref: CONTENT_REF },
  marketMakerId: 'hrkey-v1',
  marketMakerRegistry,
  now: NOW,
  interpreter: {
    enabled: true,
    query: 'Summarize the candidate profile.'
  }
});
```

## Handling denied flows

When `executeCapabilityFlow(...)` returns `allowed: false`, inspect these fields first:

- `result.stage` — where denial happened (`evaluation` or `consumption`).
- `result.reasonCode` — stable machine-readable code from the underlying decision.
- `result.reason` — human-readable explanation.

```ts
const result = executeCapabilityFlow(/* ... */);

if (!result.allowed) {
  console.error('Denied stage:', result.stage);
  console.error('Reason code:', result.reasonCode);
  console.error('Reason:', result.reason);
}
```
