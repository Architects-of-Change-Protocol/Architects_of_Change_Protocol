// Canonical identity note: runtime APIs preserve legacy wire fields while mapping to principal semantics.
import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type ProtocolCapability } from '../../protocol/capability';
import { DataAccessService } from '../access/service';
import type { DataAccessDecision, DataAccessRequestInput } from '../access/types';
import { RuntimeAuditService, type ListAuditEventsInput, type RuntimeAuditEvent } from '../audit/service';
import { InMemoryAuditService } from '../audit/service';
import { RlusdPayoutAdapter } from '../payout/payoutAdapters/rlusd.adapter';
import { RlusdPayoutExecutorService } from '../payout/rlusdPayoutExecutor.service';
import type { PayoutCallbackInput, PayoutExecuteResult } from '../payout/types';
import { InMemoryTrustService, type GrantConsentInput, type RegisterCredentialInput, type VerifyIdentityInput } from '../trust/service';
import type {
  AocIdentityConsentRecord,
  AocIdentityCredentialRecord,
  IdentityVerificationResult,
  RlusdWithdrawalRequest,
} from '../trust/types';
import type { ApiResponse, RuntimeEndpoint } from '../types/api-types';
import { InMemoryUsageService, isMeteredEndpoint } from '../usage';
import { InMemoryMonetizationService, InMemoryPricingRegistry, type PricingRule } from '../monetization';
import type { MeteredRuntimeEndpoint, UsageSummaryResult } from '../usage';
import { ControlPlaneService, type AccessRequest, type ConsentDecision, type GrantedAccess } from '../controlPlane';
import { normalizePolicyDecision } from '../policy';

export type RuntimeCore = {
  evaluateEnforcement: typeof evaluateEnforcement;
  authorizeExecution: typeof authorizeExecution;
  mintCapability: typeof mintCapability;
  trustService: InMemoryTrustService;
  payoutExecutor: RlusdPayoutExecutorService;
  dataAccessService: DataAccessService;
  auditService: RuntimeAuditService;
  usageService: InMemoryUsageService;
  monetizationService: InMemoryMonetizationService;
  capabilityAuditService: InMemoryAuditService;
  controlPlaneService: ControlPlaneService;
};

const DEFAULT_PRICING_RULES: PricingRule[] = [
  { resource: '/data/access', action: 'execute', unit_price: 0.05, currency: 'AOC' },
  { resource: '/payout/execute', action: 'execute', unit_price: 0.25, currency: 'AOC' },
  { resource: '/trust/verify', action: 'execute', unit_price: 0, currency: 'AOC' },
];

const defaultTrustService = new InMemoryTrustService();
const defaultPayoutExecutor = new RlusdPayoutExecutorService(defaultTrustService, new RlusdPayoutAdapter());
const defaultDataAccessService = new DataAccessService(defaultTrustService);
const defaultAuditService = new RuntimeAuditService(defaultTrustService, defaultPayoutExecutor, defaultDataAccessService);
const defaultUsageService = new InMemoryUsageService();
const defaultMonetizationService = new InMemoryMonetizationService(new InMemoryPricingRegistry(DEFAULT_PRICING_RULES));
const defaultCapabilityAuditService = new InMemoryAuditService();
const defaultControlPlaneService = new ControlPlaneService();

const ROUTE_ERRORS = {
  invalidRequest: 'INVALID_REQUEST',
  executionError: 'EXECUTION_ERROR',
  routeNotFound: 'ROUTE_NOT_FOUND',
  protocolError: 'PROTOCOL_ERROR',
} as const;

export const DEFAULT_RUNTIME_CORE: RuntimeCore = {
  evaluateEnforcement,
  authorizeExecution,
  mintCapability,
  trustService: defaultTrustService,
  payoutExecutor: defaultPayoutExecutor,
  dataAccessService: defaultDataAccessService,
  auditService: defaultAuditService,
  usageService: defaultUsageService,
  monetizationService: defaultMonetizationService,
  capabilityAuditService: defaultCapabilityAuditService,
  controlPlaneService: defaultControlPlaneService,
};

function reviveNow<T extends Record<string, unknown>>(payload: T): T {
  if (typeof payload.now === 'string') {
    return {
      ...payload,
      now: new Date(payload.now),
    } as T;
  }

  return payload;
}

