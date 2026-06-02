import { createSupabaseServer } from '@/lib/supabase-server';
import { CandidatePoolTable } from '@/components/admin/candidate-pool-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CandidatePoolPage() {
  const supabase = createSupabaseServer();

  const [candidatesRes, applicationsRes, mappingsRes, teamRes, jobsRes] = await Promise.all([
    supabase.from('candidates').select('*').order('last_touch', { ascending: false }),
    supabase.from('applications').select('candidate_id, job_id, applied_at, status, job:jobs(id, title, client_company)'),
    supabase.from('candidate_job_mappings').select('id, candidate_id, job_id, stage, recruiter_id, source, added_at, job:jobs(id, title, client_company), recruiter:team_members(id, full_name)'),
    supabase.from('team_members').select('id, full_name, role').eq('status', 'Active').order('full_name'),
    supabase.from('jobs').select('id, title, client_company, status').order('posted_at', { ascending: false }),
  ]);

  const candidates    = candidatesRes.data || [];
  const applications  = applicationsRes.data || [];
  const mappings      = mappingsRes.data || [];
  const teamMembers   = teamRes.data || [];
  const jobs          = jobsRes.data || [];

  // Build a candidate-id -> applied jobs index from BOTH applications and mappings
  const appliedByCandidate: Record<string, any[]> = {};
  (applications || []).forEach((a: any) => {
    if (!a.job?.id) return;
    if (!appliedByCandidate[a.candidate_id]) appliedByCandidate[a.candidate_id] = [];
    appliedByCandidate[a.candidate_id].push({
      id: a.job.id,
      title: a.job.title,
      client_company: a.job.client_company,
      applied_at: a.applied_at,
      status: a.status,                      // legacy HireStatus from applications
      stage: null,                           // mappings provide stage
      mapping_id: null,
      recruiter: null,
      source: null,
      from: 'application',
    });
  });

  // Mappings carry the canonical pipeline stage
  (mappings || []).forEach((m: any) => {
    if (!appliedByCandidate[m.candidate_id]) appliedByCandidate[m.candidate_id] = [];
    // If we already have an entry for this job from applications, merge in the stage
    const existing = appliedByCandidate[m.candidate_id].find((e: any) => e.id === m.job?.id);
    if (existing) {
      existing.stage      = m.stage;
      existing.mapping_id = m.id;
      existing.recruiter  = m.recruiter?.full_name || null;
      existing.source     = m.source;
    } else if (m.job?.id) {
      appliedByCandidate[m.candidate_id].push({
        id: m.job.id,
        title: m.job.title,
        client_company: m.job.client_company,
        applied_at: m.added_at,
        status: null,
        stage: m.stage,
        mapping_id: m.id,
        recruiter: m.recruiter?.full_name || null,
        source: m.source,
        from: 'mapping',
      });
    }
  });

  // Recruiter lookup (id -> name) so we can show the assigned recruiter
  const recruiterById: Record<string, string> = {};
  (teamMembers || []).forEach((t: any) => { recruiterById[t.id] = t.full_name; });

  const enriched = (candidates || []).map((c: any) => ({
    ...c,
    applied_jobs: appliedByCandidate[c.id] || [],
    recruiter_name: c.recruiter_id ? recruiterById[c.recruiter_id] || null : null,
  }));

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Candidate Pool</h2>
          <p>Every candidate we&apos;ve worked with — across all roles. Click any row to open the full profile.</p>
        </div>
      </div>
      <CandidatePoolTable
        candidates={enriched as any}
        jobs={jobs as any}
        teamMembers={teamMembers as any}
      />
    </>
  );
}
