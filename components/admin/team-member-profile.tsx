'use client';

// Team member profile page — performance dashboard.
// Shows employee info, KPI cards, performance table (12 months),
// SVG charts (revenue trend, placements trend), and edit/add controls.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Plus, CheckCircle2, Trash2, Mail, Phone, Briefcase, Calendar, User2 } from 'lucide-react';
import { TeamMember, MonthlyPerformance } from '@/types/database';
import { AddTeamMemberModal } from './add-team-member-modal';
import { MonthlyPerfModal } from './monthly-perf-modal';
import { showToast } from '../toast';
import { rupeeFmt, rupeeFull } from '@/lib/format';
import { pctClass, pickGrad, logoLetter } from '@/lib/helpers';

type Props = {
  member: TeamMember;
  records: MonthlyPerformance[];           // sorted ASC by month
  managerName: string | null;
  managers: { id: string; full_name: string }[];
  activeJobs: number;
  candidatesManaged: number;
};

function monthLabel(iso: string): string {
  // 'YYYY-MM-DD' → 'Jun 26'
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function monthLabelLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function TeamMemberProfile({ member, records, managerName, managers, activeJobs, candidatesManaged }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen]   = useState(false);
  const [perfOpen, setPerfOpen]   = useState(false);
  const [editRec, setEditRec]     = useState<MonthlyPerformance | null>(null);

  // Sort ASC by month for charts
  const sorted = useMemo(() => [...records].sort((a, b) => a.month.localeCompare(b.month)), [records]);

  // Aggregate metrics
  const totalTarget   = sorted.reduce((s, r) => s + Number(r.target_revenue), 0);
  const totalAchieved = sorted.reduce((s, r) => s + Number(r.achieved_revenue), 0);
  const totalPlace    = sorted.reduce((s, r) => s + Number(r.placements_made), 0);
  const totalInter    = sorted.reduce((s, r) => s + Number(r.interviews_scheduled), 0);
  const overallPct    = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

  // Growth — last 2 months
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const growthPct = (prev && Number(prev.achieved_revenue) > 0)
    ? Math.round(((Number(last.achieved_revenue) - Number(prev.achieved_revenue)) / Number(prev.achieved_revenue)) * 100)
    : null;

  async function complete(rec: MonthlyPerformance) {
    if (rec.completed) return;
    try {
      const res = await fetch(`/api/admin/team/${member.id}/performance/${rec.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) throw new Error();
      showToast('Month marked complete');
      router.refresh();
    } catch {
      showToast('Could not update', 'error');
    }
  }

  async function removeRec(rec: MonthlyPerformance) {
    if (!confirm(`Delete the record for ${monthLabelLong(rec.month)}?`)) return;
    try {
      const res = await fetch(`/api/admin/team/${member.id}/performance/${rec.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Record deleted');
      router.refresh();
    } catch {
      showToast('Could not delete', 'error');
    }
  }

  async function deleteMember() {
    if (!confirm(`Permanently delete ${member.full_name}? Their performance records will be deleted too.`)) return;
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Team member deleted');
      router.push('/admin/team');
    } catch {
      showToast('Could not delete', 'error');
    }
  }

  // SVG chart helpers
  const chartW = 600, chartH = 160, padL = 40, padR = 12, padT = 14, padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxRev = Math.max(1, ...sorted.map(r => Math.max(Number(r.target_revenue), Number(r.achieved_revenue))));
  const maxPlace = Math.max(1, ...sorted.map(r => Number(r.placements_made)));

  function xAt(i: number, n: number) {
    if (n <= 1) return padL + innerW / 2;
    return padL + (i / (n - 1)) * innerW;
  }

  return (
    <>
      <div className="view-head">
        <div>
          <Link className="btn btn-ghost btn-sm" href="/admin/team" style={{ marginBottom: 10, paddingLeft: 0 }}>
            <ArrowLeft size={13} /> Back to team
          </Link>
          <h2>{member.full_name}</h2>
          <p>{member.designation || member.role}{member.department ? ` · ${member.department}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>
            <Edit2 size={13} /> Edit
          </button>
          <button className="btn btn-ghost btn-sm" onClick={deleteMember}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
          {member.profile_photo_url
            ? <img alt="" src={member.profile_photo_url} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 72, height: 72, borderRadius: '50%', background: pickGrad(member.full_name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 26 }}>{logoLetter(member.full_name)}</div>}
          <div>
            <div style={{ fontSize: 22, fontWeight: 500 }}>{member.full_name}</div>
            <div className="small" style={{ marginTop: 4 }}>
              {member.role}{member.employee_id ? ` · ${member.employee_id}` : ''} · <span className={`status-pill ${member.status === 'Active' ? 'active' : 'pending'}`} style={{ marginLeft: 4 }}><span className="ddot"></span>{member.status}</span>
            </div>
          </div>
        </div>

        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="info-row">
            <div className="lbl"><Mail size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />Email</div>
            <div className="val"><a href={`mailto:${member.email}`}>{member.email}</a></div>
          </div>
          <div className="info-row">
            <div className="lbl"><Phone size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />Phone</div>
            <div className="val">{member.phone || '—'}</div>
          </div>
          <div className="info-row">
            <div className="lbl"><Calendar size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />Date of joining</div>
            <div className="val">{member.doj ? new Date(member.doj).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
          </div>
          <div className="info-row">
            <div className="lbl"><User2 size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />Reporting manager</div>
            <div className="val">{managerName || '—'}</div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Active jobs"          value={activeJobs.toString()} icon={<Briefcase size={14} />} />
        <KpiCard label="Candidates managed"   value={candidatesManaged.toString()} icon={<User2 size={14} />} />
        <KpiCard label="Lifetime revenue"     value={rupeeFmt(totalAchieved)} sub={`of ${rupeeFmt(totalTarget)} target`} />
        <KpiCard label="Lifetime placements"  value={String(totalPlace)} sub={`${totalInter} interviews`} />
        <KpiCard label="Target achievement"   value={`${overallPct}%`} sub="lifetime" pct={overallPct} />
        <KpiCard label="MoM growth"           value={growthPct === null ? '—' : `${growthPct > 0 ? '+' : ''}${growthPct}%`} sub="last month vs previous" />
      </div>

      {/* Charts */}
      {sorted.length > 0 && (
        <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Revenue trend — target vs achieved</div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', maxHeight: 200 }}>
            {/* Y axis labels */}
            {[0, 0.5, 1].map((p) => (
              <g key={p}>
                <line x1={padL} x2={padL + innerW} y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke="var(--border)" strokeDasharray="2 4" />
                <text x={padL - 6} y={padT + innerH * (1 - p) + 4} fill="var(--fg-muted)" fontSize="10" textAnchor="end">{rupeeFmt(maxRev * p)}</text>
              </g>
            ))}
            {/* Bars */}
            {sorted.map((r, i) => {
              const x = xAt(i, sorted.length);
              const barW = Math.max(6, Math.min(28, innerW / sorted.length * 0.35));
              const tH = (Number(r.target_revenue)   / maxRev) * innerH;
              const aH = (Number(r.achieved_revenue) / maxRev) * innerH;
              return (
                <g key={r.id}>
                  <rect x={x - barW - 1} y={padT + innerH - tH} width={barW} height={tH} fill="color-mix(in srgb, var(--fg-muted) 30%, transparent)" rx={2} />
                  <rect x={x + 1}        y={padT + innerH - aH} width={barW} height={aH} fill="var(--accent)" rx={2} />
                  <text x={x} y={chartH - 6} fill="var(--fg-muted)" fontSize="10" textAnchor="middle">{monthLabel(r.month)}</text>
                </g>
              );
            })}
            <text x={padL + innerW} y={padT - 4} fill="var(--fg-muted)" fontSize="10" textAnchor="end">
              <tspan>■ target </tspan><tspan fill="var(--accent)">■ achieved</tspan>
            </text>
          </svg>

          <div className="section-h-sm">Placements per month</div>
          <svg viewBox={`0 0 ${chartW} 120`} style={{ width: '100%', height: 'auto', maxHeight: 160 }}>
            {[0, 0.5, 1].map((p) => (
              <g key={p}>
                <line x1={padL} x2={padL + innerW} y1={padT + (120 - padT - padB) * (1 - p)} y2={padT + (120 - padT - padB) * (1 - p)} stroke="var(--border)" strokeDasharray="2 4" />
                <text x={padL - 6} y={padT + (120 - padT - padB) * (1 - p) + 4} fill="var(--fg-muted)" fontSize="10" textAnchor="end">{Math.round(maxPlace * p)}</text>
              </g>
            ))}
            {sorted.map((r, i) => {
              const x = xAt(i, sorted.length);
              const barW = Math.max(8, Math.min(30, innerW / sorted.length * 0.6));
              const h = (Number(r.placements_made) / maxPlace) * (120 - padT - padB);
              return (
                <g key={r.id}>
                  <rect x={x - barW / 2} y={padT + (120 - padT - padB) - h} width={barW} height={h} fill="var(--accent-2)" rx={2} />
                  <text x={x} y={120 - 4} fill="var(--fg-muted)" fontSize="10" textAnchor="middle">{monthLabel(r.month)}</text>
                  {Number(r.placements_made) > 0 && (
                    <text x={x} y={padT + (120 - padT - padB) - h - 4} fill="var(--fg)" fontSize="10" textAnchor="middle">{r.placements_made}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Records table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Monthly performance records</h3>
            <div className="sub">{sorted.length} record{sorted.length === 1 ? '' : 's'}</div>
          </div>
          <button className="btn btn-glow btn-sm" onClick={() => { setEditRec(null); setPerfOpen(true); }}>
            <Plus size={13} /> Add monthly record
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="empty">
            <h4>No records yet</h4>
            <p>Click <strong style={{ color: 'var(--fg)' }}>Add monthly record</strong> to start tracking this team member&apos;s monthly target, achievements, placements, and activity.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Target</th>
                <th style={{ textAlign: 'right' }}>Achieved</th>
                <th style={{ minWidth: 140 }}>Achievement</th>
                <th style={{ textAlign: 'right' }}>Placements</th>
                <th style={{ textAlign: 'right' }}>Interviews</th>
                <th style={{ textAlign: 'right' }}>Candidates</th>
                <th>Status</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {[...sorted].reverse().map(r => {
                const pct = Number(r.target_revenue) > 0 ? Math.round((Number(r.achieved_revenue) / Number(r.target_revenue)) * 100) : 0;
                const cls = pctClass(pct);
                return (
                  <tr key={r.id}>
                    <td><strong>{monthLabelLong(r.month)}</strong></td>
                    <td style={{ textAlign: 'right' }}>{rupeeFull(Number(r.target_revenue))}</td>
                    <td style={{ textAlign: 'right' }}>{rupeeFull(Number(r.achieved_revenue))}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={`progress ${cls}`} style={{ flex: 1, minWidth: 60 }}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
                        <div className={`pct-label ${cls}`} style={{ minWidth: 42, textAlign: 'right' }}>{pct}%</div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>{r.placements_made}</td>
                    <td style={{ textAlign: 'right' }}>{r.interviews_scheduled}</td>
                    <td style={{ textAlign: 'right' }}>{r.candidates_processed}</td>
                    <td>
                      {r.completed
                        ? <span className="status-pill active"><span className="ddot"></span>Complete</span>
                        : <span className="status-pill pending"><span className="ddot"></span>Open</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost btn-sm btn-icon-sq" onClick={() => { setEditRec(r); setPerfOpen(true); }} aria-label="Edit"><Edit2 size={13} /></button>
                      {!r.completed && (
                        <button className="btn btn-ghost btn-sm btn-icon-sq" onClick={() => complete(r)} aria-label="Mark complete" style={{ marginLeft: 4 }}>
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon-sq" onClick={() => removeRec(r)} aria-label="Delete" style={{ marginLeft: 4 }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddTeamMemberModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        member={member}
        managers={managers}
      />

      <MonthlyPerfModal
        open={perfOpen}
        onClose={() => { setPerfOpen(false); setEditRec(null); }}
        teamMemberId={member.id}
        record={editRec}
      />
    </>
  );
}

function KpiCard({ label, value, sub, icon, pct }: { label: string; value: string; sub?: string; icon?: React.ReactNode; pct?: number }) {
  return (
    <div className="panel" style={{ padding: '14px 16px' }}>
      <div className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: '-.01em' }}>{value}</div>
      {sub && <div className="small" style={{ marginTop: 2 }}>{sub}</div>}
      {pct !== undefined && (
        <div className={`progress ${pctClass(pct)}`} style={{ marginTop: 8 }}>
          <span style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
    </div>
  );
}
