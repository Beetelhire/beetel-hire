'use client';

// Admin Contact Enquiries view — filter by status, search, expand to read full message,
// change status (New / Contacted / Closed), delete.

import { useMemo, useState } from 'react';
import { Inbox, Mail, Phone, Search, ChevronDown, Trash2, Building2, Calendar } from 'lucide-react';
import { showToast } from '../toast';
import { ExportMenu } from './export-menu';
import { fmtRelative, logoLetter } from '@/lib/format';
import type { ContactEnquiry, ContactEnquiryStatus } from '@/types/database';

const STATUSES: ContactEnquiryStatus[] = ['New', 'Contacted', 'Closed'];

function statusClass(s: ContactEnquiryStatus): string {
  if (s === 'New')       return 'pending';
  if (s === 'Contacted') return 'review';
  return 'active'; // Closed
}

export function EnquiriesView({ initial }: { initial: ContactEnquiry[] }) {
  const [rows, setRows] = useState<ContactEnquiry[]>(initial);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactEnquiryStatus>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => ({
    all: rows.length,
    New: rows.filter(r => r.status === 'New').length,
    Contacted: rows.filter(r => r.status === 'Contacted').length,
    Closed: rows.filter(r => r.status === 'Closed').length,
  }), [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!needle) return true;
      const hay = [
        r.full_name, r.company_name, r.email, r.phone, r.subject, r.message,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, q, statusFilter]);

  async function changeStatus(id: string, status: ContactEnquiryStatus) {
    const prev = rows;
    setRows(r => r.map(x => x.id === id ? { ...x, status } : x));
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      showToast(`Marked ${status}`);
    } catch {
      setRows(prev);
      showToast('Could not update status', 'error');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    const prev = rows;
    setRows(r => r.filter(x => x.id !== id));
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Enquiry deleted');
    } catch {
      setRows(prev);
      showToast('Could not delete', 'error');
    }
  }

  if (rows.length === 0) {
    return (
      <div className="empty">
        <Inbox size={28} style={{ marginBottom: 12, opacity: 0.5 }} />
        <h4>No enquiries yet</h4>
        <p>When visitors submit the <strong style={{ color: 'var(--fg)' }}>Contact Us</strong> form on beetelhire.in, their messages land here automatically.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="panel" style={{ padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="search" style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px' }}>
            <Search size={14} style={{ opacity: 0.6 }} />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by name, company, email, subject…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter('all')}
            >
              All <span style={{ opacity: 0.5, marginLeft: 6 }}>{counts.all}</span>
            </button>
            {STATUSES.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s} <span style={{ opacity: 0.5, marginLeft: 6 }}>{counts[s]}</span>
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <ExportMenu
              filename="contact-enquiries"
              sheet="Enquiries"
              title="Contact Enquiries"
              rows={filtered}
              columns={[
                { key: 'full_name', label: 'Name' },
                { key: 'company_name', label: 'Company' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'subject', label: 'Subject' },
                { key: 'message', label: 'Message' },
                { key: 'status', label: 'Status' },
                { key: 'created_at', label: 'Received', format: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
                { key: 'notes', label: 'Notes' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty">
          <h4>No matching enquiries</h4>
          <p>Try clearing the search or status filter.</p>
        </div>
      ) : (
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Received</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <>
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg,var(--accent),var(--accent-2))',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: 13, flexShrink: 0,
                          }}
                        >
                          {logoLetter(r.full_name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{r.full_name}</div>
                          <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Mail size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                            {r.email}
                            {r.company_name && (
                              <> · <Building2 size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />{r.company_name}</>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{r.subject || <span style={{ color: 'var(--fg-muted)' }}>—</span>}</td>
                    <td>
                      <select
                        className="status-select"
                        value={r.status}
                        onChange={(e) => changeStatus(r.id, e.target.value as ContactEnquiryStatus)}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 12,
                          color: 'var(--fg)',
                          cursor: 'pointer',
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className="small">
                        <Calendar size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                        {fmtRelative(r.created_at)}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon-sq"
                        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        aria-label="Expand message"
                      >
                        <ChevronDown
                          size={14}
                          style={{ transform: expanded === r.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
                        />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon-sq"
                        onClick={() => remove(r.id)}
                        aria-label="Delete"
                        style={{ marginLeft: 4 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>

                  {expanded === r.id && (
                    <tr key={r.id + '-msg'}>
                      <td colSpan={5} style={{ background: 'var(--bg)', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '8px 24px', fontSize: 13 }}>
                          <div style={{ color: 'var(--fg-muted)' }}>Message</div>
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{r.message}</div>

                          {r.phone && (<>
                            <div style={{ color: 'var(--fg-muted)' }}>Phone</div>
                            <div>
                              <Phone size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 6 }} />
                              <a href={`tel:${r.phone}`}>{r.phone}</a>
                            </div>
                          </>)}

                          <div style={{ color: 'var(--fg-muted)' }}>Reply</div>
                          <div>
                            <a className="btn btn-sm btn-secondary" href={`mailto:${r.email}?subject=Re: ${encodeURIComponent(r.subject || 'Your enquiry')}`}>
                              <Mail size={12} /> Email {r.full_name.split(' ')[0]}
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
