import { createSupabaseServer } from '@/lib/supabase-server';
import { fmtRelative, logoLetter } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const supabase = createSupabaseServer();
  const { data: meetings } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Meetings</h2>
          <p>Discovery calls booked through <em>Book a Call</em> on the marketing site. Every entry was prequalified before scheduling.</p>
        </div>
      </div>

      {(!meetings || meetings.length === 0) ? (
        <div className="empty">
          <h4>No meetings yet</h4>
          <p>When clients click <strong style={{ color: 'var(--fg)' }}>Book a Call</strong> on the site and submit the brief form, their details land here automatically.</p>
        </div>
      ) : (
        <div className="panel">
          <table className="table">
            <thead>
              <tr><th>Client</th><th>Company</th><th>Hiring for</th><th>Urgency</th><th>Status</th><th>Booked</th></tr>
            </thead>
            <tbody>
              {meetings.map((m: any) => (
                <>
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{logoLetter(m.name)}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{m.name}</div>
                          <div className="small">{m.email} · {m.role || 'Hiring lead'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{m.company}</td>
                    <td>{m.hiring_for || '—'}</td>
                    <td>{m.urgency || '—'}</td>
                    <td><span className={`status-pill ${m.status === 'completed' ? 'active' : m.status === 'scheduled' ? 'review' : 'pending'}`}><span className="ddot"></span>{m.status}</span></td>
                    <td>{fmtRelative(m.created_at)}</td>
                  </tr>
                  {m.message && (
                    <tr key={m.id + '-msg'}>
                      <td colSpan={6} style={{ background: 'var(--bg)', padding: '14px 24px', color: 'var(--fg-muted)', fontSize: 13, fontStyle: 'italic', lineHeight: 1.55 }}>
                        &ldquo;{m.message}&rdquo;
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
