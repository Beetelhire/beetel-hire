import { createSupabaseServer } from '@/lib/supabase-server';
import { logoLetter, pickGrad } from '@/lib/helpers';
import { Mail, Phone, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusPill(s: string) {
  const labels: Record<string, string> = { live: 'Live', review: 'Shortlisting', pending: 'Calibrating', rejected: 'Closed' };
  return <span className={`status-pill ${s}`}><span className="ddot"></span> {labels[s] || s}</span>;
}

export default async function CompaniesPage() {
  const supabase = createSupabaseServer();
  const { data: jobs } = await supabase.from('jobs').select('client_company, client_contact, status');
  const { data: meetings } = await supabase.from('meetings').select('company, name, email');

  type Row = { name: string; roles: number; stages: Set<string>; lead: string; contact: { name?: string; email?: string; phone?: string } };
  const map = new Map<string, Row>();

  (jobs || []).forEach((j: any) => {
    const key = j.client_company || '—';
    if (!map.has(key)) map.set(key, { name: key, roles: 0, stages: new Set(), lead: 'Thomas Berge', contact: j.client_contact || {} });
    const e = map.get(key)!;
    e.roles += 1;
    e.stages.add(j.status);
    const c = j.client_contact || {};
    if (c.name || c.email) e.contact = c;
  });
  (meetings || []).forEach((m: any) => {
    if (!map.has(m.company)) map.set(m.company, { name: m.company, roles: 0, stages: new Set(['pending']), lead: 'Aanya Krishnan', contact: { name: m.name, email: m.email } });
  });

  const rows = [...map.values()];

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Companies</h2>
          <p>Real client companies (admin-only). Public jobs always display as &quot;Beetel Hire&quot; — these are the actual employers behind each posting.</p>
        </div>
      </div>
      <div className="panel">
        <table className="table">
          <thead>
            <tr><th>Company</th><th>Contact</th><th>Open roles</th><th>Stage</th><th>Lead partner</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map(c => {
              const con = c.contact || {};
              return (
                <tr key={c.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: pickGrad(c.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{logoLetter(c.name)}</div>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{con.name || '—'}</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {con.email && <a href={`mailto:${con.email}`} style={{ fontSize: 11.5, color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{con.email}</a>}
                        {con.phone && <a href={`tel:${con.phone}`} style={{ fontSize: 11.5, color: 'var(--fg-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{con.phone}</a>}
                      </div>
                    </div>
                  </td>
                  <td><strong style={{ color: 'var(--fg)' }}>{c.roles}</strong></td>
                  <td>{[...c.stages].map(s => <span key={s}>{statusPill(s)} </span>)}</td>
                  <td>{c.lead}</td>
                  <td style={{ textAlign: 'right' }}><ChevronRight size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6}>
                <div className="empty"><h4>No companies yet</h4><p>They&apos;ll appear here as you add jobs or receive booking leads.</p></div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
