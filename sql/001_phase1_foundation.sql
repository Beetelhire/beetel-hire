-- ===========================================================
-- Beetel Hire — Phase 1: Database foundation + audit logs
-- ===========================================================
-- Adds:
--   team_members              -- canonical team member directory
--   monthly_performance       -- per team member, per month
--   contact_enquiries         -- Contact Us form submissions
--   candidate_job_mappings    -- candidate <-> job pipeline (Applied .. Hired/Rejected)
--   audit_logs                -- activity trail
--   New columns on candidates -- current_company, current_designation,
--                                linkedin_url, recruiter_id, added_by
--
-- This script is IDEMPOTENT - safe to run more than once.
-- Run in Supabase Studio -> SQL Editor.
-- ===========================================================


-- -----------------------------------------------------------
-- 1. team_members
-- -----------------------------------------------------------
create table if not exists public.team_members (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid references auth.users(id) on delete set null,
  employee_id         text unique,
  full_name           text not null,
  email               text not null unique,
  phone               text,
  role                text not null,           -- 'recruiter' | 'manager' | 'admin' | 'ops' | etc.
  department          text,
  designation         text,
  doj                 date,
  manager_id          uuid references public.team_members(id) on delete set null,
  profile_photo_url   text,
  status              text not null default 'Active' check (status in ('Active','Inactive')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_team_members_status   on public.team_members(status);
create index if not exists idx_team_members_role     on public.team_members(role);
create index if not exists idx_team_members_manager  on public.team_members(manager_id);
create index if not exists idx_team_members_auth     on public.team_members(auth_user_id);


-- -----------------------------------------------------------
-- 2. monthly_performance
-- -----------------------------------------------------------
create table if not exists public.monthly_performance (
  id                       uuid primary key default gen_random_uuid(),
  team_member_id           uuid not null references public.team_members(id) on delete cascade,
  month                    date not null,                 -- always first of month: 2026-06-01
  target_revenue           numeric(14,2) not null default 0,
  achieved_revenue         numeric(14,2) not null default 0,
  placements_made          int not null default 0,
  interviews_scheduled     int not null default 0,
  candidates_processed     int not null default 0,
  notes                    text,
  completed                boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (team_member_id, month)
);

create index if not exists idx_monthly_perf_month        on public.monthly_performance(month);
create index if not exists idx_monthly_perf_team_member  on public.monthly_performance(team_member_id);


-- -----------------------------------------------------------
-- 3. contact_enquiries
-- -----------------------------------------------------------
create table if not exists public.contact_enquiries (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  company_name  text,
  email         text not null,
  phone         text,
  subject       text,
  message       text not null,
  status        text not null default 'New' check (status in ('New','Contacted','Closed')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_contact_enq_status   on public.contact_enquiries(status);
create index if not exists idx_contact_enq_created  on public.contact_enquiries(created_at desc);


-- -----------------------------------------------------------
-- 4. candidate_job_mappings
-- Canonical pipeline table. One row per candidate-on-this-job.
-- Public applications continue to write to `applications`; an
-- accompanying mapping row will be created from Phase 4 onward.
-- -----------------------------------------------------------
create table if not exists public.candidate_job_mappings (
  id              uuid primary key default gen_random_uuid(),
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  job_id          uuid not null references public.jobs(id) on delete cascade,
  stage           text not null default 'Applied'
                    check (stage in ('Applied','Screening','Interview','Client Review','Offer','Hired','Rejected')),
  recruiter_id    uuid references public.team_members(id) on delete set null,
  source          text,
  notes           text,
  added_at        timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create index if not exists idx_cjm_candidate   on public.candidate_job_mappings(candidate_id);
create index if not exists idx_cjm_job         on public.candidate_job_mappings(job_id);
create index if not exists idx_cjm_recruiter   on public.candidate_job_mappings(recruiter_id);
create index if not exists idx_cjm_stage       on public.candidate_job_mappings(stage);


-- -----------------------------------------------------------
-- 5. audit_logs
-- -----------------------------------------------------------
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  user_email      text,
  user_name       text,
  action          text not null,            -- 'create' | 'update' | 'delete' | 'status_change' | 'export' | ...
  entity_type     text not null,            -- 'candidate' | 'job' | 'team_member' | 'enquiry' | ...
  entity_id       uuid,
  entity_label    text,                     -- human-readable identifier ("Senior Engineer @ Acme")
  changes         jsonb,                    -- {before, after} or freeform snapshot
  created_at      timestamptz not null default now()
);

create index if not exists idx_audit_entity   on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_user     on public.audit_logs(user_id);
create index if not exists idx_audit_created  on public.audit_logs(created_at desc);


-- -----------------------------------------------------------
-- 6. New columns on candidates
-- -----------------------------------------------------------
alter table public.candidates add column if not exists current_company     text;
alter table public.candidates add column if not exists current_designation text;
alter table public.candidates add column if not exists linkedin_url        text;
alter table public.candidates add column if not exists recruiter_id        uuid references public.team_members(id) on delete set null;
alter table public.candidates add column if not exists added_by            uuid references auth.users(id) on delete set null;

create index if not exists idx_candidates_recruiter on public.candidates(recruiter_id);
create index if not exists idx_candidates_source    on public.candidates(source);


-- -----------------------------------------------------------
-- 7. Shared updated_at trigger
-- -----------------------------------------------------------
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_team_members_updated') then
    create trigger trg_team_members_updated before update on public.team_members
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_monthly_perf_updated') then
    create trigger trg_monthly_perf_updated before update on public.monthly_performance
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_contact_enq_updated') then
    create trigger trg_contact_enq_updated before update on public.contact_enquiries
      for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_cjm_updated') then
    create trigger trg_cjm_updated before update on public.candidate_job_mappings
      for each row execute function public.set_updated_at();
  end if;
end $$;


-- -----------------------------------------------------------
-- 8. Row Level Security
-- -----------------------------------------------------------
alter table public.team_members            enable row level security;
alter table public.monthly_performance     enable row level security;
alter table public.contact_enquiries       enable row level security;
alter table public.candidate_job_mappings  enable row level security;
alter table public.audit_logs              enable row level security;

-- team_members: admins read/write all
drop policy if exists team_members_admin_all on public.team_members;
create policy team_members_admin_all on public.team_members
  for all to authenticated
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- monthly_performance: admins read/write all
drop policy if exists monthly_perf_admin_all on public.monthly_performance;
create policy monthly_perf_admin_all on public.monthly_performance
  for all to authenticated
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- contact_enquiries: anon can INSERT (public form); admins read/update/delete
drop policy if exists contact_enq_public_insert on public.contact_enquiries;
create policy contact_enq_public_insert on public.contact_enquiries
  for insert to anon, authenticated
  with check (true);

drop policy if exists contact_enq_admin_select on public.contact_enquiries;
create policy contact_enq_admin_select on public.contact_enquiries
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists contact_enq_admin_update on public.contact_enquiries;
create policy contact_enq_admin_update on public.contact_enquiries
  for update to authenticated
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

drop policy if exists contact_enq_admin_delete on public.contact_enquiries;
create policy contact_enq_admin_delete on public.contact_enquiries
  for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- candidate_job_mappings: admins read/write all
drop policy if exists cjm_admin_all on public.candidate_job_mappings;
create policy cjm_admin_all on public.candidate_job_mappings
  for all to authenticated
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- audit_logs: admins read; inserts happen via service-role from API routes
drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select on public.audit_logs
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));


-- -----------------------------------------------------------
-- Done.
-- -----------------------------------------------------------
