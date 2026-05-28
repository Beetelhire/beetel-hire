'use client';

import { useMemo, useState } from 'react';
import { Candidate } from '@/types/database';
import { CandidateDrawer } from './candidate-drawer';
import { logoLetter } from '@/lib/format';
import { Search, ChevronRight } from 'lucide-react';

type C = Candidate & { applied_jobs?: { id: string; title: string; client_company: string; applied_at: string; status: string }[] };

const PAGE_SIZE = 12;

export function CandidatePoolTable({ candidates: all }: { candidates: C[] }) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [exp, setExp] = useState('');
  const [freshness, setFreshness] = useState('');
  const [poolStatus, setPoolStatus] = useState('');
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<C | null>(null);

  const locations = useMemo(() => [...new Set(all.map(c => c.location).filter(Boolean))].sort() as string[], [all]);
  const skills    = useMemo(() => [...new Set(all.flatMap(c => c.skills || []))].sort(), [all]);

  const filtered = useMemo(() => {
    let arr = all.slice();
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(c => `${c.name} ${c.email} ${(c.skills || []).join(' ')} ${c.focus || ''}`.toLowerCase().includes(q));
    }
    if (location)   arr = arr.filter(c => c.location === location);
    if (poolStatus) arr = arr.filter(c => c.pool_status === poolStatus);
    if (freshness)  arr = arr.filter(c => c.freshness === freshness);
    if (skill)      arr = arr.filter(c => (c.skills || []).includes(skill));
    if (exp) arr = arr.filter(c => {
      const y = c.experience_yrs || 0;
      if (exp === '0-3')   return y <= 3;
      if (exp === '3-5')   return y > 3 && y <= 5;
      if (exp === '5-10')  return y > 5 && y <= 10;
      if (exp === '10+')   return y > 10;
      return true;
    });
    return arr;
  }, [all, search, location, exp, freshness, poolStatus, skill]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, skill, or email…" />
        </div>
        <button className={`filter-tag${location ? ' active' : ''}`}>
          Location:
          <select value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </button>
        <button className={`filter-tag${exp ? ' active' : ''}`}>
          Experience:
          <select value={exp} onChange={e => { setExp(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="0-3">0–3 yrs</option>
            <option value="3-5">3–5 yrs</option>
            <option value="5-10">5–10 yrs</option>
            <option value="10+">10+ yrs</option>
          </select>
        </button>
        <button className={`filter-tag${freshness ? ' active' : ''}`}>
          Freshness:
          <select value={freshness} onChange={e => { setFreshness(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Passive">Passive</option>
            <option value="Warm">Warm</option>
          </select>
        </button>
        <button className={`filter-tag${poolStatus ? ' active' : ''}`}>
          Pool status:
          <select value={poolStatus} onChange={e => { setPoolStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Hold">On Hold</option>
          </select>
        </button>
        <button className={`filter-tag${skill ? ' active' : ''}`}>
          Skill:
          <select value={skill} onChange={e => { setSkill(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </button>
      </div>

      <div className="panel">
        <table className="table sortable">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Location</th>
              <th>Freshness</th>
              <th>Pool status</th>
              <th>Applied</th>
              <th>Availability</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(c => {
              const appliedNames = (c.applied_jobs || []).map(a => a.title).filter(Boolean);
              return (
                <tr key={c.id} className="clickable" onClick={() => setOpen(c)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {c.avatar_url
                        ? <img alt="" src={c.avatar_url} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                        : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{logoLetter(c.name)}</div>}
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div className="small">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.experience || '—'}</td>
                  <td>
                    <div className="skill-chips" style={{ maxWidth: 200 }}>
                      {(c.skills || []).slice(0, 3).map(sk => <span key={sk} className="skill-chip">{sk}</span>)}
                      {(c.skills || []).length > 3 && <span className="small" style={{ marginLeft: 4 }}>+{(c.skills || []).length - 3}</span>}
                    </div>
                  </td>
                  <td>{c.location || '—'}</td>
                  <td><span className="small">{c.freshness || '—'}</span></td>
                  <td><span className={`pool-status-pill ${c.pool_status.replace(' ', '')}`}>{c.pool_status}</span></td>
                  <td><span className="small">{appliedNames.length ? appliedNames.join(', ') : '—'}</span></td>
                  <td><span className="small">{c.availability || '—'}</span></td>
                  <td style={{ textAlign: 'right' }}><ChevronRight size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={9}>
                <div className="empty"><h4>No candidates match</h4><p>Try clearing a filter or broadening your search.</p></div>
              </td></tr>
            )}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className="pagination">
            <div>Showing <strong style={{ color: 'var(--fg)' }}>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--fg)' }}>{filtered.length}</strong> candidates</div>
            <div className="pagination-pages">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={p === safePage ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      <CandidateDrawer candidate={open} onClose={() => setOpen(null)} />
    </>
  );
}
