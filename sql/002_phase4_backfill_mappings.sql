-- ===========================================================
-- Beetel Hire — Phase 4 utility: backfill candidate_job_mappings
-- from existing applications (pre-Phase-1 data).
-- ===========================================================
-- Run ONCE after Phase 1 + Phase 4 deploys. Safe to re-run — uses
-- ON CONFLICT DO NOTHING to skip any rows that already have a mapping.
--
-- For every (candidate_id, job_id) in `applications` that doesn't already
-- have a row in `candidate_job_mappings`, this creates a mapping with
-- stage='Applied' (or 'Hired' if the original application status was
-- 'Onboarded', or 'Rejected' if it was 'Dropped').
-- ===========================================================

insert into public.candidate_job_mappings (candidate_id, job_id, stage, source, added_at)
select
  a.candidate_id,
  a.job_id,
  case a.status
    when 'Onboarded' then 'Hired'
    when 'Dropped'   then 'Rejected'
    else 'Applied'
  end as stage,
  c.source,
  a.applied_at
from public.applications a
join public.candidates c on c.id = a.candidate_id
on conflict (candidate_id, job_id) do nothing;

-- ===========================================================
-- Done. Verify: counts should match (or be close to) the applications count.
-- ===========================================================
-- select count(*) as applications from public.applications;
-- select count(*) as mappings from public.candidate_job_mappings;
