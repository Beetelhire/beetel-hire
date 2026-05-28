import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopBar } from '@/components/admin/topbar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect('/sign-in');

  return (
    <div className="app-shell">
      <AdminSidebar profile={profile} />
      <div className="app-main">
        <AdminTopBar />
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
