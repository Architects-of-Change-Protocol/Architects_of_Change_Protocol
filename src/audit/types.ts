export type AuditTimelineItem = {
  id?: string;
  created_at: string;
  event_type: string;
  severity?: string | null;
  workspace_id?: string | null;
  actor_user_id?: string | null;
  actor_agent_id?: string | null;
  event_detail?: Record<string, unknown> | null;
  [key: string]: unknown;
};
