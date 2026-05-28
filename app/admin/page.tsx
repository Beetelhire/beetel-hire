import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase-server';
import { fmtRelative } from '@/lib/format';
import { ArrowRight, Edit2, Plus, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusPill(s: string) {
  const labels: Record<string, string> = { live: 'Live', review: 'Shortlisting', pending: 'Calibrating', rejected: 'Closed' };
  return <span className={`status-pill ${s}`}><span className="ddot"></span> {labels[s] || s}</span>;
}

export default async function AdminOverview() {
  const supabase = createSupabaseServer();

  const [{ data: jobs }, { count: candidatesCount }, { count: meetingsCount }, { count: appsCount }] = await Promise.all([
    supabase.from('jobs').select('id, title, fn, exp_level, loc, client_company, status, posted_at, applicants_count').order('posted_at', { ascending: false }).limit(5),
    supabase.from('candidates').select('id', { count: 'exact', head: true }),
    supabase.from('meetings').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }),
  ]);

  const totalJobs = jobs?.length || 0;
  const liveJobs = (jobs || []).filter((j: any) => j.status === 'live').length;

  return (
    <>
      {/* KPI grid */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Open roles</div>
          <div className="value">{liveJobs}</div>
          <div className="delta"><TrendingUp size={12} /> Live now</div>
        </div>
        <div className="kpi">
          <div className="label">Active candidates</div>
          <div className="value">{candidatesCount ?? 0}</div>
          <div className="delta"><TrendingUp size={12} /> Across all roles</div>
        </div>
        <div className="kpi">
          <div className="label">Meetings booked</div>
          <div className="value">{meetingsCount ?? 0}</div>
          <div className="delta"><TrendingUp size={12} /> via Book a Call</div>
        </div>
        <div className="kpi">
          <div className="label">Applications</div>
          <div className="value">{appsCount ?? 0}</div>
          <div className="delta">In pipeline</div>
        </div>
      </div>

      {/* Recent jobs preview */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div className="panel-head">
          <div>
            <h3>Recent jobs</h3>
            <div className="sub">{liveJobs} live · {totalJobs - liveJobs} in review</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn btn-sm btn-secondary" href="/admin/jobs">View all <ArrowRight size={13} /></Link>
            <Link className="btn btn-sm btn-primary" href="/admin/jobs/new"><Plus size={13} /> Add job</Link>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Client</th>
              <th>Status</th>
              <th>Posted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(jobs || []).map((j: any) => (
              <tr key={j.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{j.title}</div>
                  <div className="small">{j.fn || ''}{j.exp_level ? ` · ${j.exp_level}` : ''} · {j.loc}</div>
                </td>
                <td>{j.client_company || '—'}</td>
                <td>{statusPill(j.status)}</td>
                <td>{fmtRelative(j.posted_at)}</td>
                <td style={{ textAlign: 'right' }}>
                  <Link className="btn btn-icon-sq btn-ghost" href={`/admin/jobs/${j.id}`}><Edit2 style={{ width: 13, height: 13 }} /></Link>
                </td>
              </tr>
            ))}
            {(!jobs || jobs.length === 0) && (
              <tr><td colSpan={5}>
                <div className="empty">
                  <h4>No roles yet</h4>
                  <p>Add your first job to publish to the live site.</p>
                  <Link className="btn btn-glow btn-sm" href="/admin/jobs/new"><Plus size={13} /> Add a job</Link>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
