import Link from 'next/link';
import { TopologyCanvas } from '@/components/topology-canvas';
import { createSupabaseServer } from '@/lib/supabase-server';
import { JobRow } from '@/components/job-row';
import { HeroEyebrow } from '@/components/hero-eyebrow';
import { ClientHeroCTAs, ClientFinalCTAs } from '@/components/home-ctas';
import {
  ArrowRight, Users, Compass, Crown, Layers,
  Code2, Landmark, HeartPulse, Factory, HardHat, RadioTower, ShoppingBag, Leaf,
  UserPlus, GitMerge, MessagesSquare, Award, Clock, Zap, Calendar, TrendingUp, ArrowUpRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createSupabaseServer();
  const { data: liveJobs } = await supabase
    .from('jobs')
    .select('id, title, client_company, loc, type, experience, exp_level, fn, pay, pay_note, tags, status, posted_at, posted_platforms')
    .eq('status', 'live')
    .order('posted_at', { ascending: false })
    .limit(5);

  const jobs = liveJobs || [];

  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="bg-grid"></div>
        <TopologyCanvas id="topoHero" />
        <div className="hero-edge-glow" aria-hidden="true" />
        <div className="container">
          <HeroEyebrow />
          <h1 className="t-display hero-headline reveal in">
            Technology<br />
            meets <span className="hero-headline-accent">talent.</span>
          </h1>
          <p className="t-lead hero-sub reveal in">
            Beetel Hire is a new-generation recruitment platform connecting ambitious people with the companies building what&apos;s next — engineered for signal over noise.
          </p>
          <ClientHeroCTAs />
          <div className="hero-tertiary reveal in">
            <span className="pulse-dot" style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#4ade80', marginRight:8, verticalAlign:'middle' }} />
            Hiring? Book a 20-minute intro — we&apos;ll let you know within a week whether we&apos;re the right partner.
          </div>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="section">
        <div className="container">
          <div className="about-preview">
            <div className="left">
              <span className="t-eyebrow reveal in"><span className="dot"></span>About Beetel Hire</span>
              <h2 className="t-h1 title reveal in">
                A new approach to<br />
                <span className="serif">how India hires.</span>
              </h2>
              <p className="t-lead reveal in">
                We&apos;re a young team of recruiters, engineers, and designers building Beetel Hire as the modern alternative to traditional recruitment — pairing thoughtful curation with the right technology so the best people meet the right companies, faster.
              </p>
              <p className="t-body reveal in" style={{ marginTop: 20 }}>
                Hiring shouldn&apos;t feel like a transaction. We&apos;re here to fix that — one careful introduction at a time.
              </p>
            </div>
            <div className="right reveal in">
              <div className="img">
                <img className="photo" alt="A modern team working together" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&h=1250&auto=format&fit=crop&q=85" />
                <div className="img-caption">
                  <span className="dot pulse-dot"></span>
                  <div>
                    <div style={{ fontWeight: 500 }}>Live · hiring now</div>
                    <div style={{ color: 'var(--fg-subtle)', fontSize: 11, marginTop: 2 }}>Across 8 industries in India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES (What we do) ===== */}
      <section className="section services-section">
        <div className="container">
          <div className="section-head section-head-compact">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>What we do</span>
              <h2 className="t-h2 title">Four practices.<br />One careful approach.</h2>
            </div>
            <p className="t-body" style={{ maxWidth: '32ch' }}>
              Every engagement starts with listening — to your team, to the candidate, to what isn&apos;t being said yet.
            </p>
          </div>

          <div className="services-grid-v3">
            <ServiceCard num="01 — Talent Acquisition"   title="End-to-end search"    text="We embed with your team, learn your bar, and bring you a curated shortlist — not a flood of resumes." visual={<TalentVisual />} />
            <ServiceCard num="02 — Recruitment Consulting" title="Hiring strategy"     text="Comp benchmarking, interview design, and process audits — for founders building the muscle in-house." visual={<ConsultVisual />} />
            <ServiceCard num="03 — Executive Hiring"     title="C-suite & board search" text="Discreet, deeply researched search for leadership roles. Most placements come through warm introductions." visual={<ExecVisual />} />
            <ServiceCard num="04 — Staffing Solutions"   title="Fractional & contract" text="Vetted contract and fractional talent for short-cycle projects — briefed and ready to ship within days." visual={<StaffVisual />} />
          </div>
        </div>
      </section>

      {/* ===== INDUSTRIES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>Industries we hire for</span>
              <h2 className="t-h1 title">Talent for every<br />kind of company.</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:18, maxWidth:'34ch' }}>
              <p className="t-body">From early-stage product teams to established enterprises — we partner with companies building across India&apos;s most consequential sectors.</p>
              <Link className="btn btn-secondary btn-sm" href="/industries">All industries <ArrowRight size={13} /></Link>
            </div>
          </div>

          <div className="industries-grid-v2">
            <IndustryCard icon={<Code2 />}      title="Information Technology"      text="Software engineering, data, security, and IT services for product startups to enterprise tech." />
            <IndustryCard icon={<Landmark />}   title="Banking & Financial Services" text="BFSI, fintech, insurance, capital markets, lending, and modern wealth platforms." />
            <IndustryCard icon={<HeartPulse />} title="Healthcare & Pharma"          text="Clinical, R&D, regulatory, and commercial roles across hospitals, biotech, and pharma." />
            <IndustryCard icon={<Factory />}    title="Manufacturing"                text="Plant leadership, operations, supply chain, and engineering across heavy and light industry." />
            <IndustryCard icon={<HardHat />}    title="Engineering & Construction"   text="Civil, mechanical, EPC, infrastructure, and large-scale project leadership." />
            <IndustryCard icon={<RadioTower />} title="Telecom & Networks"           text="5G, network engineering, telecom infrastructure, and connectivity-platform roles." />
            <IndustryCard icon={<ShoppingBag />}title="Retail & Consumer"            text="D2C, FMCG, omnichannel retail, category leadership, and consumer-tech roles." />
            <IndustryCard icon={<Leaf />}       title="Energy & Sustainability"      text="Renewables, climate-tech, EV, and the modern grid — engineering and commercial roles." />
          </div>
        </div>
      </section>

      {/* ===== FEATURED JOBS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>Live opportunities</span>
              <h2 className="t-h1 title">Open roles this week.</h2>
            </div>
            <Link className="btn btn-secondary" href="/jobs">View all open roles <ArrowRight size={14} /></Link>
          </div>

          <div className="jobs-list" id="featuredJobs">
            {jobs.length === 0 ? (
              <div className="empty" style={{ marginTop: 24 }}>
                <h4>No live roles yet</h4>
                <p>Add jobs from the admin panel to see them here.</p>
              </div>
            ) : jobs.map(j => <JobRow key={j.id} job={j as any} />)}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS — 4 STEPS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>For candidates</span>
              <h2 className="t-h1 title">Four steps. Zero noise.</h2>
            </div>
          </div>
          <div className="flow-v2">
            <div className="flow-line" aria-hidden="true"><div className="flow-line-progress"></div></div>

            <FlowStep num="01" icon={<UserPlus />}        title="Create profile"     text="Tell us what you've built and what you're looking for. Five minutes — no recruiters spamming you afterward." metaIcon={<Clock size={11} />} meta="~5 min" />
            <FlowStep num="02" icon={<GitMerge />}        title="Apply or get matched" text="Apply to roles directly, or let us quietly surface introductions when something feels right." metaIcon={<Zap size={11} />} meta="within a week" />
            <FlowStep num="03" icon={<MessagesSquare />}  title="Interview with context" text="You'll always know what's coming, who you're meeting, and how decisions get made. Always." metaIcon={<Calendar size={11} />} meta="2–4 rounds" />
            <FlowStep num="04" icon={<Award />}           title="Land the offer"     text="We negotiate alongside you — comp, equity, scope — so the offer reflects the work, not the bargaining." metaIcon={<TrendingUp size={11} />} meta="offer in hand" />
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>What people say</span>
              <h2 className="t-h1 title">Quiet results,<br />loud word of mouth.</h2>
            </div>
          </div>

          <div className="testimonials">
            <div className="quote featured">
              <p>
                &ldquo;Working with Beetel Hire felt like having a thoughtful friend in the room — one who actually knew the market, listened to what we needed, and protected the bar even when we were tempted to bend it. <span className="serif">It changed how I think about building teams.</span>&rdquo;
              </p>
              <div className="by">
                <img className="avatar" alt="" src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=160&h=160&auto=format&fit=crop&q=80" />
                <div>
                  <div className="who">Lena Okafor</div>
                  <div className="role">VP Engineering, Halo Labs</div>
                </div>
              </div>
            </div>

            <div className="quote">
              <p>&ldquo;Best recruiter experience I&apos;ve had. They told me when a role wasn&apos;t right — which is the highest compliment I can give.&rdquo;</p>
              <div className="by">
                <img className="avatar" alt="" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&auto=format&fit=crop&q=80" />
                <div>
                  <div className="who">Mateo Reyes</div>
                  <div className="role">Staff Engineer</div>
                </div>
              </div>
            </div>

            <div className="quote">
              <p>&ldquo;They helped us fill three hard-to-find product roles in six weeks. Every one of them is still with us — and thriving.&rdquo;</p>
              <div className="by">
                <img className="avatar" alt="" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&auto=format&fit=crop&q=80" />
                <div>
                  <div className="who">Priya Anand</div>
                  <div className="role">Co-founder, Northwall</div>
                </div>
              </div>
            </div>

            <div className="quote">
              <p>&ldquo;The shortlist Beetel Hire sent us was so tight we hired the first person we met. Twice in a row.&rdquo;</p>
              <div className="by">
                <img className="avatar" alt="" src="https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?w=160&h=160&auto=format&fit=crop&q=80" />
                <div>
                  <div className="who">David Chen</div>
                  <div className="role">CEO, Otto</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="final-cta">
        <div className="bg-orbs">
          <div className="orb orb-1" style={{ opacity: .7, top: -100 }} />
          <div className="orb orb-2" style={{ opacity: .7 }} />
        </div>
        <TopologyCanvas id="topoCta" variant="dim" density={0.7} maxDist={320} />
        <div className="container">
          <h2 className="title">
            Looking to hire,<br />
            or <span className="serif">get hired?</span>
          </h2>
          <p className="t-lead" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            Start with a 20-minute conversation. We&apos;ll let you know within a week whether we&apos;re the right partner.
          </p>
          <ClientFinalCTAs />
        </div>
      </section>
    </main>
  );
}

/* ===== Small inline subcomponents ===== */

function ServiceCard({ num, title, text, visual }: { num: string; title: string; text: string; visual: React.ReactNode }) {
  return (
    <div className="service-card-h">
      <div className="service-visual-h">{visual}</div>
      <div className="service-body-h">
        <div className="service-num">{num}</div>
        <h3>{title}</h3>
        <p>{text}</p>
        <a className="service-link">Learn more <ArrowRight size={13} /></a>
      </div>
    </div>
  );
}

function IndustryCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link className="industry-card reveal in" href="/industries">
      <div className="industry-bg-pattern"></div>
      <div className="industry-top">
        <div className="industry-icon-tile">{icon}</div>
        <span className="industry-status"><span className="ddot"></span>Live</span>
      </div>
      <h4>{title}</h4>
      <p>{text}</p>
      <span className="industry-link">Explore roles <ArrowUpRight size={14} /></span>
    </Link>
  );
}

