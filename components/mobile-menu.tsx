'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { X, ArrowUpRight, User, Calendar } from 'lucide-react';
import { useBookCall } from './book-call-modal';

type Ctx = { open: () => void; close: () => void };
const Cx = createContext<Ctx>({ open: () => {}, close: () => {} });
export const useMobileMenu = () => useContext(Cx);

export function MobileMenu({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { open: openBookCall } = useBookCall();

  const open  = useCallback(() => { setIsOpen(true);  document.body.style.overflow = 'hidden'; }, []);
  const close = useCallback(() => { setIsOpen(false); document.body.style.overflow = '';     }, []);

  useEffect(() => {
    const onResize = () => { if (!window.matchMedia('(max-width: 880px)').matches) close(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [close]);

  return (
    <Cx.Provider value={{ open, close }}>
      {children}
      <div className={`mobile-menu${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
        <div className="mobile-menu-head">
          <Link className="brand" href="/" onClick={close} aria-label="Beetel Hire — home">
            <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light sm" />
            <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark sm" />
          </Link>
          <button className="btn btn-icon mobile-menu-close" onClick={close} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <div className="mobile-menu-links">
          <Link href="/"           onClick={close}><span className="num">01</span><span>Home</span><ArrowUpRight size={18} /></Link>
          <Link href="/about"      onClick={close}><span className="num">02</span><span>About</span><ArrowUpRight size={18} /></Link>
          <Link href="/industries" onClick={close}><span className="num">03</span><span>Industries</span><ArrowUpRight size={18} /></Link>
          <Link href="/jobs"       onClick={close}><span className="num">04</span><span>Jobs</span><ArrowUpRight size={18} /></Link>
        </div>
        <div className="mobile-menu-foot">
          <Link className="btn btn-secondary" href="/sign-in" onClick={close}>
            <User size={14} /> Sign in
          </Link>
          <button className="btn btn-glow" onClick={() => { close(); openBookCall(); }}>
            <Calendar size={14} /> Book a call
          </button>
        </div>
      </div>
    </Cx.Provider>
  );
}
