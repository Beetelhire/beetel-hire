import { TopologyCanvas } from '@/components/topology-canvas';
import { ClientFinalCTAs } from '@/components/home-ctas';
import { Ear, Shield, Scale, HandCoins, MessageCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const PROCESS = [
  { num: '01', title: 'Discovery',         text: 'A 90-minute conversation to understand the role, the team, the culture, and the constraints.', badge: '~1 week' },
  { num: '02', title: 'Calibration',       text: 'We send a calibration set — three to five profiles — to confirm we\'ve understood the bar.', badge: '~1 week' },
  { num: '03', title: 'Outreach',          text: 'Targeted, hand-written introductions to a curated list. No mass blasts.', badge: '~2 weeks' },
  { num: '04', title: 'Shortlist',         text: 'A narrative shortlist of five to eight candidates with our honest read on each.', badge: '~1 week' },
  { num: '05', title: 'Interview support', text: 'We prep both sides — candidates on what to expect, hiring managers on what to listen for.', badge: '~2–3 weeks' },
  { num: '06', title: 'Offer & landing',   text: 'We negotiate alongside both sides, then stay involved through the first 90 days.', badge: '90 days' },
];

const VALUES = [
  { icon: <Ear size={16} />,        title: 'Listen first',      text: 'We ask more questions than we answer. Every brief starts with what isn\'t being said yet.' },
  { icon: <Shield size={16} />,     title: 'Protect both sides', text: 'We work for the company and for the candidate. When those two diverge, we say so.' },
  { icon: <Scale size={16} />,      title: 'Stay narrow',       text: 'We say no to roughly a third of engagements we hear about. Volume is the enemy of care.' },
  { icon: <HandCoins size={16} />,  title: 'Charge fairly',     text: 'Flat fees, transparent terms, no surprise invoices. The economics are designed to align us.' },
  { icon: <MessageCircle size={16} />, title: 'Tell the truth', text: 'If a candidate isn\'t right, we\'ll tell you. If the role is wrong, we\'ll tell them.' },
  { icon: <Clock size={16} />,      title: 'Take the long view', text: 'We optimize for relationships that last decades, not deals that close this quarter.' },
];

export default function AboutPage() {
  return (
    <main>
      <section className="about-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <TopologyCanvas id="topoAbout" variant="dim" density={0.65} maxDist={320} />
        <div className="container">
          <span className="t-eyebrow label reveal in"><span className="dot"></span>About us</span>
          <h1 className="t-display reveal in" style={{ marginBottom: 32 }}>
            We believe hiring<br />
            should feel <span className="serif">human.</span>
          </h1>
          <p className="intro reveal in">
            We started Beetel Hire because we saw firsthand how broken hiring had become — too transactional, too noisy, too slow. We&apos;re a small team building the modern alternative: thoughtful, technology-led recruitment for India&apos;s most ambitious companies.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-sm">
        <div className="container">
          <div className="about-preview">
            <div className="right reveal in">
              <div className="img">
                <img className="photo" alt="Beetel Hire team at work" src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&h=1250&auto=format&fit=crop&q=85" />
              </div>
            </div>
            <div className="left">
              <span className="t-eyebrow reveal in"><span className="dot"></span>Our story</span>
              <h2 className="t-h2 title reveal in" style={{ margin: '16px 0 24px' }}>
                A new chapter for<br /><span className="serif">how India hires.</span>
              </h2>
              <p className="t-lead reveal in" style={{ marginBottom: 20 }}>
                Beetel Hire began with a simple observation: most hiring still happens on platforms that optimize for volume, not fit. We&apos;re building something different — a thoughtful, technology-led practice that pairs careful human judgement with the modern tools the industry has been missing.
              </p>
              <p className="t-body reveal in">
                We&apos;re independent, ambitious, and intentionally small. We&apos;ve grown only through the people we placed — and we plan to keep it that way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle brand divider */}
      <div className="brand-divider" aria-hidden="true">
        <img src="/beetel-hire-logo.svg" alt="" />
      </div>

      {/* Mission */}
      <section className="section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card reveal in">
              <span className="t-eyebrow label"><span className="dot"></span>Mission</span>
              <h3>To make the most consequential decision in someone&apos;s career — <span className="serif">feel less consequential.</span></h3>
              <p>The right job at the right time changes a life. We treat it that way, on both sides of the table.</p>
            </div>
            <div className="mission-card reveal in">
              <span className="t-eyebrow label"><span className="dot"></span>Vision</span>
              <h3>A world where talent doesn&apos;t have to <span className="serif">shout</span> to be heard.</h3>
              <p>The best people are usually the quietest about it. We&apos;ve built the practice around finding them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>Our process</span>
              <h2 className="t-h1 title">Six steps. No surprises.</h2>
            </div>
          </div>
          <div className="process-steps">
            {PROCESS.map(p => (
              <div className="process-step reveal in" key={p.num}>
                <div className="num">{p.num}</div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
                <div className="badge">{p.badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section">
        <div className="container">
          <div className="founder-section">
            <div className="founder-portrait reveal in">
              <img alt="Deepa M, Co-founder & CEO" src="/deepa-m.jpg" />
            </div>
            <div className="reveal in">
              <span className="t-eyebrow label"><span className="dot"></span>A note from the founders</span>
              <h2>&ldquo;The best hires of our careers <span className="serif">never applied.</span>&rdquo;</h2>
              <p className="t-body" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: '54ch' }}>
                We started Beetel Hire because we&apos;d watched the recruiting industry tilt entirely toward volume — outreach blasts, automated workflows, and metrics that measured everything except the thing that actually matters: did the right person end up in the right job.
              </p>
              <blockquote>
                We&apos;re building something that feels different. Quieter. More curated. The kind of practice you&apos;d recommend to a friend without caveats — and that&apos;s the only metric we care about.
              </blockquote>

              {/* Co-founder signatures */}
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 28 }}>
                <div className="sig" style={{ marginTop: 0 }}>
                  <img
                    src="/deepa-m.jpg"
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <div>
                    <div className="sig-name">Deepa M</div>
                    <div className="sig-role">Co-founder &amp; CEO, Beetel Hire</div>
                  </div>
                </div>

                <div className="sig" style={{ marginTop: 0 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 16, letterSpacing: '0.02em',
                    }}
                  >RG</div>
                  <div>
                    <div className="sig-name">Rohit G</div>
                    <div className="sig-role">Co-founder, Beetel Hire</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="left">
              <span className="t-eyebrow label"><span className="dot"></span>Our values</span>
              <h2 className="t-h1 title">Six things we won&apos;t compromise.</h2>
            </div>
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div className="value reveal in" key={v.title}>
                <div className="icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="container">
          <h2 className="title">Let&apos;s talk about the<br />team you&apos;re <span className="serif">building.</span></h2>
          <ClientFinalCTAs />
        </div>
      </section>
    </main>
  );
}
