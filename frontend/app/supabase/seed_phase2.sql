insert into public.tenants (id, tenant_key, display_name)
values ('00000000-0000-0000-0000-000000000001', 'aoc-enterprise', 'AOC Enterprise')
on conflict (tenant_key) do nothing;

insert into public.campaigns (id, tenant_id, external_ref, name)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'cmp-q2-retention', 'Q2 Retention Wave'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'cmp-reconsent', 'Annual Re-Consent Drive')
on conflict do nothing;

insert into public.audiences (id, tenant_id, audience_key, name, audience_type, filter_definition)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'high-trust-users', 'High Trust Users', 'computed', '{"score":{"gte":0.8}}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'expiring-consent-30d', 'Consents Expiring in 30 Days', 'dynamic', '{"expires_in_days":{"lte":30}}'::jsonb)
on conflict do nothing;
