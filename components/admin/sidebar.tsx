'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-client';
import { Profile } from '@/types/database';
import {
  LayoutDashboard, Briefcase, UsersRound, Inbox, Calendar,
  BarChart3, Building2, Settings, LogOut
} from 'lucide-react';

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href));

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <aside className="sidebar">
      <Link className="brand" href="/admin">
        <img src="/beetel-hire-logo-light.svg" alt="Beetel Hire" className="brand-logo brand-logo-light sm" />
        <img src="/beetel-hire-logo-dark.svg"  alt="Beetel Hire" className="brand-logo brand-logo-dark sm" />
        <span className="admin-chip">ADMIN</span>
      </Link>

      <div className="side-label">Workspace</div>
      <Link className={`side-link${isActive('/admin') && pathname === '/admin' ? ' active' : ''}`}        href="/admin"><LayoutDashboard /> Overview</Link>
      <Link className={`side-link${isActive('/admin/jobs') ? ' active' : ''}`}             href="/admin/jobs"><Briefcase /> Jobs</Link>
      <Link className={`side-link${isActive('/admin/candidates') ? ' active' : ''}`}       href="/admin/candidates"><UsersRound /> Candidate Pool</Link>
      <Link className={`side-link${isActive('/admin/applications') ? ' active' : ''}`}     href="/admin/applications"><Inbox /> Applications</Link>
      <Link className={`side-link${isActive('/admin/meetings') ? ' active' : ''}`}         href="/admin/meetings"><Calendar /> Meetings</Link>

      <div className="side-label">Insights</div>
      <Link className={`side-link${isActive('/admin/analytics') ? ' active' : ''}`}        href="/admin/analytics"><BarChart3 /> Analytics</Link>

      <div className="side-label">Workspace</div>
      <Link className={`side-link${isActive('/admin/companies') ? ' active' : ''}`}        href="/admin/companies"><Building2 /> Companies</Link>
      <Link className={`side-link${isActive('/admin/team') ? ' active' : ''}`}             href="/admin/team"><UsersRound /> Team</Link>
      <Link className={`side-link${isActive('/admin/settings') ? ' active' : ''}`}         href="/admin/settings"><Settings /> Settings</Link>

      <div className="sidebar-foot">
        <div className="avatar" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="name">{profile.full_name || 'Admin'}</div>
          <div className="email" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.role || 'Beetel Hire'}</div>
        </div>
        <button className="btn btn-ghost btn-icon-sq" onClick={signOut} aria-label="Sign out"><LogOut style={{ width: 14, height: 14 }} /></button>
      </div>
    </aside>
  );
}
