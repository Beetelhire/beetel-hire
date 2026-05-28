import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase-server';
import { fmtRelative, logoLetter } from '@/lib/format';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const supabase = createSupabaseServer();
  const { data: apps } = await supabase
    .from('applications')
    .select('id, status, applied_at, candidate:candidates(id, name, email, avatar_url, location), job:jobs(id, title, client_company)')
    .order('applied_at', { ascending: false });

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Applications</h2>
          <p>All submissions from candidates against open roles.</p>
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Candidate</th><th>Applied to</th><th>Client</th><th>Status</th><th>Received</th><th></th></tr>
          </thead>
          <tbody>
            {(apps || []).map((a: any) => {
              const c = a.candidate; const j = a.job;
              if (!c || !j) return null;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.avatar_url
                        ? <img alt="" src={c.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{logoLetter(c.name)}</div>}
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div className="small">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Link href={`/admin/jobs/${j.id}`} style={{ color: 'var(--accent)' }}>{j.title}</Link></td>
                  <td>{j.client_company}</td>
                  <td><span className={`hire-status-pill ${a.status}`}><span className="ddot"></span>{a.status}</span></td>
                  <td>{fmtRelative(a.applied_at)}</td>
                  <td style={{ textAlign: 'right' }}><ChevronRight size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                </tr>
              );
            })}
            {(!apps || apps.length === 0) && (
              <tr><td colSpan={6}>
                <div className="empty">
                  <h4>No applications yet</h4>
                  <p>When candidates apply to a role, they&apos;ll show up here.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
