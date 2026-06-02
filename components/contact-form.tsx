'use client';

// Public contact form. Posts to /api/contact, which writes to public.contact_enquiries.

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { showToast } from './toast';

const SUBJECT_OPTIONS = [
  'Hiring enquiry',
  'Candidate enquiry',
  'Partnership',
  'Press / Media',
  'General question',
  'Other',
];

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name:    String(fd.get('full_name') || '').trim(),
      company_name: String(fd.get('company_name') || '').trim() || null,
      email:        String(fd.get('email') || '').trim(),
      phone:        String(fd.get('phone') || '').trim() || null,
      subject:      String(fd.get('subject') || '').trim() || null,
      message:      String(fd.get('message') || '').trim(),
    };

    if (!payload.full_name || !payload.email || !payload.message) {
      showToast('Name, email, and message are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'submit failed');
      }
      setSubmitted(true);
      showToast("Thanks — we'll be in touch shortly");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      showToast(err?.message || 'Could not send. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="panel" style={{ padding: 24 }}>
        <h4 style={{ marginBottom: 8 }}>Inquiry received</h4>
        <p style={{ color: 'var(--fg-muted)', marginBottom: 16 }}>
          Thanks for reaching out. A member of the Beetel Hire team will get back to you within one business day.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={() => setSubmitted(false)}>Send another</button>
      </div>
    );
  }

  return (
    <form className="panel contact-form" onSubmit={onSubmit} autoComplete="on" style={{ padding: 24 }}>
      <div className="form-row cols2">
        <div>
          <label>Full name</label>
          <input className="input" name="full_name" placeholder="Jane Patel" required />
        </div>
        <div>
          <label>Company name <span className="hint" style={{ display: 'inline', margin: 0 }}>(optional)</span></label>
          <input className="input" name="company_name" placeholder="e.g. Halo Labs" />
        </div>
      </div>

      <div className="form-row cols2">
        <div>
          <label>Email</label>
          <input className="input" type="email" name="email" placeholder="jane@company.com" required />
        </div>
        <div>
          <label>Phone <span className="hint" style={{ display: 'inline', margin: 0 }}>(optional)</span></label>
          <input className="input" type="tel" name="phone" placeholder="+91 98765 43210" />
        </div>
      </div>

      <div className="form-row">
        <label>Subject</label>
        <select name="subject" defaultValue="Hiring enquiry">
          {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="form-row">
        <label>Message</label>
        <textarea name="message" rows={5} placeholder="Tell us about the role, the candidate, or what you&apos;d like to discuss…" required></textarea>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <button type="submit" className="btn btn-glow" disabled={submitting}>
          {submitting ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
          {submitting ? 'Sending…' : 'Submit inquiry'}
        </button>
      </div>
    </form>
  );
}
