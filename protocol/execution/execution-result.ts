import type { EnforcementDecision } from '../enforcement/enforcement-types';
import { EXECUTION_REASON_CODES } from './execution-types';
import type {
  ExecutionAuthorizationResult,
  ExecutionContract,
  ExecutionReasonCode,
  ExecutionTarget,
  NormalizedExecutionRequest,
} from './execution-types';

export type BuildExecutionAuthorizationResultInput = {
  authorized: boolean;
  reason_code: ExecutionReasonCode;
  reasons: string[];
  evaluated_at: string;
  execution_target: ExecutionTarget;
  normalized_request?: NormalizedExecutionRequest;
  enforcement_decision?: EnforcementDecision;
  execution_contract?: ExecutionContract;
  authorization_token?: string | null;
};

export function buildExecutionAuthorizationResult(
  input: BuildExecutionAuthorizationResultInput
): ExecutionAuthorizationResult {
  return {
    authorized: input.authorized,
    decision: input.authorized ? 'authorized' : 'rejected',
    reason_code: input.reason_code,
    reasons: input.reasons,
    evaluated_at: input.evaluated_at,
    execution_target: input.execution_target,
    ...(input.normalized_request !== undefined ? { normalized_request: input.normalized_request } : {}),
    ...(input.enforcement_decision !== undefined ? { enforcement_decision: input.enforcement_decision } : {}),
    ...(input.execution_contract !== undefined ? { execution_contract: input.execution_contract } : {}),
    authorization_token: input.authorization_token ?? null,
  };
}

export function buildRejectedExecutionResult(input: {
  reason_code: ExecutionReasonCode;
  reasons: string[];
  now: Date;
  execution_target: ExecutionTarget;
  normalized_request?: NormalizedExecutionRequest;
  enforcement_decision?: EnforcementDecision;
}): ExecutionAuthorizationResult {
  return buildExecutionAuthorizationResult({
    authorized: false,
    reason_code: input.reason_code,
    reasons: input.reasons,
    evaluated_at: input.now.toISOString(),
    execution_target: input.execution_target,
    normalized_request: input.normalized_request,
    enforcement_decision: input.enforcement_decision,
    authorization_token: null,
  });
}

export function buildAuthorizedExecutionResult(input: {
  now: Date;
  execution_target: ExecutionTarget;
  normalized_request: NormalizedExecutionRequest;
  enforcement_decision: EnforcementDecision;
  execution_contract: ExecutionContract;
}): ExecutionAuthorizationResult {
  return buildExecutionAuthorizationResult({
    authorized: true,
    reason_code: EXECUTION_REASON_CODES.EXECUTION_AUTHORIZED,
    reasons: ['Execution request authorized by canonical enforcement runtime.'],
    evaluated_at: input.now.toISOString(),
    execution_target: input.execution_target,
    normalized_request: input.normalized_request,
    enforcement_decision: input.enforcement_decision,
    execution_contract: input.execution_contract,
    authorization_token: null,
  });
}
