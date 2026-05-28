import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase-server';
import { AdminJobsTable } from '@/components/admin/jobs-table';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminJobsPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('jobs')
    .select('id, title, client_company, loc, type, experience, exp_level, fn, pay, pay_note, status, posted_at, posted_platforms, applicants_count')
    .order('posted_at', { ascending: false });

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Jobs</h2>
          <p>Every role here publishes to the live <Link href="/jobs" style={{ color: 'var(--accent)' }}>/jobs</Link> page and homepage instantly. Click a row for details + applicants.</p>
        </div>
        <Link className="btn btn-glow btn-sm" href="/admin/jobs/new"><Plus size={13} /> Add job</Link>
      </div>

      <AdminJobsTable jobs={(data || []) as any} />
    </>
  );
}
