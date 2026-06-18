// Public Contact Us page.
// Renders company info + a contact form. Form posts to /api/contact.
// Company info constants are defined here — edit COMPANY_INFO below to update.

import { TopologyCanvas } from '@/components/topology-canvas';
import { ContactForm } from '@/components/contact-form';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

// ── Edit these values to update the Contact page ─────────────
const COMPANY_INFO = {
  name: 'Beetel Hire',
  email: 'contact@beetelhire.in',
  phone: '+91 81230 63196',
  address: `No.78/2A, 2nd Floor, 4th Shop
Munipapaiah Layout, 2nd Phase, 2nd Block
Arekere, HIMB Post, BDA 80 Feet Road
Bangalore – 560076`,
  hours: 'Monday – Friday · 10:00 AM – 7:00 PM IST',
};

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="about-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <TopologyCanvas id="topoContact" variant="dim" density={0.65} maxDist={320} />
        <div className="container">
          <span className="t-eyebrow label reveal in"><span className="dot"></span>Contact</span>
          <h1 className="t-display reveal in" style={{ marginBottom: 32 }}>
            Let&apos;s talk about<br />
            who you&apos;re <span className="serif">hiring.</span>
          </h1>
          <p className="intro reveal in">
            Whether you&apos;re a company exploring a senior hire, a candidate looking for your next role, or a partner who wants to work with us — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Info + form */}
      <section className="section-sm">
        <div className="container">
          <div className="contact-grid">
            {/* Company info */}
            <aside className="contact-info">
              <h3 style={{ marginBottom: 18 }}>Reach us directly</h3>

              <div className="contact-item">
                <div className="contact-ico"><Mail size={16} /></div>
                <div>
                  <div className="contact-label">Email</div>
                  <a className="contact-value" href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-ico"><Phone size={16} /></div>
                <div>
                  <div className="contact-label">Phone</div>
                  <a className="contact-value" href={`tel:${COMPANY_INFO.phone.replace(/\s+/g, '')}`}>{COMPANY_INFO.phone}</a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-ico"><MapPin size={16} /></div>
                <div>
                  <div className="contact-label">Address</div>
                  <div className="contact-value">{COMPANY_INFO.address}</div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-ico"><Clock size={16} /></div>
                <div>
                  <div className="contact-label">Working hours</div>
                  <div className="contact-value">{COMPANY_INFO.hours}</div>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="contact-form-wrap">
              <h3 style={{ marginBottom: 6 }}>Send us an inquiry</h3>
              <p className="contact-sub">We&apos;ll get back within one business day.</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
