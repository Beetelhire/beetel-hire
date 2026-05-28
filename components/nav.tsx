'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './providers';
import { Calendar, Menu, Moon, Sun } from 'lucide-react';
import { useBookCall } from './book-call-modal';
import { useMobileMenu } from './mobile-menu';

export function TopBar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { open: openBookCall } = useBookCall();
  const { open: openMobileMenu } = useMobileMenu();
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.matchMedia('(max-width: 880px)').matches) return;
      setShrink(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide on app-like pages (sign-in, admin) — those have their own shell
  const hide = pathname.startsWith('/sign-in') || pathname.startsWith('/admin');
  if (hide) return null;

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <div
      className="nav-wrap"
      id="topnav"
      style={shrink ? { top: 12, maxWidth: 1000 } : { top: 18, maxWidth: 1180 }}
    >
      <nav className="nav">
        <Link className="brand" href="/" aria-label="Beetel Hire — home">
          <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light" />
          <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark" />
        </Link>
        <div className="nav-links">
          <Link className={`nav-link${isActive('/') ? ' active' : ''}`} href="/">Home</Link>
          <Link className={`nav-link${isActive('/about') ? ' active' : ''}`} href="/about">About</Link>
          <Link className={`nav-link${isActive('/industries') ? ' active' : ''}`} href="/industries">Industries</Link>
          <Link className={`nav-link${isActive('/jobs') ? ' active' : ''}`} href="/jobs">Jobs</Link>
        </div>
        <div className="nav-cta">
          <button className="btn btn-icon theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link className="btn btn-secondary btn-sm nav-signin" href="/sign-in">Sign in</Link>
          <button className="btn btn-primary btn-sm nav-book" onClick={openBookCall}>
            <Calendar size={13} /> Book a call
          </button>
          <button className="btn btn-icon nav-mobile-toggle" onClick={openMobileMenu} aria-label="Open menu">
            <Menu size={14} />
          </button>
        </div>
      </nav>
    </div>
  );
}
