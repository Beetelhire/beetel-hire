'use client';

// Job detail → Pipeline section.
// Stage filter chips, search, recruiter/source filters, candidate table with stage dropdown,
// and "Add existing" / "Add new" buttons.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PIPELINE_STAGES, PipelineStage, CANDIDATE_SOURCES,
} from '@/types/database';
import { AddCandidateModal, JobLite, TeamMemberLite } from './add-candidate-modal';
import { AddExistingCandidateModal, CandidateLite } from './add-existing-candidate-modal';
import { showToast } from '../toast';
import { fmtRelative, logoLetter } from '@/lib/format';
import {
  Search, UserPlus, UsersRound, Trash2, ChevronRight, Mail,
} from 'lucide-react';

export type PipelineRow = {
  mapping_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_avatar: string | null;
  candidate_experience: string | null;
  candidate_location: string | null;
  stage: PipelineStage;
  recruiter_id: string | null;
  recruiter_name: string | null;
  source: string | null;
  added_at: string;
};

type Props = {
  jobId: string;
  jobTitle: string;
  rows: PipelineRow[];
  poolForLinking: CandidateLite[];
  teamMembers: TeamMemberLite[];
  thisJob: JobLite;                       // for the "Add new candidate" modal
};

function StageDot({ stage }: { stage: PipelineStage }) {
  const COLORS: Record<PipelineStage, string> = {
    'Applied':       '#94a3b8',
    'Screening':     '#38bdf8',
    'Interview':     '#a78bfa',
    'Client Review': '#f59e0b',
    'Offer':         '#fb923c',
    'Hired':         '#22c55e',
    'Rejected':      '#ef4444',
  };
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: COLORS[stage], marginRight: 6,
    }} />
  );
}

