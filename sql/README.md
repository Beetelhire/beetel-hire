# Beetel Hire — SQL migrations

Idempotent migrations to evolve the Supabase schema. Run them in order in the Supabase Studio SQL editor.

## How to run a migration

1. Open `https://supabase.com/dashboard` → select the Beetel Hire project.
2. Left sidebar → **SQL Editor**.
3. Click **+ New query**.
4. Open the migration file from `/sql` in this repo, copy the entire contents.
5. Paste into the SQL editor.
6. Click **Run** (bottom right) or hit `Cmd/Ctrl + Enter`.
7. You should see a green "Success. No rows returned." message at the bottom.

All migrations are **idempotent** — running them twice is safe. They use `create table if not exists`, `add column if not exists`, and `drop policy if exists` before recreating.

## Migrations

| File | What it does |
|---|---|
| `001_phase1_foundation.sql` | Phase 1: adds team_members, monthly_performance, contact_enquiries, candidate_job_mappings, audit_logs. Adds new columns to candidates. Sets RLS policies. |
| `002_phase4_backfill_mappings.sql` | Phase 4 utility: backfills `candidate_job_mappings` rows for every existing `applications` row. Safe to re-run (uses `on conflict do nothing`). Optional — without it, candidates who applied via the public form before Phase 4 will not appear in the Pipeline view. |

## Verifying after running

After running `001_phase1_foundation.sql`, check in Supabase Studio → **Table Editor** that these tables now appear:

- `team_members` (empty)
- `monthly_performance` (empty)
- `contact_enquiries` (empty)
- `candidate_job_mappings` (empty)
- `audit_logs` (empty)

And open `candidates` and confirm these columns exist:

- `current_company`
- `current_designation`
- `linkedin_url`
- `recruiter_id`
- `added_by`

If all of these are present, Phase 1 is done.
