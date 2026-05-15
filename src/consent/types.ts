export type ConsentStatus = "active" | "revoked" | "expired" | "superseded";

export type ConsentGrant = {
  id: string;
  workspaceId?: string | null;
  subjectPrincipalId: string;
  controllerPrincipalId?: string | null;
  delegatedByPrincipalId?: string | null;
  scope: string;
  boundaries?: Record<string, unknown> | null;
  status: ConsentStatus;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  metadata?: Record<string, unknown> | null;
};
