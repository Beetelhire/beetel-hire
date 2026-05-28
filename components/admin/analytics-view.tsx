'use client';

import { useMemo, useState, useRef } from 'react';
import { Job, TeamTarget, AnalyticsTarget } from '@/types/database';
import { jobExpectedFee, rupeeFmt, FEE_RATE } from '@/lib/format';
import { pctClass } from '@/lib/helpers';

type J = Pick<Job, 'id' | 'title' | 'client_company' | 'pay' | 'posted_at' | 'status'>;

const WINDOWS = [
  { days: 15, label: '15 days' },
  { days: 30, label: '1 month' },
  { days: 45, label: '45 days' },
  { days: 60, label: '2 months' },
];

export function AnalyticsView({ jobs, team, targets }: { jobs: J[]; team: TeamTarget[]; targets: AnalyticsTarget[] }) {
  const [win, setWin] = useState(30);
  const targetsByWin = useMemo(() => {
    const m: Record<number, AnalyticsTarget> = {};
    (targets || []).forEach(t => { m[t.window_days] = t; });
    return m;
  }, [targets]);
  const [target, setTarget] = useState<number>(targetsByWin[30]?.target || 0);
  const [achieved, setAchieved] = useState<number>(targetsByWin[30]?.achieved || 0);

  // When user switches the window, reload that window's saved values
  function switchWindow(days: number) {
    setWin(days);
    const t = targetsByWin[days];
    setTarget(t?.target || 0);
    setAchieved(t?.achieved || 0);
  }

  // Pipeline metrics for selected window
  const inWindow = useMemo(() => {
    const cutoff = Date.now() - win * 86400000;
    return jobs.filter(j => new Date(j.posted_at).getTime() >= cutoff && j.status !== 'rejected');
  }, [jobs, win]);
  const totalFees = useMemo(() => inWindow.reduce((s, j) => s + jobExpectedFee(j.pay), 0), [inWindow]);
  const clients   = useMemo(() => new Set(inWindow.map(j => j.client_company).filter(Boolean)).size, [inWindow]);
  const avgFee    = inWindow.length ? totalFees / inWindow.length : 0;

  // Trend buckets (one count per day)
  const buckets = useMemo(() => {
    const arr = new Array(win).fill(0);
    const now = Date.now();
    jobs.forEach(j => {
      const age = Math.floor((now - new Date(j.posted_at).getTime()) / 86400000);
      if (age >= 0 && age < win) arr[win - 1 - age] += 1;
    });
    return arr;
  }, [jobs, win]);

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function commitTargets(t: number, a: number) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/admin/analytics-targets/${win}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ target: t, achieved: a }),
        });
      } catch {}
    }, 400);
  }

  const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
  const cls = pctClass(pct);

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Analytics</h2>
          <p>Set your target for a window, enter what you&apos;ve achieved, see your pipeline and percentage at a glance.</p>
        </div>
      </div>

      {/* Timeline selector */}
      <div className="timeline-selector">
        {WINDOWS.map(w => (
          <button key={w.days} className={win === w.days ? 'active' : ''} onClick={() => switchWindow(w.days)}>{w.label}</button>
        ))}
      </div>

      <div className="analytics-twocol">
        {/* Pipeline value */}
        <div className="panel ana-panel">
          <div className="panel-head">
            <div>
              <h3>Pipeline value</h3>
              <div className="sub">Estimated fees (≈{Math.round(FEE_RATE * 100)}% of CTC) from {inWindow.length} role{inWindow.length === 1 ? '' : 's'} posted in last {win} days</div>
            </div>
          </div>
          <div className="ana-pipeline">
            <div className="ana-big-value">{rupeeFmt(totalFees)}</div>
            <div className="ana-meta">
              <div className="ana-meta-row"><span>Active mandates in window</span><strong>{inWindow.length}</strong></div>
              <div className="ana-meta-row"><span>Client companies</span><strong>{clients}</strong></div>
              <div className="ana-meta-row"><span>Avg. expected fee / role</span><strong>{rupeeFmt(avgFee)}</strong></div>
            </div>
          </div>
        </div>

        {/* Target vs Achieved */}
        <div className="panel ana-panel">
          <div className="panel-head">
            <div>
              <h3>Target vs Achieved</h3>
              <div className="sub">Manually enter target and what you closed in this window.</div>
            </div>
          </div>
          <div className="ana-target">
            <div className="ana-target-inputs">
              <label>
                <span>Expected target (₹)</span>
                <input className="input-mini" type="number" min={0} value={target || ''} placeholder="50,00,000" onChange={e => { const v = parseFloat(e.target.value) || 0; setTarget(v); commitTargets(v, achieved); }} />
              </label>
              <label>
                <span>Achieved (₹)</span>
                <input className="input-mini" type="number" min={0} value={achieved || ''} placeholder="38,00,000" onChange={e => { const v = parseFloat(e.target.value) || 0; setAchieved(v); commitTargets(target, v); }} />
              </label>
            </div>
            <div className="ana-pct-block">
              <div className={`ana-pct ${cls}`}>{pct}%</div>
              <div className={`progress ${cls}`}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
              <div className="ana-pct-sub">Achieved {rupeeFmt(achieved)} of {rupeeFmt(target)} target for the {win}-day window</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head">
          <div>
            <h3>Pipeline trend</h3>
            <div className="sub">{buckets.reduce((a, b) => a + b, 0)} role{buckets.reduce((a, b) => a + b, 0) === 1 ? '' : 's'} posted in the last {win} days · peak day: {Math.max(...buckets)} role{Math.max(...buckets) === 1 ? '' : 's'}</div>
          </div>
        </div>
        <TrendChart buckets={buckets} days={win} />
      </div>

      {/* Team performance */}
      <div className="panel ana-panel-padded" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-.012em' }}>Team performance</h3>
          <div className="sub" style={{ fontSize: 12, marginTop: 2 }}>Achievement against current targets</div>
        </div>
        <TeamHbar team={team} />
      </div>
    </>
  );
}

