import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { fmtRelative, jobExpectedFee, rupeeFmt, functionIcon } from '@/lib/format';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, Edit2, ChevronRight, Globe, Linkedin, Instagram } from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusPill(s: string) {
  const labels: Record<string, string> = { live: 'Live', review: 'Shortlisting', pending: 'Calibrating', rejected: 'Closed' };
  return <span className={`status-pill ${s}`}><span className="ddot"></span> {labels[s] || s}</span>;
}

function PlatformBadge({ p }: { p: string }) {
  const Icon = p === 'linkedin' ? Linkedin : p === 'instagram' ? Instagram : Globe;
  return <span className={`platform-pill platform-pill-lg ${p}`}><Icon size={12} /> {p[0].toUpperCase() + p.slice(1)}</span>;
}

export default async function AdminJobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: j } = await supabase.from('jobs').select('*').eq('id', params.id).single();
  if (!j) notFound();

  const { data: apps } = await supabase
    .from('applications')
    .select('id, status, applied_at, candidate:candidates(id, name, email, avatar_url, experience, location)')
    .eq('job_id', j.id)
    .order('applied_at', { ascending: false });

  const con = (j.client_contact || {}) as any;
  const platforms = j.posted_platforms || ['website'];
  const iconName = functionIcon(j.fn);
  const Icon = (LucideIcons as any)[
    iconName.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Briefcase;

  return (
    <>
      <div className="view-head">
        <div>
          <Link className="btn btn-ghost btn-sm" href="/admin/jobs" style={{ marginBottom: 10, paddingLeft: 0 }}>
            <ArrowLeft size={13} /> Back to jobs
          </Link>
          <h2>{j.title}</h2>
          <p>{j.fn || ''}{j.loc ? ` · ${j.loc}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn btn-secondary btn-sm" href={`/admin/jobs/${j.id}/edit`}><Edit2 size={13} /> Edit</Link>
        </div>
      </div>

      {/* Info card */}
      <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          <div className="job-logo job-logo-brand" style={{ width: 60, height: 60, borderRadius: 14 }}><Icon size={22} /></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-.018em' }}>{j.title}</div>
            <div className="small" style={{ marginTop: 4 }}>
              <strong style={{ color: 'var(--fg)' }}>{j.client_company || '—'}</strong>
              <span style={{ color: 'var(--fg-subtle)' }}> · public listing shows as &quot;Beetel Hire&quot;</span>
            </div>
            <div className="small" style={{ marginTop: 2 }}>{j.loc}</div>
          </div>
          {statusPill(j.status)}
        </div>

        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
          <div className="info-row"><div className="lbl">Experience</div><div className="val">{j.experience || j.exp_level || '—'}</div></div>
          <div className="info-row"><div className="lbl">Arrangement</div><div className="val">{j.type || '—'}</div></div>
          <div className="info-row"><div className="lbl">Salary</div><div className="val">{j.pay || '—'} <span className="small" style={{ fontWeight: 400 }}>{j.pay_note || ''}</span></div></div>
          <div className="info-row"><div className="lbl">Expected fee</div><div className="val">{rupeeFmt(jobExpectedFee(j.pay))}</div></div>
        </div>

        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="info-row"><div className="lbl">Contact name</div><div className="val">{con.name || '—'}</div></div>
          <div className="info-row"><div className="lbl">Contact email</div><div className="val">{con.email ? <a href={`mailto:${con.email}`} style={{ color: 'var(--accent)' }}>{con.email}</a> : '—'}</div></div>
          <div className="info-row"><div className="lbl">Contact phone</div><div className="val">{con.phone ? <a href={`tel:${con.phone}`} style={{ color: 'var(--accent)' }}>{con.phone}</a> : '—'}</div></div>
        </div>

        {(j.skills || j.tags || []).length > 0 && (<>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Skills</div>
          <div className="skill-chips" style={{ marginBottom: 22 }}>
            {(j.skills || j.tags || []).map((s: string) => <span key={s} className="skill-chip">{s}</span>)}
          </div>
        </>)}

        {j.about && (<>
          <div className="section-h-sm">Description</div>
          <p className="t-body" style={{ marginBottom: 22, lineHeight: 1.6, fontSize: 14, maxWidth: '80ch', whiteSpace: 'pre-wrap' }}>{j.about}</p>
        </>)}

        <div className="section-h-sm">Posted to</div>
        <div className="platform-pills">
          {platforms.map((p: string) => <PlatformBadge key={p} p={p} />)}
        </div>
      </div>

      {/* Applicants */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Applicants</h3>
            <div className="sub">{apps?.length || 0} applicant{apps?.length === 1 ? '' : 's'}</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr><th>Candidate</th><th>Experience</th><th>Location</th><th>Applied</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {(apps || []).map((a: any) => {
              const c = a.candidate;
              if (!c) return null;
              return (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.avatar_url
                        ? <img alt="" src={c.avatar_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))' }} />}
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div className="small">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.experience || '—'}</td>
                  <td>{c.location || '—'}</td>
                  <td>{fmtRelative(a.applied_at)}</td>
                  <td><span className={`hire-status-pill ${a.status}`}><span className="ddot"></span>{a.status}</span></td>
                  <td style={{ textAlign: 'right' }}><ChevronRight size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                </tr>
              );
            })}
            {(!apps || apps.length === 0) && (
              <tr><td colSpan={6}>
                <div className="empty">
                  <h4>No applicants yet</h4>
                  <p>Once candidates apply, they&apos;ll show up here.</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