function success<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function failure(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNumericString(value: unknown): value is string {
  return typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim());
}

function parseOptionalDate(input: unknown): Date | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input instanceof Date) {
    return input;
  }
  if (typeof input !== 'string') {
    return undefined;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

function parseOptionalMeteredEndpoint(input: unknown): MeteredRuntimeEndpoint | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (input !== '/data/access' && input !== '/payout/execute' && input !== '/trust/verify') {
    return undefined;
  }
  return input;
}

function fromBooleanDecision(allowed: boolean, reasonCode: string): { decision: 'allow' | 'deny'; reasonCode: string } {
  return { decision: normalizePolicyDecision(allowed ? 'allowed' : 'denied'), reasonCode };
}

export function deriveDecision(endpoint: RuntimeEndpoint, data: unknown): { decision: 'allow' | 'deny'; reasonCode: string } {
  if (endpoint === '/enforcement/evaluate') {
    const enforcement = data as EnforcementDecision;
    return fromBooleanDecision(enforcement.allowed, enforcement.reason_code);
  }

  if (endpoint === '/execution/authorize') {
    const execution = data as ExecutionAuthorizationResult;
    return fromBooleanDecision(execution.authorized, execution.reason_code);
  }
  if (endpoint === '/trust/verify') {
    const verification = data as IdentityVerificationResult;
    return fromBooleanDecision(verification.valid, verification.reason_code);
  }
  if (endpoint === '/trust/credential/register') {
    return { decision: 'allow', reasonCode: 'CREDENTIAL_REGISTERED' };
  }
  if (endpoint === '/trust/consent/grant') {
    return { decision: 'allow', reasonCode: 'CONSENT_GRANTED' };
  }
  if (endpoint === '/payout/execute') {
    const payout = data as { allowed: boolean; reason_code: string };
    return fromBooleanDecision(payout.allowed, payout.reason_code);
  }
  if (endpoint === '/payout/callback') {
    const callback = data as { received: true; reason_code: string };
    return fromBooleanDecision(callback.received, callback.reason_code);
  }
  if (endpoint === '/data/access') {
    const access = data as { allowed: boolean; reason_code: string };
    return fromBooleanDecision(access.allowed, access.reason_code);
  }
  if (endpoint === '/capability/mint') {
    return { decision: 'allow', reasonCode: 'CAPABILITY_MINTED' };
  }
  if (endpoint === '/access/request') {
    return { decision: 'allow', reasonCode: 'ACCESS_REQUEST_CREATED' };
  }
  if (endpoint === '/access/requests') {
    return { decision: 'allow', reasonCode: 'ACCESS_REQUESTS_LISTED' };
  }
  if (endpoint === '/access/request/decision') {
    const result = data as { decision: { decision: 'approve' | 'deny' } };
    return { decision: 'allow', reasonCode: result.decision.decision === 'approve' ? 'ACCESS_REQUEST_APPROVED' : 'ACCESS_REQUEST_DENIED' };
  }
  if (endpoint === '/access/grants/active') {
    return { decision: 'allow', reasonCode: 'ACTIVE_GRANTS_LISTED' };
  }
  if (endpoint === '/access/grant/revoke') {
    return { decision: 'allow', reasonCode: 'GRANT_REVOKED' };
  }
  if (endpoint === '/audit/events') {
    return { decision: 'allow', reasonCode: 'AUDIT_EVENTS_LISTED' };
  }
  if (endpoint === '/usage/summary') {
    return { decision: 'allow', reasonCode: 'USAGE_SUMMARY_LISTED' };
  }

  const knownEndpoints: RuntimeEndpoint[] = [
    '/enforcement/evaluate',
    '/execution/authorize',
    '/capability/mint',
    '/access/request',
    '/access/requests',
    '/access/request/decision',
    '/access/grants/active',
    '/access/grant/revoke',
    '/payout/execute',
    '/payout/callback',
    '/trust/credential/register',
    '/trust/verify',
    '/trust/consent/grant',
    '/data/access',
    '/audit/events',
    '/usage/summary',
  ];

  if (!knownEndpoints.includes(endpoint)) {
    return {
      decision: 'deny',
      reasonCode: 'UNKNOWN_ENDPOINT',
    };
  }

  return {
    decision: 'allow',
    reasonCode: 'UNHANDLED_ENDPOINT',
  };
}

