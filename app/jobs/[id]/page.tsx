import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { JobRow } from '@/components/job-row';
import { fmtRelative } from '@/lib/format';
import { ChevronRight, MapPin, Briefcase, Clock, Banknote, ArrowRight, Bookmark, Share2, MessageCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: j } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'live')
    .single();

  if (!j) notFound();

  const { data: similar } = await supabase
    .from('jobs')
    .select('id, title, client_company, loc, type, experience, exp_level, fn, pay, pay_note, tags')
    .eq('status', 'live')
    .neq('id', j.id)
    .order('posted_at', { ascending: false })
    .limit(3);

  // Split title for the headline italic accent
  const words = (j.title || '').trim().split(/\s+/);
  const half = Math.ceil(words.length / 2);
  const line1 = words.slice(0, half).join(' ');
  const line2 = words.length > 1 ? words.slice(half).join(' ') : '';

  return (
    <main>
      <section className="job-detail-hero">
        <div className="container">
          <div className="crumb reveal in">
            <Link href="/jobs">Jobs</Link>
            <ChevronRight size={13} />
            <Link href="/jobs">{j.fn || 'Open roles'}</Link>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--fg)' }}>{j.title}</span>
          </div>
          <div className="job-detail-head reveal in">
            <div className="logo"><Briefcase size={30} /></div>
            <div style={{ flex: 1 }}>
              <div className="company">Beetel Hire</div>
              <h1>{line1}{line2 && <><br /><span className="serif">{line2}</span></>}</h1>
            </div>
          </div>
          <div className="job-detail-meta reveal in">
            <span className="tag"><MapPin size={12} /> {j.loc}</span>
            <span className="tag"><Briefcase size={12} /> {j.type}</span>
            <span className="tag"><Clock size={12} /> {j.experience || j.exp_level || ''}</span>
            <span className="tag accent"><Banknote size={12} /> {j.pay} {j.pay_note || ''}</span>
            <span className="tag green"><span className="ddot" style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80' }} /> Actively interviewing</span>
            {(j.tags || []).map((t: string) => <span className="tag" key={t}>{t}</span>)}
          </div>
          <div className="job-detail-actions reveal in">
            <Link className="btn btn-glow btn-lg" href={`/jobs/${j.id}/apply`}>
              Apply for this role <ArrowRight size={15} />
            </Link>
            <button className="btn btn-secondary btn-lg"><Bookmark size={15} /> Save</button>
            <button className="btn btn-ghost btn-lg"><Share2 size={15} /> Share</button>
            <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--fg-subtle)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="pulse-dot" style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#4ade80' }} />
              Posted {fmtRelative(j.posted_at)} · {j.applicants_count || 0} applicants
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="job-detail-body">
            <article className="job-article reveal in">
              <h2>About the role</h2>
              {(j.about || `Beetel Hire is recruiting a ${j.title} for one of our partner companies — a senior role with significant scope.`).split(/\n\s*\n/).map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}

              {j.quote && <div className="pull">{j.quote}</div>}

              {j.responsibilities && j.responsibilities.length > 0 && (<>
                <h2>What you&apos;ll do</h2>
                <ul>{j.responsibilities.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
              </>)}

              {j.requirements && j.requirements.length > 0 && (<>
                <h2>What we&apos;re looking for</h2>
                <ul>{j.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
              </>)}

              {j.benefits && j.benefits.length > 0 && (<>
                <h2>What we offer</h2>
                <ul>{j.benefits.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
              </>)}

              <h2>About Beetel Hire</h2>
              <p>{j.company_desc || 'Beetel Hire is a new-generation recruitment platform connecting ambitious talent with the companies building India\'s future. We work across product, engineering, design, and operations — leading with quality over quantity on every single search.'}</p>
            </article>

            <aside className="job-aside">
              <div className="aside-card">
                <h5>Role at a glance</h5>
                <div className="aside-row"><span className="k">Department</span><span className="v">{j.dept || j.fn || '—'}</span></div>
                <div className="aside-row"><span className="k">Reports to</span><span className="v">{j.reports_to || '—'}</span></div>
                <div className="aside-row"><span className="k">Team size</span><span className="v">{j.team_size || '—'}</span></div>
                <div className="aside-row"><span className="k">Stack</span><span className="v">{j.stack || '—'}</span></div>
                <div className="aside-row"><span className="k">On-call</span><span className="v">{j.on_call || '—'}</span></div>
              </div>
              <div className="aside-card" style={{ background: 'linear-gradient(135deg, var(--accent-soft), transparent), var(--surface)' }}>
                <h5>Your Beetel Hire contact</h5>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet), var(--accent))' }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{j.partner_name || 'Thomas Berge'}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>{j.partner_role || 'Search partner · Replies in < 4h'}</div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%' }}>
                  <MessageCircle size={13} /> Message {(j.partner_name || 'Thomas').split(' ')[0]}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Similar roles */}
      {similar && similar.length > 0 && (
        <section className="section-sm" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-head">
              <div className="left">
                <span className="t-eyebrow label"><span className="dot"></span>Similar roles</span>
                <h2 className="t-h2 title">You might also like</h2>
              </div>
            </div>
            <div className="jobs-list">
              {similar.map(s => <JobRow key={s.id} job={s as any} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
