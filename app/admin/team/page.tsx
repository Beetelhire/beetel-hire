import { createSupabaseServer } from '@/lib/supabase-server';
import { TeamTable, type TeamRow } from '@/components/admin/team-table';
import type { TeamMember } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function firstOfCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export default async function TeamPage() {
  const supabase = createSupabaseServer();
  const thisMonth = firstOfCurrentMonth();

  const [membersRes, mappingsRes, candsRes, perfRes] = await Promise.all([
    supabase.from('team_members').select('*').order('full_name'),
    supabase.from('candidate_job_mappings').select('recruiter_id, job:jobs(id, status)'),
    supabase.from('candidates').select('id, recruiter_id'),
    supabase.from('monthly_performance').select('*').eq('month', thisMonth),
  ]);

  const members  = (membersRes.data || []) as TeamMember[];
  const mappings = (mappingsRes.data || []) as any[];
  const cands    = (candsRes.data    || []) as any[];
  const perf     = (perfRes.data     || []) as any[];

  // Aggregates per team member
  const activeJobsByRecruiter: Record<string, Set<string>> = {};
  mappings.forEach(m => {
    if (!m.recruiter_id || m.job?.status !== 'live' || !m.job?.id) return;
    if (!activeJobsByRecruiter[m.recruiter_id]) activeJobsByRecruiter[m.recruiter_id] = new Set();
    activeJobsByRecruiter[m.recruiter_id].add(m.job.id);
  });

  const candsByRecruiter: Record<string, number> = {};
  cands.forEach(c => {
    if (!c.recruiter_id) return;
    candsByRecruiter[c.recruiter_id] = (candsByRecruiter[c.recruiter_id] || 0) + 1;
  });

  const perfByMember: Record<string, { target: number; achieved: number }> = {};
  perf.forEach(p => {
    perfByMember[p.team_member_id] = {
      target: Number(p.target_revenue) || 0,
      achieved: Number(p.achieved_revenue) || 0,
    };
  });

  const memberNameById: Record<string, string> = {};
  members.forEach(m => { memberNameById[m.id] = m.full_name; });

  const rows: TeamRow[] = members.map(m => ({
    ...m,
    manager_name: m.manager_id ? memberNameById[m.manager_id] || null : null,
    active_jobs: activeJobsByRecruiter[m.id]?.size || 0,
    candidates_managed: candsByRecruiter[m.id] || 0,
    this_month_target:   perfByMember[m.id]?.target   || 0,
    this_month_achieved: perfByMember[m.id]?.achieved || 0,
  }));

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Team</h2>
          <p>Your recruitment team — add members, track performance, manage targets.</p>
        </div>
      </div>
      <TeamTable rows={rows} />
    </>
  );
}