export function executeRoute(
  endpoint: RuntimeEndpoint,
  payload: unknown,
  core: RuntimeCore = DEFAULT_RUNTIME_CORE
): ApiResponse<
  | EnforcementDecision
  | ExecutionAuthorizationResult
  | ProtocolCapability
  | AocIdentityCredentialRecord
  | IdentityVerificationResult
  | AocIdentityConsentRecord
  | PayoutExecuteResult
  | DataAccessDecision
  | AccessRequest
  | AccessRequest[]
  | { request: AccessRequest; decision: ConsentDecision; grant?: GrantedAccess }
  | GrantedAccess
  | GrantedAccess[]
  | { received: true; reason_code: string }
  | { events: RuntimeAuditEvent[] }
  | UsageSummaryResult
> {
  try {
    switch (endpoint) {
      case '/enforcement/evaluate':
        return success(core.evaluateEnforcement(reviveNow(payload as Parameters<typeof evaluateEnforcement>[0])));
      case '/execution/authorize':
        return success(core.authorizeExecution(reviveNow(payload as Parameters<typeof authorizeExecution>[0])));
      case '/capability/mint':
        return success(core.mintCapability(payload as Parameters<typeof mintCapability>[0]));
      case '/access/request': {
        const request = payload as {
          subject_id?: string;
          requester_id?: string;
          dataset_id?: string;
          purpose?: string;
          requested_scope?: string[];
        };
        if (!isNonEmptyString(request.subject_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'subject_id is required.');
        }
        if (!isNonEmptyString(request.requester_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'requester_id is required.');
        }
        if (!isNonEmptyString(request.dataset_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'dataset_id is required.');
        }
        if (!isNonEmptyString(request.purpose)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'purpose is required.');
        }
        if (request.requested_scope !== undefined && !Array.isArray(request.requested_scope)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'requested_scope must be an array when provided.');
        }
        return success(
          core.controlPlaneService.createAccessRequest({
            subject_id: request.subject_id,
            requester_id: request.requester_id,
            dataset_id: request.dataset_id,
            purpose: request.purpose,
            requested_scope: request.requested_scope,
          })
        );
      }
      case '/access/requests': {
        const request = payload as { subject_id?: string; status?: 'pending' | 'approved' | 'denied' };
        if (!isNonEmptyString(request.subject_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'subject_id is required.');
        }
        if (
          request.status !== undefined &&
          request.status !== 'pending' &&
          request.status !== 'approved' &&
          request.status !== 'denied'
        ) {
          return failure(ROUTE_ERRORS.invalidRequest, 'status must be one of pending, approved, denied.');
        }
        return success(core.controlPlaneService.listRequestsBySubject({ subject_id: request.subject_id, status: request.status }));
      }
      case '/access/request/decision': {
        const request = payload as { request_id?: string; subject_id?: string; decision?: 'approve' | 'deny'; reason?: string };
        if (!isNonEmptyString(request.request_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'request_id is required.');
        }
        if (!isNonEmptyString(request.subject_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'subject_id is required.');
        }
        if (request.decision !== 'approve' && request.decision !== 'deny') {
          return failure(ROUTE_ERRORS.invalidRequest, 'decision must be approve or deny.');
        }
        return success(
          core.controlPlaneService.decideAccessRequest({
            request_id: request.request_id,
            subject_id: request.subject_id,
            decision: request.decision,
            reason: request.reason,
          })
        );
      }
      case '/access/grants/active': {
        const request = payload as { subject_id?: string; requester_id?: string };
        return success(core.controlPlaneService.listActiveGrants({ subject_id: request.subject_id, requester_id: request.requester_id }));
      }
      case '/access/grant/revoke': {
        const request = payload as { grant_id?: string; subject_id?: string; requester_id?: string };
        if (!isNonEmptyString(request.grant_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'grant_id is required.');
        }
        return success(
          core.controlPlaneService.revokeGrant({
            grant_id: request.grant_id,
            subject_id: request.subject_id,
            requester_id: request.requester_id,
          })
        );
      }
      case '/payout/execute': {
        const request = payload as Partial<RlusdWithdrawalRequest>;
        if (!isNonEmptyString(request.withdrawal_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'withdrawal_id is required.');
        }
        if (!isNonEmptyString(request.subject_hash)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'subject_hash is required.');
        }
        if (!isNonEmptyString(request.consumer_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'consumer_id is required.');
        }
        if (!isNumericString(request.amount)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'amount must be a numeric string.');
        }

        try {
          return success(core.payoutExecutor.execute(request as RlusdWithdrawalRequest));
        } catch (error) {
          return failure(
            ROUTE_ERRORS.executionError,
            error instanceof Error ? error.message : 'Unknown payout execution error.'
          );
        }
      }
      case '/payout/callback':
        return success(core.payoutExecutor.callback(payload as PayoutCallbackInput));
      case '/trust/credential/register':
        return success(core.trustService.registerCredential(payload as RegisterCredentialInput));
      case '/trust/verify':
        return success(core.trustService.verifyIdentity(reviveNow(payload as VerifyIdentityInput)));
      case '/trust/consent/grant':
        return success(core.trustService.grantConsent(payload as GrantConsentInput));
      case '/data/access': {
        const request = reviveNow(payload as Partial<DataAccessRequestInput>);
        if (!isNonEmptyString(request.subject_hash)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'subject_hash is required.');
        }
        if (!isNonEmptyString(request.consumer_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'consumer_id is required.');
        }
        if (!isNonEmptyString(request.dataset_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'dataset_id is required.');
        }
        if (!isNonEmptyString(request.purpose)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'purpose is required.');
        }
        if (request.requested_scope !== undefined && !Array.isArray(request.requested_scope)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'requested_scope must be an array when provided.');
        }

        return success(core.dataAccessService.requestAccess(request as DataAccessRequestInput));
      }
      case '/audit/events': {
        const request = payload as Partial<ListAuditEventsInput>;
        const from = parseOptionalDate(request.from);
        const to = parseOptionalDate(request.to);
        if (request.from !== undefined && from === undefined) {
          return failure(ROUTE_ERRORS.invalidRequest, 'from must be a valid ISO-8601 date string.');
        }
        if (request.to !== undefined && to === undefined) {
          return failure(ROUTE_ERRORS.invalidRequest, 'to must be a valid ISO-8601 date string.');
        }

        const events = core.auditService.listEvents({
          subject_hash: request.subject_hash,
          consumer_id: request.consumer_id,
          event_type: request.event_type,
          from,
          to,
        });

        return success({ events });
      }
      case '/usage/summary': {
        const request = payload as { consumer_id?: string; endpoint?: string; from?: string; to?: string };
        if (!isNonEmptyString(request.consumer_id)) {
          return failure(ROUTE_ERRORS.invalidRequest, 'consumer_id is required.');
        }

        const endpoint = parseOptionalMeteredEndpoint(request.endpoint);
        if (request.endpoint !== undefined && endpoint === undefined) {
          return failure(ROUTE_ERRORS.invalidRequest, 'endpoint must be one of /data/access, /payout/execute, /trust/verify.');
        }

        const from = parseOptionalDate(request.from);
        const to = parseOptionalDate(request.to);
        if (request.from !== undefined && from === undefined) {
          return failure(ROUTE_ERRORS.invalidRequest, 'from must be a valid ISO-8601 date string.');
        }
        if (request.to !== undefined && to === undefined) {
          return failure(ROUTE_ERRORS.invalidRequest, 'to must be a valid ISO-8601 date string.');
        }

        return success(
          core.usageService.getSummary({
            consumer_id: request.consumer_id,
            endpoint,
            from,
            to,
          })
        );
      }
      default:
        return failure(ROUTE_ERRORS.routeNotFound, `Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    return failure(ROUTE_ERRORS.protocolError, error instanceof Error ? error.message : 'Unknown protocol error.');
  }
}

export function maybeResolveUsageConsumerId(endpoint: RuntimeEndpoint, payload: unknown): string | undefined {
  if (!isMeteredEndpoint(endpoint) || payload === null || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = (payload as { consumer_id?: unknown }).consumer_id;
  if (typeof candidate !== 'string' || candidate.trim() === '') {
    return undefined;
  }
  return candidate;
}
