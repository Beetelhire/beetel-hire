import Link from 'next/link';
import { SignInForm } from '@/components/sign-in-form';
import { TopologyCanvas } from '@/components/topology-canvas';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  // If already signed in as admin, jump straight to admin
  const profile = await getCurrentProfile();
  if (profile?.is_admin) redirect('/admin');

  return (
    <main>
      <div className="auth">
        <div className="auth-form-side">
          <Link className="back" href="/"><ArrowLeft size={14} /> Back to home</Link>
          <div className="auth-form-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
              <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light md" />
              <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark md" />
            </div>
            <SignInForm />
          </div>
        </div>

        <div className="auth-visual-side">
          <TopologyCanvas id="topoAuth" variant="dim" density={0.8} maxDist={280} />
          <div className="auth-quote">
            <span className="badge"><span className="pulse-dot" style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:'#4ade80' }} /> Now hiring across India</span>
            <h3>&ldquo;They sent me three roles in three weeks. <span className="serif">I took the second one</span> and I&apos;ve never been happier.&rdquo;</h3>
            <div className="by">
              <img className="avatar" alt="" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&auto=format&fit=crop&q=85" />
              <div>
                <div style={{ color: 'white', fontWeight: 500 }}>Naila Hassan</div>
                <div>Principal PM — placed via Beetel Hire</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
