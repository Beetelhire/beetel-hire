'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TopologyCanvas } from './topology-canvas';
import { Linkedin, Twitter, Github } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/admin')) return null;

  return (
    <footer>
      <TopologyCanvas variant="full dim" density={0.9} signals={4} maxDist={300} />
      <div className="footer-edge" aria-hidden="true"></div>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link className="brand" href="/" aria-label="Beetel Hire">
              <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light md" />
              <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark md" />
            </Link>
            <p className="foot-blurb">Recruitment technology infrastructure — where exceptional talent meets the companies building what&apos;s next.</p>
          </div>
          <div>
            <h5>Product</h5>
            <ul>
              <li><Link href="/jobs">Browse jobs</Link></li>
              <li><Link href="/sign-in">Sign in</Link></li>
              <li><Link href="/admin">For employers</Link></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/industries">Industries</Link></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><a href="#">Field notes</a></li>
              <li><a href="#">Salary reports</a></li>
              <li><a href="#">Interview library</a></li>
              <li><a href="#">Help center</a></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-mega" aria-hidden="true">
          <span className="foot-mega-pri">Beetel</span><span className="foot-mega-sec">Hire</span><span className="foot-mega-dot">.</span>
        </div>

        <div className="foot-bottom">
          <div>© {new Date().getFullYear()} Beetel Hire Technologies, Inc. — Connecting talent and opportunity worldwide.</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <a href="#"><Linkedin size={16} /></a>
            <a href="#"><Twitter size={16} /></a>
            <a href="#"><Github size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
