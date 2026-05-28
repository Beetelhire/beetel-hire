import { ArrowRight, Sparkle } from 'lucide-react';

export function HeroEyebrow() {
  return (
    <span className="hero-eyebrow reveal in">
      <span className="pill"><Sparkle size={11} /> Now hiring</span>
      A new kind of recruitment partner — built for India&apos;s most ambitious teams
      <ArrowRight size={13} style={{ color: 'var(--fg-subtle)' }} />
    </span>
  );
}
