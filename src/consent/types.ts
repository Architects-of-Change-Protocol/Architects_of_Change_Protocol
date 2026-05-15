export type ConsentGrant = {
  id: string;
  subject_id: string;
  scope: string;
  status: "active" | "revoked" | "expired";
  granted_at: string;
  expires_at: string | null;
  metadata?: Record<string, unknown> | null;
};