function FlowStep({ num, icon, title, text, metaIcon, meta }: { num: string; icon: React.ReactNode; title: string; text: string; metaIcon: React.ReactNode; meta: string }) {
  return (
    <div className="flow-step-v2">
      <div className="flow-step-card">
        <div className="flow-step-head">
          <div className="flow-step-icon">{icon}</div>
          <div className="flow-step-num">{num}</div>
        </div>
        <h4>{title}</h4>
        <p>{text}</p>
        <div className="flow-step-meta">{metaIcon} {meta}</div>
      </div>
    </div>
  );
}

/* ===== Service mini-illustrations ===== */

function TalentVisual() {
  return (
    <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="svcMatch1" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#3E42FB" stopOpacity=".3" />
          <stop offset="1" stopColor="#3E42FB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g opacity=".35">
        <line x1="30" y1="40"  x2="140" y2="90" stroke="#3E42FB" />
        <line x1="30" y1="90"  x2="140" y2="90" stroke="#3E42FB" />
        <line x1="30" y1="140" x2="140" y2="90" stroke="#3E42FB" />
      </g>
      <circle cx="30" cy="40"  r="5" fill="#3E42FB" className="svc-pulse" style={{ ['--d' as any]: '0s' }} />
      <circle cx="30" cy="90"  r="5" fill="#3E42FB" className="svc-pulse" style={{ ['--d' as any]: '.3s' }} />
      <circle cx="30" cy="140" r="5" fill="#3E42FB" className="svc-pulse" style={{ ['--d' as any]: '.6s' }} />
      <circle cx="140" cy="90" r="22" fill="url(#svcMatch1)" />
      <circle cx="140" cy="90" r="13" fill="white" stroke="#3E42FB" strokeWidth="1.5" />
      <circle cx="140" cy="90" r="4"  fill="#3E42FB" />
    </svg>
  );
}

