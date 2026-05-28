import Link from 'next/link';
import { TopologyCanvas } from '@/components/topology-canvas';
import { ClientFinalCTAs } from '@/components/home-ctas';
import { Code2, Landmark, HeartPulse, Factory, HardHat, RadioTower, ShoppingBag, Leaf, Search, Users, ShieldCheck, TrendingUp, ArrowUpRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const INDUSTRIES = [
  { id: 'it',      name: 'Information Technology',  sub: 'Engineering · Data · Security · Platform',  icon: <Code2 />,       img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'Software engineering, data, security, DevOps, and platform roles across India\'s product startups and enterprise tech.', roles: ['Staff Engineer','Eng. Manager','CTO','Platform Lead','Data Engineer','Security'] },
  { id: 'bfsi',    name: 'Banking & Financial Services', sub: 'BFSI · Fintech · Insurance · Capital Markets', icon: <Landmark />, img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'BFSI, fintech, insurance, capital markets, lending platforms, and modern wealth tech.', roles: ['Risk Manager','Fintech PM','Credit Analyst','Compliance','Investment Banking'] },
  { id: 'health',  name: 'Healthcare & Pharma',     sub: 'Clinical · R&D · Regulatory · Commercial',  icon: <HeartPulse />,  img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'Clinical, R&D, regulatory, and commercial roles across hospitals, biotech, and pharma manufacturing.', roles: ['Clinical Lead','Regulatory Affairs','Medical Director','R&D Scientist','Pharma Sales'] },
  { id: 'mfg',     name: 'Manufacturing',           sub: 'Plant · Operations · Supply Chain · Engineering', icon: <Factory />, img: 'https://images.unsplash.com/photo-1565891741441-64926e441838?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'Plant leadership, operations, supply chain, and engineering across heavy and light manufacturing.', roles: ['Plant Manager','Production Eng.','QA Lead','Supply Chain','Ops Director'] },
  { id: 'eng',     name: 'Engineering & Construction', sub: 'Civil · Mechanical · EPC · Infrastructure', icon: <HardHat />, img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'Civil, mechanical, EPC, infrastructure, and large-scale project leadership.', roles: ['Project Manager','Civil Engineer','EPC Lead','Site Director','Structural'] },
  { id: 'telecom', name: 'Telecom & Networks',      sub: '5G · Network · Telecom · Connectivity',     icon: <RadioTower />,  img: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=675&auto=format&fit=crop&q=85', desc: '5G, network engineering, telecom infrastructure, and connectivity-platform roles.', roles: ['Network Engineer','RF Engineer','5G Specialist','Solutions Architect','Telecom PM'] },
  { id: 'retail',  name: 'Retail & Consumer',       sub: 'D2C · FMCG · Retail · Consumer Tech',       icon: <ShoppingBag />, img: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'D2C brands, FMCG, omnichannel retail, category leadership, and consumer-tech roles.', roles: ['Category Manager','Brand Lead','Retail Head','E-commerce','Consumer Insights'] },
  { id: 'energy',  name: 'Energy & Sustainability', sub: 'Renewables · EV · Grid · Climate-tech',     icon: <Leaf />,        img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=675&auto=format&fit=crop&q=85', desc: 'Renewables, climate-tech, EV, and the modern grid — engineering and commercial.', roles: ['Clean Energy Eng.','EV Lead','Sustainability Dir.','Grid Engineer','Climate-tech'] },
];

const APPROACH = [
  { icon: <Search size={18} />,        title: 'Sector-aware sourcing', text: 'Every practice has a dedicated partner who knows the talent landscape — who\'s moving, who\'s hiring, who\'s about to.' },
  { icon: <Users size={18} />,         title: 'Narrative shortlists',  text: 'Three to eight candidates per role, each with our honest read on fit, gaps, motivation, and comp.' },
  { icon: <ShieldCheck size={18} />,   title: 'Bar-protected interviews', text: 'We prep both sides — candidates on what to expect, hiring managers on what to listen for.' },
  { icon: <TrendingUp size={18} />,    title: 'Lands that last',       text: 'We stay close through the first 90 days. A placement isn\'t a win until the person is thriving.' },
];

export default function IndustriesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="industries-hero" style={{ position:'relative', overflow:'hidden', padding:'160px 0 80px' }}>
        <TopologyCanvas id="topoIndustries" variant="dim" density={0.7} maxDist={300} />
        <div className="container">
          <span className="t-eyebrow label reveal in"><span className="dot"></span>Industries</span>
          <h1 className="t-display reveal in" style={{ margin:'24px 0 32px', maxWidth:'18ch' }}>
            Talent across<br />
            every <span className="serif">sector</span> that matters.
          </h1>
          <p className="intro reveal in" style={{ fontSize:'clamp(17px,1.5vw,21px)', lineHeight:1.5, color:'var(--fg-muted)', maxWidth:'60ch' }}>
            We partner with companies building across India&apos;s most consequential industries — from early-stage product teams to established enterprises.
          </p>
          <div className="industry-stat-row reveal in">
            <div className="ind-stat"><div className="n">8</div><div className="l">Focus sectors</div></div>
            <div className="ind-stat"><div className="n">India-wide</div><div className="l">Hiring footprint</div></div>
            <div className="ind-stat"><div className="n">Live</div><div className="l">Now interviewing</div></div>
          </div>
        </div>
      </section>

      {/* Industry directory */}
      <section className="section-sm">
        <div className="container">
          <div className="section-head" style={{ marginBottom: 48 }}>
            <div className="left">
              <span className="t-eyebrow label reveal in"><span className="dot"></span>Where we hire</span>
              <h2 className="t-h2 title reveal in">Eight industries.<br />One careful approach.</h2>
            </div>
            <p className="t-body reveal in" style={{ maxWidth: '34ch' }}>
              Each industry has its own bar, its own talent map, and its own rhythm. We work the same way across all of them — quietly, carefully, with senior partners on every search.
            </p>
          </div>

          <div className="industries-page-grid">
            {INDUSTRIES.map(ind => (
              <Link className="ind-card reveal in" key={ind.id} href="/jobs">
                <div className="ind-card-media">
                  <div className="ind-card-media-img">
                    <img src={ind.img} alt={ind.name} loading="lazy" />
                    <span className="live-pill"><span className="ddot"></span>Live</span>
                  </div>
                  <div className="ind-card-icon">{ind.icon}</div>
                </div>
                <div className="ind-card-body">
                  <h3>{ind.name}</h3>
                  <div className="ind-sub">{ind.sub}</div>
                  <p>{ind.desc}</p>
                  <div className="ind-roles">
                    {ind.roles.map(r => <span className="ind-role-chip" key={r}>{r}</span>)}
                  </div>
                  <div className="ind-card-foot">
                    <div className="meta">View open roles</div>
                    <span className="ind-link">Explore <ArrowUpRight size={14} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section-sm" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label reveal in"><span className="dot"></span>How we work</span>
              <h2 className="t-h2 title reveal in">A consistent approach,<br />tuned for each sector.</h2>
            </div>
          </div>
          <div className="approach-grid">
            {APPROACH.map(a => (
              <div className="approach-card reveal in" key={a.title}>
                <div className="approach-icon">{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta" style={{ padding: '100px 0', borderTop: '1px solid var(--border)' }}>
        <div className="bg-orbs"><div className="orb orb-1" style={{ opacity:.5, top:-100 }} /><div className="orb orb-2" style={{ opacity:.5 }} /></div>
        <TopologyCanvas id="topoIndustriesCta" variant="dim" density={0.55} maxDist={320} />
        <div className="container">
          <span className="t-eyebrow label" style={{ display:'inline-flex', marginBottom: 24 }}><span className="dot"></span>Don&apos;t see your sector?</span>
          <h2 className="title" style={{ fontSize:'clamp(36px,5vw,68px)', lineHeight:1.05, marginBottom:24 }}>
            Hiring outside these eight?<br />
            <span className="serif">Talk to us anyway.</span>
          </h2>
          <p className="t-lead" style={{ margin:'0 auto 40px', textAlign:'center', maxWidth:'56ch' }}>
            We take on roles outside our core practices when the brief excites us. Tell us what you&apos;re building — we&apos;ll let you know honestly whether we&apos;re the right partner.
          </p>
          <ClientFinalCTAs />
        </div>
      </section>
    </main>
  );
}
