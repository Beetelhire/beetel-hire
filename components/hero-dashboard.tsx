// Recruitment dashboard mockup that sits on the right side of the home hero.
// Pure HTML/CSS/SVG — no library, no real data, no JS interactivity.
// Designed to communicate "AI-powered recruitment platform" at a glance.

import { Briefcase, UsersRound, Sparkles, TrendingUp, CheckCircle2, Circle } from 'lucide-react';

type PipelineStage = { name: string; count: number; color: string };

const PIPELINE: PipelineStage[] = [
  { name: 'Applied',   count: 142, color: '#94A3B8' },
  { name: 'Screening', count: 38,  color: '#60A5FA' },
  { name: 'Interview', count: 24,  color: '#A78BFA' },
  { name: 'Offer',     count: 12,  color: '#FB923C' },
  { name: 'Hired',     count: 8,   color: '#22C55E' },
];

export function HeroDashboard() {
  const max = Math.max(...PIPELINE.map(p => p.count));
  return (
    <div className="dash-stage">
      {/* Soft glow halo behind the mock */}
      <div className="dash-halo" aria-hidden="true" />

      {/* Floating metric chip — top right */}
      <div className="dash-chip dash-chip-tr">
        <Sparkles size={11} />
        <span>AI matched</span>
        <strong>94%</strong>
      </div>

      {/* Floating metric chip — bottom left */}
      <div className="dash-chip dash-chip-bl">
        <TrendingUp size={11} />
        <span>This quarter</span>
        <strong>+18%</strong>
      </div>

      {/* Main mock card */}
      <div className="dash-card">
        <div className="dash-header">
          <div className="dash-traffic">
            <span className="d r" /><span className="d y" /><span className="d g" />
          </div>
          <div className="dash-title">
            <span className="dash-brand-dot" />
            Beetel Hire — Dashboard
          </div>
          <span className="dash-live">
            <span className="dot" /> Live
          </span>
        </div>

        {/* KPI strip */}
        <div className="dash-kpis">
          <div className="dash-kpi">
            <div className="lbl"><Briefcase size={10} /> Open positions</div>
            <div className="val">24</div>
            <div className="sub up">+5 this week</div>
          </div>
          <div className="dash-kpi">
            <div className="lbl"><UsersRound size={10} /> Active recruiters</div>
            <div className="val">8</div>
            <div className="sub">All on track</div>
          </div>
          <div className="dash-kpi">
            <div className="lbl"><CheckCircle2 size={10} /> Hires this month</div>
            <div className="val">8</div>
            <div className="sub up">+33%</div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="dash-section-h">Recruitment pipeline</div>
        <div className="dash-pipeline">
          {PIPELINE.map((s, i) => {
            const h = (s.count / max) * 100;
            return (
              <div key={s.name} className="dash-stage-col">
                <div className="dash-bar-wrap">
                  <div
                    className="dash-bar"
                    style={{ height: `${Math.max(8, h)}%`, background: s.color, animationDelay: `${i * 80}ms` }}
                  />
                </div>
                <div className="dash-stage-name">{s.name}</div>
                <div className="dash-stage-count">{s.count}</div>
              </div>
            );
          })}
        </div>

        {/* AI match candidate row */}
        <div className="dash-match">
          <div className="dash-avatar">PS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="dash-cand-name">Priya Sharma</div>
            <div className="dash-cand-role">Senior Engineer · 6 yrs · Bangalore</div>
          </div>
          <div className="dash-score">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(99,102,241,.15)" strokeWidth="4" />
              <circle
                cx="22" cy="22" r="18"
                fill="none"
                stroke="#6366F1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="113.1"
                strokeDashoffset="6.8"
                transform="rotate(-90 22 22)"
              />
            </svg>
            <div className="dash-score-val">94<span>%</span></div>
          </div>
        </div>

        <div className="dash-stages-row">
          {['Applied', 'Screened', 'Interview', 'Offer'].map((s, i) => (
            <div key={s} className={`dash-stage-pill${i <= 2 ? ' done' : ''}`}>
              {i <= 2 ? <CheckCircle2 size={10} /> : <Circle size={10} />}
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
