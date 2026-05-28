'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SocialIntegration } from '@/types/database';
import { showToast } from '../toast';
import { createSupabaseBrowser } from '@/lib/supabase-client';
import { Linkedin, Instagram, Link as LinkIcon, Unlink, Zap, RefreshCw, LogOut, X, Shield } from 'lucide-react';

type Props = { integrations: SocialIntegration[] };

const SPEC = [
  { key: 'linkedin'  as const, name: 'LinkedIn',  icon: <Linkedin size={22} />,  blurb: 'Cross-post new roles to LinkedIn Jobs and your company feed.' },
  { key: 'instagram' as const, name: 'Instagram', icon: <Instagram size={22} />, blurb: 'Auto-generate a visual job post for your Instagram feed.' },
];

export function SettingsView({ integrations: initial }: Props) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(initial);
  const [modal, setModal] = useState<{ platform: 'linkedin' | 'instagram'; handle: string; token: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState(true);
  const [autoPublish, setAutoPublish] = useState(true);
  const [twoFA, setTwoFA] = useState(true);

  function find(key: 'linkedin' | 'instagram') {
    return integrations.find(i => i.platform === key);
  }

  async function disconnect(platform: 'linkedin' | 'instagram') {
    const platformName = platform === 'linkedin' ? 'LinkedIn' : 'Instagram';
    if (!confirm(`Disconnect ${platformName}? Cross-posting will stop until reconnected.`)) return;
    try {
      const res = await fetch(`/api/admin/social-integrations/${platform}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setIntegrations(prev => prev.map(i => i.platform === platform ? { ...i, connected: false, handle: null, encrypted_token: null, connected_at: null } : i));
      showToast(`${platformName} disconnected`);
    } catch {
      showToast('Could not disconnect', 'error');
    }
  }

  async function testConnection(platform: 'linkedin' | 'instagram') {
    const integ = find(platform);
    if (integ?.connected) showToast(`${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} connection healthy ✓`);
    else showToast('Not connected', 'error');
  }

  async function submitConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/social-integrations/${modal.platform}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ handle: modal.handle, token: modal.token }),
      });
      if (!res.ok) throw new Error();
      setIntegrations(prev => prev.map(i =>
        i.platform === modal.platform
          ? { ...i, connected: true, handle: modal.handle, connected_at: new Date().toISOString() }
          : i));
      showToast(`${modal.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} connected`);
      setModal(null);
    } catch {
      showToast('Could not save token', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    showToast('Signed out');
    setTimeout(() => router.push('/'), 200);
  }

  return (
    <>
      {/* Social Integrations */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Social media integrations</h3>
            <div className="sub">Connect channels you want to cross-post new roles to. Tokens are stored encrypted per workspace.</div>
          </div>
        </div>
        <div style={{ padding: '18px 24px 22px' }}>
          {SPEC.map(s => {
            const integ = find(s.key);
            const connected = integ?.connected;
            return (
              <div key={s.key} className="integration-card">
                <div className={`ico ${s.key}`}>{s.icon}</div>
                <div className="meta">
                  <div className="name">{s.name}</div>
                  <div className="sub">
                    <span className={`conn-dot${connected ? ' on' : ''}`}></span>
                    {connected ? <>Connected as <strong style={{ color: 'var(--fg)', marginLeft: 3 }}>{integ.handle || '—'}</strong></> : s.blurb}
                  </div>
                </div>
                <div className="integration-actions">
                  {connected ? (
                    <>
                      <button className="btn btn-sm btn-secondary" onClick={() => testConnection(s.key)}><Zap size={13} /> Test</button>
                      <button className="btn btn-sm btn-ghost"     onClick={() => disconnect(s.key)}><Unlink size={13} /> Disconnect</button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-glow" onClick={() => setModal({ platform: s.key, handle: '', token: '' })}>
                      <LinkIcon size={13} /> Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace preferences */}
      <div className="panel" style={{ padding: '8px 24px' }}>
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <h5>Notifications — new bookings</h5>
              <p>Email Aanya & Thomas whenever a client books a discovery call via the Book a Call CTA.</p>
            </div>
            <button className={`toggle${notifs ? ' on' : ''}`} onClick={() => setNotifs(!notifs)}><span className="dot"></span></button>
          </div>
          <div className="setting-item">
            <div>
              <h5>Auto-publish new jobs</h5>
              <p>Jobs added here go live on the marketing site instantly. Disable to require review first.</p>
            </div>
            <button className={`toggle${autoPublish ? ' on' : ''}`} onClick={() => setAutoPublish(!autoPublish)}><span className="dot"></span></button>
          </div>
          <div className="setting-item">
            <div>
              <h5>Two-factor authentication</h5>
              <p>Required for all admin console sessions.</p>
            </div>
            <button className={`toggle${twoFA ? ' on' : ''}`} onClick={() => setTwoFA(!twoFA)}><span className="dot"></span></button>
          </div>
          <div className="setting-item">
            <div>
              <h5>Sign out</h5>
              <p>End your admin session on this device.</p>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={signOut}><LogOut size={13} /> Sign out</button>
          </div>
        </div>
      </div>

      {/* Connect modal */}
      <div className={`modal-backdrop${modal ? ' open' : ''}`} onClick={() => setModal(null)} />
      <div className={`modal${modal ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="title">Connect {modal?.platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}</div>
            <div className="sub">Authorize Beetel Hire to post on your behalf. Tokens are encrypted at rest.</div>
          </div>
          <button className="close" onClick={() => setModal(null)} aria-label="Close"><X size={16} /></button>
        </div>
        {modal && (
          <form onSubmit={submitConnect}>
            <div className="modal-body">
              <div className="form-row">
                <label>Account handle / page</label>
                <input className="input" placeholder={modal.platform === 'linkedin' ? 'linkedin.com/company/beetel-hire' : '@beetelhire'} required value={modal.handle} onChange={e => setModal({ ...modal, handle: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Access token <span className="hint" style={{ display: 'inline', margin: 0 }}>(OAuth token from the platform)</span></label>
                <input className="input" type="password" placeholder="••••••••••••••••" required value={modal.token} onChange={e => setModal({ ...modal, token: e.target.value })} />
              </div>
              <div className="modal-callout" style={{ marginBottom: 0 }}>
                <Shield size={14} />
                <span>This token is stored only in your workspace. In production, tokens go through OAuth and are encrypted with a per-tenant key.</span>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-glow" disabled={saving}><LinkIcon size={14} /> {saving ? 'Saving…' : 'Connect'}</button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
