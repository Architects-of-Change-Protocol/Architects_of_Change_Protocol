create table if not exists public.project_bootstrap_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  discovery_version integer not null,
  brief_version integer not null,
  execution_health text not null check (execution_health in ('Green', 'Yellow', 'Red')),
  execution_complexity text not null check (execution_complexity in ('Low', 'Medium', 'High', 'Very High')),
  confidence_score numeric not null check (confidence_score >= 0 and confidence_score <= 100),
  stakeholder_pressure_score numeric not null check (stakeholder_pressure_score >= 0 and stakeholder_pressure_score <= 100),
  dependency_pressure_score numeric not null check (dependency_pressure_score >= 0 and dependency_pressure_score <= 100),
  risk_pressure_score numeric not null check (risk_pressure_score >= 0 and risk_pressure_score <= 100),
  unknown_pressure_score numeric not null check (unknown_pressure_score >= 0 and unknown_pressure_score <= 100),
  governance_summary text not null check (array_length(regexp_split_to_array(trim(governance_summary), '\s+'), 1) <= 250),
  recommended_actions_json jsonb not null default '[]'::jsonb,
  critical_findings_json jsonb not null default '[]'::jsonb,
  positive_signals_json jsonb not null default '[]'::jsonb,
  concerns_json jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_bootstrap_briefs_version_unique unique (workspace_id, project_id, brief_version),
  constraint project_bootstrap_briefs_discovery_version_unique unique (workspace_id, project_id, discovery_version, brief_version)
);

create index if not exists project_bootstrap_briefs_latest_idx
  on public.project_bootstrap_briefs (workspace_id, project_id, brief_version desc);

alter table public.project_bootstrap_briefs enable row level security;

create policy "project_bootstrap_briefs_workspace_read"
  on public.project_bootstrap_briefs
  for select
  using (
    exists (
      select 1
      from public.workspace_memberships wm
      where wm.workspace_id = project_bootstrap_briefs.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "project_bootstrap_briefs_workspace_insert"
  on public.project_bootstrap_briefs
  for insert
  with check (
    exists (
      select 1
      from public.workspace_memberships wm
      where wm.workspace_id = project_bootstrap_briefs.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'project_manager')
    )
  );

create policy "project_bootstrap_briefs_workspace_update_blocked"
  on public.project_bootstrap_briefs
  for update
  using (false)
  with check (false);
