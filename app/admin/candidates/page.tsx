import { createSupabaseServer } from '@/lib/supabase-server';
import { CandidatePoolTable } from '@/components/admin/candidate-pool-table';

export const dynamic = 'force-dynamic';

export default async function CandidatePoolPage() {
  const supabase = createSupabaseServer();

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .order('last_touch', { ascending: false });

  // Fetch applications + job titles so we can show "applied to" inline
  const { data: applications } = await supabase
    .from('applications')
    .select('candidate_id, job_id, applied_at, status, job:jobs(id, title, client_company)');

  const appliedByCandidate: Record<string, any[]> = {};
  (applications || []).forEach((a: any) => {
    if (!appliedByCandidate[a.candidate_id]) appliedByCandidate[a.candidate_id] = [];
    appliedByCandidate[a.candidate_id].push({
      id: a.job?.id,
      title: a.job?.title,
      client_company: a.job?.client_company,
      applied_at: a.applied_at,
      status: a.status,
    });
  });

  const enriched = (candidates || []).map((c: any) => ({
    ...c,
    applied_jobs: appliedByCandidate[c.id] || [],
  }));

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Candidate Pool</h2>
          <p>Every candidate we&apos;ve worked with — across all roles. Click any row to open the full profile.</p>
        </div>
      </div>
      <CandidatePoolTable candidates={enriched as any} />
    </>
  );
}
