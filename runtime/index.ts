/**
 * Public Runtime Surface (stable)
 *
 * This module is the stable entrypoint intended for SDK/application consumers.
 * Internal and experimental runtime modules are intentionally excluded and are
 * available only through dedicated entrypoints.
 *
 * `createRuntimeServer` and the HMAC capability-token enforcement path
 * (`enforceCapabilityAccess`, formerly re-exported here via `export * from
 * './enforcement'`) are deliberately NOT exported from this stable surface — see
 * docs/security/revocation/14-independent-review.md §Part 1/2. That authorization path
 * (`protocol/consent/capability-authorize.ts`) has no revocation check of any kind, gates
 * live `/data/access` and `/payout/execute` traffic, and must not be presented as a
 * ready-to-use stable API. They remain available, explicitly labeled non-stable, via
 * `./internal` (see `runtime/internal.ts`), matching this repo's existing internal/
 * experimental surface convention. `scripts/check-runtime-export-governance.mjs` fails CI
 * if either is re-added here.
 */

export { HostedRuntimeClient } from './sdk/client';
export type { HostedRuntimeSdk, HostedRuntimeClientOptions, PayoutCallbackResult } from './sdk/client';
export { InMemoryApiKeyStore, DEFAULT_API_KEYS } from './auth/apiKeys';
export { InMemoryRateLimiter } from './limits/rateLimiter';
export { RuntimeLogger } from './logging/logger';
export { InMemoryTrustService, DEFAULT_TRUST_ISSUERS } from './trust/service';

export type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  AocIdentityIssuerRecord,
  IdentityVerificationResult,
  RlusdWithdrawalRequest,
  TrustAuditEvent,
} from './trust/types';

export type { ApiRequest, ApiResponse, ErrorResponse, RuntimeEndpoint } from './types/api-types';
export type { PrincipalId, TenantId, ActorKind, RuntimeIdentity, CanonicalPrincipalContext, LegacyPrincipalAliases } from './identity';
export { normalizePrincipalContext } from './identity';

export type { PayoutCallbackInput, PayoutExecuteResult, PayoutAuditEvent } from './payout/types';
export type { DataAccessAuditEvent, DataAccessDecision, DataAccessRequestInput, AccessTokenRecord } from './access/types';
export type { GetUsageSummaryInput, ListAuditEventsInput } from './sdk/client';

export { InMemoryUsageService, UNIT_PRICES } from './usage';
export { InMemoryMonetizationService, InMemoryPricingRegistry } from './monetization';

export type {
  PricingRule,
  BillableEvent,
  BillableEventQuery,
  ConsumerBillingSummary,
  MonetizationUsageEvent,
} from './monetization';

export type {
  MeteredRuntimeEndpoint,
  UsageDecision,
  UsageRecord,
  UsageSummaryItem,
  UsageSummaryQuery,
  UsageSummaryResult,
} from './usage';

export * from './audit';

export { RUNTIME_TRANSPORT_VERSION } from './versioning';
export { RUNTIME_HANDSHAKE_PATH, buildMetadata, toErrorEnvelope } from './types/transport';
export type { RuntimeTransportMetadata, RuntimeRequestEnvelope, RuntimeResponseEnvelope, RuntimeErrorEnvelope, RuntimeHandshakeEnvelope, RuntimeErrorCode } from './types/transport';

export * from './observability';
