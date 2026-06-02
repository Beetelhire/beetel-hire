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
  phone: '+91 80 4567 8910',
  address: 'Beetel Hire, Bangalore, Karnataka 560001, India',
  hours: 'Monday – Friday · 10:00 AM – 7:00 PM IST',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62208.8!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1700000000000',
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

              <div className="contact-map" aria-label="Map">
                <iframe
                  src={COMPANY_INFO.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Beetel Hire location"
                />
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
