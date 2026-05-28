'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate, CandidateNote, CandidateTimelineEvent } from '@/types/database';
import { fmtRelative, logoLetter } from '@/lib/format';
import { showToast } from '../toast';
import { X, Plus, Eye, Download, Mail, MessageCircle } from 'lucide-react';

type Props = {
  candidate: (Candidate & { applied_jobs?: { id: string; title: string; client_company: string; applied_at: string; status: string }[] }) | null;
  onClose: () => void;
};

export function CandidateDrawer({ candidate, onClose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'notes' | 'timeline'>('profile');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [hireStatus, setHireStatus] = useState<string>(candidate?.hire_status || 'Selected');

  useEffect(() => {
    if (candidate) {
      setTab('profile');
      setNote('');
      setHireStatus(candidate.hire_status);
    }
  }, [candidate?.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (candidate) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [candidate, onClose]);

  async function updateStatus(newStatus: string) {
    if (!candidate || newStatus === candidate.hire_status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ hire_status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setHireStatus(newStatus);
      showToast(`Status updated to ${newStatus}`);
      router.refresh();
    } catch {
      showToast('Could not update status', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!candidate || !note.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}/notes`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: note.trim() }),
      });
      if (!res.ok) throw new Error('Save failed');
      setNote('');
      showToast('Note added');
      router.refresh();
    } catch {
      showToast('Could not save note', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function downloadResume() {
    if (!candidate?.resume_url) return;
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}/resume-url`);
      const json = await res.json();
      if (json.url) window.open(json.url, '_blank');
      else showToast('Could not generate download link', 'error');
    } catch {
      showToast('Download failed', 'error');
    }
  }

  if (!candidate) return null;

  const c = candidate;
  return (
    <>
      <div className={`drawer-backdrop${c ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${c ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div className="drawer-head-top">
            <span className={`hire-status-pill ${hireStatus}`}><span className="ddot"></span>{hireStatus}</span>
            <button className="close" onClick={onClose} aria-label="Close"><X size={16} /></button>
          </div>
          <div className="drawer-profile">
            {c.avatar_url
              ? <img className="av" alt="" src={c.avatar_url} />
              : <div className="av" style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:600 }}>{logoLetter(c.name)}</div>}
            <div>
              <div className="name">{c.name}</div>
              <div className="email">{c.email}</div>
            </div>
          </div>
        </div>

        <div className="drawer-tabs">
          {(['profile', 'notes', 'timeline'] as const).map(t => (
            <button
              key={t}
              className={`drawer-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        <div className="drawer-body">
          {tab === 'profile' && (
            <div className="drawer-panel active">
              <div className="info-grid">
                <div className="info-row"><div className="lbl">Phone</div><div className="val">{c.phone || '—'}</div></div>
                <div className="info-row"><div className="lbl">Experience</div><div className="val">{c.experience || '—'}</div></div>
                <div className="info-row span2"><div className="lbl">Current location</div><div className="val">{c.location || '—'}</div></div>
                <div className="info-row"><div className="lbl">Source</div><div className="val">{c.source || '—'}</div></div>
                <div className="info-row"><div className="lbl">Availability</div><div className="val">{c.availability || '—'}</div></div>
                <div className="info-row span2"><div className="lbl">Pool status</div><div className="val"><span className={`pool-status-pill ${c.pool_status.replace(' ', '')}`}>{c.pool_status}</span></div></div>
              </div>

              <div className="section-h-sm">Skills</div>
              <div className="skill-chips">
                {(c.skills || []).length === 0 ? <span className="small">—</span> : c.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>

              {c.applied_jobs && c.applied_jobs.length > 0 && (
                <>
                  <div className="section-h-sm">Applied to</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.applied_jobs.map(j => (
                      <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{j.title}</div>
                          <div className="small">{j.client_company} · {fmtRelative(j.applied_at)}</div>
                        </div>
                        <span className={`hire-status-pill ${j.status}`}><span className="ddot"></span>{j.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {c.resume_url && (
                <>
                  <div className="section-h-sm">Resume / CV</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={downloadResume}><Eye size={13} /> Preview</button>
                    <button className="btn btn-secondary btn-sm" onClick={downloadResume}><Download size={13} /> Download CV</button>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'notes' && (
            <div className="drawer-panel active">
              <div className="note-input-wrap">
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note about this candidate…"
                />
                <div className="actions">
                  <button className="btn btn-glow btn-sm" onClick={addNote} disabled={!note.trim() || saving}>
                    <Plus size={13} /> Add note
                  </button>
                </div>
              </div>
              <div className="note-list">
                {!c.notes || c.notes.length === 0 ? <div className="small">No notes yet.</div> : c.notes.map((n: CandidateNote) => (
                  <div className="note-card" key={n.id}>
                    <div className="note-meta"><span>{n.by}</span><span>{fmtRelative(n.ts)}</span></div>
                    <div className="note-text">{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'timeline' && (
            <div className="drawer-panel active">
              <div className="timeline">
                {!c.timeline || c.timeline.length === 0 ? <div className="small">No activity yet.</div> :
                  [...c.timeline].sort((a, b) => b.ts - a.ts).map((t: CandidateTimelineEvent) => (
                    <div className="timeline-item" key={t.id}>
                      <div className="event">{t.event}</div>
                      <div className="meta">{t.by || 'System'} · {fmtRelative(t.ts)}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <select
            className="status-select"
            value={hireStatus}
            onChange={e => updateStatus(e.target.value)}
            disabled={saving}
          >
            <option value="Onboarded">Onboarded</option>
            <option value="Selected">Selected</option>
            <option value="Dropped">Dropped</option>
          </select>
          <a className="btn btn-secondary btn-sm" href={`mailto:${c.email}`}><Mail size={13} /> Contact</a>
        </div>
      </div>
    </>
  );
}
