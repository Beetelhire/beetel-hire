'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { X, Calendar, Shield } from 'lucide-react';
import { showToast } from './toast';

type Ctx = { open: () => void; close: () => void };
const Cx = createContext<Ctx>({ open: () => {}, close: () => {} });
export const useBookCall = () => useContext(Cx);

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/beetel-hire/intro-call';

declare global {
  interface Window { Calendly?: any }
}

export function BookCallModal({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      company: String(form.get('company') || '').trim(),
      role: String(form.get('role') || '').trim(),
      hiring_for: String(form.get('hiring_for') || '').trim(),
      urgency: String(form.get('urgency') || '').trim(),
      message: String(form.get('message') || '').trim(),
    };
    if (!values.name || !values.email || !values.company) {
      showToast('Fill in name, email, and company', 'error');
      return;
    }
    try {
      const res = await fetch('/api/book-call', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
      if (!res.ok) throw new Error('save failed');
      showToast('Thanks — opening scheduling…');
      close();
      setTimeout(() => {
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          window.Calendly.initPopupWidget({
            url: CALENDLY_URL,
            prefill: { name: values.name, email: values.email, customAnswers: { a1: values.company, a2: values.hiring_for } },
            utm: { utmSource: 'beetel-hire-site' },
          });
        } else {
          window.open(CALENDLY_URL, '_blank', 'noopener');
        }
      }, 400);
    } catch {
      showToast('Could not save your details. Try again.', 'error');
    }
  }

  return (
    <Cx.Provider value={{ open, close }}>
      {children}
      <div className={`modal-backdrop${isOpen ? ' open' : ''}`} onClick={close} />
      <div className={`modal${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!isOpen}>
        <div className="modal-head">
          <div>
            <div className="title">Tell us about your hiring</div>
            <div className="sub">A quick 60-second brief — then we&apos;ll open a 20-minute slot to chat.</div>
          </div>
          <button className="close" onClick={close} aria-label="Close"><X size={16} /></button>
        </div>
        <form id="callForm" onSubmit={onSubmit} autoComplete="on">
          <div className="modal-body">
            <div className="form-row cols2">
              <div><label>Your name</label><input className="input" name="name" placeholder="Jane Patel" required /></div>
              <div><label>Work email</label><input className="input" type="email" name="email" placeholder="jane@company.com" required /></div>
            </div>
            <div className="form-row cols2">
              <div><label>Company</label><input className="input" name="company" placeholder="e.g. Halo Labs" required /></div>
              <div><label>Your role</label><input className="input" name="role" placeholder="e.g. Head of People" /></div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>What are you hiring for?</label>
                <select name="hiring_for">
                  <option>Engineering</option><option>Product</option><option>Design</option>
                  <option>Executive / C-suite</option><option>Operations</option><option>Other</option>
                </select>
              </div>
              <div>
                <label>How urgent?</label>
                <select name="urgency">
                  <option>Hiring now</option><option>Within 1 month</option>
                  <option>Within 3 months</option><option>Exploring / no deadline</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>Anything specific you&apos;d like us to know? <span className="hint" style={{display:'inline',margin:0}}>(optional)</span></label>
              <textarea name="message" placeholder="Roles, scope, location, comp range…"></textarea>
            </div>
            <div className="modal-callout" style={{ marginBottom: 0 }}>
              <Shield size={14} />
              <span>Your details are stored in our admin workspace and only visible to Beetel Hire partners.</span>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
            <button type="submit" className="btn btn-glow"><Calendar size={14} /> Continue to scheduling</button>
          </div>
        </form>
      </div>
    </Cx.Provider>
  );
}
