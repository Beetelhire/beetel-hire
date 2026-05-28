'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../toast';
import { fmtRelative, functionIcon } from '@/lib/format';
import * as LucideIcons from 'lucide-react';
import { Edit2, Trash2, Search, Globe, Linkedin, Instagram } from 'lucide-react';

type J = {
  id: string;
  title: string;
  client_company: string;
  loc: string;
  type: string;
  experience: string | null;
  exp_level: string | null;
  fn: string | null;
  pay: string | null;
  pay_note: string | null;
  status: string;
  posted_at: string;
  posted_platforms: string[];
  applicants_count: number;
};

function statusPill(s: string) {
  const labels: Record<string, string> = { live: 'Live', review: 'Shortlisting', pending: 'Calibrating', rejected: 'Closed' };
  return <span className={`status-pill ${s}`}><span className="ddot"></span> {labels[s] || s}</span>;
}

function PlatformPill({ p }: { p: string }) {
  const Icon = p === 'linkedin' ? Linkedin : p === 'instagram' ? Instagram : Globe;
  return <span className={`platform-pill ${p}`} title={p}><Icon size={12} /></span>;
}

const PAGE_SIZE = 10;

export function AdminJobsTable({ jobs: allJobs }: { jobs: J[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [client, setClient] = useState('');
  const [platform, setPlatform] = useState('');
  const [sortKey, setSortKey] = useState<'title' | 'client_company' | 'loc' | 'status' | 'posted_at' | 'applicants'>('posted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const clients = useMemo(() => [...new Set(allJobs.map(j => j.client_company).filter(Boolean))].sort(), [allJobs]);

  const filtered = useMemo(() => {
    let arr = allJobs.slice();
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(j => `${j.title} ${j.client_company} ${j.loc} ${j.fn || ''}`.toLowerCase().includes(q));
    }
    if (status)   arr = arr.filter(j => j.status === status);
    if (client)   arr = arr.filter(j => j.client_company === client);
    if (platform) arr = arr.filter(j => (j.posted_platforms || []).includes(platform));

    arr.sort((a, b) => {
      let va: any = a[sortKey === 'applicants' ? 'applicants_count' : sortKey];
      let vb: any = b[sortKey === 'applicants' ? 'applicants_count' : sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      va = va ?? '';
      vb = vb ?? '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return arr;
  }, [allJobs, search, status, client, platform, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageJobs = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleSort(k: typeof sortKey) {
    if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  }

  function thClass(k: typeof sortKey) {
    if (sortKey !== k) return '';
    return sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc';
  }

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This removes it from the live site immediately.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      showToast('Job removed');
      router.refresh();
    } catch {
      showToast('Could not delete', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title, client, location…" />
        </div>
        <button className={`filter-tag${status ? ' active' : ''}`}>
          Status:
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="live">Live</option>
            <option value="review">Shortlisting</option>
            <option value="pending">Calibrating</option>
            <option value="rejected">Closed</option>
          </select>
        </button>
        <button className={`filter-tag${client ? ' active' : ''}`}>
          Client:
          <select value={client} onChange={e => { setClient(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </button>
        <button className={`filter-tag${platform ? ' active' : ''}`}>
          Platform:
          <select value={platform} onChange={e => { setPlatform(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="website">Website</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
        </button>
      </div>

      <div className="panel">
        <table className="table sortable">
          <thead>
            <tr>
              <th className={thClass('title')}          onClick={() => toggleSort('title')}          data-sort="title">Job Title</th>
              <th className={thClass('client_company')} onClick={() => toggleSort('client_company')} data-sort="client_company">Client Company</th>
              <th className={thClass('loc')}            onClick={() => toggleSort('loc')}            data-sort="loc">Location</th>
              <th className={thClass('status')}         onClick={() => toggleSort('status')}         data-sort="status">Status</th>
              <th className={thClass('posted_at')}      onClick={() => toggleSort('posted_at')}      data-sort="posted_at">Posted</th>
              <th className={thClass('applicants')}     onClick={() => toggleSort('applicants')}     data-sort="applicants">Applicants</th>
              <th>Platforms</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageJobs.map(j => {
              const iconName = functionIcon(j.fn);
              const Icon = (LucideIcons as any)[
                iconName.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
              ] || LucideIcons.Briefcase;
              return (
                <tr key={j.id} className="clickable" onClick={() => router.push(`/admin/jobs/${j.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="job-logo job-logo-brand" style={{ width: 36, height: 36, borderRadius: 10 }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{j.title}</div>
                        <div className="small">{j.type || ''} · {j.experience || j.exp_level || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>{j.client_company || '—'}</td>
                  <td>{j.loc}</td>
                  <td>{statusPill(j.status)}</td>
                  <td>{fmtRelative(j.posted_at)}</td>
                  <td><strong style={{ color: 'var(--fg)' }}>{j.applicants_count || 0}</strong></td>
                  <td><div className="platform-pills">{(j.posted_platforms || ['website']).map(p => <PlatformPill key={p} p={p} />)}</div></td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <Link className="btn btn-icon-sq btn-ghost" href={`/admin/jobs/${j.id}/edit`} title="Edit"><Edit2 size={13} /></Link>
                      <button className="btn btn-icon-sq btn-ghost" onClick={() => onDelete(j.id, j.title)} title="Delete" disabled={deletingId === j.id}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageJobs.length === 0 && (
              <tr><td colSpan={8}>
                <div className="empty">
                  <h4>No roles match these filters</h4>
                  <p>Adjust filters, clear the search, or add a new job.</p>
                  <Link className="btn btn-glow btn-sm" href="/admin/jobs/new">Add a job</Link>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>

        {filtered.length > PAGE_SIZE && (
          <div className="pagination">
            <div>Showing <strong style={{ color: 'var(--fg)' }}>{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--fg)' }}>{filtered.length}</strong> roles</div>
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
    </>
  );
}
