'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Calendar } from 'lucide-react';
import { useBookCall } from './book-call-modal';

export function ClientHeroCTAs() {
  const { open } = useBookCall();
  return (
    <div className="hero-cta reveal in">
      <Link className="btn btn-glow btn-xl" href="/jobs">
        Explore jobs <ArrowUpRight size={16} />
      </Link>
      <button className="btn btn-secondary btn-xl" onClick={open}>
        <Calendar size={15} /> Book a call
      </button>
    </div>
  );
}

export function ClientFinalCTAs() {
  const { open } = useBookCall();
  return (
    <div className="actions">
      <button className="btn btn-glow btn-xl" onClick={open}>
        <Calendar size={16} /> Book a call
      </button>
      <Link className="btn btn-secondary btn-xl" href="/jobs">
        Find a role <ArrowRight size={16} />
      </Link>
    </div>
  );
}
