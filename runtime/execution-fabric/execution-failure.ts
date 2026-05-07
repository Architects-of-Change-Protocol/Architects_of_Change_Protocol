import { ExecutionFailure, RetryRecommendation } from './types';

export function failureRetryable(failure: ExecutionFailure): boolean {
  return failure.retryable && !failure.resolvedAt;
}

export function deriveRecommendation(failure: ExecutionFailure): RetryRecommendation {
  if (failure.reasonCode.includes('revocation_ack')) return 'wait_for_revocation_ack';
  if (failure.reasonCode.includes('human_review')) return 'require_human_review';
  if (failure.reasonCode.includes('remote_runtime')) return 'retry_remote_runtime';
  if (failure.retryable) return 'retry_same_runtime';
  return 'abort_execution';
}
