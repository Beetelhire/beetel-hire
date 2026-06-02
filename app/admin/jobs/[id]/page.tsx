import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { jobExpectedFee, rupeeFmt, functionIcon } from '@/lib/format';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, Edit2, Globe, Linkedin, Instagram } from 'lucide-react';
import { JobPipelineView, PipelineRow } from '@/components/admin/job-pipeline-view';
import type { PipelineStage } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Pipeline mappings (canonical source for stage tracking)
  const { data: mappings } = await supabase
    .from('candidate_job_mappings')
    .select(`
      id, stage, source, added_at, recruiter_id,
      candidate:candidates(id, name, email, avatar_url, experience, location),
      recruiter:team_members(id, full_name)
    `)
    .eq('job_id', j.id)
    .order('added_at', { ascending: false });

  // Team members for filters / recruiter assignment dropdowns
  const { data: teamRes } = await supabase
    .from('team_members')
    .select('id, full_name, role')
    .eq('status', 'Active')
    .order('full_name');
  const teamMembers = (teamRes || []) as any;

  // Build the rows the pipeline view consumes
  const rows: PipelineRow[] = (mappings || [])
    .filter((m: any) => !!m.candidate?.id)
    .map((m: any) => ({
      mapping_id:         m.id,
      candidate_id:       m.candidate.id,
      candidate_name:     m.candidate.name,
      candidate_email:    m.candidate.email,
      candidate_avatar:   m.candidate.avatar_url || null,
      candidate_experience: m.candidate.experience || null,
      candidate_location: m.candidate.location || null,
      stage:              m.stage as PipelineStage,
      recruiter_id:       m.recruiter_id || null,
      recruiter_name:     m.recruiter?.full_name || null,
      source:             m.source || null,
      added_at:           m.added_at,
    }));

  // Pool for "Add existing" — every candidate NOT already on this job
  const onThisJobIds = new Set(rows.map(r => r.candidate_id));
  const { data: allCands } = await supabase
    .from('candidates')
    .select('id, name, email, source, current_company, experience, location, recruiter_id')
    .order('last_touch', { ascending: false });
  const poolForLinking = (allCands || [])
    .filter((c: any) => !onThisJobIds.has(c.id))
    .map((c: any) => ({
      id: c.id, name: c.name, email: c.email, source: c.source,
      current_company: c.current_company, experience: c.experience,
      location: c.location, recruiter_id: c.recruiter_id,
    }));

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

      {/* Pipeline */}
      <JobPipelineView
        jobId={j.id}
        jobTitle={j.title}
        rows={rows}
        poolForLinking={poolForLinking}
        teamMembers={teamMembers}
        thisJob={{ id: j.id, title: j.title, client_company: j.client_company || '', status: j.status }}
      />
    </>
  );
}
