'use client';

// Enhanced Team table — adds employee_id, dept, doj, manager, active jobs,
// candidates managed, monthly performance, status; row click opens dedicated
// profile page; Add Team Member button.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamMember } from '@/types/database';
import { AddTeamMemberModal } from './add-team-member-modal';
import { ExportMenu } from './export-menu';
import { pickGrad, logoLetter, pctClass } from '@/lib/helpers';
import { rupeeFmt, rupeeFull } from '@/lib/format';
import { Search, UserPlus, ChevronRight } from 'lucide-react';

export type TeamRow = TeamMember & {
  manager_name: string | null;
  active_jobs:   number;
  candidates_managed: number;
  this_month_target:   number;
  this_month_achieved: number;
};

export function TeamTable({ rows: initial }: { rows: TeamRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');
  const [addOpen, setAddOpen] = useState(false);

  const departments = useMemo(() => [...new Set(initial.map(r => r.department).filter(Boolean))].sort() as string[], [initial]);
  const roles       = useMemo(() => [...new Set(initial.map(r => r.role).filter(Boolean))].sort(), [initial]);
  const managers    = useMemo(() => initial.map(r => ({ id: r.id, full_name: r.full_name })), [initial]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initial.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (roleFilter && r.role !== roleFilter)        return false;
      if (deptFilter && r.department !== deptFilter)  return false;
      if (q) {
        const hay = `${r.full_name} ${r.email} ${r.employee_id || ''} ${r.designation || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initial, search, statusFilter, roleFilter, deptFilter]);

  return (
    <>
      <div className="admin-toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, employee ID…" />
        </div>
        <button className={`filter-tag${statusFilter !== 'all' ? ' active' : ''}`}>
          Status:
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </button>
        <button className={`filter-tag${roleFilter ? ' active' : ''}`}>
          Role:
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </button>
        <button className={`filter-tag${deptFilter ? ' active' : ''}`}>
          Department:
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">All</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <ExportMenu
            filename="team"
            sheet="Team"
            title="Team"
            rows={filtered}
            columns={[
              { key: 'employee_id', label: 'Employee ID' },
              { key: 'full_name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'role', label: 'Role' },
              { key: 'department', label: 'Department' },
              { key: 'designation', label: 'Designation' },
              { key: 'doj', label: 'Date of joining', format: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
              { key: 'manager_name', label: 'Manager' },
              { key: 'active_jobs', label: 'Active jobs', align: 'right' },
              { key: 'candidates_managed', label: 'Candidates managed', align: 'right' },
              { key: 'this_month_target', label: 'This month target', align: 'right', format: (v) => rupeeFull(Number(v) || 0) },
              { key: 'this_month_achieved', label: 'This month achieved', align: 'right', format: (v) => rupeeFull(Number(v) || 0) },
              { key: 'status', label: 'Status' },
            ]}
          />
          <button className="btn btn-glow btn-sm" onClick={() => setAddOpen(true)}>
            <UserPlus size={14} /> Add team member
          </button>
        </div>
      </div>

      {initial.length === 0 ? (
        <div className="empty">
          <h4>No team members yet</h4>
          <p>Click <strong style={{ color: 'var(--fg)' }}>Add team member</strong> to start building your team directory. Performance tracking, recruiter assignment, and targets will all hang off this.</p>
        </div>
      ) : (
        <div className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Role</th>
                <th>Department</th>
                <th>DOJ</th>
                <th>Manager</th>
                <th style={{ textAlign: 'right' }}>Active jobs</th>
                <th style={{ textAlign: 'right' }}>Candidates</th>
                <th style={{ minWidth: 180 }}>This month</th>
                <th>Status</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const pct = r.this_month_target > 0 ? Math.round((r.this_month_achieved / r.this_month_target) * 100) : 0;
                const cls = pctClass(pct);
                return (
                  <tr key={r.id} className="clickable" onClick={() => router.push(`/admin/team/${r.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {r.profile_photo_url
                          ? <img alt="" src={r.profile_photo_url} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 34, height: 34, borderRadius: '50%', background: pickGrad(r.full_name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{logoLetter(r.full_name)}</div>}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500 }}>{r.full_name}</div>
                          <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="small">{r.employee_id || '—'}</span></td>
                    <td>{r.role}</td>
                    <td><span className="small">{r.department || '—'}</span></td>
                    <td><span className="small">{r.doj ? new Date(r.doj).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span></td>
                    <td><span className="small">{r.manager_name || '—'}</span></td>
                    <td style={{ textAlign: 'right' }}>{r.active_jobs}</td>
                    <td style={{ textAlign: 'right' }}>{r.candidates_managed}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={`progress ${cls}`} style={{ flex: 1 }}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
                          <div className={`pct-label ${cls}`} style={{ minWidth: 36, textAlign: 'right', fontSize: 11 }}>{pct}%</div>
                        </div>
                        <div className="small" style={{ fontSize: 11 }}>
                          {rupeeFmt(r.this_month_achieved)} / {rupeeFmt(r.this_month_target)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${r.status === 'Active' ? 'active' : 'pending'}`}>
                        <span className="ddot"></span>{r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}><ChevronRight size={14} style={{ color: 'var(--fg-subtle)' }} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11}>
                  <div className="empty"><h4>No matches</h4><p>Try clearing the filter or search.</p></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AddTeamMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        managers={managers}
      />
    </>
  );
}
