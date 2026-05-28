'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '../toast';
import { Job } from '@/types/database';
import { Zap, Globe, Linkedin, Instagram, Plus, X } from 'lucide-react';

type Mode = 'new' | 'edit';

type Props = {
  mode: Mode;
  initial?: Partial<Job>;
};

function lines(s: string) { return s.split('\n').map(x => x.trim()).filter(Boolean); }

export function JobForm({ mode, initial }: Props) {
  const router = useRouter();
  const j: any = initial || {};
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(j.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [pubWebsite, setPubWebsite]     = useState((j.posted_platforms || ['website']).includes('website') || mode === 'new');
  const [pubLinkedin, setPubLinkedin]   = useState((j.posted_platforms || []).includes('linkedin'));
  const [pubInstagram, setPubInstagram] = useState((j.posted_platforms || []).includes('instagram'));

  function addTag() {
    const v = tagInput.trim().replace(/,$/, '');
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      const payload: any = {
        title:          (form.get('title')          as string).trim(),
        client_company: (form.get('client_company') as string).trim(),
        client_contact: {
          name:  (form.get('contact_name')  as string || '').trim(),
          email: (form.get('contact_email') as string || '').trim(),
          phone: (form.get('contact_phone') as string || '').trim(),
        },
        loc:            (form.get('loc')        as string).trim(),
        type:           form.get('type') || 'Hybrid',
        experience:     form.get('experience') || '5-10 yrs',
        fn:             form.get('fn') || 'Engineering',
        pay:            (form.get('pay')        as string).trim(),
        pay_note:       (form.get('pay_note')   as string || '+ ESOPs').trim(),
        tags,
        skills:         tags,
        status:         form.get('status') || 'live',
        about:          (form.get('about')      as string || '').trim() || null,
        quote:          (form.get('quote')      as string || '').trim() || null,
        responsibilities: lines(form.get('responsibilities') as string || ''),
        requirements:     lines(form.get('requirements')     as string || ''),
        benefits:         lines(form.get('benefits')         as string || ''),
        company_desc:   (form.get('company_desc') as string || '').trim() || null,
        dept:           (form.get('dept')       as string || '').trim() || null,
        reports_to:     (form.get('reports_to') as string || '').trim() || null,
        team_size:      (form.get('team_size')  as string || '').trim() || null,
        stack:          (form.get('stack')      as string || '').trim() || null,
        on_call:        (form.get('on_call')    as string || '').trim() || null,
        partner_name:   (form.get('partner_name') as string || '').trim() || null,
        partner_role:   (form.get('partner_role') as string || '').trim() || null,
        posted_platforms: [
          ...(pubWebsite   ? ['website']   : []),
          ...(pubLinkedin  ? ['linkedin']  : []),
          ...(pubInstagram ? ['instagram'] : []),
        ],
      };

      if (!payload.title || !payload.client_company || !payload.loc || !payload.pay) {
        showToast('Fill in title, client company, location, and salary', 'error');
        setSubmitting(false);
        return;
      }

      const url = mode === 'new' ? '/api/admin/jobs' : `/api/admin/jobs/${j.id}`;
      const method = mode === 'new' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Save failed');
      }
      showToast(mode === 'new' ? `Role published — live on ${payload.posted_platforms.join(', ')}` : 'Role updated');
      router.push('/admin/jobs');
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not save', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel" style={{ padding: 28 }}>
      {/* Basics */}
      <div className="form-section-head">Basics</div>
      <div className="form-row">
        <label>Role title <span style={{ color: 'var(--accent)' }}>*</span></label>
        <input className="input" name="title" defaultValue={j.title || ''} placeholder="e.g. Staff Product Engineer" required />
      </div>
      <div className="form-row cols2">
        <div>
          <label>Client company <span style={{ color: 'var(--accent)' }}>*</span> <span className="hint" style={{ display: 'inline', margin: 0 }}>(admin-only — public shows &quot;Beetel Hire&quot;)</span></label>
          <input className="input" name="client_company" defaultValue={j.client_company || ''} placeholder="e.g. Halo Labs" required />
        </div>
        <div>
          <label>Location <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="input" name="loc" defaultValue={j.loc || ''} placeholder="e.g. Bangalore / Remote" required />
        </div>
      </div>
      <div className="form-row cols3">
        <div>
          <label>Contact name</label>
          <input className="input" name="contact_name" defaultValue={j.client_contact?.name || ''} placeholder="e.g. Lena Okafor" />
        </div>
        <div>
          <label>Contact email</label>
          <input className="input" type="email" name="contact_email" defaultValue={j.client_contact?.email || ''} placeholder="lena@client.com" />
        </div>
        <div>
          <label>Contact phone</label>
          <input className="input" name="contact_phone" defaultValue={j.client_contact?.phone || ''} placeholder="+91 …" />
        </div>
      </div>
      <div className="form-row cols3">
        <div>
          <label>Work arrangement</label>
          <select name="type" defaultValue={j.type || 'Hybrid'}>
            <option>On-site</option><option>Hybrid</option><option>Remote</option>
          </select>
        </div>
        <div>
          <label>Experience</label>
          <select name="experience" defaultValue={j.experience || '5-10 yrs'}>
            <option>0-2 yrs</option><option>3-5 yrs</option><option>5-10 yrs</option><option>10+ yrs</option>
          </select>
        </div>
        <div>
          <label>Function</label>
          <select name="fn" defaultValue={j.fn || 'Engineering'}>
            <option>Engineering</option><option>Product</option><option>Design</option>
            <option>Operations</option><option>Marketing</option><option>Sales</option><option>Finance</option>
          </select>
        </div>
      </div>
      <div className="form-row cols2">
        <div>
          <label>Salary range <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="input" name="pay" defaultValue={j.pay || ''} placeholder="e.g. ₹40–60 LPA" required />
        </div>
        <div>
          <label>Pay note</label>
          <input className="input" name="pay_note" defaultValue={j.pay_note || '+ ESOPs'} placeholder="e.g. + ESOPs" />
        </div>
      </div>
      <div className="form-row">
        <label>Tags <span className="hint" style={{ display: 'inline', margin: 0 }}>(Enter or comma to add)</span></label>
        <div className="tag-input-wrap">
          {tags.map((t, i) => (
            <span className="tag-chip" key={t}>{t}
              <button type="button" onClick={() => setTags(tags.filter((_, ix) => ix !== i))} aria-label="Remove">
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
              else if (e.key === 'Backspace' && !tagInput && tags.length) setTags(tags.slice(0, -1));
            }}
            placeholder="Type a tag…"
          />
        </div>
      </div>
      <div className="form-row">
        <label>Status</label>
        <select name="status" defaultValue={j.status || 'live'}>
          <option value="live">Live</option>
          <option value="review">Shortlisting</option>
          <option value="pending">Calibrating</option>
          <option value="rejected">Closed</option>
        </select>
      </div>

      {/* About */}
      <div className="form-section-head">About the role</div>
      <div className="form-row">
        <label>About the role</label>
        <textarea name="about" rows={6} defaultValue={j.about || ''} placeholder={'Describe the role in paragraphs…\n\nSeparate paragraphs with a blank line.'} />
      </div>
      <div className="form-row">
        <label>Pull quote <span className="hint" style={{ display: 'inline', margin: 0 }}>(optional accent quote)</span></label>
        <textarea name="quote" rows={2} defaultValue={j.quote || ''} placeholder="e.g. We're building the boring, important software that the energy transition runs on." />
      </div>

      {/* Responsibilities */}
      <div className="form-section-head">What you&apos;ll do</div>
      <div className="form-row">
        <label>Responsibilities <span className="hint" style={{ display: 'inline', margin: 0 }}>(one per line)</span></label>
        <textarea name="responsibilities" rows={5} defaultValue={(j.responsibilities || []).join('\n')} placeholder={'Own the technical direction…\nMentor a small team of senior engineers…'} />
      </div>

      {/* Requirements */}
      <div className="form-section-head">What we&apos;re looking for</div>
      <div className="form-row">
        <label>Requirements <span className="hint" style={{ display: 'inline', margin: 0 }}>(one per line)</span></label>
        <textarea name="requirements" rows={5} defaultValue={(j.requirements || []).join('\n')} placeholder={'7+ years building production software…\nDeep experience with TypeScript and Postgres…'} />
      </div>

      {/* Benefits */}
      <div className="form-section-head">What we offer</div>
      <div className="form-row">
        <label>Benefits <span className="hint" style={{ display: 'inline', margin: 0 }}>(one per line)</span></label>
        <textarea name="benefits" rows={5} defaultValue={(j.benefits || []).join('\n')} placeholder={'Competitive base + ESOPs…\nComprehensive health and dental…'} />
      </div>

      {/* Company */}
      <div className="form-section-head">About the company</div>
      <div className="form-row">
        <label>Company description</label>
        <textarea name="company_desc" rows={4} defaultValue={j.company_desc || ''} placeholder="The closing paragraph on the job detail page…" />
      </div>

      {/* Role at a glance */}
      <div className="form-section-head">Role at a glance</div>
      <div className="form-row cols2">
        <div><label>Department</label><input className="input" name="dept" defaultValue={j.dept || ''} placeholder="e.g. Engineering" /></div>
        <div><label>Reports to</label><input className="input" name="reports_to" defaultValue={j.reports_to || ''} placeholder="e.g. CTO" /></div>
      </div>
      <div className="form-row cols3">
        <div><label>Team size</label><input className="input" name="team_size" defaultValue={j.team_size || ''} placeholder="e.g. 7 → 12" /></div>
        <div><label>Stack</label><input className="input" name="stack" defaultValue={j.stack || ''} placeholder="e.g. TS · Postgres · K8s" /></div>
        <div><label>On-call</label><input className="input" name="on_call" defaultValue={j.on_call || ''} placeholder="e.g. 1 wk / 6" /></div>
      </div>

      {/* Contact */}
      <div className="form-section-head">Your Beetel Hire contact</div>
      <div className="form-row cols2">
        <div><label>Partner name</label><input className="input" name="partner_name" defaultValue={j.partner_name || 'Thomas Berge'} /></div>
        <div><label>Partner role</label><input className="input" name="partner_role" defaultValue={j.partner_role || 'Search partner · Replies in < 4h'} /></div>
      </div>

      {/* Publish to */}
      <div className="form-section-head">Publish to</div>
      <div className="publish-options">
        <label className="publish-opt">
          <input type="checkbox" checked={pubWebsite} onChange={e => setPubWebsite(e.target.checked)} />
          <span className="ico"><span className="platform-pill website"><Globe size={16} /></span></span>
          <span className="meta">
            <span className="t">Website</span>
            <span className="s">/jobs and homepage featured strip</span>
          </span>
          <span className="status connected"><span className="d"></span> Always on</span>
        </label>
        <label className="publish-opt">
          <input type="checkbox" checked={pubLinkedin} onChange={e => setPubLinkedin(e.target.checked)} />
          <span className="ico"><span className="platform-pill linkedin"><Linkedin size={16} /></span></span>
          <span className="meta">
            <span className="t">LinkedIn</span>
            <span className="s">Connect in Settings → Social Integrations to enable cross-posting</span>
          </span>
        </label>
        <label className="publish-opt">
          <input type="checkbox" checked={pubInstagram} onChange={e => setPubInstagram(e.target.checked)} />
          <span className="ico"><span className="platform-pill instagram"><Instagram size={16} /></span></span>
          <span className="meta">
            <span className="t">Instagram</span>
            <span className="s">Connect in Settings → Social Integrations to enable cross-posting</span>
          </span>
        </label>
      </div>

      <div className="modal-callout" style={{ marginTop: 24 }}>
        <Zap size={14} />
        <span>Once published, this role appears on the homepage&apos;s featured strip, the <strong style={{ color: 'var(--fg)' }}>/jobs</strong> page, and a fully laid-out detail page candidates can apply from.</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-glow" disabled={submitting}>
          {submitting ? 'Saving…' : (
            mode === 'new'
              ? <><Plus size={14} /> Publish role</>
              : 'Save changes'
          )}
        </button>
      </div>
    </form>
  );
}
