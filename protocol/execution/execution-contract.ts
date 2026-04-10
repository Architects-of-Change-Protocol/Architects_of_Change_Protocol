import type { ProtocolCapability } from '../capability/capability-types';
import type { NormalizedExecutionRequest, ExecutionContract } from './execution-types';

export type BuildExecutionContractInput = {
  normalized_request: NormalizedExecutionRequest;
  normalized_capability: ProtocolCapability;
  issued_at: string;
};

export function buildExecutionContract(input: BuildExecutionContractInput): ExecutionContract {
  const { normalized_request, normalized_capability, issued_at } = input;

  return {
    adapter: normalized_request.execution_target.adapter,
    operation: normalized_request.execution_target.operation,
    subject: normalized_capability.subject,
    grantee: normalized_capability.grantee,
    allowed_scope: normalized_request.requested_scope,
    allowed_permissions: normalized_request.requested_permissions,
    capability_hash: normalized_capability.capability_hash,
    parent_consent_hash: normalized_capability.parent_consent_hash,
    ...(normalized_request.marketMakerId !== undefined ? { marketMakerId: normalized_request.marketMakerId } : {}),
    ...(normalized_request.resource !== undefined ? { resource: normalized_request.resource } : {}),
    ...(normalized_request.action_context !== undefined ? { action_context: normalized_request.action_context } : {}),
    issued_at,
  };
}