function TrendChart({ buckets, days }: { buckets: number[]; days: number }) {
  const max = Math.max(1, ...buckets);
  const W = 800, H = 220, PAD_L = 36, PAD_R = 12, PAD_T = 16, PAD_B = 32;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const xStep = innerW / Math.max(1, buckets.length - 1);
  const points = buckets.map((v, i) => ({ x: PAD_L + i * xStep, y: PAD_T + (1 - v / max) * innerH, v, dayBack: buckets.length - 1 - i }));

  // smooth path
  let linePath = '';
  if (points.length) {
    linePath = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      const mx = (a.x + b.x) / 2;
      linePath += ` Q ${mx},${a.y} ${mx},${(a.y + b.y) / 2} T ${b.x},${b.y}`;
    }
  }
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x},${H - PAD_B} L ${PAD_L},${H - PAD_B} Z` : '';

  const ticks = [0, 1, 2, 3, 4].map(i => Math.round(max * (i / 4)));
  const labelCount = 5;
  const xLabels: { x: number; label: string }[] = [];
  for (let k = 0; k <= labelCount; k++) {
    const idx = Math.round(k * (points.length - 1) / labelCount);
    if (points[idx]) {
      const dayBack = points[idx].dayBack;
      xLabels.push({ x: points[idx].x, label: dayBack === 0 ? 'Today' : `${dayBack}d` });
    }
  }

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradAna" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity=".30" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid">
          {ticks.map((v, i) => {
            const y = PAD_T + (1 - i / 4) * innerH;
            return <line key={i} x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} />;
          })}
        </g>
        <g className="axis">
          {ticks.map((v, i) => {
            const y = PAD_T + (1 - i / 4) * innerH;
            return <text key={i} x={PAD_L - 8} y={y + 3} textAnchor="end">{v}</text>;
          })}
          {xLabels.map((l, i) => <text key={i} x={l.x} y={H - PAD_B + 16} textAnchor="middle">{l.label}</text>)}
        </g>
        <path d={areaPath} fill="url(#trendGradAna)" />
        <path d={linePath} className="line" />
        {points.map((p, i) => p.v > 0 && <circle key={i} className="point" cx={p.x} cy={p.y} r={3.5} />)}
      </svg>
    </div>
  );
}

function TeamHbar({ team }: { team: TeamTarget[] }) {
  if (!team.length) return <div className="empty" style={{ padding: 24 }}><h4 style={{ fontSize: 14 }}>No team targets set</h4></div>;
  return (
    <div className="hbar-list">
      {team.map(t => {
        const pct = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
        const color = pct >= 80 ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                    : pct >= 50 ? 'linear-gradient(90deg, #ca8a04, #fbbf24)'
                                : 'linear-gradient(90deg, #b91c1c, #ef4444)';
        return (
          <div className="hbar-row" key={t.id}>
            <div className="hbar-label" title={`${t.name} — ${t.role}`}>{t.name} — {t.role}</div>
            <div className="hbar-track"><span style={{ width: `${Math.min(100, pct)}%`, background: color }} /></div>
            <div className="hbar-value">{t.achieved}/{t.target} · {pct}%</div>
          </div>
        );
      })}
    </div>
  );
}
