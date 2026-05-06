-- Consent Relationship Console - Phase 2
-- Multi-tenant, audit-first, RLS-ready schema

create extension if not exists pgcrypto;
create extension if not exists citext;

create type consent_subject_type as enum ('user', 'workspace', 'service_account', 'agent');
create type consent_status as enum ('granted', 'denied', 'expired', 'revoked', 'superseded');
create type revocation_reason as enum ('user_request', 'admin_action', 'policy_change', 'legal_request', 'security_event', 'system_cleanup');
create type audience_type as enum ('static', 'dynamic', 'computed');
create type relationship_event_type as enum (
  'audience_created','audience_member_added','audience_member_removed','consent_granted','consent_updated','consent_expired','consent_revoked','campaign_linked','campaign_unlinked','score_recomputed'
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_key citext unique not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  external_ref text,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists campaigns_tenant_idx on public.campaigns (tenant_id);

create table public.audiences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  audience_key citext not null,
  name text not null,
  description text,
  audience_type audience_type not null default 'static',
  filter_definition jsonb,
  lifecycle_state text not null default 'active',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint audiences_tenant_key_unique unique (tenant_id, audience_key)
);
create index audiences_tenant_state_idx on public.audiences (tenant_id, lifecycle_state);
create index audiences_filter_gin_idx on public.audiences using gin (filter_definition jsonb_path_ops);

create table public.audience_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  audience_id uuid not null references public.audiences(id) on delete cascade,
  subject_type consent_subject_type not null,
  subject_id uuid not null,
  membership_source text not null default 'manual',
  source_ref text,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint audience_members_unique_active unique (tenant_id, audience_id, subject_type, subject_id, valid_from)
);
create index audience_members_lookup_idx on public.audience_members (tenant_id, audience_id, subject_type, subject_id);
create index audience_members_subject_idx on public.audience_members (tenant_id, subject_type, subject_id);
create index audience_members_validity_idx on public.audience_members (tenant_id, valid_from, valid_to);

create table public.consent_scopes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  scope_key citext not null,
  scope_name text not null,
  scope_description text,
  legal_basis text,
  data_categories text[] not null default '{}',
  processor_purposes text[] not null default '{}',
  risk_level smallint not null default 1,
  is_sensitive boolean not null default false,
  version integer not null default 1,
  previous_scope_id uuid references public.consent_scopes(id),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consent_scopes_tenant_version_unique unique (tenant_id, scope_key, version),
  constraint consent_scopes_id_version_unique unique (id, version)
);
create index consent_scopes_tenant_active_idx on public.consent_scopes (tenant_id, is_active);
create index consent_scopes_metadata_gin_idx on public.consent_scopes using gin (metadata);

create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subject_type consent_subject_type not null default 'user',
  subject_id uuid not null,
  scope_id uuid not null references public.consent_scopes(id),
  scope_version integer not null,
  status consent_status not null,
  granted_at timestamptz,
  denied_at timestamptz,
  source_channel text not null,
  source_event_id uuid,
  proof_hash text,
  policy_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_consents_scope_version_fk
    foreign key (scope_id, scope_version)
    references public.consent_scopes(id, version)
    deferrable initially deferred
);
create index user_consents_current_lookup_idx on public.user_consents (tenant_id, subject_type, subject_id, scope_id, updated_at desc);
create index user_consents_status_idx on public.user_consents (tenant_id, status);
create index user_consents_metadata_gin_idx on public.user_consents using gin (metadata);

create table public.consent_expirations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_consent_id uuid not null references public.user_consents(id) on delete cascade,
  expires_at timestamptz not null,
  expired_at timestamptz,
  expiration_policy text not null,
  notification_schedule jsonb not null default '[]'::jsonb,
  processing_status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index consent_expirations_due_idx on public.consent_expirations (tenant_id, processing_status, expires_at);
create index consent_expirations_consent_idx on public.consent_expirations (tenant_id, user_consent_id);

create table public.consent_revocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_consent_id uuid not null references public.user_consents(id) on delete cascade,
  revoked_at timestamptz not null default now(),
  reason revocation_reason not null,
  initiated_by_type text not null,
  initiated_by_id uuid,
  support_ticket_ref text,
  evidence_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index consent_revocations_consent_idx on public.consent_revocations (tenant_id, user_consent_id, revoked_at desc);
create index consent_revocations_reason_idx on public.consent_revocations (tenant_id, reason);

