'use client';

// Admin "Add Candidate" modal — full manual entry form.
// Fields: name, email, phone, location, current_company, current_designation,
//         experience_yrs, skills, linkedin_url, source (required dropdown),
//         recruiter_id (team_member), notes, resume upload, job mapping (multi-select).

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, Loader2, FileText } from 'lucide-react';
import { showToast } from '../toast';
import { CANDIDATE_SOURCES } from '@/types/database';

export type JobLite = {
  id: string;
  title: string;
  client_company: string;
  status: string;
};

export type TeamMemberLite = {
  id: string;
  full_name: string;
  role: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  jobs: JobLite[];
  teamMembers: TeamMemberLite[];
};

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  location: '',
  current_company: '',
  current_designation: '',
  experience_yrs: '',
  skills: '',
  linkedin_url: '',
  source: 'Inbound',
  recruiter_id: '',
  notes: '',
};

export function AddCandidateModal({ open, onClose, jobs, teamMembers }: Props) {
  const router = useRouter();
  const [vals, setVals] = useState(INITIAL);
  const [resume, setResume] = useState<File | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setVals(INITIAL);
      setResume(null);
      setSelectedJobs([]);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function setField<K extends keyof typeof INITIAL>(k: K, v: string) {
    setVals(prev => ({ ...prev, [k]: v }));
  }

  function toggleJob(id: string) {
    setSelectedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vals.name.trim())  return showToast('Full name is required', 'error');
    if (!vals.email.trim()) return showToast('Email is required', 'error');
    if (!vals.source)       return showToast('Source is required', 'error');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', vals.name.trim());
      fd.append('email', vals.email.trim());
      fd.append('phone', vals.phone.trim());
      fd.append('location', vals.location.trim());
      fd.append('current_company', vals.current_company.trim());
      fd.append('current_designation', vals.current_designation.trim());
      fd.append('experience_yrs', vals.experience_yrs.trim());
      fd.append('skills', vals.skills.trim());
      fd.append('linkedin_url', vals.linkedin_url.trim());
      fd.append('source', vals.source);
      fd.append('recruiter_id', vals.recruiter_id);
      fd.append('notes', vals.notes.trim());
      fd.append('job_ids', selectedJobs.join(','));
      if (resume) fd.append('resume', resume);

      const res = await fetch('/api/admin/candidates', { method: 'POST', body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Could not save');

      showToast(
        selectedJobs.length > 0
          ? `Candidate added and linked to ${selectedJobs.length} job${selectedJobs.length > 1 ? 's' : ''}`
          : 'Candidate added to pool'
      );
      onClose();
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  }

  const liveJobs = jobs.filter(j => j.status === 'live');

  return (
    <>
      <div className={`modal-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`modal job-modal${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="title">Add candidate</div>
            <div className="sub">Add a candidate manually to the pool. Optionally link them to one or more open jobs.</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={{ maxHeight: 'calc(85vh - 160px)', overflowY: 'auto' }}>
            {/* Basic */}
            <div className="form-section-h">Personal details</div>
            <div className="form-row cols2">
              <div>
                <label>Full name *</label>
                <input className="input" value={vals.name} onChange={e => setField('name', e.target.value)} placeholder="Priya Sharma" required />
              </div>
              <div>
                <label>Email *</label>
                <input className="input" type="email" value={vals.email} onChange={e => setField('email', e.target.value)} placeholder="priya@example.com" required />
              </div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>Phone</label>
                <input className="input" value={vals.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label>LinkedIn URL</label>
                <input className="input" value={vals.linkedin_url} onChange={e => setField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/priyasharma" />
              </div>
            </div>
            <div className="form-row">
              <label>Current location</label>
              <input className="input" value={vals.location} onChange={e => setField('location', e.target.value)} placeholder="Bangalore, India" />
            </div>

            {/* Professional */}
            <div className="form-section-h">Professional details</div>
            <div className="form-row cols2">
              <div>
                <label>Current company</label>
                <input className="input" value={vals.current_company} onChange={e => setField('current_company', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label>Current designation</label>
                <input className="input" value={vals.current_designation} onChange={e => setField('current_designation', e.target.value)} placeholder="Senior Software Engineer" />
              </div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>Experience (years)</label>
                <input className="input" type="number" min={0} max={50} value={vals.experience_yrs} onChange={e => setField('experience_yrs', e.target.value)} placeholder="5" />
              </div>
              <div>
                <label>Skills <span className="hint" style={{ display: 'inline', margin: 0 }}>(comma-separated)</span></label>
                <input className="input" value={vals.skills} onChange={e => setField('skills', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
              </div>
            </div>

            {/* Source & Recruiter */}
            <div className="form-section-h">Tracking</div>
            <div className="form-row cols2">
              <div>
                <label>Source *</label>
                <select value={vals.source} onChange={e => setField('source', e.target.value)} required>
                  {CANDIDATE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Recruiter assigned</label>
                <select value={vals.recruiter_id} onChange={e => setField('recruiter_id', e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name}{m.role ? ` (${m.role})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resume */}
            <div className="form-section-h">Resume</div>
            <div className="form-row">
              <label>Upload CV <span className="hint" style={{ display: 'inline', margin: 0 }}>(PDF, DOCX — up to 10 MB)</span></label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setResume(e.target.files?.[0] || null)}
                style={{ fontSize: 13 }}
              />
              {resume && (
                <div className="small" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={12} /> {resume.name} · {(resume.size / 1024).toFixed(0)} KB
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="form-row">
              <label>Notes</label>
              <textarea rows={3} value={vals.notes} onChange={e => setField('notes', e.target.value)} placeholder="Initial impressions, anything relevant…" />
            </div>

            {/* Job mapping */}
            <div className="form-section-h">Link to open jobs <span className="hint" style={{ display: 'inline', margin: 0, marginLeft: 8 }}>(optional, select multiple)</span></div>
            {liveJobs.length === 0 ? (
              <div className="small" style={{ padding: 12, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                No live jobs to link to. The candidate will be added to the pool only.
              </div>
            ) : (
              <div className="job-mapping-list" style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10, padding: 6 }}>
                {liveJobs.map(j => (
                  <label key={j.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: selectedJobs.includes(j.id) ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(j.id)}
                      onChange={() => toggleJob(j.id)}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{j.title}</div>
                      <div className="small">{j.client_company}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-glow" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <UserPlus size={14} />}
              {saving ? 'Saving…' : 'Add candidate'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
