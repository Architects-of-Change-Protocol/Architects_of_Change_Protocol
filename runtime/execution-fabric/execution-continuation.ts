import { ExecutionContinuation } from './types';

export function isPendingContinuation(continuation: ExecutionContinuation): boolean {
  return continuation.status === 'pending';
}
