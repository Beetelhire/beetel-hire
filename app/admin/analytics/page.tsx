// Phase 6: Analytics Dashboard — full redesign.
// Server component does all the aggregation; AnalyticsView renders the dashboard.

import { createSupabaseServer } from '@/lib/supabase-server';
import { AnalyticsView, type AnalyticsData } from '@/components/admin/analytics-view';
import { jobExpectedFee } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function firstOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function firstOfMonthFromIso(iso: string): string {
  const d = new Date(iso);
  return firstOfMonth(d);
}
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function quarterStart(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1);
}

export default async function AnalyticsPage() {
  const supabase = createSupabaseServer();

  const [jobsRes, candsRes, mappingsRes, teamRes, perfRes] = await Promise.all([
    supabase.from('jobs').select('id, title, client_company, fn, pay, posted_at, status'),
    supabase.from('candidates').select('id, source, recruiter_id, created_at, hire_status'),
    supabase.from('candidate_job_mappings').select('id, candidate_id, job_id, stage, recruiter_id, source, added_at, job:jobs(id, title, client_company, fn, pay), candidate:candidates(id, source)'),
    supabase.from('team_members').select('id, full_name, role, status'),
    supabase.from('monthly_performance').select('*'),
  ]);

  const jobs     = (jobsRes.data     || []) as any[];
  const cands    = (candsRes.data    || []) as any[];
  const mappings = (mappingsRes.data || []) as any[];
  const team     = (teamRes.data     || []) as any[];
  const perf     = (perfRes.data     || []) as any[];

  const now = new Date();
  const thisMonthIso = firstOfMonth(now);
  const thisQuarterStart = quarterStart(now);

  // ---- Revenue: from monthly_performance.achieved_revenue ----
  const totalRevenue   = perf.reduce((s, p) => s + Number(p.achieved_revenue || 0), 0);
  const monthlyRevenue = perf.filter(p => p.month === thisMonthIso).reduce((s, p) => s + Number(p.achieved_revenue || 0), 0);
  const quarterRevenue = perf.filter(p => new Date(p.month) >= thisQuarterStart).reduce((s, p) => s + Number(p.achieved_revenue || 0), 0);

  // ---- Jobs ----
  const activeJobs = jobs.filter(j => j.status === 'live').length;

  // ---- Candidates ----
  const totalCandidates = cands.length;

  // ---- Funnel (counts by stage from mappings) ----
  const stageCounts: Record<string, number> = {
    Applied: 0, Screening: 0, Interview: 0, 'Client Review': 0, Offer: 0, Hired: 0, Rejected: 0,
  };
  mappings.forEach(m => { stageCounts[m.stage] = (stageCounts[m.stage] || 0) + 1; });

  // Placements this month = mappings where stage='Hired' AND updated/added this month (best approximation)
  const placementsThisMonth = perf
    .filter(p => p.month === thisMonthIso)
    .reduce((s, p) => s + Number(p.placements_made || 0), 0);

  // ---- Recruiters active ----
  const recruitersActive = team.filter(t => t.status === 'Active').length;

  // ---- Offer conversion rate = Offer + Hired / Applied (anti-funnel) ----
  const offers = (stageCounts.Offer || 0) + (stageCounts.Hired || 0);
  const apps   = mappings.length;
  const offerConvPct = apps > 0 ? Math.round((offers / apps) * 100) : 0;

  // ---- Revenue by recruiter ----
  const teamById: Record<string, any> = {};
  team.forEach(t => { teamById[t.id] = t; });
  const revByRecruiter: Record<string, number> = {};
  perf.forEach(p => {
    revByRecruiter[p.team_member_id] = (revByRecruiter[p.team_member_id] || 0) + Number(p.achieved_revenue || 0);
  });

  // ---- Revenue by client (from jobs.pay * placements via mappings) ----
  // Simple proxy: for each Hired mapping, attribute jobExpectedFee(job.pay) to job.client_company
  const revByClient: Record<string, number> = {};
  mappings.forEach(m => {
    if (m.stage !== 'Hired' || !m.job) return;
    const client = m.job.client_company || 'Unknown';
    revByClient[client] = (revByClient[client] || 0) + jobExpectedFee(m.job.pay);
  });

  // ---- Revenue by job category (fn) ----
  const revByCategory: Record<string, number> = {};
  mappings.forEach(m => {
    if (m.stage !== 'Hired' || !m.job) return;
    const fn = m.job.fn || 'Other';
    revByCategory[fn] = (revByCategory[fn] || 0) + jobExpectedFee(m.job.pay);
  });

  // ---- Revenue by month (last 12) ----
  const months: { key: string; label: string; iso: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: monthKey(d),
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      iso: firstOfMonth(d),
    });
  }
  const revByMonth = months.map(m => {
    const sum = perf
      .filter(p => p.month === m.iso)
      .reduce((s, p) => s + Number(p.achieved_revenue || 0), 0);
    const target = perf
      .filter(p => p.month === m.iso)
      .reduce((s, p) => s + Number(p.target_revenue || 0), 0);
    const placements = perf
      .filter(p => p.month === m.iso)
      .reduce((s, p) => s + Number(p.placements_made || 0), 0);
    return { ...m, revenue: sum, target, placements };
  });

  // ---- Recruiter leaderboard ----
  const candByRec: Record<string, number> = {};
  cands.forEach(c => { if (c.recruiter_id) candByRec[c.recruiter_id] = (candByRec[c.recruiter_id] || 0) + 1; });

  const interviewsByRec: Record<string, number> = {};
  const placementsByRec: Record<string, number> = {};
  mappings.forEach(m => {
    if (!m.recruiter_id) return;
    if (['Interview','Client Review','Offer','Hired'].includes(m.stage)) {
      interviewsByRec[m.recruiter_id] = (interviewsByRec[m.recruiter_id] || 0) + 1;
    }
    if (m.stage === 'Hired') {
      placementsByRec[m.recruiter_id] = (placementsByRec[m.recruiter_id] || 0) + 1;
    }
  });

  const recruiterLeaderboard = team
    .filter(t => t.status === 'Active')
    .map(t => {
      const c = candByRec[t.id] || 0;
      const p = placementsByRec[t.id] || 0;
      const i = interviewsByRec[t.id] || 0;
      const r = revByRecruiter[t.id] || 0;
      const success = c > 0 ? Math.round((p / c) * 100) : 0;
      return { id: t.id, name: t.full_name, role: t.role, candidates: c, interviews: i, placements: p, revenue: r, successPct: success };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // ---- Source performance ----
  const ALL_SOURCES = ['LinkedIn','Referral','Inbound','Website','Naukri','Indeed','Walk-in','Internal Database','Other'];
  const sourcePerf = ALL_SOURCES.map(src => {
    const candsAtSource = cands.filter(c => c.source === src);
    const mapsAtSource = mappings.filter(m => (m.source || m.candidate?.source) === src);
    const interviews = mapsAtSource.filter(m => ['Interview','Client Review','Offer','Hired'].includes(m.stage)).length;
    const placements = mapsAtSource.filter(m => m.stage === 'Hired').length;
    const revenue = mapsAtSource.filter(m => m.stage === 'Hired').reduce((s, m) => s + jobExpectedFee(m.job?.pay), 0);
    return {
      source: src,
      candidates: candsAtSource.length,
      interviews,
      placements,
      revenue,
    };
  }).filter(s => s.candidates > 0 || s.interviews > 0);

  // ---- Hiring trend (last 12 months: placements + candidate growth + job growth) ----
  const trend = months.map(m => {
    const monthStart = new Date(m.iso);
    const monthEnd   = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const candAdded = cands.filter(c => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return d >= monthStart && d < monthEnd;
    }).length;

    const jobAdded = jobs.filter(j => {
      if (!j.posted_at) return false;
      const d = new Date(j.posted_at);
      return d >= monthStart && d < monthEnd;
    }).length;

    const place = perf
      .filter(p => p.month === m.iso)
      .reduce((s, p) => s + Number(p.placements_made || 0), 0);

    return { label: m.label, candAdded, jobAdded, placements: place };
  });

  // ---- Business health ----
  // Average time to fill = mean (days between job.posted_at and earliest Hired mapping.added_at) for jobs that have a hire
  const filledJobs: number[] = [];
  jobs.forEach(j => {
    const hires = mappings
      .filter(m => m.job_id === j.id && m.stage === 'Hired')
      .map(m => new Date(m.added_at).getTime());
    if (hires.length && j.posted_at) {
      const first = Math.min(...hires);
      const posted = new Date(j.posted_at).getTime();
      const days = Math.max(0, Math.round((first - posted) / 86400000));
      filledJobs.push(days);
    }
  });
  const avgTimeToFill = filledJobs.length ? Math.round(filledJobs.reduce((s, n) => s + n, 0) / filledJobs.length) : null;

  const hiredCount = mappings.filter(m => m.stage === 'Hired').length;
  const candToHireRatio = hiredCount > 0 ? Math.round((apps / hiredCount) * 10) / 10 : null;
  const acceptedOffers = mappings.filter(m => m.stage === 'Hired').length;
  const totalOffers    = mappings.filter(m => ['Offer','Hired','Rejected'].includes(m.stage)).length;
  const offerAcceptRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : null;
  const placementSuccessRate = apps > 0 ? Math.round((hiredCount / apps) * 100) : null;
  const totalTargetThisMonth = perf.filter(p => p.month === thisMonthIso).reduce((s, p) => s + Number(p.target_revenue || 0), 0);
  const productivityPct = totalTargetThisMonth > 0 ? Math.round((monthlyRevenue / totalTargetThisMonth) * 100) : null;

  // ---- Quick insights ----
  const insights: string[] = [];
  // Top source by placements this month
  const sourcesByPlacement = [...sourcePerf].sort((a, b) => b.placements - a.placements);
  if (sourcesByPlacement[0]?.placements > 0) {
    const top = sourcesByPlacement[0];
    const pct = Math.round((top.placements / Math.max(1, hiredCount)) * 100);
    insights.push(`${top.source} generated ${pct}% of all placements.`);
  }
  // Top recruiter by revenue this month
  const recsThisMonth = team
    .filter(t => t.status === 'Active')
    .map(t => {
      const p = perf.find(p => p.team_member_id === t.id && p.month === thisMonthIso);
      return { name: t.full_name, achieved: Number(p?.achieved_revenue || 0), target: Number(p?.target_revenue || 0) };
    })
    .filter(r => r.target > 0)
    .sort((a, b) => (b.achieved / b.target) - (a.achieved / a.target));
  if (recsThisMonth[0]) {
    const top = recsThisMonth[0];
    const pct = Math.round((top.achieved / top.target) * 100);
    if (pct > 100) insights.push(`${top.name} exceeded target by ${pct - 100}% this month.`);
    else if (pct >= 80) insights.push(`${top.name} is at ${pct}% of target this month.`);
  }
  // Top job category by revenue
  const catEntries = Object.entries(revByCategory).sort((a, b) => b[1] - a[1]);
  if (catEntries[0]?.[1] > 0) {
    insights.push(`${catEntries[0][0]} roles generated the highest revenue.`);
  }
  // Funnel conversion
  if ((stageCounts.Applied || 0) > 0 && (stageCounts.Hired || 0) > 0) {
    const pct = Math.round((stageCounts.Hired / stageCounts.Applied) * 100);
    insights.push(`Overall pipeline conversion is ${pct}% from Applied → Hired.`);
  }

  const data: AnalyticsData = {
    exec: {
      totalRevenue, monthlyRevenue, quarterRevenue,
      activeJobs, totalCandidates,
      placementsThisMonth, recruitersActive,
      offerConvPct,
    },
    funnel: stageCounts,
    revByMonth,
    revByRecruiter: recruiterLeaderboard.map(r => ({ name: r.name, revenue: r.revenue })),
    revByClient: Object.entries(revByClient).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue })),
    revByCategory: Object.entries(revByCategory).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue })),
    recruiterLeaderboard,
    sourcePerf,
    trend,
    health: { avgTimeToFill, candToHireRatio, offerAcceptRate, placementSuccessRate, productivityPct },
    insights,
  };

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Analytics</h2>
          <p>Business command center — revenue, pipeline health, recruiter performance, and source ROI in one place.</p>
        </div>
      </div>
      <AnalyticsView data={data} />
    </>
  );
}