function ConsultVisual() {
  return (
    <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="svcBarG" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3E42FB" stopOpacity="1" />
          <stop offset="1" stopColor="#5A2EFF" stopOpacity=".4" />
        </linearGradient>
      </defs>
      <g stroke="rgba(63,99,244,.12)" strokeWidth="1">
        <line x1="20" x2="160" y1="50"  y2="50" />
        <line x1="20" x2="160" y1="100" y2="100" />
        <line x1="20" x2="160" y1="150" y2="150" />
      </g>
      <g className="svc-bars">
        <rect x="32"  y="110" width="20" height="50"  rx="3" fill="url(#svcBarG)" className="bar" style={{ ['--d' as any]: '0s' }} />
        <rect x="62"  y="90"  width="20" height="70"  rx="3" fill="url(#svcBarG)" className="bar" style={{ ['--d' as any]: '.15s' }} />
        <rect x="92"  y="60"  width="20" height="100" rx="3" fill="url(#svcBarG)" className="bar" style={{ ['--d' as any]: '.3s' }} />
        <rect x="122" y="35"  width="20" height="125" rx="3" fill="url(#svcBarG)" className="bar" style={{ ['--d' as any]: '.45s' }} />
      </g>
      <path d="M42,110 L72,90 L102,60 L132,35" stroke="#5A2EFF" strokeWidth="1.4" fill="none" strokeDasharray="2 3" opacity=".55" />
    </svg>
  );
}

