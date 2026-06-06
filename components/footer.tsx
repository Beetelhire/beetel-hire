'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TopologyCanvas } from './topology-canvas';

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
              <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light lg" />
              <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark lg" />
            </Link>
            <p className="foot-blurb">Recruitment technology infrastructure — where exceptional talent meets the companies building what&apos;s next.</p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/industries">Industries</Link></li>
              <li><Link href="/jobs">Jobs</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5>Account</h5>
            <ul>
              <li><Link href="/sign-in">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className="foot-mega" aria-hidden="true">
          <span className="foot-mega-pri">Beetel</span><span className="foot-mega-sec">Hire</span><span className="foot-mega-dot">.</span>
        </div>

        <div className="foot-bottom">
          <div>© {new Date().getFullYear()} Beetel Hire Technologies, Inc. — Connecting talent and opportunity across India.</div>
        </div>
      </div>
    </footer>
  );
}
