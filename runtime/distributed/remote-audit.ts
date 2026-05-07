import { RemoteAuditReference } from './types';

const auditRefs = new Map<string, RemoteAuditReference>();

export function createRemoteAuditReference(input: RemoteAuditReference): RemoteAuditReference {
  auditRefs.set(input.auditRefId, input);
  return input;
}

export function resolveRemoteAuditReference(auditRefId: string): RemoteAuditReference | undefined {
  return auditRefs.get(auditRefId);
}

export function clearRemoteAuditReferences(): void {
  auditRefs.clear();
}
