'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Candidate, CandidateNote, CandidateTimelineEvent,
  PIPELINE_STAGES, PipelineStage,
} from '@/types/database';
import type { JobLite, TeamMemberLite } from './add-candidate-modal';
import { fmtRelative, logoLetter } from '@/lib/format';
import { showToast } from '../toast';
import { X, Plus, Eye, Download, Mail, Briefcase, Linkedin, Building2, Trash2 } from 'lucide-react';

type AppliedJob = {
  id: string;
  title: string;
  client_company: string;
  applied_at: string;
  status: string | null;
  stage: string | null;
  mapping_id: string | null;
  recruiter: string | null;
  source: string | null;
  from?: string;
};

type Props = {
  candidate: (Candidate & {
    applied_jobs?: AppliedJob[];
    recruiter_name?: string | null;
  }) | null;
  onClose: () => void;
  teamMembers: TeamMemberLite[];
  jobs: JobLite[];
};

export function CandidateDrawer({ candidate, onClose, teamMembers, jobs }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'pipeline' | 'notes' | 'timeline'>('profile');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [hireStatus, setHireStatus] = useState<string>(candidate?.hire_status || 'Selected');
  const [addingJob, setAddingJob] = useState(false);
  const [newJobId, setNewJobId] = useState('');

  useEffect(() => {
    if (candidate) {
      setTab('profile');
      setNote('');
      setHireStatus(candidate.hire_status);
      setAddingJob(false);
      setNewJobId('');
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

  async function changeStage(mappingId: string, stage: PipelineStage) {
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings/${mappingId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error();
      showToast(`Stage updated to ${stage}`);
      router.refresh();
    } catch {
      showToast('Could not update stage', 'error');
    }
  }

  async function removeMapping(mappingId: string) {
    if (!confirm('Remove this candidate from the job?')) return;
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings/${mappingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Removed from job');
      router.refresh();
    } catch {
      showToast('Could not remove', 'error');
    }
  }

  async function addToJob() {
    if (!candidate || !newJobId) return;
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidate.id,
          job_id: newJobId,
          stage: 'Applied',
          recruiter_id: candidate.recruiter_id || null,
          source: candidate.source || null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'failed');
      showToast('Added to job');
      setNewJobId('');
      setAddingJob(false);
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not add to job', 'error');
    }
  }

  if (!candidate) return null;

  const c = candidate;
  const liveJobs = jobs.filter(j => j.status === 'live');
  const alreadyOnJobIds = new Set((c.applied_jobs || []).map(a => a.id));
  const availableJobs = liveJobs.filter(j => !alreadyOnJobIds.has(j.id));

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
          {(['profile', 'pipeline', 'notes', 'timeline'] as const).map(t => (
            <button
              key={t}
              className={`drawer-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'pipeline' && (c.applied_jobs || []).length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({(c.applied_jobs || []).length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {tab === 'profile' && (
            <div className="drawer-panel active">
              <div className="info-grid">
                <div className="info-row"><div className="lbl">Phone</div><div className="val">{c.phone || '—'}</div></div>
                <div className="info-row"><div className="lbl">Experience</div><div className="val">{c.experience || '—'}</div></div>
                <div className="info-row"><div className="lbl">Current company</div><div className="val">{c.current_company || '—'}</div></div>
                <div className="info-row"><div className="lbl">Current designation</div><div className="val">{c.current_designation || '—'}</div></div>
                <div className="info-row span2"><div className="lbl">Location</div><div className="val">{c.location || '—'}</div></div>
                <div className="info-row"><div className="lbl">Source</div><div className="val">{c.source ? <span className="skill-chip">{c.source}</span> : '—'}</div></div>
                <div className="info-row"><div className="lbl">Recruiter assigned</div><div className="val">{c.recruiter_name || <span className="small">— Unassigned —</span>}</div></div>
                <div className="info-row"><div className="lbl">Pool status</div><div className="val"><span className={`pool-status-pill ${c.pool_status.replace(' ', '')}`}>{c.pool_status}</span></div></div>
                <div className="info-row"><div className="lbl">Availability</div><div className="val">{c.availability || '—'}</div></div>
                {c.linkedin_url && (
                  <div className="info-row span2">
                    <div className="lbl">LinkedIn</div>
                    <div className="val">
                      <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Linkedin size={12} /> View profile
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="section-h-sm">Skills</div>
              <div className="skill-chips">
                {(c.skills || []).length === 0 ? <span className="small">—</span> : c.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
              </div>

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

          {tab === 'pipeline' && (
            <div className="drawer-panel active">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-h-sm" style={{ margin: 0 }}>Jobs &amp; pipeline stage</div>
                {availableJobs.length > 0 && !addingJob && (
                  <button className="btn btn-sm btn-secondary" onClick={() => setAddingJob(true)}>
                    <Plus size={12} /> Link to job
                  </button>
                )}
              </div>

              {addingJob && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <select value={newJobId} onChange={e => setNewJobId(e.target.value)} style={{ flex: 1 }}>
                    <option value="">Pick a job…</option>
                    {availableJobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title} — {j.client_company}</option>
                    ))}
                  </select>
                  <button className="btn btn-glow btn-sm" disabled={!newJobId} onClick={addToJob}>Add</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setAddingJob(false); setNewJobId(''); }}>Cancel</button>
                </div>
              )}

              {(c.applied_jobs || []).length === 0 ? (
                <div className="small" style={{ padding: 14, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  Not linked to any jobs yet. {availableJobs.length > 0 && <>Click <strong style={{ color: 'var(--fg)' }}>Link to job</strong> above to add this candidate to an open role.</>}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(c.applied_jobs || []).map(j => (
                    <div key={j.id} style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Briefcase size={12} /> {j.title}
                          </div>
                          <div className="small" style={{ marginTop: 2 }}>
                            <Building2 size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                            {j.client_company} · Added {fmtRelative(j.applied_at)}
                          </div>
                          {(j.recruiter || j.source) && (
                            <div className="small" style={{ marginTop: 4 }}>
                              {j.recruiter && <>Recruiter: <strong style={{ color: 'var(--fg)' }}>{j.recruiter}</strong></>}
                              {j.recruiter && j.source && ' · '}
                              {j.source && <>Source: <strong style={{ color: 'var(--fg)' }}>{j.source}</strong></>}
                            </div>
                          )}
                        </div>
                        {j.mapping_id && (
                          <button className="btn btn-ghost btn-sm btn-icon-sq" onClick={() => removeMapping(j.mapping_id!)} aria-label="Remove from job">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="small" style={{ color: 'var(--fg-muted)' }}>Stage:</span>
                        {j.mapping_id ? (
                          <select
                            value={(j.stage || 'Applied') as string}
                            onChange={(e) => changeStage(j.mapping_id!, e.target.value as PipelineStage)}
                            className="status-select"
                            style={{ flex: 1 }}
                          >
                            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="small">
                            {j.status ? <span className={`hire-status-pill ${j.status}`}><span className="ddot"></span>{j.status}</span> : '—'}
                            <em style={{ marginLeft: 8, opacity: 0.6 }}>(legacy — re-add to enable stages)</em>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
