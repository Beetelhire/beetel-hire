'use client';

// Phase 6: Analytics Dashboard — business command center.
// Server passes pre-aggregated `data`; this view renders sections.

import { rupeeFmt, rupeeFull } from '@/lib/format';
import { pctClass, pickGrad, logoLetter } from '@/lib/helpers';
import { ExportMenu } from './export-menu';
import {
  TrendingUp, Briefcase, UsersRound,
  Award, BadgePercent, Wallet, CalendarRange,
  Lightbulb, ArrowRight,
} from 'lucide-react';

export type AnalyticsData = {
  exec: {
    totalRevenue: number;
    monthlyRevenue: number;
    quarterRevenue: number;
    activeJobs: number;
    totalCandidates: number;
    placementsThisMonth: number;
    recruitersActive: number;
    offerConvPct: number;
  };
  funnel: Record<string, number>;
  revByMonth: { label: string; iso: string; revenue: number; target: number; placements: number }[];
  revByRecruiter: { name: string; revenue: number }[];
  revByClient:    { name: string; revenue: number }[];
  revByCategory:  { name: string; revenue: number }[];
  recruiterLeaderboard: {
    id: string; name: string; role: string;
    candidates: number; interviews: number; placements: number;
    revenue: number; successPct: number;
  }[];
  sourcePerf: {
    source: string; candidates: number; interviews: number;
    placements: number; revenue: number;
  }[];
  trend: { label: string; candAdded: number; jobAdded: number; placements: number }[];
  health: {
    avgTimeToFill:        number | null;
    candToHireRatio:      number | null;
    offerAcceptRate:      number | null;
    placementSuccessRate: number | null;
    productivityPct:      number | null;
  };
  insights: string[];
};