create table public.relationship_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_type relationship_event_type not null,
  occurred_at timestamptz not null default now(),
  actor_type text not null,
  actor_id uuid,
  audience_id uuid references public.audiences(id),
  subject_type consent_subject_type,
  subject_id uuid,
  scope_id uuid references public.consent_scopes(id),
  user_consent_id uuid references public.user_consents(id),
  campaign_id uuid references public.campaigns(id),
  correlation_id uuid,
  causation_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index relationship_events_tenant_time_idx on public.relationship_events (tenant_id, occurred_at desc);
create index relationship_events_tenant_type_idx on public.relationship_events (tenant_id, event_type, occurred_at desc);
create index relationship_events_payload_gin_idx on public.relationship_events using gin (payload);
create index relationship_events_correlation_idx on public.relationship_events (tenant_id, correlation_id);

create table public.relationship_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  subject_type consent_subject_type not null,
  subject_id uuid not null,
  score_name text not null,
  score_value numeric(7,4) not null,
  score_band text,
  model_version text not null,
  computed_at timestamptz not null default now(),
  inputs_snapshot jsonb not null default '{}'::jsonb,
  explanation jsonb,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  constraint relationship_scores_current_unique unique (tenant_id, subject_type, subject_id, score_name, model_version, computed_at)
);
create index relationship_scores_subject_idx on public.relationship_scores (tenant_id, subject_type, subject_id, score_name, computed_at desc);
create index relationship_scores_current_idx on public.relationship_scores (tenant_id, is_current, score_name);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  event_time timestamptz not null default now(),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  actor_type text not null,
  actor_id uuid,
  request_id text,
  session_id text,
  ip_address inet,
  user_agent text,
  before_state jsonb,
  after_state jsonb,
  change_summary jsonb,
  integrity_hash text,
  retention_until timestamptz,
  created_at timestamptz not null default now()
);
create index audit_logs_tenant_time_idx on public.audit_logs (tenant_id, event_time desc);
create index audit_logs_resource_idx on public.audit_logs (tenant_id, resource_type, resource_id);
create index audit_logs_actor_idx on public.audit_logs (tenant_id, actor_type, actor_id, event_time desc);

create table public.campaign_relationship_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  audience_id uuid references public.audiences(id),
  scope_id uuid references public.consent_scopes(id),
  link_type text not null,
  priority smallint not null default 100,
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_links_require_target check (audience_id is not null or scope_id is not null)
);
create index campaign_relationship_links_campaign_idx on public.campaign_relationship_links (tenant_id, campaign_id, is_active, priority);
create index campaign_relationship_links_audience_idx on public.campaign_relationship_links (tenant_id, audience_id);
create index campaign_relationship_links_scope_idx on public.campaign_relationship_links (tenant_id, scope_id);

create or replace function public.current_tenant_id()
returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.tenant_id', true), '')::uuid
$$;

create or replace function public.enforce_tenant_match(row_tenant_id uuid)
returns boolean language sql stable as $$
  select row_tenant_id = public.current_tenant_id()
$$;

create or replace function public.log_audit_hash()
returns trigger language plpgsql security definer as $$
begin
  if new.integrity_hash is null then
    new.integrity_hash := encode(digest(coalesce(row_to_json(new)::text, '')::bytea, 'sha256'), 'hex');
  end if;
  return new;
end;
$$;

create trigger audit_logs_integrity_hash_trg
before insert on public.audit_logs
for each row execute function public.log_audit_hash();

alter table public.audiences enable row level security;
alter table public.audience_members enable row level security;
alter table public.consent_scopes enable row level security;
alter table public.user_consents enable row level security;
alter table public.consent_expirations enable row level security;
alter table public.consent_revocations enable row level security;
alter table public.relationship_events enable row level security;
alter table public.relationship_scores enable row level security;
alter table public.audit_logs enable row level security;
alter table public.campaign_relationship_links enable row level security;

create policy audiences_tenant_isolation on public.audiences for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy audience_members_tenant_isolation on public.audience_members for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy consent_scopes_tenant_isolation on public.consent_scopes for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy user_consents_tenant_isolation on public.user_consents for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy consent_expirations_tenant_isolation on public.consent_expirations for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy consent_revocations_tenant_isolation on public.consent_revocations for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy relationship_events_tenant_isolation on public.relationship_events for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy relationship_scores_tenant_isolation on public.relationship_scores for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy audit_logs_tenant_isolation on public.audit_logs for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));
create policy campaign_relationship_links_tenant_isolation on public.campaign_relationship_links for all using (public.enforce_tenant_match(tenant_id)) with check (public.enforce_tenant_match(tenant_id));

alter table public.audit_logs force row level security;