function ExecVisual() {
  return (
    <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="execGlow2" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#5A2EFF" stopOpacity=".5" />
          <stop offset="1" stopColor="#5A2EFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="execTile2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3E42FB" />
          <stop offset="1" stopColor="#5A2EFF" />
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="78" fill="url(#execGlow2)" />
      <circle cx="90" cy="90" r="68" fill="none" stroke="#3E42FB" strokeWidth="1" strokeDasharray="3 5" opacity=".4" className="exec-ring2" />
      <circle cx="90" cy="90" r="46" fill="none" stroke="#3E42FB" strokeWidth="1" opacity=".22" />
      <rect x="62" y="62" width="56" height="56" rx="13" fill="url(#execTile2)" />
      <g stroke="rgba(255,255,255,.5)" strokeWidth="1" fill="white">
        <line x1="72" y1="74"  x2="108" y2="74"  opacity=".5" />
        <line x1="72" y1="106" x2="108" y2="106" opacity=".5" />
        <line x1="90" y1="74"  x2="90"  y2="106" opacity=".5" />
        <circle cx="72"  cy="74"  r="2.5" />
        <circle cx="108" cy="74"  r="2.5" />
        <circle cx="90"  cy="90"  r="3.2" />
        <circle cx="72"  cy="106" r="2.5" />
        <circle cx="108" cy="106" r="2.5" />
      </g>
      <circle cx="20"  cy="30"  r="3" fill="#3E42FB" opacity=".7" />
      <circle cx="160" cy="30"  r="3" fill="#3E42FB" opacity=".7" />
      <circle cx="20"  cy="150" r="3" fill="#3E42FB" opacity=".7" />
      <circle cx="160" cy="150" r="3" fill="#3E42FB" opacity=".7" />
    </svg>
  );
}

function StaffVisual() {
  return (
    <svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="stackAv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3E42FB" />
          <stop offset="1" stopColor="#5A2EFF" />
        </linearGradient>
      </defs>
      <g className="stack-card" style={{ ['--d' as any]: '0s' }}>
        <rect x="40" y="36" width="110" height="32" rx="8" fill="white" stroke="rgba(63,99,244,.2)" strokeWidth="1" opacity=".35" />
      </g>
      <g className="stack-card" style={{ ['--d' as any]: '.15s' }}>
        <rect x="32" y="58" width="110" height="32" rx="8" fill="white" stroke="rgba(63,99,244,.3)" strokeWidth="1" opacity=".6" />
      </g>
      <g className="stack-card" style={{ ['--d' as any]: '.3s' }}>
        <rect x="24" y="84" width="132" height="40" rx="9" fill="white" stroke="rgba(63,99,244,.5)" strokeWidth="1.2" />
        <circle cx="42" cy="104" r="10" fill="url(#stackAv)" />
        <rect x="58" y="96"  width="56" height="5" rx="2.5" fill="rgba(14,16,20,.5)" />
        <rect x="58" y="106" width="36" height="4" rx="2"   fill="rgba(14,16,20,.25)" />
        <circle cx="142" cy="104" r="3" fill="#4ade80" />
      </g>
    </svg>
  );
}