export function JobPipelineView({ jobId, jobTitle, rows: initialRows, poolForLinking, teamMembers, thisJob }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<PipelineRow[]>(initialRows);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | PipelineStage>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('');
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    PIPELINE_STAGES.forEach(s => { c[s] = 0; });
    rows.forEach(r => { c[r.stage] = (c[r.stage] || 0) + 1; });
    return c;
  }, [rows]);

  // Funnel conversion percentages (Applied → next)
  const funnel = useMemo(() => {
    const total = rows.length || 1;
    return PIPELINE_STAGES.map((s, i) => {
      const atOrPast = PIPELINE_STAGES
        .slice(i)
        .filter(st => st !== 'Rejected')   // rejected isn't "past Applied"
        .reduce((sum, st) => sum + (counts[st] || 0), 0);
      return {
        stage: s,
        count: counts[s] || 0,
        pct: Math.round((atOrPast / total) * 100),
      };
    });
  }, [counts, rows.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
      if (sourceFilter && r.source !== sourceFilter) return false;
      if (recruiterFilter && r.recruiter_id !== recruiterFilter) return false;
      if (q && !`${r.candidate_name} ${r.candidate_email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, stageFilter, sourceFilter, recruiterFilter]);

  async function changeStage(mappingId: string, newStage: PipelineStage) {
    const prev = rows;
    setRows(rs => rs.map(r => r.mapping_id === mappingId ? { ...r, stage: newStage } : r));
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings/${mappingId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error();
      showToast(`Stage → ${newStage}`);
      router.refresh();
    } catch {
      setRows(prev);
      showToast('Could not update stage', 'error');
    }
  }

  async function changeRecruiter(mappingId: string, newRecruiterId: string) {
    const prev = rows;
    const recruiterName = teamMembers.find(t => t.id === newRecruiterId)?.full_name || null;
    setRows(rs => rs.map(r =>
      r.mapping_id === mappingId
        ? { ...r, recruiter_id: newRecruiterId || null, recruiter_name: recruiterName }
        : r));
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings/${mappingId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recruiter_id: newRecruiterId || null }),
      });
      if (!res.ok) throw new Error();
      showToast('Recruiter updated');
      router.refresh();
    } catch {
      setRows(prev);
      showToast('Could not update recruiter', 'error');
    }
  }

  async function remove(mappingId: string) {
    if (!confirm('Remove this candidate from the job? They stay in the pool.')) return;
    const prev = rows;
    setRows(rs => rs.filter(r => r.mapping_id !== mappingId));
    try {
      const res = await fetch(`/api/admin/candidate-job-mappings/${mappingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Removed from job');
      router.refresh();
    } catch {
      setRows(prev);
      showToast('Could not remove', 'error');
    }
  }

  function resetFilters() {
    setSearch(''); setStageFilter('all'); setSourceFilter(''); setRecruiterFilter('');
  }
  const anyFilter = !!(search || stageFilter !== 'all' || sourceFilter || recruiterFilter);

  return (
    <>
      <div className="panel" style={{ padding: 0, marginTop: 20 }}>
        <div className="panel-head" style={{ padding: '18px 24px 14px' }}>
          <div>
            <h3>Pipeline</h3>
            <div className="sub">{rows.length} candidate{rows.length === 1 ? '' : 's'} across all stages</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setAddExistingOpen(true)}>
              <UsersRound size={13} /> Add existing
            </button>
            <button className="btn btn-glow btn-sm" onClick={() => setAddNewOpen(true)}>
              <UserPlus size={13} /> Add new
            </button>
          </div>
        </div>

        {/* Stage chips */}
        <div style={{ padding: '0 24px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <button
            className={`btn btn-sm ${stageFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setStageFilter('all')}
          >
            All <span style={{ opacity: 0.5, marginLeft: 6 }}>{counts.all}</span>
          </button>
          {PIPELINE_STAGES.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${stageFilter === s ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setStageFilter(s)}
            >
              <StageDot stage={s} />{s} <span style={{ opacity: 0.5, marginLeft: 6 }}>{counts[s] || 0}</span>
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ padding: '12px 24px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px' }}>
            <Search size={13} style={{ opacity: 0.6 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 13 }}
            />
          </div>
          <button className={`filter-tag${sourceFilter ? ' active' : ''}`}>
            Source:
            <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
              <option value="">All</option>
              {CANDIDATE_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </button>
          <button className={`filter-tag${recruiterFilter ? ' active' : ''}`}>
            Recruiter:
            <select value={recruiterFilter} onChange={e => setRecruiterFilter(e.target.value)}>
              <option value="">All</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </button>
          {anyFilter && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Clear</button>}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="empty">
            <h4>{rows.length === 0 ? 'No candidates on this job yet' : 'No candidates match your filters'}</h4>
            <p>
              {rows.length === 0
                ? <>Click <strong style={{ color: 'var(--fg)' }}>Add existing</strong> or <strong style={{ color: 'var(--fg)' }}>Add new</strong> to start building the pipeline.</>
                : <>Try clearing the filter or stage chip.</>}
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Source</th>
                <th>Recruiter</th>
                <th>Stage</th>
                <th>Added</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.mapping_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {r.candidate_avatar
                        ? <img alt="" src={r.candidate_avatar} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{logoLetter(r.candidate_name)}</div>}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{r.candidate_name}</div>
                        <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.candidate_email}
                          {r.candidate_experience && <> · {r.candidate_experience}</>}
                          {r.candidate_location && <> · {r.candidate_location}</>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{r.source ? <span className="skill-chip">{r.source}</span> : <span className="small">—</span>}</td>
                  <td>
                    <select
                      className="status-select"
                      value={r.recruiter_id || ''}
                      onChange={e => changeRecruiter(r.mapping_id, e.target.value)}
                      style={{ minWidth: 120 }}
                    >
                      <option value="">— Unassigned —</option>
                      {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={r.stage}
                      onChange={e => changeStage(r.mapping_id, e.target.value as PipelineStage)}
                      style={{ minWidth: 130 }}
                    >
                      {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><span className="small">{fmtRelative(r.added_at)}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <a className="btn btn-ghost btn-sm btn-icon-sq" href={`mailto:${r.candidate_email}`} aria-label="Email"><Mail size={13} /></a>
                    <a className="btn btn-ghost btn-sm btn-icon-sq" href={`/admin/candidates?focus=${r.candidate_id}`} aria-label="Open profile" style={{ marginLeft: 4 }}><ChevronRight size={13} /></a>
                    <button className="btn btn-ghost btn-sm btn-icon-sq" onClick={() => remove(r.mapping_id)} aria-label="Remove" style={{ marginLeft: 4 }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Funnel summary (only if there are candidates) */}
        {rows.length > 0 && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="small" style={{ marginBottom: 10, color: 'var(--fg-muted)' }}>Funnel</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {funnel.filter(f => f.stage !== 'Rejected').map((f) => (
                <div key={f.stage} style={{
                  flex: 1, minWidth: 100,
                  padding: '10px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center' }}>
                    <StageDot stage={f.stage} />{f.stage}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{f.count}</div>
                  <div className="small">{f.pct}% conversion</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddExistingCandidateModal
        open={addExistingOpen}
        onClose={() => setAddExistingOpen(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        candidates={poolForLinking}
        teamMembers={teamMembers}
      />

      <AddCandidateModal
        open={addNewOpen}
        onClose={() => setAddNewOpen(false)}
        jobs={[thisJob]}
        teamMembers={teamMembers}
        preselectedJobIds={[thisJob.id]}
      />
    </>
  );
}
