import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type ProtocolCapability } from '../../protocol/capability';
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

export type RuntimeCore = {
  evaluateEnforcement: typeof evaluateEnforcement;
  authorizeExecution: typeof authorizeExecution;
  mintCapability: typeof mintCapability;
  trustService: InMemoryTrustService;
  payoutExecutor: RlusdPayoutExecutorService;
};

const defaultTrustService = new InMemoryTrustService();
const defaultPayoutExecutor = new RlusdPayoutExecutorService(defaultTrustService, new RlusdPayoutAdapter());

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

export function deriveDecision(endpoint: RuntimeEndpoint, data: unknown): { decision: 'allow' | 'deny'; reasonCode: string } {
  if (endpoint === '/enforcement/evaluate') {
    const enforcement = data as EnforcementDecision;
    return { decision: enforcement.allowed ? 'allow' : 'deny', reasonCode: enforcement.reason_code };
  }

  if (endpoint === '/execution/authorize') {
    const execution = data as ExecutionAuthorizationResult;
    return { decision: execution.authorized ? 'allow' : 'deny', reasonCode: execution.reason_code };
  }
  if (endpoint === '/trust/verify') {
    const verification = data as IdentityVerificationResult;
    return { decision: verification.valid ? 'allow' : 'deny', reasonCode: verification.reason_code };
  }
  if (endpoint === '/trust/credential/register') {
    return { decision: 'allow', reasonCode: 'CREDENTIAL_REGISTERED' };
  }
  if (endpoint === '/trust/consent/grant') {
    return { decision: 'allow', reasonCode: 'CONSENT_GRANTED' };
  }
  if (endpoint === '/payout/execute') {
    const payout = data as { allowed: boolean; reason_code: string };
    return { decision: payout.allowed ? 'allow' : 'deny', reasonCode: payout.reason_code };
  }
  if (endpoint === '/payout/callback') {
    const callback = data as { received: true; reason_code: string };
    return { decision: callback.received ? 'allow' : 'deny', reasonCode: callback.reason_code };
  }

  return {
    decision: 'allow',
    reasonCode: 'CAPABILITY_MINTED',
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
  | { received: true; reason_code: string }
> {
  try {
    switch (endpoint) {
      case '/enforcement/evaluate':
        return success(core.evaluateEnforcement(reviveNow(payload as Parameters<typeof evaluateEnforcement>[0])));
      case '/execution/authorize':
        return success(core.authorizeExecution(reviveNow(payload as Parameters<typeof authorizeExecution>[0])));
      case '/capability/mint':
        return success(core.mintCapability(payload as Parameters<typeof mintCapability>[0]));
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
      default:
        return failure(ROUTE_ERRORS.routeNotFound, `Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    return failure(ROUTE_ERRORS.protocolError, error instanceof Error ? error.message : 'Unknown protocol error.');
  }
}
