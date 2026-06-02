import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase-server';
import { AdminJobsTable } from '@/components/admin/jobs-table';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminJobsPage() {
  const supabase = createSupabaseServer();

  const [jobsRes, mappingsRes, teamRes] = await Promise.all([
    supabase
      .from('jobs')
      .select('id, title, client_company, loc, type, experience, exp_level, fn, pay, pay_note, status, posted_at, posted_platforms, applicants_count')
      .order('posted_at', { ascending: false }),
    supabase
      .from('candidate_job_mappings')
      .select('job_id, recruiter_id'),
    supabase
      .from('team_members')
      .select('id, full_name')
      .eq('status', 'Active')
      .order('full_name'),
  ]);

  const jobs     = (jobsRes.data     || []) as any[];
  const mappings = (mappingsRes.data || []) as any[];
  const team     = (teamRes.data     || []) as any[];

  // Compute the dominant recruiter for each job
  // (the recruiter who has the most mappings on this job)
  const recCountsByJob: Record<string, Record<string, number>> = {};
  mappings.forEach(m => {
    if (!m.recruiter_id) return;
    if (!recCountsByJob[m.job_id]) recCountsByJob[m.job_id] = {};
    recCountsByJob[m.job_id][m.recruiter_id] = (recCountsByJob[m.job_id][m.recruiter_id] || 0) + 1;
  });

  const teamById: Record<string, string> = {};
  team.forEach(t => { teamById[t.id] = t.full_name; });

  const enriched = jobs.map(j => {
    const counts = recCountsByJob[j.id] || {};
    const topRecruiterId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      ...j,
      recruiter_id: topRecruiterId || null,
      recruiter_name: topRecruiterId ? (teamById[topRecruiterId] || null) : null,
    };
  });

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Jobs</h2>
          <p>Every role here publishes to the live <Link href="/jobs" style={{ color: 'var(--accent)' }}>/jobs</Link> page and homepage instantly. Click a row for details + applicants.</p>
        </div>
        <Link className="btn btn-glow btn-sm" href="/admin/jobs/new"><Plus size={13} /> Add job</Link>
      </div>

      <AdminJobsTable jobs={enriched as any} teamMembers={team as any} />
    </>
  );
}