const FUNNEL_STAGES = ['Applied','Screening','Interview','Client Review','Offer','Hired'] as const;
const STAGE_COLORS: Record<string, string> = {
  Applied:        '#94a3b8',
  Screening:      '#38bdf8',
  Interview:      '#a78bfa',
  'Client Review':'#f59e0b',
  Offer:          '#fb923c',
  Hired:          '#22c55e',
  Rejected:       '#ef4444',
};

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const { exec, funnel, revByMonth, revByRecruiter, revByClient, revByCategory, recruiterLeaderboard, sourcePerf, trend, health, insights } = data;

  return (
    <>
      {/* ───────── Executive overview ───────── */}
      <div className="section-h-sm" style={{ marginTop: 0 }}>Executive overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Total revenue"        value={rupeeFmt(exec.totalRevenue)}    icon={<Wallet size={14} />} accent />
        <KpiCard label="This month"           value={rupeeFmt(exec.monthlyRevenue)}   icon={<CalendarRange size={14} />} />
        <KpiCard label="This quarter"         value={rupeeFmt(exec.quarterRevenue)}   icon={<TrendingUp size={14} />} />
        <KpiCard label="Active jobs"          value={String(exec.activeJobs)}         icon={<Briefcase size={14} />} />
        <KpiCard label="Total candidates"     value={String(exec.totalCandidates)}    icon={<UsersRound size={14} />} />
        <KpiCard label="Placements this mo"   value={String(exec.placementsThisMonth)} icon={<Award size={14} />} />
        <KpiCard label="Recruiters active"    value={String(exec.recruitersActive)}    icon={<UsersRound size={14} />} />
        <KpiCard label="Offer conv. rate"     value={`${exec.offerConvPct}%`}          icon={<BadgePercent size={14} />} pct={exec.offerConvPct} />
      </div>

      {/* ───────── Recruitment funnel ───────── */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-h-sm" style={{ marginTop: 0 }}>Recruitment funnel</div>
        <Funnel funnel={funnel} />
      </div>

      {/* ───────── Revenue analytics ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Revenue by month — last 12</div>
          {revByMonth.every(m => m.revenue === 0 && m.target === 0)
            ? <EmptyMini msg="No revenue data yet. Add monthly performance records in Team." />
            : <RevByMonthChart data={revByMonth} />}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Revenue by recruiter</div>
          {revByRecruiter.length === 0 || revByRecruiter.every(r => r.revenue === 0)
            ? <EmptyMini msg="No recruiter revenue yet." />
            : <BarList rows={revByRecruiter} format={rupeeFull} />}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Revenue by client</div>
          {revByClient.length === 0
            ? <EmptyMini msg="No hires recorded yet. Revenue is attributed when a candidate reaches Hired stage on a job." />
            : <BarList rows={revByClient.slice(0, 8)} format={rupeeFull} />}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-h-sm" style={{ marginTop: 0 }}>Revenue by job category</div>
          {revByCategory.length === 0
            ? <EmptyMini msg="No category revenue yet." />
            : <BarList rows={revByCategory.slice(0, 8)} format={rupeeFull} />}
        </div>
      </div>

      {/* ───────── Recruiter leaderboard ───────── */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div><h3>Recruiter leaderboard</h3><div className="sub">Sorted by revenue generated</div></div>
          <ExportMenu
            filename="recruiter-leaderboard"
            sheet="Leaderboard"
            title="Recruiter Leaderboard"
            rows={recruiterLeaderboard}
            columns={[
              { key: 'name', label: 'Recruiter' },
              { key: 'role', label: 'Role' },
              { key: 'candidates', label: 'Candidates added', align: 'right' },
              { key: 'interviews', label: 'Interviews', align: 'right' },
              { key: 'placements', label: 'Placements', align: 'right' },
              { key: 'revenue', label: 'Revenue', align: 'right', format: (v) => rupeeFull(Number(v) || 0) },
              { key: 'successPct', label: 'Success rate', align: 'right', format: (v) => `${v}%` },
            ]}
          />
        </div>
        {recruiterLeaderboard.length === 0 ? (
          <div className="empty"><h4>No active recruiters</h4><p>Add team members with role &quot;Recruiter&quot; in <strong style={{ color: 'var(--fg)' }}>Team</strong>.</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th style={{ textAlign: 'right' }}>Candidates added</th>
                <th style={{ textAlign: 'right' }}>Interviews</th>
                <th style={{ textAlign: 'right' }}>Placements</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
                <th style={{ textAlign: 'right' }}>Success rate</th>
              </tr>
            </thead>
            <tbody>
              {recruiterLeaderboard.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: pickGrad(r.name), color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: 12,
                      }}>{logoLetter(r.name)}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {i < 3 && <span style={{ marginRight: 6 }}>{['🥇','🥈','🥉'][i]}</span>}
                          {r.name}
                        </div>
                        <div className="small">{r.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{r.candidates}</td>
                  <td style={{ textAlign: 'right' }}>{r.interviews}</td>
                  <td style={{ textAlign: 'right' }}>{r.placements}</td>
                  <td style={{ textAlign: 'right' }}><strong>{rupeeFmt(r.revenue)}</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`pct-label ${pctClass(r.successPct)}`}>{r.successPct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ───────── Source performance ───────── */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div><h3>Source performance</h3><div className="sub">Where your candidates are coming from</div></div>
          <ExportMenu
            filename="source-performance"
            sheet="Sources"
            title="Source Performance"
            rows={sourcePerf}
            columns={[
              { key: 'source', label: 'Source' },
              { key: 'candidates', label: 'Candidates', align: 'right' },
              { key: 'interviews', label: 'Interviews', align: 'right' },
              { key: 'placements', label: 'Placements', align: 'right' },
              { key: 'revenue', label: 'Revenue', align: 'right', format: (v) => rupeeFull(Number(v) || 0) },
            ]}
          />
        </div>
        {sourcePerf.length === 0 ? (
          <div className="empty"><h4>No source data yet</h4><p>Sources are tracked when candidates are added. Try adding a few in <strong style={{ color: 'var(--fg)' }}>Candidate Pool</strong>.</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Candidates</th>
                <th style={{ textAlign: 'right' }}>Interviews</th>
                <th style={{ textAlign: 'right' }}>Placements</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sourcePerf.map(s => (
                <tr key={s.source}>
                  <td><span className="skill-chip">{s.source}</span></td>
                  <td style={{ textAlign: 'right' }}>{s.candidates}</td>
                  <td style={{ textAlign: 'right' }}>{s.interviews}</td>
                  <td style={{ textAlign: 'right' }}>{s.placements}</td>
                  <td style={{ textAlign: 'right' }}>{rupeeFmt(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ───────── Hiring trend ───────── */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-h-sm" style={{ marginTop: 0 }}>Hiring trend — last 12 months</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <MiniBarChart title="Monthly placements"  data={trend.map(t => ({ label: t.label, value: t.placements }))} color="var(--accent-2)" />
          <MiniBarChart title="Monthly revenue"     data={revByMonth.map(t => ({ label: t.label, value: t.revenue }))} color="var(--accent)" yFormat={rupeeFmt} />
          <MiniBarChart title="Candidate growth"    data={trend.map(t => ({ label: t.label, value: t.candAdded }))} color="#22c55e" />
          <MiniBarChart title="Job growth"          data={trend.map(t => ({ label: t.label, value: t.jobAdded }))} color="#f59e0b" />
        </div>
      </div>

      {/* ───────── Business health ───────── */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-h-sm" style={{ marginTop: 0 }}>Business health</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <HealthCard label="Avg. time to fill"        value={health.avgTimeToFill === null ? '—' : `${health.avgTimeToFill} days`} />
          <HealthCard label="Candidate-to-hire ratio"  value={health.candToHireRatio === null ? '—' : `${health.candToHireRatio}:1`} />
          <HealthCard label="Offer acceptance rate"    value={health.offerAcceptRate === null ? '—' : `${health.offerAcceptRate}%`}    pct={health.offerAcceptRate ?? undefined} />
          <HealthCard label="Placement success rate"   value={health.placementSuccessRate === null ? '—' : `${health.placementSuccessRate}%`} pct={health.placementSuccessRate ?? undefined} />
          <HealthCard label="Recruiter productivity"   value={health.productivityPct === null ? '—' : `${health.productivityPct}%`}     pct={health.productivityPct ?? undefined} />
        </div>
      </div>

      {/* ───────── Quick insights ───────── */}
      <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="section-h-sm" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lightbulb size={14} /> Quick insights
        </div>
        {insights.length === 0 ? (
          <div className="small" style={{ padding: 12 }}>Once you have a few candidates, recruiters, and monthly records, insights will surface here automatically.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((t, i) => (
              <li key={i} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <ArrowRight size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ─── helper components ──────────────────────────────────────

function KpiCard({ label, value, icon, sub, pct, accent }: { label: string; value: string; icon?: React.ReactNode; sub?: string; pct?: number; accent?: boolean }) {
  return (
    <div className="panel" style={{
      padding: '14px 16px',
      ...(accent ? { borderColor: 'color-mix(in srgb, var(--accent) 30%, var(--border))' } : {}),
    }}>
      <div className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4, letterSpacing: '-.01em', color: accent ? 'var(--accent)' : 'var(--fg)' }}>{value}</div>
      {sub && <div className="small" style={{ marginTop: 2 }}>{sub}</div>}
      {pct !== undefined && (
        <div className={`progress ${pctClass(pct)}`} style={{ marginTop: 8 }}>
          <span style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
    </div>
  );
}

function HealthCard({ label, value, pct }: { label: string; value: string; pct?: number }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
      <div className="small">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{value}</div>
      {pct !== undefined && (
        <div className={`progress ${pctClass(pct)}`} style={{ marginTop: 8 }}>
          <span style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
    </div>
  );
}

function EmptyMini({ msg }: { msg: string }) {
  return (
    <div className="small" style={{ padding: '20px 12px', textAlign: 'center', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
      {msg}
    </div>
  );
}

function BarList({ rows, format }: { rows: { name: string; revenue: number }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map(r => r.revenue));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 13 }}>{format(r.revenue)}</div>
          </div>
          <div className="progress good">
            <span style={{ width: `${Math.max(2, (r.revenue / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ title, data, color, yFormat }: { title: string; data: { label: string; value: number }[]; color: string; yFormat?: (n: number) => string }) {
  const w = 380, h = 120, padL = 36, padR = 8, padT = 14, padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(1, ...data.map(d => d.value));
  const fmt = yFormat || ((n: number) => String(n));

  return (
    <div>
      <div className="small" style={{ marginBottom: 8, fontWeight: 500 }}>{title}</div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', maxHeight: 160 }}>
        {[0, 0.5, 1].map(p => (
          <g key={p}>
            <line x1={padL} x2={padL + innerW} y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke="var(--border)" strokeDasharray="2 3" />
            <text x={padL - 4} y={padT + innerH * (1 - p) + 3} fill="var(--fg-muted)" fontSize="9" textAnchor="end">{fmt(max * p)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const barW = Math.max(4, (innerW / data.length) * 0.7);
          const x = padL + (innerW / data.length) * (i + 0.5) - barW / 2;
          const barH = (d.value / max) * innerH;
          return (
            <g key={i}>
              <rect x={x} y={padT + innerH - barH} width={barW} height={barH} fill={color} rx={2} />
              {i % Math.ceil(data.length / 6) === 0 && (
                <text x={x + barW / 2} y={h - 6} fill="var(--fg-muted)" fontSize="9" textAnchor="middle">{d.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RevByMonthChart({ data }: { data: { label: string; revenue: number; target: number; placements: number }[] }) {
  const w = 600, h = 180, padL = 50, padR = 8, padT = 18, padB = 26;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(1, ...data.map(d => Math.max(d.revenue, d.target)));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', maxHeight: 220 }}>
      {[0, 0.5, 1].map(p => (
        <g key={p}>
          <line x1={padL} x2={padL + innerW} y1={padT + innerH * (1 - p)} y2={padT + innerH * (1 - p)} stroke="var(--border)" strokeDasharray="2 3" />
          <text x={padL - 6} y={padT + innerH * (1 - p) + 3} fill="var(--fg-muted)" fontSize="9" textAnchor="end">{rupeeFmt(max * p)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const groupW = innerW / data.length;
        const cx = padL + groupW * (i + 0.5);
        const barW = Math.max(4, groupW * 0.32);
        const tH = (d.target / max) * innerH;
        const aH = (d.revenue / max) * innerH;
        return (
          <g key={i}>
            <rect x={cx - barW - 1} y={padT + innerH - tH} width={barW} height={tH} fill="color-mix(in srgb, var(--fg-muted) 30%, transparent)" rx={2} />
            <rect x={cx + 1}        y={padT + innerH - aH} width={barW} height={aH} fill="var(--accent)" rx={2} />
            <text x={cx} y={h - 6} fill="var(--fg-muted)" fontSize="9" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
      <text x={padL + innerW} y={padT - 4} fill="var(--fg-muted)" fontSize="9" textAnchor="end">
        <tspan>■ target  </tspan>
        <tspan fill="var(--accent)">■ achieved</tspan>
      </text>
    </svg>
  );
}

function Funnel({ funnel }: { funnel: Record<string, number> }) {
  const applied = funnel.Applied || 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FUNNEL_STAGES.map((s, i) => {
        const count = funnel[s] || 0;
        const max = Math.max(1, applied);
        const widthPct = (count / max) * 100;
        const prev = i === 0 ? count : (funnel[FUNNEL_STAGES[i - 1]] || 0);
        const conv = prev > 0 ? Math.round((count / prev) * 100) : 0;
        return (
          <div key={s} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 70px', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[s] }}></span>
              {s}
            </div>
            <div style={{ height: 26, background: 'var(--bg)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.max(2, widthPct)}%`,
                background: STAGE_COLORS[s],
                borderRadius: 6,
                transition: 'width .4s ease',
              }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{count}</div>
            <div className="small" style={{ textAlign: 'right' }}>
              {i > 0 && <>→ {conv}%</>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
