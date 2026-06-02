'use client';

// Admin: add an EXISTING candidate from the pool to a specific job.
// Used on the job detail page. Pre-filters out candidates who are already
// linked to this job.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, Search, Loader2 } from 'lucide-react';
import { showToast } from '../toast';
import { PIPELINE_STAGES, PipelineStage } from '@/types/database';
import { logoLetter } from '@/lib/format';
import type { TeamMemberLite } from './add-candidate-modal';

export type CandidateLite = {
  id: string;
  name: string;
  email: string;
  source: string | null;
  current_company: string | null;
  experience: string | null;
  location: string | null;
  recruiter_id: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  candidates: CandidateLite[];           // pool of candidates NOT yet on this job
  teamMembers: TeamMemberLite[];
};

export function AddExistingCandidateModal({ open, onClose, jobId, jobTitle, candidates, teamMembers }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [stage, setStage] = useState<PipelineStage>('Applied');
  const [recruiterId, setRecruiterId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSearch('');
      setPickedId(null);
      setStage('Applied');
      setRecruiterId('');
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Default recruiter from picked candidate
  useEffect(() => {
    if (!pickedId) return;
    const c = candidates.find(x => x.id === pickedId);
    if (c?.recruiter_id) setRecruiterId(c.recruiter_id);
  }, [pickedId, candidates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return candidates.slice(0, 50);
    return candidates.filter(c =>
      `${c.name} ${c.email} ${c.current_company || ''} ${c.location || ''}`.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [candidates, search]);

  async function submit() {
    if (!pickedId) return showToast('Pick a candidate first', 'error');
    setSaving(true);
    try {
      const c = candidates.find(x => x.id === pickedId);
      const res = await fetch('/api/admin/candidate-job-mappings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          candidate_id: pickedId,
          job_id: jobId,
          stage,
          recruiter_id: recruiterId || null,
          source: c?.source || null,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'failed');
      showToast(`${c?.name || 'Candidate'} added to ${jobTitle}`);
      onClose();
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not add', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`modal-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`modal job-modal${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="title">Add existing candidate to {jobTitle}</div>
            <div className="sub">Pick a candidate from your pool. They&apos;ll appear in this job&apos;s pipeline at the stage you choose.</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: 'calc(85vh - 200px)', overflowY: 'auto' }}>
          {/* Search */}
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
              <Search size={14} style={{ opacity: 0.6 }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, company, location…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Pool list */}
          {filtered.length === 0 ? (
            <div className="small" style={{ padding: 18, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
              {candidates.length === 0
                ? 'All candidates in your pool are already on this job.'
                : 'No candidates match your search.'}
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, maxHeight: 280, overflowY: 'auto' }}>
              {filtered.map(c => (
                <label
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 10, cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: pickedId === c.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="candidate-pick"
                    checked={pickedId === c.id}
                    onChange={() => setPickedId(c.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 12, flexShrink: 0,
                  }}>
                    {logoLetter(c.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                    <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.email}
                      {c.current_company && <> · {c.current_company}</>}
                      {c.experience && <> · {c.experience}</>}
                    </div>
                  </div>
                  {c.source && <span className="skill-chip">{c.source}</span>}
                </label>
              ))}
            </div>
          )}

          {/* Stage + recruiter for this mapping */}
          {pickedId && (
            <>
              <div className="form-section-h" style={{ marginTop: 18 }}>Pipeline placement</div>
              <div className="form-row cols2">
                <div>
                  <label>Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value as PipelineStage)}>
                    {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label>Recruiter</label>
                  <select value={recruiterId} onChange={e => setRecruiterId(e.target.value)}>
                    <option value="">— Unassigned —</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name}{m.role ? ` (${m.role})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-glow" disabled={!pickedId || saving} onClick={submit}>
            {saving ? <Loader2 size={14} className="spin" /> : <UserPlus size={14} />}
            {saving ? 'Adding…' : 'Add to job'}
          </button>
        </div>
      </div>
    </>
  );
}
