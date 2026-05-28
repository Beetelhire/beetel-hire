'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-client';
import { showToast } from './toast';
import { User, Shield, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';

type Tab = 'candidate' | 'admin';

export function SignInForm() {
  const [tab, setTab] = useState<Tab>('candidate');
  const router = useRouter();

  return (
    <>
      <div className="auth-tabs" role="tablist" data-active={tab}>
        <button className={`auth-tab${tab === 'candidate' ? ' active' : ''}`} onClick={() => setTab('candidate')}>
          <User size={14} /> Candidate
        </button>
        <button className={`auth-tab${tab === 'admin' ? ' active' : ''}`} onClick={() => setTab('admin')}>
          <Shield size={14} /> Admin
        </button>
        <div className="auth-tab-indicator" />
      </div>

      {tab === 'candidate' ? <CandidatePanel onSubmitted={() => router.push('/jobs')} /> : <AdminPanel onSignedIn={() => router.push('/admin')} />}
    </>
  );
}

function CandidatePanel({ onSubmitted }: { onSubmitted: () => void }) {
  return (
    <div className="auth-panel active">
      <span className="t-eyebrow label"><span className="dot"></span>Welcome</span>
      <h2>Sign in to<br /><span className="serif">your account</span></h2>
      <p className="sub">Browse roles, save your favorites, and track applications. Want to apply to a role? You can do that without an account — just hit Apply on any job.</p>

      <div className="modal-callout" style={{ marginTop: 12 }}>
        <Info size={14} />
        <span>Candidate accounts are coming soon. For now, applying to a job creates your profile automatically — no signup needed.</span>
      </div>

      <div className="auth-foot" style={{ marginTop: 24 }}>
        Looking to apply? <a href="/jobs">Browse open roles</a>
      </div>
    </div>
  );
}

function AdminPanel({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Email and password are required.'); return; }
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowser();
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        setError('Invalid credentials. Try again.');
        showToast('Invalid credentials', 'error');
        return;
      }
      // Verify is_admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Could not load user profile.'); return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setError('This account is not authorized for the admin console.');
        showToast('Not authorized', 'error');
        return;
      }
      showToast('Admin verified. Entering console…');
      onSignedIn();
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-panel active">
      <span className="t-eyebrow label" style={{ color: 'var(--accent)' }}>
        <span className="dot"></span>Restricted access
      </span>
      <h2>Admin <span className="serif">console</span></h2>
      <p className="sub">For Beetel Hire partners and operations team only. All sessions are logged.</p>

      <form onSubmit={onSubmit} autoComplete="on">
        <div className="field">
          <label>Admin ID</label>
          <div className="input-wrap">
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@beetelhire.in"
              required
              autoComplete="username"
            />
            <Mail style={{ width: 16, height: 16 }} />
          </div>
        </div>
        <div className="field">
          <label>Password</label>
          <div className="input-wrap">
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
            <Lock style={{ width: 16, height: 16 }} />
          </div>
        </div>

        {error && (
          <div className="auth-error show">
            <AlertCircle size={14} /> <span>{error}</span>
          </div>
        )}

        <div className="auth-row">
          <label className="checkbox"><input type="checkbox" /> Keep me signed in</label>
          <span className="t-small" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-faint)' }}>2FA enforced</span>
        </div>
        <button className="btn btn-glow btn-lg" style={{ width: '100%' }} type="submit" disabled={submitting}>
          <ShieldCheck size={15} /> {submitting ? 'Signing in…' : 'Enter admin console'}
        </button>
      </form>
    </div>
  );
}
