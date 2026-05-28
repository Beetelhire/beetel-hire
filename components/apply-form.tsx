'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { showToast } from './toast';
import { ArrowRight, CheckCircle2, FileText, Upload } from 'lucide-react';

export function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      data.append('job_id', jobId);
      const res = await fetch('/api/apply', { method: 'POST', body: data });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Submission failed');
      }
      setDone(true);
      showToast('Application submitted ✓');
    } catch (err: any) {
      showToast(err?.message || 'Could not submit. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="panel" style={{ padding: 36, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(74,222,128,.15)', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={28} />
        </div>
        <h2 className="t-h2" style={{ marginBottom: 12 }}>Application received</h2>
        <p className="t-lead" style={{ marginBottom: 28 }}>
          Thanks for applying for <strong style={{ color: 'var(--fg)' }}>{jobTitle}</strong>. Our team will review your application and reach out within a few days if there&apos;s a fit.
        </p>
        <div style={{ display: 'inline-flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => router.push('/jobs')}>Browse more roles <ArrowRight size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <form className="panel" style={{ padding: 28 }} onSubmit={onSubmit}>
      <div className="form-row cols2">
        <div>
          <label>Full name <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="input" name="name" placeholder="Jane Patel" required />
        </div>
        <div>
          <label>Email <span style={{ color: 'var(--accent)' }}>*</span></label>
          <input className="input" type="email" name="email" placeholder="jane@example.com" required />
        </div>
      </div>
      <div className="form-row cols2">
        <div>
          <label>Phone</label>
          <input className="input" name="phone" placeholder="+91 …" />
        </div>
        <div>
          <label>Location</label>
          <input className="input" name="location" placeholder="Bangalore" />
        </div>
      </div>
      <div className="form-row cols2">
        <div>
          <label>Total experience (years)</label>
          <input className="input" type="number" min="0" step="1" name="experience_yrs" placeholder="e.g. 6" />
        </div>
        <div>
          <label>Current focus / role</label>
          <input className="input" name="focus" placeholder="e.g. Senior Engineer" />
        </div>
      </div>
      <div className="form-row">
        <label>Skills <span className="hint" style={{ display: 'inline', margin: 0 }}>(comma-separated)</span></label>
        <input className="input" name="skills" placeholder="e.g. TypeScript, React, Postgres" />
      </div>
      <div className="form-row">
        <label>Cover note <span className="hint" style={{ display: 'inline', margin: 0 }}>(optional — why this role?)</span></label>
        <textarea name="message" placeholder="Briefly tell us why you're a good fit for this role…"></textarea>
      </div>

      <div className="form-row">
        <label>Resume / CV <span style={{ color: 'var(--accent)' }}>*</span> <span className="hint" style={{ display: 'inline', margin: 0 }}>(PDF, DOC — max 10 MB)</span></label>
        <label
          htmlFor="resume"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px',
            background: 'var(--surface)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 12,
            cursor: 'pointer',
            color: 'var(--fg-muted)',
            fontSize: 13.5,
          }}
        >
          {resumeFile ? <FileText size={18} /> : <Upload size={18} />}
          <div style={{ flex: 1 }}>
            {resumeFile
              ? <div><div style={{ color: 'var(--fg)', fontWeight: 500 }}>{resumeFile.name}</div><div className="small">{(resumeFile.size / 1024).toFixed(0)} KB · click to change</div></div>
              : 'Click to upload your CV'}
          </div>
        </label>
        <input
          id="resume"
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          style={{ display: 'none' }}
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="modal-callout" style={{ marginTop: 18 }}>
        <span>By submitting, you agree that Beetel Hire may store your details and resume to evaluate this application and contact you about relevant roles.</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-glow" disabled={submitting}>
          {submitting ? 'Submitting…' : <>Submit application <ArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}
