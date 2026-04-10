import { authorizeExecution, type ExecutionAuthorizationResult } from '../../protocol/execution';
import { evaluateEnforcement, type EnforcementDecision } from '../../protocol/enforcement';
import { mintCapability, type ProtocolCapability } from '../../protocol/capability';
import type { ApiResponse, RuntimeEndpoint } from '../types/api-types';

export type RuntimeCore = {
  evaluateEnforcement: typeof evaluateEnforcement;
  authorizeExecution: typeof authorizeExecution;
  mintCapability: typeof mintCapability;
};

export const DEFAULT_RUNTIME_CORE: RuntimeCore = {
  evaluateEnforcement,
  authorizeExecution,
  mintCapability,
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

export function deriveDecision(endpoint: RuntimeEndpoint, data: unknown): { decision: 'allow' | 'deny'; reasonCode: string } {
  if (endpoint === '/enforcement/evaluate') {
    const enforcement = data as EnforcementDecision;
    return { decision: enforcement.allowed ? 'allow' : 'deny', reasonCode: enforcement.reason_code };
  }

  if (endpoint === '/execution/authorize') {
    const execution = data as ExecutionAuthorizationResult;
    return { decision: execution.authorized ? 'allow' : 'deny', reasonCode: execution.reason_code };
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
): ApiResponse<EnforcementDecision | ExecutionAuthorizationResult | ProtocolCapability> {
  try {
    switch (endpoint) {
      case '/enforcement/evaluate':
        return success(core.evaluateEnforcement(reviveNow(payload as Parameters<typeof evaluateEnforcement>[0])));
      case '/execution/authorize':
        return success(core.authorizeExecution(reviveNow(payload as Parameters<typeof authorizeExecution>[0])));
      case '/capability/mint':
        return success(core.mintCapability(payload as Parameters<typeof mintCapability>[0]));
      default:
        return failure('ROUTE_NOT_FOUND', `Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    return failure('PROTOCOL_ERROR', error instanceof Error ? error.message : 'Unknown protocol error.');
  }
}
